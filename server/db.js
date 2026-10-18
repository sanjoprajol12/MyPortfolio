const mongoose = require('mongoose');
const { isServerless } = require('./config');

let connecting = null;

// One shared connection pool per process. Serverless instances each hold their own pool,
// so they keep it small to stay under the Atlas connection limit.
function connectDb() {
  if (connecting) return connecting;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error('MONGODB_URI is missing. Copy .env.example to .env and fill it in.'));
  }
  mongoose.set('strictQuery', true);
  connecting = mongoose.connect(uri, {
    maxPoolSize: isServerless ? 5 : 20,
    minPoolSize: 0,
    maxIdleTimeMS: 60_000,
    serverSelectionTimeoutMS: 8_000,
    socketTimeoutMS: 30_000,
  }).catch((err) => {
    connecting = null;
    throw err;
  });
  return connecting;
}

module.exports = { connectDb };
