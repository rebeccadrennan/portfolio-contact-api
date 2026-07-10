'use strict';

require('dotenv').config();

const required = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_APP_PASSWORD',
  'CONTACT_TO_EMAIL',
  'FRONTEND_URL',
];

const missing = required.filter((key) => !process.env[key]);
const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  frontendUrl: process.env.FRONTEND_URL || '',
  allowedOrigins: [...new Set(allowedOrigins)],
  missing,
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 465,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_APP_PASSWORD,
  },
  contactToEmail: process.env.CONTACT_TO_EMAIL,
};
