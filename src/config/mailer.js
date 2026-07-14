'use strict';

const nodemailer = require('nodemailer');
const env = require('./env');

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.password,
  },
});

if (env.nodeEnv !== 'test') {
  transporter
    .verify()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('SMTP transporter is ready');
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('SMTP transporter verification failed', {
        code: error && error.code,
        message: error && error.message,
        command: error && error.command,
        responseCode: error && error.responseCode,
      });
    });
}

module.exports = transporter;
