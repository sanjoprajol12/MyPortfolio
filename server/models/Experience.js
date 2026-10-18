const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  order: { type: Number, default: 0 },
  date: { type: String, default: '' },
  role: { type: String, required: true },
  company: { type: String, default: '' },
  stack: [String],
  bullets: [String],
}, { timestamps: true });

experienceSchema.index({ order: 1 });

module.exports = mongoose.model('Experience', experienceSchema);
