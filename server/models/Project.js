const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  order: { type: Number, default: 0 },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  statusKind: { type: String, enum: ['live', 'type', 'none'], default: 'none' },
  statusLabel: { type: String, default: '' },
  techs: [String],
  features: [String],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
