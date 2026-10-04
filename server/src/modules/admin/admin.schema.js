import { z } from 'zod';
import { nameSchema, emailSchema, passwordSchema, addressSchema } from '../auth/auth.schema.js';

export const createUserSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    address: addressSchema,
    role: z.enum(['ADMIN', 'USER', 'OWNER']),
  })
  .strict();

export const createStoreSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Store name must be between 3 and 100 characters')
      .max(100, 'Store name must be between 3 and 100 characters'),
    email: emailSchema,
    address: addressSchema,
    categoryId: z.coerce.number().int().positive('Category ID is required'),
    ownerId: z.coerce.number().int().positive().nullable().optional(),
  })
  .strict();

export const getUsersQuerySchema = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(['ADMIN', 'USER', 'OWNER']).optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  })
  .strict();

export const getStoresQuerySchema = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    categoryId: z.coerce.number().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  })
  .strict();
