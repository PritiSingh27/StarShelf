import { Router } from 'express';
import * as storesController from './stores.controller.js';
import { auth } from '../../shared/middleware/auth.js';
import { requireRole } from '../../shared/middleware/requireRole.js';
import { validate } from '../../shared/middleware/validate.js';
import { writeLimiter } from '../../shared/middleware/rateLimiters.js';
import { storeQuerySchema, ratingSchema } from './stores.schema.js';

const router = Router();

router.use(auth, requireRole('USER'));

router.get('/', validate({ query: storeQuerySchema }), storesController.getStores);
router.put('/:id/rating', writeLimiter, validate({ body: ratingSchema }), storesController.rateStore);
router.get('/:id/reviews', storesController.getStoreReviews);

export default router;
