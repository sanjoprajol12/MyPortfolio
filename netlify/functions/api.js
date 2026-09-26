// netlify/functions/api.js
// Wraps the existing Express app as a Netlify (AWS Lambda-compatible) Function.
// All requests to /.netlify/functions/api/* are handled here, and netlify.toml
// rewrites /api/* → /.netlify/functions/api/* so the frontend URLs stay the same.

require('dotenv').config();
const serverless = require('serverless-http');
const express    = require('express');
const cors       = require('cors');

const { connectDb }  = require('../../server/db');
const { seed }       = require('../../server/seed');
const authRoutes     = require('../../server/routes/auth');
const publicRoutes   = require('../../server/routes/public');
const adminRoutes    = require('../../server/routes/admin');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',  authRoutes);
app.use('/api',       publicRoutes);
app.use('/api/admin', adminRoutes);

// Lazy-connect: reuse the Mongoose connection across warm Lambda invocations.
let ready = false;
const ensureDb = async () => {
  if (!ready) {
    await connectDb();
    await seed();          // no-op if data already exists (seed is idempotent)
    ready = true;
  }
};

const handler = serverless(app);

exports.handler = async (event, context) => {
  // Prevent Lambda from waiting for the event loop to drain (Mongoose keeps it open).
  context.callbackWaitsForEmptyEventLoop = false;
  await ensureDb();
  return handler(event, context);
};
