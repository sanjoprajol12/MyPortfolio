const mongoose = require('mongoose');
const { httpUrl, slugify } = require('../lib/validate');

const projectSchema = new mongoose.Schema({
  order: { type: Number, default: 0 },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  // Address of the project's own page (/projects/<slug>); filled from the title when empty
  slug: { type: String, trim: true, lowercase: true, maxlength: 80 },
  description: { type: String, default: '', maxlength: 2000 },
  liveUrl: { type: String, default: '', trim: true, validate: httpUrl },
  githubUrl: { type: String, default: '', trim: true, validate: httpUrl },
  statusKind: { type: String, enum: ['live', 'type', 'none'], default: 'none' },
  statusLabel: { type: String, default: '', maxlength: 60 },
  techs: [String],
  features: [String],
}, { timestamps: true });

projectSchema.index({ order: 1 });
projectSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { slug: { $type: 'string', $gt: '' } } });

projectSchema.pre('validate', function setSlug() {
  this.slug = slugify(this.slug || this.title);
});

module.exports = mongoose.model('Project', projectSchema);
