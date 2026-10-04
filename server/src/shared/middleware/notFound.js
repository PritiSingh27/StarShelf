import { HttpError } from '../utils/httpError.js';

export const notFound = (req, res, next) => {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} not found`));
};
