import { verifyJwtToken } from '../utils/token.js';
import { prisma } from '../../db/prisma.js';
import { HttpError } from '../utils/httpError.js';

export const auth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7);
    }

    if (!token) {
      return next(new HttpError(401, 'Authentication required'));
    }

    let payload;
    try {
      payload = verifyJwtToken(token);
    } catch {
      return next(new HttpError(401, 'Invalid or expired session token'));
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return next(new HttpError(401, 'User account no longer exists'));
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return next(new HttpError(401, 'Session revoked. Please log in again'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
