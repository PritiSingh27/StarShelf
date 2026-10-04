import { z } from 'zod';

export const createCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Category name must be between 2 and 50 characters')
      .max(50, 'Category name must be between 2 and 50 characters'),
  })
  .strict();
