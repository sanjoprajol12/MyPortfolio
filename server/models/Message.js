const mongoose = require('mongoose');

// Only what is needed to reply: no IP address, browser details or tracking data are stored.
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 4000 },
  read: { type: Boolean, default: false },
  // When the sender agreed to the privacy policy
  consentAt: { type: Date, default: null },
  // Flagged by the spam checks in server/lib/spam.js; kept for review, never emailed
  spam: { type: Boolean, default: false },
}, { timestamps: true });

messageSchema.index({ createdAt: -1 });
messageSchema.index({ read: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
