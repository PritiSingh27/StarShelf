import { z } from 'zod';

export const ownerDashboardQuerySchema = z
  .object({
    sortBy: z.enum(['name', 'value', 'ratedAt']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  })
  .strict();
