// Saves every collection to backups/<date>/<collection>.json.gz (MongoDB Extended JSON) and
// keeps the newest 14 backups. Run it on a schedule (cron, a CI job) for automatic backups.
// The files include password hashes and two-step secrets: store them somewhere private.
// Usage: npm run backup [-- --keep 30]
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const mongoose = require('mongoose');
const { EJSON } = require('bson');

const keepArg = process.argv.indexOf('--keep');
const KEEP = keepArg > -1 ? Number(process.argv[keepArg + 1]) || 14 : 14;
const dir = path.join(__dirname, '..', 'backups');

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = path.join(dir, stamp);
  fs.mkdirSync(target, { recursive: true, mode: 0o700 });

  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const { name } of collections) {
    const docs = await mongoose.connection.db.collection(name).find().toArray();
    const file = path.join(target, `${name}.json.gz`);
    fs.writeFileSync(file, zlib.gzipSync(EJSON.stringify(docs, { relaxed: false })), { mode: 0o600 });
    console.log(`${name}: ${docs.length} documents`);
  }

  const old = fs.readdirSync(dir).filter((d) => fs.statSync(path.join(dir, d)).isDirectory()).sort().reverse().slice(KEEP);
  for (const d of old) fs.rmSync(path.join(dir, d), { recursive: true, force: true });
  console.log(`Backup written to backups/${stamp}${old.length ? ` (removed ${old.length} older)` : ''}`);
}

main()
  .catch((err) => {
    console.error(`Backup failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
