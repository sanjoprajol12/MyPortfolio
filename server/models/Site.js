const mongoose = require('mongoose');
const { httpUrl } = require('../lib/validate');

const siteSchema = new mongoose.Schema({
  firstName: { type: String, default: 'Prajwal' },
  lastName: { type: String, default: 'Sainju' },
  pageTitle: { type: String, default: 'Prajwal Sainju | Laravel & Vue.js Developer in Kathmandu, Nepal' },
  // Shown in search results and link previews (about 150 characters)
  metaDescription: { type: String, default: '', maxlength: 300 },
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
    website: { type: String, default: '', trim: true, validate: httpUrl },
    linkedinUrl: { type: String, default: '', trim: true, validate: httpUrl },
    linkedinHandle: { type: String, default: '' },
    githubUrl: { type: String, default: '', trim: true, validate: httpUrl },
    githubHandle: { type: String, default: '' },
  },
  resume: {
    headline: { type: String, default: '' },
    summary: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '', trim: true, validate: httpUrl },
    includePhoto: { type: Boolean, default: false },
    showDownloadButtons: { type: Boolean, default: true },
    includeProjectsOnResume: { type: Boolean, default: false },
    resumeProjectLimit: { type: Number, default: 3 },
    education: [{
      degree: { type: String, default: '' },
      school: { type: String, default: '' },
      years: { type: String, default: '' },
      details: { type: String, default: '' },
    }],
    certifications: [{
      name: { type: String, default: '' },
      issuer: { type: String, default: '' },
      year: { type: String, default: '' },
    }],
    languages: [{
      name: { type: String, default: '' },
      level: { type: String, default: '' },
    }],
    awards: [{
      name: { type: String, default: '' },
      year: { type: String, default: '' },
      details: { type: String, default: '' },
    }],
    interests: [String],
  },
  footerCopy: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Site', siteSchema);
