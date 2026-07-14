import type { ErrorRequestHandler } from 'express';

import { type Env } from '../config/env';
import env from '../config/env';

type HttpError = Error & {
  status?: number;
  statusCode?: number;
};

const { isProduction } = env as Env;

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  void _next;
  const status = (err as HttpError).status || (err as HttpError).statusCode || 500;

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

export default errorHandler;
