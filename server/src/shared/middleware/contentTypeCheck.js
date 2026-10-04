import { HttpError } from '../utils/httpError.js';

export const contentTypeCheck = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentLength = req.headers['content-length'];
    if (contentLength && parseInt(contentLength, 10) > 0) {
      if (!req.is('application/json')) {
        return next(new HttpError(400, 'Content-Type must be application/json'));
      }
    }
  }
  next();
};
