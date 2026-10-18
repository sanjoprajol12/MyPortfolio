const mongoose = require('mongoose');

// A unit of background work (an email, an alert) processed by server/lib/queue.js
const jobSchema = new mongoose.Schema({
  type: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['pending', 'processing', 'done', 'failed'], default: 'pending' },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  // Not picked up before this time; also how retries back off and how messages are scheduled
  runAt: { type: Date, default: Date.now },
  lockedAt: { type: Date, default: null },
  lastError: { type: String, default: '' },
  // Jobs with the same key are only queued once (used to throttle alerts)
  dedupeKey: { type: String },
  finishedAt: { type: Date, default: null },
}, { timestamps: true });

jobSchema.index({ status: 1, runAt: 1 });
jobSchema.index({ dedupeKey: 1 }, { unique: true, partialFilterExpression: { dedupeKey: { $type: 'string' } } });
// Finished jobs are removed after 30 days
jobSchema.index({ finishedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Job', jobSchema);
