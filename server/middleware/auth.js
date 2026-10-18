const User = require('../models/User');
const { verifySessionToken } = require('../lib/tokens');
const { SESSION_COOKIE } = require('../lib/security');
const { requireMfa } = require('../config');

// Verifies the session cookie, then makes sure the account still exists and has not signed out
// all sessions (password change, "sign out everywhere", deleted account) since it was issued.
// Every permission check happens here on the server; the admin UI only hides what would fail.
async function auth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    return res.status(401).json({ error: 'Sign in required' });
  }
  const session = verifySessionToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
  try {
    const user = await User.findById(session.id);
    if (!user || (user.tokenVersion || 0) !== session.tv) {
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// With REQUIRE_MFA on (the default), an account without two-step verification can only reach
// the endpoints it needs to set it up.
function requireMfaEnrolled(req, res, next) {
  if (requireMfa && !req.user?.mfaEnabled) {
    return res.status(403).json({
      error: 'Turn on two-step verification on the Security page before making changes.',
      code: 'mfa_setup_required',
    });
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admins can manage admin accounts.' });
  }
  next();
}

module.exports = { auth, requireMfaEnrolled, requireSuperAdmin };
