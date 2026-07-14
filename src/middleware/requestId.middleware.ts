import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

const requestId: RequestHandler = (req, res, next) => {
  const incomingRequestId = req.header('x-request-id');
  const id = typeof incomingRequestId === 'string' && incomingRequestId.trim()
    ? incomingRequestId.trim()
    : randomUUID();

  req.requestId = id;
  res.setHeader('x-request-id', id);
  next();
};

export default requestId;
