const Job = require('../models/Job');
const { isServerless } = require('../config');

// A small job queue stored in MongoDB. Requests add jobs and return quickly; a worker sends the
// emails and alerts, retrying failures with growing delays. Workers:
//  - the long-running server polls every minute (server/index.js)
//  - on Netlify, a scheduled function runs every 5 minutes (netlify/functions/queue-worker.js)
//  - right after a job is queued, the request that queued it gives it one immediate try

const handlers = new Map();
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;

// `redact` lists payload fields removed once the job is finished (for example a reset token)
function registerHandler(type, run, { redact = [] } = {}) {
  handlers.set(type, { run, redact });
}

async function enqueue(type, payload = {}, { runAt = new Date(), dedupeKey, maxAttempts = 5 } = {}) {
  if (!handlers.has(type)) throw new Error(`No handler registered for job type "${type}"`);
  try {
    return await Job.create({ type, payload, runAt, maxAttempts, ...(dedupeKey && { dedupeKey }) });
  } catch (err) {
    if (err.code === 11000 && dedupeKey) return null; // already queued
    throw err;
  }
}

function backoffMs(attempts) {
  return Math.min(60, 2 ** attempts) * 60 * 1000; // 2, 4, 8, 16, 32, 60 minutes
}

async function claimNext() {
  const now = new Date();
  return Job.findOneAndUpdate(
    {
      $or: [
        { status: 'pending', runAt: { $lte: now } },
        // A worker that crashed mid-job leaves it locked; take it over after the timeout
        { status: 'processing', lockedAt: { $lte: new Date(now - LOCK_TIMEOUT_MS) } },
      ],
    },
    { $set: { status: 'processing', lockedAt: now }, $inc: { attempts: 1 } },
    { sort: { runAt: 1 }, new: true }
  );
}

async function runJob(job) {
  const handler = handlers.get(job.type);
  try {
    if (!handler) throw Object.assign(new Error(`Unknown job type "${job.type}"`), { permanent: true });
    await handler.run(job.payload || {}, job);
    const payload = { ...(job.payload || {}) };
    for (const field of handler.redact) delete payload[field];
    await Job.updateOne({ _id: job._id }, {
      $set: { status: 'done', finishedAt: new Date(), lockedAt: null, lastError: '', payload },
    });
  } catch (err) {
    const giveUp = err.permanent || job.attempts >= job.maxAttempts;
    // Error messages only; payloads may hold personal data and are never logged
    console.error(`[queue] ${job.type} attempt ${job.attempts} failed: ${err.message}`);
    await Job.updateOne({ _id: job._id }, {
      $set: {
        status: giveUp ? 'failed' : 'pending',
        lockedAt: null,
        lastError: String(err.message || err).slice(0, 500),
        ...(giveUp ? { finishedAt: new Date() } : { runAt: new Date(Date.now() + backoffMs(job.attempts)) }),
      },
    });
  }
}

// Processes due jobs until none are left or the time budget runs out
async function processJobs({ budgetMs = 20_000, limit = 25 } = {}) {
  const started = Date.now();
  let processed = 0;
  while (processed < limit && Date.now() - started < budgetMs) {
    const job = await claimNext();
    if (!job) break;
    await runJob(job);
    processed += 1;
  }
  return processed;
}

// Called right after enqueue. A serverless function is frozen once it responds, so there the
// request waits (briefly) for the work; the long-running server does it in the background.
async function kick() {
  const work = processJobs({ budgetMs: 4_000, limit: 3 }).catch((err) => {
    console.error(`[queue] immediate run failed: ${err.message}`);
  });
  if (isServerless) await work;
}

module.exports = { registerHandler, enqueue, processJobs, kick };
