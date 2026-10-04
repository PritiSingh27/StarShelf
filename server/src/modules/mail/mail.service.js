import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../shared/utils/logger.js';

const createTransporter = () => {
  const options = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
  };

  if (env.SMTP_USER) {
    options.auth = {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    };
  }

  return nodemailer.createTransport(options);
};

export const sendVerificationEmail = async (to, token) => {
  const baseUrl = env.CLIENT_URL.split(',')[0].trim();
  const verifyLink = `${baseUrl}/verify-email?token=${token}`;

  const text = `Welcome to StarShelf! Please verify your email address by visiting the following link:\n\n${verifyLink}\n\nThis link will expire in 24 hours.`;
  const html = `<div><h2>Welcome to StarShelf</h2><p>Please verify your email address by clicking the link below:</p><p><a href="${verifyLink}">${verifyLink}</a></p><p>This link expires in 24 hours.</p></div>`;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to,
      subject: 'Verify your StarShelf email address',
      text,
      html,
    });
  } catch (error) {
    logger.error({ error, to }, 'Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (to, token) => {
  const baseUrl = env.CLIENT_URL.split(',')[0].trim();
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  const text = `You requested a password reset for your StarShelf account. Reset your password by visiting the following link:\n\n${resetLink}\n\nThis link will expire in 30 minutes. If you did not request this, please ignore this email.`;
  const html = `<div><h2>StarShelf Password Reset</h2><p>Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 30 minutes.</p></div>`;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to,
      subject: 'Reset your StarShelf password',
      text,
      html,
    });
  } catch (error) {
    logger.error({ error, to }, 'Failed to send password reset email');
  }
};
