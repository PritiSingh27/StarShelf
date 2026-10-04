import { z } from 'zod';
import { nameSchema, emailSchema, addressSchema, passwordSchema } from '../auth/auth.schema.js';

export const updateProfileSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    address: addressSchema,
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  })
  .strict();
