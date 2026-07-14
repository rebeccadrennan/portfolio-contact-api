'use strict';

require('dotenv').config();

const required = [
  'FRONTEND_URL',
  'RESEND_API_KEY',
];

const missing = required.filter((key) => !process.env[key]);
if (!process.env.CONTACT_TO_EMAIL && !process.env.CONTACT_EMAIL) {
  missing.push('CONTACT_TO_EMAIL');
}
const frontendOrigin = process.env.FRONTEND_URL;

const getAlternateSubdomainOrigin = (origin) => {
  if (!origin) return null;

  try {
    const parsed = new URL(origin);
    const { hostname } = parsed;

    if (hostname.startsWith('www.')) {
      parsed.hostname = hostname.slice(4);
      return parsed.toString().replace(/\/$/, '');
    }

    parsed.hostname = `www.${hostname}`;
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
};

const allowedOrigins = [frontendOrigin, getAlternateSubdomainOrigin(frontendOrigin)].filter(Boolean);

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  frontendUrl: process.env.FRONTEND_URL || '',
  allowedOrigins: [...new Set(allowedOrigins)],
  missing,
  resendApiKey: process.env.RESEND_API_KEY,
  resendFrom: process.env.RESEND_FROM || 'Portfolio Contact <onboarding@resend.dev>',
  contactToEmail: process.env.CONTACT_TO_EMAIL || process.env.CONTACT_EMAIL,
};
