'use strict';

const { isProduction } = require('../config/env');

const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;

  if (!isProduction) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message: isProduction
      ? 'Sorry, something went wrong. Please try again later.'
      : err.message || 'Internal Server Error',
    requestId: req.requestId,
  });
};

module.exports = errorHandler;
