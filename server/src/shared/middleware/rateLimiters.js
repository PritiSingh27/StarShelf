import rateLimit from 'express-rate-limit';
import { env } from '../../config/env.js';

const createLimiter = (options) =>
  rateLimit({
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit'],
    handler: (req, res, _next, options) => {
      const retryAfter = Math.ceil(options.windowMs / 1000);
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({
        message: options.message || 'Too many requests, please try again later.',
        requestId: req.requestId || null,
      });
    },
    ...options,
  });

export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : '';
    return `${req.ip}_${email}`;
  },
  message: 'Too many failed login attempts, please try again after 15 minutes',
});

export const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many accounts created from this IP, please try again after an hour',
});

export const authActionLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many request attempts, please try again after an hour',
});

export const writeLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => (req.user?.id ? `user_${req.user.id}` : req.ip),
  message: 'Too many write actions, please slow down',
});

export const adminActionLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => (req.user?.id ? `user_${req.user.id}` : req.ip),
  message: 'Too many admin operations, please slow down',
});
