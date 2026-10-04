import bcrypt from 'bcrypt';
import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../shared/utils/httpError.js';
import { generateJwtToken, generateRandomToken, hashToken } from '../../shared/utils/token.js';
import { sendVerificationEmail } from '../mail/mail.service.js';

export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      emailVerified: true,
    },
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return user;
};

export const updateProfile = async (userId, { name, email, address }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const emailChanged = user.email !== normalizedEmail;

  if (emailChanged) {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new HttpError(409, 'Email address is already in use by another account');
    }
  }

  const updateData = {
    name,
    email: normalizedEmail,
    address,
  };

  if (emailChanged && env.REQUIRE_EMAIL_VERIFICATION) {
    updateData.emailVerified = false;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      emailVerified: true,
    },
  });

  if (emailChanged && env.REQUIRE_EMAIL_VERIFICATION) {
    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.authToken.create({
      data: {
        userId,
        type: 'EMAIL_VERIFY',
        tokenHash,
        expiresAt,
      },
    });

    sendVerificationEmail(updatedUser.email, rawToken);
  }

  return updatedUser;
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isMatch) {
    throw new HttpError(400, 'Current password is incorrect.');
  }

  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_COST);
  const updatedTokenVersion = user.tokenVersion + 1;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      tokenVersion: updatedTokenVersion,
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  const freshJwtToken = generateJwtToken(updatedUser);

  return {
    jwtToken: freshJwtToken,
    message: 'Password changed successfully',
  };
};
