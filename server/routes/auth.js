const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const wrap = require('../lib/asyncHandler');
const { createSessionToken, createMfaChallengeToken, verifyMfaChallengeToken } = require('../lib/tokens');
const { verifyTotp, hashRecoveryCode } = require('../lib/totp');
const { passwordError, cleanUsername, usernameError, isUsernameTaken } = require('../lib/accounts');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts. Try again later.' },
});

const mfaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many verification attempts. Try again later.' },
});

async function startSession(user, res) {
  user.lastLoginAt = new Date();
  await user.save();
  res.json({ token: createSessionToken(user), user: user.toPublic() });
}

router.post('/login', loginLimiter, wrap(async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  // Second step: the password was right, now the authenticator code is required
  if (user.mfaEnabled) {
    return res.json({ mfaRequired: true, mfaToken: createMfaChallengeToken(user) });
  }
  await startSession(user, res);
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
  await startSession(user, res);
}));

router.get('/me', auth, (req, res) => {
  res.json(req.user.toPublic());
});

// Change your own username and/or password; always needs the current password
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

  let token;
  if (req.body.newPassword) {
    const invalid = passwordError(req.body.newPassword);
    if (invalid) return res.status(400).json({ error: invalid });
    user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    // Signs out every other session; this one gets a fresh token
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    token = createSessionToken(user);
  }

  await user.save();
  res.json({ user: user.toPublic(), ...(token && { token }) });
}));

// Signs out every session of this account, including this one's old token
router.post('/sessions/revoke', auth, wrap(async (req, res) => {
  const user = req.user;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  res.json({ token: createSessionToken(user) });
}));

module.exports = router;
