// The Express app shared by the long-running server (server/index.js) and the Netlify
// function (netlify/functions/api.js).
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const {
  securityHeaders, permissionsPolicy, sanitizeRequest, ensureCsrfCookie, requireCsrf,
} = require('./lib/security');
const config = require('./config');
require('./jobs'); // registers the background job handlers

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const mfaRoutes = require('./routes/mfa');
const userRoutes = require('./routes/users');
const pageRoutes = require('./routes/pages');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

function checkConfig() {
  const secret = process.env.JWT_SECRET || '';
  if (secret.length < 32 || /EXAMPLE|CHANGE_ME/i.test(secret)) {
    throw new Error('JWT_SECRET must be a random string of at least 32 characters. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"');
  }
}

// Turns any error into a short, generic JSON answer. Details go to the server log only, and the
// log never includes request bodies, so passwords, tokens and messages are never written there.
function errorHandler(err, req, res, _next) {
  let status = err.status || err.statusCode || 500;
  let message = 'Something went wrong. Please try again.';

  if (err.type === 'entity.parse.failed') { status = 400; message = 'The request was not valid JSON.'; }
  else if (err.type === 'entity.too.large' || err.code === 'LIMIT_FILE_SIZE') { status = 413; message = 'The upload is too large.'; }
  else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors || {}).map((e) => e.message).join(' ') || 'Some fields are not valid.';
  } else if (err.name === 'CastError') { status = 400; message = 'One of the values has the wrong format.'; }
  else if (err.code === 11000) { status = 409; message = 'That value is already used by another item.'; }
  else if (status >= 400 && status < 500 && err.expose !== false && err.message) message = err.message;

  if (status >= 500) console.error(`[error] ${req.method} ${req.path}: ${err.name}: ${err.message}`);
  if (res.headersSent) return res.end();
  res.status(status).json({ error: message });
}

function createApp({ serveStatic = false } = {}) {
  checkConfig();
  const app = express();

  app.disable('x-powered-by');
  // One proxy hop (Netlify, Render, a load balancer) sits in front, so trust its client IP
  app.set('trust proxy', 1);

  app.use(securityHeaders, permissionsPolicy);
  app.use(compression());
  app.use(cors({
    // Same-origin by default: other sites cannot call the API from a visitor's browser
    origin: config.allowedOrigins.length ? config.allowedOrigins : false,
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(sanitizeRequest);

  // Everything an admin does is CSRF-protected
  app.use(['/api/auth', '/api/admin'], ensureCsrfCookie, requireCsrf);
  app.get('/api/auth/csrf', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api', publicRoutes);
  app.use('/api/admin/mfa', mfaRoutes);
  app.use('/api/admin/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  app.use(pageRoutes);

  if (serveStatic) {
    // Serves the built site (npm run build). Only dist/ is public, never the source tree.
    if (!fs.existsSync(dist)) throw new Error('dist/ is missing. Run `npm run build` first.');
    app.use('/fonts', express.static(path.join(dist, 'fonts'), { maxAge: '365d', immutable: true }));
    app.use('/images', express.static(path.join(dist, 'images'), { maxAge: '7d' }));
    app.use(express.static(dist, { extensions: ['html'], index: 'index.html' }));
    // The admin is a single-page app: its client-side routes all load the same index.html
    app.get(['/admin', '/admin/*'], (_req, res) => {
      res.set('Cache-Control', 'no-cache');
      res.sendFile(path.join(dist, 'admin', 'index.html'));
    });
    app.use((_req, res) => res.status(404).sendFile(path.join(dist, '404.html')));
  } else {
    app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  }

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
