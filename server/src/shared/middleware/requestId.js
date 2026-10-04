import crypto from 'node:crypto';

export const requestId = (req, res, next) => {
  const existingId = req.headers['x-request-id'];
  const id = existingId && typeof existingId === 'string' ? existingId : crypto.randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};
