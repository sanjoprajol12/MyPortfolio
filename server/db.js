const mongoose = require('mongoose');

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Copy .env.example to .env and fill it in.');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
}

module.exports = { connectDb };
