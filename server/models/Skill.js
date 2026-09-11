const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  order: { type: Number, default: 0 },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  fullWidth: { type: Boolean, default: false },
  tags: [{
    name: String,
    highlight: { type: Boolean, default: false },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
