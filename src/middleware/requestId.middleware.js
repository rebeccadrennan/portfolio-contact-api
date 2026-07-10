'use strict';

const { randomUUID } = require('node:crypto');

const requestId = (req, res, next) => {
  const incomingRequestId = req.header('x-request-id');
  const id = typeof incomingRequestId === 'string' && incomingRequestId.trim()
    ? incomingRequestId.trim()
    : randomUUID();

  req.requestId = id;
  res.setHeader('x-request-id', id);
  next();
};

module.exports = requestId;
