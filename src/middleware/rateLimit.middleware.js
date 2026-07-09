'use strict';

const rateLimit = require('express-rate-limit');

const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please wait a moment before trying again.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

module.exports = { contactRateLimit };
