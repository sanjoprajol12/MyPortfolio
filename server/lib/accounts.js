const User = require('../models/User');

const MIN_PASSWORD_LENGTH = 8;

// A short list of the passwords attackers try first. Length and variety do most of the work.
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '123456789012', 'qwertyuiop', 'qwerty123456', 'iloveyou',
  'admin', 'administrator', 'letmein', 'welcome', 'welcome123', 'changeme', 'portfolio', 'abc123456789',
  'football', 'baseball', 'superman', 'trustno1', 'sunshine', 'princess', 'dragon', 'monkey', 'master',
]);

function characterClasses(password) {
  return [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
}

// Returns an error message, or null when the password is acceptable. Long passphrases (16+)
// pass on length alone; shorter passwords need three kinds of character.
function passwordError(password, username = '') {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  if (password.length > 200) return 'Password is too long.';
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower) || /^(.)\1+$/.test(password)) {
    return 'This password is too common. Choose something harder to guess.';
  }
  if (username && username.length >= 3 && lower.includes(String(username).toLowerCase())) {
    return 'Password must not contain your username.';
  }
  if (password.length < 16 && characterClasses(password) < 3) {
    return 'Use at least three of: lowercase letters, capital letters, numbers and symbols. Or use a passphrase of 16 or more characters.';
  }
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

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

function cleanEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function emailError(email) {
  if (!email) return null;
  if (email.length > 160 || !EMAIL_RE.test(email)) return 'Enter a valid email address.';
  return null;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Usernames are unique regardless of case
async function isUsernameTaken(username, exceptId) {
  const existing = await User.findOne({ username: new RegExp(`^${escapeRegex(username)}$`, 'i') });
  return Boolean(existing && String(existing._id) !== String(exceptId || ''));
}

async function isEmailTaken(email, exceptId) {
  if (!email) return false;
  const existing = await User.findOne({ email });
  return Boolean(existing && String(existing._id) !== String(exceptId || ''));
}

module.exports = {
  MIN_PASSWORD_LENGTH,
  EMAIL_RE,
  passwordError,
  cleanUsername,
  usernameError,
  cleanEmail,
  emailError,
  isUsernameTaken,
  isEmailTaken,
};
