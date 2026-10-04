import { Router } from 'express';
import * as categoriesController from './categories.controller.js';
import { auth } from '../../shared/middleware/auth.js';
import { requireRole } from '../../shared/middleware/requireRole.js';
import { validate } from '../../shared/middleware/validate.js';
import { adminActionLimiter } from '../../shared/middleware/rateLimiters.js';
import { createCategorySchema } from './categories.schema.js';

const router = Router();

router.get('/categories', auth, categoriesController.getCategories);
router.post(
  '/admin/categories',
  auth,
  requireRole('ADMIN'),
  adminActionLimiter,
  validate({ body: createCategorySchema }),
  categoriesController.createCategory
);

export default router;
