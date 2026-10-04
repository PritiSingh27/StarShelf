import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';
import { env } from '../../config/env.js';

// Express error handler middleware requiring four parameters
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const requestId = req.requestId || null;

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errors: err.errors,
      code: err.code || undefined,
      requestId,
    });
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors,
      requestId,
    });
  }

  if (err.code === 'P2002') {
    const target = err.meta?.target;
    const fieldName = Array.isArray(target) ? target.join(', ') : 'field';
    return res.status(409).json({
      message: `A record with this ${fieldName} already exists`,
      requestId,
    });
  }

  logger.error({ err, requestId, url: req.originalUrl, method: req.method }, 'Unhandled server error');

  const statusCode = err.status || err.statusCode || 500;
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error';

  return res.status(statusCode).json({
    message,
    requestId,
  });
};
