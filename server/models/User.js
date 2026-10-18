const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  // Optional; needed to receive password reset links
  email: { type: String, trim: true, lowercase: true, default: '' },
  passwordHash: { type: String, required: true },
  // super_admin can also manage admin accounts; admin manages site content
  role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
  // Incremented to sign out every existing session (see server/lib/tokens.js)
  tokenVersion: { type: Number, default: 0 },
  lastLoginAt: { type: Date, default: null },

  // Password reset: only a SHA-256 hash of the emailed token is stored. It expires, and it is
  // cleared the moment it is used, so each link works once.
  passwordResetHash: { type: String, default: '' },
  passwordResetExpires: { type: Date, default: null },

  // Two-step verification (authenticator app)
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, default: '' },
  mfaLastStep: { type: Number, default: -1 },
  mfaRecoveryCodes: { type: [String], default: [] },
  mfaPendingSecret: { type: String, default: '' },
  mfaPendingAt: { type: Date, default: null },
}, { timestamps: true });

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string', $gt: '' } } }
);
userSchema.index({ passwordResetHash: 1 }, { partialFilterExpression: { passwordResetHash: { $type: 'string', $gt: '' } } });

// What the admin UI is allowed to see about an account
userSchema.methods.toPublic = function toPublic() {
  return {
    id: String(this._id),
    username: this.username,
    email: this.email || '',
    role: this.role,
    mfaEnabled: Boolean(this.mfaEnabled),
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
  };
};

userSchema.methods.clearMfa = function clearMfa() {
  this.mfaEnabled = false;
  this.mfaSecret = '';
  this.mfaLastStep = -1;
  this.mfaRecoveryCodes = [];
  this.mfaPendingSecret = '';
  this.mfaPendingAt = null;
};

userSchema.methods.clearPasswordReset = function clearPasswordReset() {
  this.passwordResetHash = '';
  this.passwordResetExpires = null;
};

module.exports = mongoose.model('User', userSchema);
