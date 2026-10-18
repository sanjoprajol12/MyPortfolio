const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const wrap = require('../lib/asyncHandler');
const {
  createSessionToken, verifySessionToken, createMfaChallengeToken, verifyMfaChallengeToken,
} = require('../lib/tokens');
const { verifyTotp, hashRecoveryCode } = require('../lib/totp');
const { setSessionCookie, clearSessionCookie, SESSION_COOKIE } = require('../lib/security');
const { enqueue, kick } = require('../lib/queue');
const { securityAlert } = require('../jobs');
const {
  passwordError, cleanUsername, usernameError, cleanEmail, emailError, isUsernameTaken, isEmailTaken,
} = require('../lib/accounts');
const config = require('../config');

const router = express.Router();

const BCRYPT_COST = 12;
const RESET_MINUTES = 30;

// Compared against when the username does not exist, so a wrong username takes as long as a
// wrong password and response times do not reveal which accounts exist
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), BCRYPT_COST);

function limiter({ windowMinutes, limit, message, key, alert }) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    ...(key && { keyGenerator: key }),
    handler: (req, res, _next, options) => {
      if (alert) securityAlert(alert, `Rate limit reached on ${req.method} ${req.originalUrl}. Someone may be guessing passwords.`).catch(() => {});
      res.status(options.statusCode).json({ error: message });
    },
  });
}

// Per network and per account, so neither many accounts from one address nor one account from
// many addresses can be guessed at quickly
const loginIpLimiter = limiter({ windowMinutes: 15, limit: 20, message: 'Too many sign-in attempts. Try again in 15 minutes.', alert: 'login-rate-limit' });
const loginUserLimiter = limiter({
  windowMinutes: 15,
  limit: 8,
  message: 'Too many sign-in attempts for this account. Try again in 15 minutes.',
  key: (req) => `user:${String(req.body?.username || '').trim().toLowerCase()}`,
  alert: 'account-rate-limit',
});
const mfaLimiter = limiter({ windowMinutes: 15, limit: 10, message: 'Too many verification attempts. Try again later.', alert: 'mfa-rate-limit' });
const resetLimiter = limiter({ windowMinutes: 60, limit: 5, message: 'Too many reset requests. Try again in an hour.' });

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

async function startSession(req, res, user) {
  user.lastLoginAt = new Date();
  await user.save();
  setSessionCookie(req, res, createSessionToken(user), config.sessionHours);
  res.json({ user: user.toPublic(), mfaRequired: config.requireMfa });
}

// Hands this browser a fresh session cookie after older sessions were signed out
function refreshSession(req, res, user) {
  setSessionCookie(req, res, createSessionToken(user), config.sessionHours);
}

router.post('/login', loginIpLimiter, loginUserLimiter, wrap(async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const user = username ? await User.findOne({ username }) : null;
  const matches = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !matches) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  // Second step: the password was right, now the authenticator code is required
  if (user.mfaEnabled) {
    return res.json({ mfaRequired: true, mfaToken: createMfaChallengeToken(user) });
  }
  await startSession(req, res, user);
}));

// Accepts an authenticator code, or a one-time recovery code (which is then used up)
function consumeMfaCode(user, code) {
  const step = verifyTotp(user.mfaSecret, code, user.mfaLastStep ?? -1);
  if (step !== null) {
    user.mfaLastStep = step;
    return true;
  }
  const clean = String(code || '').replace(/[^a-f0-9]/gi, '');
  const index = user.mfaRecoveryCodes.indexOf(hashRecoveryCode(code));
  if (clean.length === 10 && index !== -1) {
    user.mfaRecoveryCodes.splice(index, 1);
    return true;
  }
  return false;
}

router.post('/login/mfa', mfaLimiter, wrap(async (req, res) => {
  const expired = 'Your sign-in attempt expired. Please enter your password again.';
  const challenge = verifyMfaChallengeToken(req.body.mfaToken);
  if (!challenge) return res.status(401).json({ error: expired });

  const user = await User.findById(challenge.id);
  if (!user || !user.mfaEnabled || (user.tokenVersion || 0) !== challenge.tv) {
    return res.status(401).json({ error: expired });
  }
  if (!consumeMfaCode(user, req.body.code)) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }
  await startSession(req, res, user);
}));

router.post('/logout', (req, res) => {
  clearSessionCookie(req, res);
  res.json({ ok: true });
});

