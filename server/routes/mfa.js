const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const QRCode = require('qrcode');
const { auth } = require('../middleware/auth');
const wrap = require('../lib/asyncHandler');
const { generateTotpSecret, verifyTotp, totpAuthUrl, generateRecoveryCodes, hashRecoveryCode } = require('../lib/totp');

// Two-step verification (authenticator app) for the signed-in admin
const router = express.Router();
router.use(auth);

const MFA_ISSUER = 'Portfolio Admin';
const SETUP_TTL_MS = 15 * 60 * 1000;

const mfaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many verification attempts. Try again later.' },
});

async function passwordMatches(req) {
  return bcrypt.compare(String(req.body.currentPassword || ''), req.user.passwordHash);
}

router.get('/', (req, res) => {
  res.json({
    enabled: Boolean(req.user.mfaEnabled),
    recoveryCodesRemaining: req.user.mfaEnabled ? req.user.mfaRecoveryCodes.length : 0,
  });
});

router.post('/setup', wrap(async (req, res) => {
  const user = req.user;
  if (user.mfaEnabled) return res.status(400).json({ error: 'Two-step verification is already on.' });

  // The secret stays pending until a valid code proves the app was set up
  const secret = generateTotpSecret();
  user.mfaPendingSecret = secret;
  user.mfaPendingAt = new Date();
  await user.save();

  const otpauthUrl = totpAuthUrl(secret, user.username, MFA_ISSUER);
  res.json({
    account: user.username,
    issuer: MFA_ISSUER,
    secret,
    otpauthUrl,
    qrCode: await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 }),
  });
}));

router.post('/activate', mfaLimiter, wrap(async (req, res) => {
  const user = req.user;
  if (user.mfaEnabled) return res.status(400).json({ error: 'Two-step verification is already on.' });
  if (!user.mfaPendingSecret || !user.mfaPendingAt || Date.now() - user.mfaPendingAt.getTime() > SETUP_TTL_MS) {
    return res.status(400).json({ error: 'Setup expired. Please start again.' });
  }

  const step = verifyTotp(user.mfaPendingSecret, req.body.code);
  if (step === null) {
    return res.status(400).json({ error: 'Invalid code. Check the time on your phone and try again.' });
  }

  const recoveryCodes = generateRecoveryCodes();
  user.mfaEnabled = true;
  user.mfaSecret = user.mfaPendingSecret;
  user.mfaLastStep = step;
  user.mfaRecoveryCodes = recoveryCodes.map(hashRecoveryCode);
  user.mfaPendingSecret = '';
  user.mfaPendingAt = null;
  await user.save();

  res.json({ recoveryCodes });
}));

router.post('/disable', mfaLimiter, wrap(async (req, res) => {
  if (!(await passwordMatches(req))) {
    return res.status(422).json({ error: 'The current password is incorrect.' });
  }
  req.user.clearMfa();
  await req.user.save();
  res.json({ ok: true });
}));

router.post('/recovery-codes', mfaLimiter, wrap(async (req, res) => {
  const user = req.user;
  if (!user.mfaEnabled) return res.status(400).json({ error: 'Two-step verification is not on.' });
  if (!(await passwordMatches(req))) {
    return res.status(422).json({ error: 'The current password is incorrect.' });
  }
  const recoveryCodes = generateRecoveryCodes();
  user.mfaRecoveryCodes = recoveryCodes.map(hashRecoveryCode);
  await user.save();
  res.json({ recoveryCodes });
}));

module.exports = router;
