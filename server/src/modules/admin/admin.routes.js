import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { auth } from '../../shared/middleware/auth.js';
import { requireRole } from '../../shared/middleware/requireRole.js';
import { validate } from '../../shared/middleware/validate.js';
import { adminActionLimiter } from '../../shared/middleware/rateLimiters.js';
import {
  createUserSchema,
  createStoreSchema,
  getUsersQuerySchema,
  getStoresQuerySchema,
} from './admin.schema.js';

const router = Router();

router.use(auth, requireRole('ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/users', validate({ query: getUsersQuerySchema }), adminController.getUsers);
router.post('/users', adminActionLimiter, validate({ body: createUserSchema }), adminController.createUser);
router.get('/users/:id', adminController.getUserDetails);
router.get('/stores', validate({ query: getStoresQuerySchema }), adminController.getStores);
router.post('/stores', adminActionLimiter, validate({ body: createStoreSchema }), adminController.createStore);
router.get('/owners/available', adminController.getAvailableOwners);

export default router;
