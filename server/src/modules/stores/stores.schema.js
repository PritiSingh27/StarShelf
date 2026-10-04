import { z } from 'zod';

export const storeQuerySchema = z
  .object({
    search: z.string().optional(),
    categoryId: z.coerce.number().optional(),
    sortBy: z.enum(['name', 'address', 'rating', 'top']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  })
  .strict();

export const ratingSchema = z
  .object({
    value: z
      .number()
      .int()
      .min(1, 'Rating must be an integer between 1 and 5')
      .max(5, 'Rating must be an integer between 1 and 5'),
    comment: z.string().nullable().optional(),
  })
  .strict();
