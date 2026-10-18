const crypto = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');
const Site = require('../models/Site');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Project = require('../models/Project');
const Message = require('../models/Message');
const { buildPdf } = require('../lib/resumePdf');
const wrap = require('../lib/asyncHandler');
const cache = require('../lib/cache');
const { enqueue, kick } = require('../lib/queue');
const { EMAIL_RE } = require('../lib/accounts');
const { looksAutomated, looksLikeSpam, verifyTurnstile } = require('../lib/spam');
const config = require('../config');

const router = express.Router();
const CONTENT_TTL_MS = 30_000;

const pdfLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many PDF downloads. Please try again later.' },
});

const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many messages from your network. Please try again in 15 minutes, or email me directly.' },
});

// Everything the public site renders, read once and shared by all visitors for a short time
function loadContent() {
  return cache.remember('content', CONTENT_TTL_MS, async () => {
    const [site, skills, experience, projects] = await Promise.all([
      Site.findOne().select('-__v').lean(),
      Skill.find().select('-__v -createdAt').sort({ order: 1 }).lean(),
      Experience.find().select('-__v -createdAt').sort({ order: 1 }).lean(),
      Project.find().select('-__v -createdAt').sort({ order: 1 }).lean(),
    ]);
    // An uploaded photo is stored as a data: URL. Sending it inside the JSON would add megabytes to
    // every page view, so the site gets a cacheable image address instead.
    if (site?.hero?.photoUrl?.startsWith('data:')) {
      const version = crypto.createHash('sha1').update(site.hero.photoUrl).digest('hex').slice(0, 12);
      site.hero.photoUrl = `/api/media/hero-photo?v=${version}`;
    }
    return { site, skills, experience, projects };
  });
}

function setPublicCache(res, seconds) {
  // Browsers revalidate every time (cheap, with ETag); Netlify's CDN may serve it for `seconds`
  res.set('Cache-Control', 'public, max-age=0, must-revalidate');
  res.set('Netlify-CDN-Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=120`);
}

router.get('/content', wrap(async (_req, res) => {
  setPublicCache(res, 30);
  res.json(await loadContent());
}));

// Browser-side settings that are safe to publish (no secrets)
router.get('/config', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.json({
    gaMeasurementId: config.gaMeasurementId || null,
    turnstileSiteKey: config.turnstile.secretKey ? config.turnstile.siteKey : null,
  });
});

router.get('/media/hero-photo', wrap(async (_req, res) => {
  const site = await Site.findOne().select('hero.photoUrl').lean();
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(site?.hero?.photoUrl || '');
  if (!match) return res.status(404).end();
  res.set('Content-Type', match[1]);
  // The address changes whenever the photo does (?v=...), so it can be cached for a year
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(Buffer.from(match[2], 'base64'));
}));

router.post('/messages', messageLimiter, wrap(async (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const message = String(body.message || '').trim();

  const errors = {};
  if (!name) errors.name = 'Please enter your name.';
  else if (name.length > 120) errors.name = 'Name must be 120 characters or fewer.';
  if (!email) errors.email = 'Please enter your email address.';
  else if (email.length > 160 || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';
  if (!message) errors.message = 'Please write a message.';
  else if (message.length < 10) errors.message = 'Please write at least a sentence so I know how to help.';
  else if (message.length > 4000) errors.message = 'Message must be 4,000 characters or fewer.';
  if (body.consent !== true && body.consent !== 'true' && body.consent !== 'on') {
    errors.consent = 'Please agree to the privacy policy so I can store and answer your message.';
  }
  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fields: errors });
  }

  // Bots get the same answer as people, so they cannot tell they were filtered
  if (looksAutomated(body)) return res.status(201).json({ ok: true });

  if (!(await verifyTurnstile(body.turnstileToken, req.ip))) {
    return res.status(400).json({ error: 'The anti-spam check failed. Please try again.' });
  }

  const spam = looksLikeSpam(message);
  await Message.create({ name, email, message, consentAt: new Date(), spam });

  if (!spam) {
    try {
      await enqueue('mail.contact-notification', { name, email, message });
      await kick();
    } catch (err) {
      // The message is saved either way; the email is only a notification
      console.error(`[contact] could not queue notification: ${err.message}`);
    }
  }
  res.status(201).json({ ok: true });
}));

async function sendPdf(_req, res, kind) {
  const { site, skills, experience, projects } = await loadContent();
  if (!site) return res.status(404).json({ error: 'Site content not found.' });
  const full = await Site.findOne().select('hero.photoUrl').lean();
  buildPdf(res, { kind, site: { ...site, hero: { ...site.hero, photoUrl: full?.hero?.photoUrl } }, skills, experience, projects });
}

router.get('/resume.pdf', pdfLimiter, wrap((req, res) => sendPdf(req, res, 'resume')));
router.get('/cv.pdf', pdfLimiter, wrap((req, res) => sendPdf(req, res, 'cv')));

module.exports = router;
module.exports.loadContent = loadContent;
