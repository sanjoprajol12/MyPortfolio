// Every environment variable the server reads, in one place. See .env.example for descriptions.
const list = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
const flag = (value, fallback) => (value === undefined || value === '' ? fallback : /^(1|true|yes|on)$/i.test(value));

const isServerless = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);

module.exports = {
  isProduction: process.env.NODE_ENV === 'production' || isServerless,
  isServerless,

  // Public address of the site, used in canonical URLs, the sitemap and links inside emails.
  // Netlify sets URL automatically; SITE_URL overrides it (for a custom domain).
  siteUrl: String(process.env.SITE_URL || process.env.URL || 'http://localhost:3000').replace(/\/+$/, ''),

  // Extra origins allowed to call the API from a browser. The site and admin are same-origin,
  // so this is empty unless the admin is hosted somewhere else.
  allowedOrigins: list(process.env.ALLOWED_ORIGINS),

  // Admins must turn on two-step verification before they can edit anything
  requireMfa: flag(process.env.REQUIRE_MFA, true),

  sessionHours: Number(process.env.SESSION_HOURS) || 12,

  mail: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || process.env.SMTP_USER || '',
    // Where contact form messages and security alerts are sent
    notifyTo: process.env.NOTIFY_EMAIL || '',
  },

  // Optional chat webhook (Slack, Discord or any service that accepts {"text": "..."}) for alerts
  alertWebhookUrl: process.env.ALERT_WEBHOOK_URL || '',

  // Cloudflare Turnstile: bot check on the contact form, used only when both keys are set
  turnstile: {
    siteKey: process.env.TURNSTILE_SITE_KEY || '',
    secretKey: process.env.TURNSTILE_SECRET_KEY || '',
  },

  // Google Analytics 4, loaded in the browser only after the visitor accepts analytics cookies
  gaMeasurementId: process.env.GA_MEASUREMENT_ID || '',
};
