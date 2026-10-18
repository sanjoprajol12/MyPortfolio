require('dotenv').config();
const { connectDb } = require('./db');
const { seed } = require('./seed');
const { createApp } = require('./app');
const { processJobs } = require('./lib/queue');

const port = Number(process.env.PORT) || 3000;
const WORKER_INTERVAL_MS = 60_000;

async function start() {
  const app = createApp({ serveStatic: true });
  await connectDb();
  await seed();

  app.listen(port, () => {
    console.log(`Portfolio running at http://localhost:${port}`);
    console.log(`Admin portal at http://localhost:${port}/admin`);
  });

  // Background worker for queued emails and alerts (see server/lib/queue.js)
  let running = false;
  setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await processJobs();
    } catch (err) {
      console.error(`[queue] worker error: ${err.message}`);
    } finally {
      running = false;
    }
  }, WORKER_INTERVAL_MS).unref();
}

start().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
