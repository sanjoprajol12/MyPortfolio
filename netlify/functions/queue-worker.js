// Scheduled Netlify Function (every 5 minutes, see netlify.toml): sends queued emails and alerts
// and retries ones that failed. See server/lib/queue.js.
require('dotenv').config();
const { connectDb } = require('../../server/db');
require('../../server/jobs');
const { processJobs } = require('../../server/lib/queue');

exports.handler = async (_event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDb();
  const processed = await processJobs({ budgetMs: 20_000, limit: 50 });
  return { statusCode: 200, body: JSON.stringify({ processed }) };
};
