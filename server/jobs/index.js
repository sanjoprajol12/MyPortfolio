// Job handlers. Mail and chat alerts are separate job types, so a broken SMTP server never
// blocks an alert (and the reverse), and each retries on its own schedule.
const { registerHandler, enqueue } = require('../lib/queue');
const { sendMail } = require('../lib/mailer');
const config = require('../config');

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

registerHandler('mail.contact-notification', async ({ name, email, message }) => {
  if (!config.mail.notifyTo) {
    throw Object.assign(new Error('NOTIFY_EMAIL is not set'), { permanent: true });
  }
  await sendMail({
    to: config.mail.notifyTo,
    replyTo: email,
    subject: `New portfolio message from ${name}`,
    text: `${name} <${email}> wrote:\n\n${message}\n\nReply to this email to answer, or open ${config.siteUrl}/admin/messages`,
    html: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt; wrote:</p>`
      + `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`
      + `<p>Reply to this email to answer, or <a href="${escapeHtml(config.siteUrl)}/admin/messages">open the inbox</a>.</p>`,
  });
}, { redact: ['message'] });

registerHandler('mail.password-reset', async ({ to, username, link, minutes }) => {
  await sendMail({
    to,
    subject: 'Reset your portfolio admin password',
    text: `Hi ${username},\n\nUse this link to choose a new password. It works once and expires in ${minutes} minutes:\n\n${link}\n\nIf you did not ask for this, ignore this email; your password stays the same.`,
    html: `<p>Hi ${escapeHtml(username)},</p><p>Use this link to choose a new password. It works once and expires in ${minutes} minutes:</p>`
      + `<p><a href="${escapeHtml(link)}">Reset my password</a></p>`
      + '<p>If you did not ask for this, ignore this email; your password stays the same.</p>',
  });
}, { redact: ['link'] });

registerHandler('mail.security-alert', async ({ subject, text }) => {
  if (!config.mail.notifyTo) throw Object.assign(new Error('NOTIFY_EMAIL is not set'), { permanent: true });
  await sendMail({ to: config.mail.notifyTo, subject, text });
});

registerHandler('notify.webhook', async ({ text }) => {
  const res = await fetch(config.alertWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, content: text }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
});

// Raises at most one alert per kind per hour, by email and/or webhook
async function securityAlert(kind, detail) {
  const hour = new Date().toISOString().slice(0, 13);
  const subject = `Security alert on your portfolio: ${kind}`;
  const text = `${detail}\n\nTime (UTC): ${new Date().toISOString()}\nSite: ${config.siteUrl}`;
  const jobs = [];
  if (config.mail.notifyTo) jobs.push(enqueue('mail.security-alert', { subject, text }, { dedupeKey: `alert-mail:${kind}:${hour}` }));
  if (config.alertWebhookUrl) jobs.push(enqueue('notify.webhook', { text: `${subject}\n${text}` }, { dedupeKey: `alert-hook:${kind}:${hour}` }));
  await Promise.allSettled(jobs);
}

module.exports = { securityAlert };
