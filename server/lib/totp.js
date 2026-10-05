const crypto = require('crypto');

// RFC 6238 time-based one-time passwords (Google Authenticator, Authy, 1Password, ...)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;
const DIGITS = 6;
// Accept the previous and next 30s window to tolerate clock drift
const DRIFT_STEPS = 1;

function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(text) {
  const clean = String(text).toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of clean) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function generateTotpSecret() {
  return base32Encode(crypto.randomBytes(20));
}

function codeForStep(secret, step) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac = crypto.createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary = hmac.readUInt32BE(offset) & 0x7fffffff;
  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0');
}

// Checks a 6-digit code. Returns the matched time step, or null.
// Pass the last accepted step so a code can never be used twice.
function verifyTotp(secret, code, lastUsedStep = -1) {
  const clean = String(code || '').replace(/\s+/g, '');
  if (!secret || !/^\d{6}$/.test(clean)) return null;

  const current = Math.floor(Date.now() / 1000 / STEP_SECONDS);
  for (let step = current - DRIFT_STEPS; step <= current + DRIFT_STEPS; step++) {
    if (step <= lastUsedStep) continue;
    const expected = Buffer.from(codeForStep(secret, step));
    if (crypto.timingSafeEqual(expected, Buffer.from(clean))) return step;
  }
  return null;
}

function totpAuthUrl(secret, accountName, issuer) {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({ secret, issuer, algorithm: 'SHA1', digits: String(DIGITS), period: String(STEP_SECONDS) });
  return `otpauth://totp/${label}?${params}`;
}

// One-time backup codes, shown once and stored only as SHA-256 hashes
function generateRecoveryCodes(count = 8) {
  return Array.from({ length: count }, () => {
    const raw = crypto.randomBytes(5).toString('hex');
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}

function hashRecoveryCode(code) {
  const normalized = String(code || '').toLowerCase().replace(/[^a-f0-9]/g, '');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

module.exports = {
  generateTotpSecret,
  verifyTotp,
  totpAuthUrl,
  generateRecoveryCodes,
  hashRecoveryCode,
  codeForStep,
  STEP_SECONDS,
};
