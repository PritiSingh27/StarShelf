import { z } from 'zod';

export const nameSchema = z
  .string()
  .trim()
  .min(20, 'Name must be between 20 and 60 characters')
  .max(60, 'Name must be between 20 and 60 characters');

export const addressSchema = z
  .string()
  .trim()
  .min(1, 'Address is required')
  .max(400, 'Address must not exceed 400 characters');

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be 8 to 16 characters')
  .max(16, 'Password must be 8 to 16 characters')
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must include at least one uppercase letter',
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: 'Password must include at least one special character',
  });

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    address: addressSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export const verifyEmailSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    newPassword: passwordSchema,
  })
  .strict();
