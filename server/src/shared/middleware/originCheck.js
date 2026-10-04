import { env } from '../../config/env.js';
import { HttpError } from '../utils/httpError.js';

export const originCheck = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const allowedOrigins = env.CLIENT_URL.split(',').map((o) => o.trim());
  const origin = req.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    return next(new HttpError(403, 'Cross-origin request blocked'));
  }

  const requestedWith = req.headers['x-requested-with'];
  if (requestedWith !== 'XMLHttpRequest') {
    return next(new HttpError(403, 'Missing or invalid X-Requested-With header'));
  }

  next();
};
