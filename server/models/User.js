const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  // super_admin can also manage admin accounts; admin manages site content
  role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
  // Incremented to sign out every existing session (see server/lib/tokens.js)
  tokenVersion: { type: Number, default: 0 },
  lastLoginAt: { type: Date, default: null },

  // Two-step verification (authenticator app)
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, default: '' },
  mfaLastStep: { type: Number, default: -1 },
  mfaRecoveryCodes: { type: [String], default: [] },
  mfaPendingSecret: { type: String, default: '' },
  mfaPendingAt: { type: Date, default: null },
}, { timestamps: true });

// What the admin UI is allowed to see about an account
userSchema.methods.toPublic = function toPublic() {
  return {
    id: String(this._id),
    username: this.username,
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

module.exports = mongoose.model('User', userSchema);
