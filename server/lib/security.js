const crypto = require('crypto');
const helmet = require('helmet');
const { isProduction } = require('../config');

// ── Content Security Policy ──────────────────────────────────────────────────────────────────
// Netlify serves the static files with the same policy from netlify.toml; keep the two in sync.
const GA = ['https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com'];
const TURNSTILE = 'https://challenges.cloudflare.com';

const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://www.googletagmanager.com', TURNSTILE],
      // Vuetify sets inline styles at runtime; the admin loads its font from Google Fonts
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', ...GA],
      connectSrc: ["'self'", ...GA, TURNSTILE],
      frameSrc: [TURNSTILE],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      manifestSrc: ["'self'"],
      // Plain http is only used for local development
      upgradeInsecureRequests: isProduction ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  strictTransportSecurity: { maxAge: 63072000, includeSubDomains: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
});

function permissionsPolicy(_req, res, next) {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()');
  next();
}

// ── Request sanitising ───────────────────────────────────────────────────────────────────────
// Removes keys that MongoDB would read as operators ("$where", "$gt") or paths ("a.b") from
// anything a client sends, so request data can never change the shape of a query or update.
function stripOperators(value, depth = 0) {
  if (depth > 20) return undefined;
  if (Array.isArray(value)) return value.map((item) => stripOperators(item, depth + 1));
  if (value && typeof value === 'object' && !(value instanceof Date) && !Buffer.isBuffer(value)) {
    const clean = {};
    for (const [key, item] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.') || key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      clean[key] = stripOperators(item, depth + 1);
    }
    return clean;
  }
  return value;
}

function sanitizeRequest(req, _res, next) {
  if (req.body && typeof req.body === 'object') req.body = stripOperators(req.body);
  if (req.params) req.params = stripOperators(req.params);
  // Express 4 lets us replace the parsed query; nested query objects are never needed here
  for (const key of Object.keys(req.query || {})) {
    if (typeof req.query[key] !== 'string') delete req.query[key];
  }
  next();
}

// ── Session and CSRF cookies ─────────────────────────────────────────────────────────────────
// The session JWT lives in an httpOnly cookie that page scripts cannot read. Requests that change
// data must also echo the readable CSRF cookie in the X-CSRF-Token header (double-submit), which a
// page on another site cannot do.
const SESSION_COOKIE = 'pf_session';
const CSRF_COOKIE = 'pf_csrf';
const CSRF_HEADER = 'x-csrf-token';

function isHttps(req) {
  return req.secure || req.headers['x-forwarded-proto'] === 'https';
}

function setSessionCookie(req, res, token, hours) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isHttps(req),
    sameSite: 'strict',
    path: '/api',
    maxAge: hours * 60 * 60 * 1000,
  });
}

function clearSessionCookie(req, res) {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: isHttps(req), sameSite: 'strict', path: '/api' });
}

function ensureCsrfCookie(req, res, next) {
  if (!req.cookies?.[CSRF_COOKIE]) {
    const token = crypto.randomBytes(24).toString('hex');
    req.cookies[CSRF_COOKIE] = token;
    res.cookie(CSRF_COOKIE, token, { httpOnly: false, secure: isHttps(req), sameSite: 'strict', path: '/' });
  }
  next();
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function requireCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  const cookie = String(req.cookies?.[CSRF_COOKIE] || '');
  const header = String(req.get(CSRF_HEADER) || '');
  const valid = cookie.length > 0
    && cookie.length === header.length
    && crypto.timingSafeEqual(Buffer.from(cookie), Buffer.from(header));
  if (!valid) {
    return res.status(403).json({ error: 'Your session could not be verified. Reload the page and try again.', code: 'csrf' });
  }
  next();
}

module.exports = {
  securityHeaders,
  permissionsPolicy,
  sanitizeRequest,
  stripOperators,
  setSessionCookie,
  clearSessionCookie,
  ensureCsrfCookie,
  requireCsrf,
  SESSION_COOKIE,
};
