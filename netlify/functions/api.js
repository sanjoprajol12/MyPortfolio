// Runs the shared Express app (server/app.js) as a Netlify Function. netlify.toml rewrites
// /api/*, /projects/* and /sitemap.xml here; Netlify serves everything else from dist/.
require('dotenv').config();
const serverless = require('serverless-http');
const { connectDb } = require('../../server/db');
const { seed } = require('../../server/seed');
const { createApp } = require('../../server/app');

const handler = serverless(createApp());

// Connect and seed once per warm instance; the connection is reused between invocations
let ready = null;
const ensureDb = () => {
  if (!ready) {
    ready = connectDb().then(() => seed()).catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
};

exports.handler = async (event, context) => {
  // Mongoose keeps the event loop busy; do not wait for it to drain before responding
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await ensureDb();
  } catch (err) {
    console.error(`[api] database unavailable: ${err.message}`);
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '30' },
      body: JSON.stringify({ error: 'The service is temporarily unavailable. Please try again shortly.' }),
    };
  }
  return handler(event, context);
};
