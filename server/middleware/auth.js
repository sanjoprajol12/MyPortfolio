const User = require('../models/User');
const { verifySessionToken } = require('../lib/tokens');

// Verifies the Bearer token, then makes sure the account still exists and has not signed out
// all sessions (password change, "sign out everywhere", deleted account) since it was issued.
async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Sign in required' });
  }
  const session = verifySessionToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired. Sign in again.' });
  }
  try {
    const user = await User.findById(session.id);
    if (!user || (user.tokenVersion || 0) !== session.tv) {
      return res.status(401).json({ error: 'Session expired. Sign in again.' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admins can manage admin accounts.' });
  }
  next();
}

module.exports = { auth, requireSuperAdmin };
