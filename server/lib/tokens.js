const jwt = require('jsonwebtoken');

// Sessions are stateless JWTs so they work across serverless instances. The token carries the
// user's tokenVersion ("tv"); bumping it on the user signs out every token issued before.

function createSessionToken(user) {
  return jwt.sign(
    { id: String(user._id), username: user.username, tv: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifySessionToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Short-lived two-step challenge tokens must never work as a session
    if (payload.typ) return null;
    return { id: payload.id, tv: payload.tv || 0 };
  } catch {
    return null;
  }
}

// Issued after a correct password when the account has two-step verification;
// exchanged for a session at POST /api/auth/login/mfa
function createMfaChallengeToken(user) {
  return jwt.sign(
    { typ: 'mfa', id: String(user._id), tv: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );
}

function verifyMfaChallengeToken(token) {
  try {
    const payload = jwt.verify(String(token || ''), process.env.JWT_SECRET);
    return payload.typ === 'mfa' ? payload : null;
  } catch {
    return null;
  }
}

module.exports = { createSessionToken, verifySessionToken, createMfaChallengeToken, verifyMfaChallengeToken };
