const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { auth, requireSuperAdmin } = require('../middleware/auth');
const wrap = require('../lib/asyncHandler');
const { createSessionToken } = require('../lib/tokens');
const { passwordError, cleanUsername, usernameError, isUsernameTaken } = require('../lib/accounts');

// Admin account management (super admins only)
const router = express.Router();
router.use(auth, requireSuperAdmin);

const cleanRole = (role) => (role === 'super_admin' ? 'super_admin' : 'admin');

async function findUser(req, res) {
  const user = mongoose.isValidObjectId(req.params.id) ? await User.findById(req.params.id) : null;
  if (!user) res.status(404).json({ error: 'Admin user not found.' });
  return user;
}

// At least one super admin must remain, or nobody could manage accounts again
async function isLastSuperAdmin(user) {
  if (user.role !== 'super_admin') return false;
  return (await User.countDocuments({ role: 'super_admin', _id: { $ne: user._id } })) === 0;
}

router.get('/', wrap(async (_req, res) => {
  const users = await User.find().sort({ createdAt: 1 });
  res.json(users.map((user) => user.toPublic()));
}));

router.post('/', wrap(async (req, res) => {
  const username = cleanUsername(req.body.username);
  const invalid = usernameError(username) || passwordError(req.body.password);
  if (invalid) return res.status(400).json({ error: invalid });
  if (await isUsernameTaken(username)) {
    return res.status(400).json({ error: `An admin with username "${username}" already exists.` });
  }

  const user = await User.create({
    username,
    passwordHash: await bcrypt.hash(req.body.password, 12),
    role: cleanRole(req.body.role),
  });
  res.status(201).json(user.toPublic());
}));

router.put('/:id', wrap(async (req, res) => {
  const user = await findUser(req, res);
  if (!user) return;
  const isSelf = String(user._id) === String(req.user._id);

  if (req.body.username !== undefined) {
    const username = cleanUsername(req.body.username);
    const invalid = usernameError(username);
    if (invalid) return res.status(400).json({ error: invalid });
    if (await isUsernameTaken(username, user._id)) {
      return res.status(400).json({ error: `Username "${username}" is already taken.` });
    }
    user.username = username;
  }

  if (req.body.role !== undefined) {
    const role = cleanRole(req.body.role);
    if (role !== 'super_admin' && await isLastSuperAdmin(user)) {
      return res.status(400).json({ error: 'There must be at least one super admin.' });
    }
    user.role = role;
  }

  let token;
  if (req.body.password) {
    const invalid = passwordError(req.body.password);
    if (invalid) return res.status(400).json({ error: invalid });
    user.passwordHash = await bcrypt.hash(req.body.password, 12);
    // Signs the account out everywhere; keep the editor signed in when they changed their own
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    if (isSelf) token = createSessionToken(user);
  }

  await user.save();
  res.json({ user: user.toPublic(), ...(token && { token }) });
}));

// For an admin who lost their phone and recovery codes
router.delete('/:id/mfa', wrap(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    return res.status(400).json({ error: 'Use the Security page to change your own two-step verification.' });
  }
  const user = await findUser(req, res);
  if (!user) return;
  user.clearMfa();
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  res.json({ ok: true });
}));

router.delete('/:id', wrap(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }
  const user = await findUser(req, res);
  if (!user) return;
  if (await isLastSuperAdmin(user)) {
    return res.status(400).json({ error: 'There must be at least one super admin.' });
  }
  // Its tokens stop working because the auth middleware requires the account to exist
  await user.deleteOne();
  res.json({ ok: true });
}));

module.exports = router;
