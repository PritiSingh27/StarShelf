import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../../config/env.js';

export const generateJwtToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    env.JWT_SECRET,
    {
      algorithm: 'HS256',
      issuer: 'starshelf',
      audience: 'starshelf-client',
      expiresIn: '7d',
    }
  );
};

export const verifyJwtToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: 'starshelf',
    audience: 'starshelf-client',
  });
};

export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (rawToken) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

export const getAuthCookieOptions = () => {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
};
