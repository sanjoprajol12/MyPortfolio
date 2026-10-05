const User = require('../models/User');

const MIN_PASSWORD_LENGTH = 8;

function passwordError(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  if (password.length > 200) return 'Password is too long.';
  return null;
}

function cleanUsername(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function usernameError(username) {
  if (!username) return 'Username is required.';
  if (username.length > 60) return 'Username must be 60 characters or fewer.';
  return null;
}

// Usernames are unique regardless of case
async function isUsernameTaken(username, exceptId) {
  const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const existing = await User.findOne({ username: new RegExp(`^${escaped}$`, 'i') });
  return Boolean(existing && String(existing._id) !== String(exceptId || ''));
}

module.exports = { MIN_PASSWORD_LENGTH, passwordError, cleanUsername, usernameError, isUsernameTaken };
