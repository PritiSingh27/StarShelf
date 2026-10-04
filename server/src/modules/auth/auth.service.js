import bcrypt from 'bcrypt';
import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../shared/utils/httpError.js';
import { generateJwtToken, generateRandomToken, hashToken } from '../../shared/utils/token.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../mail/mail.service.js';

const DUMMY_HASH = '$2b$12$eImiTXuWVxfM37uY4JANjO56E4a3g.15a6b0c7y0bCgXm7yD.Kk1m';

export const registerUser = async ({ name, email, password, address }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new HttpError(409, 'Email address is already registered');
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_COST);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      address,
      role: 'USER',
      emailVerified: false,
    },
  });

  const rawToken = generateRandomToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.authToken.create({
    data: {
      userId: user.id,
      type: 'EMAIL_VERIFY',
      tokenHash,
      expiresAt,
    },
  });

  sendVerificationEmail(user.email, rawToken);

  const jwtToken = generateJwtToken(user);

  return {
    jwtToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      emailVerified: user.emailVerified,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw new HttpError(401, 'Email or password is incorrect.');
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new HttpError(401, 'Account locked due to failed login attempts. Try again later.');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    const newFailCount = user.failedLoginCount + 1;
    let lockedUntil = null;

    if (newFailCount >= 5) {
      lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: newFailCount,
        lockedUntil,
      },
    });

    throw new HttpError(401, 'Email or password is incorrect.');
  }

  if (user.failedLoginCount > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });
  }

  const jwtToken = generateJwtToken(user);

  return {
    jwtToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      emailVerified: user.emailVerified,
    },
  };
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      address: true,
      emailVerified: true,
    },
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return {
    ...user,
    emailVerificationRequired: env.REQUIRE_EMAIL_VERIFICATION,
  };
};

export const verifyEmail = async ({ token }) => {
  const tokenHash = hashToken(token);

  const authToken = await prisma.authToken.findUnique({
    where: { tokenHash },
  });

  if (
    !authToken ||
    authToken.type !== 'EMAIL_VERIFY' ||
    authToken.usedAt ||
    authToken.expiresAt < new Date()
  ) {
    throw new HttpError(400, 'Invalid or expired verification token');
  }

  await prisma.$transaction([
    prisma.authToken.update({
      where: { id: authToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: authToken.userId },
      data: { emailVerified: true },
    }),
  ]);

  return { message: 'Email verified successfully' };
};

export const resendVerificationEmail = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (user.emailVerified) {
    throw new HttpError(400, 'Email is already verified');
  }

  const rawToken = generateRandomToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.authToken.create({
    data: {
      userId: user.id,
      type: 'EMAIL_VERIFY',
      tokenHash,
      expiresAt,
    },
  });

  sendVerificationEmail(user.email, rawToken);

  return { message: 'Verification email sent' };
};

export const forgotPassword = async ({ email }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user) {
    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.authToken.create({
      data: {
        userId: user.id,
        type: 'PASSWORD_RESET',
        tokenHash,
        expiresAt,
      },
    });

    sendPasswordResetEmail(user.email, rawToken);
  }

  return { message: 'If that email address is in our system, a password reset link has been sent.' };
};

export const resetPassword = async ({ token, newPassword }) => {
  const tokenHash = hashToken(token);

  const authToken = await prisma.authToken.findUnique({
    where: { tokenHash },
  });

  if (
    !authToken ||
    authToken.type !== 'PASSWORD_RESET' ||
    authToken.usedAt ||
    authToken.expiresAt < new Date()
  ) {
    throw new HttpError(400, 'Invalid or expired password reset token');
  }

  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_COST);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: authToken.userId } });

    await tx.user.update({
      where: { id: authToken.userId },
      data: {
        passwordHash,
        tokenVersion: user.tokenVersion + 1,
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });

    await tx.authToken.update({
      where: { id: authToken.id },
      data: { usedAt: new Date() },
    });

    await tx.authToken.deleteMany({
      where: {
        userId: authToken.userId,
        type: 'PASSWORD_RESET',
        id: { not: authToken.id },
      },
    });
  });

  return { message: 'Password reset successfully' };
};
