'use strict';

const nodemailer = require('nodemailer');
const env = require('./env');

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  family: 4,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.password,
  },
});

module.exports = transporter;
