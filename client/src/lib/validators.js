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

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

export const profileUpdateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const storeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Store name must be between 3 and 100 characters')
    .max(100, 'Store name must be between 3 and 100 characters'),
  email: emailSchema,
  address: addressSchema,
  categoryId: z.coerce.number().int().positive('Please select a category'),
  ownerId: z.coerce.number().int().positive().nullable().optional(),
});

export const userAdminSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema,
  role: z.enum(['ADMIN', 'USER', 'OWNER']),
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Category name must be between 2 and 50 characters')
    .max(50, 'Category name must be between 2 and 50 characters'),
});