// Like /me, but answers { user: null } instead of 401 when nobody is signed in
router.get('/session', wrap(async (req, res) => {
  const session = verifySessionToken(req.cookies?.[SESSION_COOKIE] || '');
  const user = session ? await User.findById(session.id) : null;
  if (!user || (user.tokenVersion || 0) !== session.tv) return res.json({ user: null });
  res.json({ user: { ...user.toPublic(), mfaRequired: config.requireMfa } });
}));

router.get('/me', auth, (req, res) => {
  res.json({ ...req.user.toPublic(), mfaRequired: config.requireMfa });
});

// Change your own username, email and/or password; always needs the current password
router.put('/account', auth, wrap(async (req, res) => {
  const user = req.user;
  if (!(await bcrypt.compare(String(req.body.currentPassword || ''), user.passwordHash))) {
    return res.status(422).json({ error: 'The current password is incorrect.' });
  }

  if (req.body.username !== undefined) {
    const username = cleanUsername(req.body.username);
    const invalid = usernameError(username);
    if (invalid) return res.status(400).json({ error: invalid });
    if (await isUsernameTaken(username, user._id)) {
      return res.status(400).json({ error: `Username "${username}" is already taken.` });
    }
    user.username = username;
  }

  if (req.body.email !== undefined) {
    const email = cleanEmail(req.body.email);
    const invalid = emailError(email);
    if (invalid) return res.status(400).json({ error: invalid });
    if (await isEmailTaken(email, user._id)) {
      return res.status(400).json({ error: 'That email address is used by another admin.' });
    }
    user.email = email;
  }

  let signedOutOthers = false;
  if (req.body.newPassword) {
    const invalid = passwordError(req.body.newPassword, user.username);
    if (invalid) return res.status(400).json({ error: invalid });
    user.passwordHash = await bcrypt.hash(req.body.newPassword, BCRYPT_COST);
    user.clearPasswordReset();
    // Signs out every other session; this one gets a fresh cookie
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    signedOutOthers = true;
  }

  await user.save();
  if (signedOutOthers) refreshSession(req, res, user);
  res.json({ user: user.toPublic() });
}));

// Signs out every session of this account; this browser gets a fresh cookie
router.post('/sessions/revoke', auth, wrap(async (req, res) => {
  const user = req.user;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  refreshSession(req, res, user);
  res.json({ ok: true });
}));

// ── Password reset ───────────────────────────────────────────────────────────────────────────
// The answer is the same whether or not the address belongs to an admin, so the form cannot be
// used to find out which addresses have accounts.
router.post('/password/forgot', resetLimiter, wrap(async (req, res) => {
  const email = cleanEmail(req.body.email);
  const done = () => res.json({ ok: true, message: 'If that address belongs to an admin account, a reset link is on its way. It expires in 30 minutes.' });
  if (!email || emailError(email)) return done();

  const user = await User.findOne({ email });
  if (!user) return done();

  const token = crypto.randomBytes(32).toString('base64url');
  user.passwordResetHash = hashToken(token);
  user.passwordResetExpires = new Date(Date.now() + RESET_MINUTES * 60 * 1000);
  await user.save();

  try {
    await enqueue('mail.password-reset', {
      to: user.email,
      username: user.username,
      minutes: RESET_MINUTES,
      link: `${config.siteUrl}/admin/reset-password?token=${encodeURIComponent(token)}`,
    }, { maxAttempts: 3 });
    await kick();
  } catch (err) {
    console.error(`[auth] could not queue reset email: ${err.message}`);
  }
  done();
}));

router.post('/password/reset', resetLimiter, wrap(async (req, res) => {
  const invalidLink = 'This reset link is invalid or has expired. Request a new one.';
  const token = String(req.body.token || '');
  if (token.length < 20) return res.status(400).json({ error: invalidLink });

  const user = await User.findOne({ passwordResetHash: hashToken(token) });
  if (!user || !user.passwordResetExpires || user.passwordResetExpires.getTime() < Date.now()) {
    if (user) {
      user.clearPasswordReset();
      await user.save();
    }
    return res.status(400).json({ error: invalidLink });
  }

  const invalid = passwordError(req.body.password, user.username);
  if (invalid) return res.status(400).json({ error: invalid });

  user.passwordHash = await bcrypt.hash(String(req.body.password), BCRYPT_COST);
  user.clearPasswordReset(); // single use
  user.tokenVersion = (user.tokenVersion || 0) + 1; // sign out everywhere
  await user.save();
  securityAlert('password-reset', `The password for admin "${user.username}" was reset with an emailed link.`).catch(() => {});
  res.json({ ok: true, message: 'Password changed. Sign in with your new password.' });
}));

module.exports = router;
