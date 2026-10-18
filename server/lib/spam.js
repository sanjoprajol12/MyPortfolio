const { turnstile } = require('../config');

// Contact form bot checks. Each one is cheap; together they stop nearly all automated spam
// without making real visitors solve puzzles.

const MIN_FILL_MS = 3_000;

// Hidden "website" field that people never see or fill in, and a minimum time on the page
function looksAutomated(body) {
  if (String(body.website || '').trim()) return true;
  const elapsed = Number(body.elapsedMs);
  return Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_FILL_MS;
}

// Content that is almost always spam: lots of links, or link markup
function looksLikeSpam(message) {
  const links = (message.match(/https?:\/\/|www\./gi) || []).length;
  return links > 3 || /\[url=|<a\s+href/i.test(message);
}

async function verifyTurnstile(token, ip) {
  if (!turnstile.secretKey) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: turnstile.secretKey, response: String(token), remoteip: ip || '' }),
      signal: AbortSignal.timeout(6_000),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    // Cloudflare unreachable: let the other checks decide rather than blocking every visitor
    return true;
  }
}

module.exports = { looksAutomated, looksLikeSpam, verifyTurnstile };
