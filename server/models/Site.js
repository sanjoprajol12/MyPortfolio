const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  firstName: { type: String, default: 'Prajwal' },
  lastName: { type: String, default: 'Sainju' },
  pageTitle: { type: String, default: 'Prajwal Sainju — Frontend & Backend Developer' },
  hero: {
    eyebrow: { type: String, default: '' },
    eyebrowHighlight: { type: String, default: '' },
    headlineLine1: { type: String, default: 'Frontend' },
    headlineLine2: { type: String, default: '& Backend' },
    headlineLine3: { type: String, default: 'Dev.' },
    locationLabel: { type: String, default: '' },
    description: { type: String, default: '' },
    photoUrl: { type: String, default: 'images/profile.jpg' },
    photoName: { type: String, default: '' },
    photoRole: { type: String, default: '' },
    stats: [{
      num: String,
      label: String,
      fullWidth: { type: Boolean, default: false },
    }],
    primaryStack: [String],
  },
  about: {
    paragraphs: [String],
    meta: [{
      key: String,
      value: String,
      highlight: { type: Boolean, default: false },
    }],
  },
  contact: {
    intro: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    availability: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    linkedinHandle: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    githubHandle: { type: String, default: '' },
  },
  footerCopy: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Site', siteSchema);
