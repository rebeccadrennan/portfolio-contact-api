'use strict';

const transporter = require('../config/mailer');
const env = require('../config/env');

const smtpConfigMissing = env.missing;

/**
 * Sends a contact form email.
 * @param {{ name: string, email: string, subject: string, message: string }} data
 * @returns {Promise<void>}
 */
const sendContactEmail = async ({ name, email, subject, message }) => {
  if (smtpConfigMissing.length > 0) {
    const error = new Error(
      `Email service is not configured. Missing: ${smtpConfigMissing.join(', ')}`
    );
    error.status = 503;
    throw error;
  }

  const timestamp = new Date().toUTCString();

  const html = `
    <h2>New Contact Form Submission</h2>
    <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td><strong>Subject</strong></td><td>${escapeHtml(subject)}</td></tr>
      <tr><td><strong>Sent at</strong></td><td>${timestamp}</td></tr>
      <tr><td><strong>Source</strong></td><td>${escapeHtml(env.frontendUrl)}</td></tr>
    </table>
    <h3>Message</h3>
    <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
  `;

  const text = [
    'New Contact Form Submission',
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Subject: ${subject}`,
    `Sent at: ${timestamp}`,
    `Source:  ${env.frontendUrl}`,
    '',
    'Message:',
    message,
  ].join('\n');

  await transporter.sendMail({
    from: `"Portfolio Contact" <${env.smtp.user}>`,
    to: env.contactToEmail,
    replyTo: email,
    subject: `[Contact] ${subject}`,
    text,
    html,
  });
};

/** Minimal HTML escaping for plain string values in HTML email bodies. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { sendContactEmail };
