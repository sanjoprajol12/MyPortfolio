const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  order: { type: Number, default: 0 },
  date: { type: String, default: '' },
  role: { type: String, required: true },
  company: { type: String, default: '' },
  stack: [String],
  bullets: [String],
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);
