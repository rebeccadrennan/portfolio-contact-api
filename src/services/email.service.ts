import { Resend } from 'resend';

import env from '../config/env';

interface ContactEmailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type ServiceError = Error & {
  status?: number;
  code?: string;
  cause?: unknown;
  command?: string;
  responseCode?: number;
};

const resendClient = env.resendApiKey ? new Resend(env.resendApiKey) : null;
const resendConfigMissing = env.missing;

/**
 * Sends a contact form email.
 * @param data Contact payload from the validated API request.
 * @returns {Promise<void>}
 */
export const sendContactEmail = async ({
  name,
  email,
  subject,
  message,
}: ContactEmailPayload): Promise<void> => {
  if (resendConfigMissing.length > 0) {
    const error = new Error(
      `Email service is not configured. Missing: ${resendConfigMissing.join(', ')}`
    ) as ServiceError;
    error.status = 503;
    throw error;
  }

  if (!resendClient) {
    const error = new Error('Email service is not configured. Missing: RESEND_API_KEY') as ServiceError;
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

  try {
    const result = await resendClient.emails.send({
      from: env.resendFrom,
      to: env.contactToEmail as string,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      text,
      html,
    });

    if (result && result.error) {
      const failure = new Error(result.error.message || 'Resend API request failed.') as ServiceError;
      failure.code = result.error.name || 'resend_error';
      throw failure;
    }
  } catch (cause: unknown) {
    const causeError = cause as Partial<ServiceError>;

    if (env.nodeEnv !== 'test') {
      // eslint-disable-next-line no-console
      console.error('Contact email delivery failed', {
        code: causeError?.code,
        message: causeError?.message,
        command: causeError?.command,
        responseCode: causeError?.responseCode,
      });
    }

    const error = new Error('Email service is temporarily unavailable.') as ServiceError;
    error.status = 503;
    error.cause = cause;
    throw error;
  }
};

/** Minimal HTML escaping for plain string values in HTML email bodies. */
function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
