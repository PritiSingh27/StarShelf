import { Router } from 'express';
import * as ownerController from './owner.controller.js';
import { auth } from '../../shared/middleware/auth.js';
import { requireRole } from '../../shared/middleware/requireRole.js';
import { validate } from '../../shared/middleware/validate.js';
import { ownerDashboardQuerySchema } from './owner.schema.js';

const router = Router();

router.use(auth, requireRole('OWNER'));

router.get('/dashboard', validate({ query: ownerDashboardQuerySchema }), ownerController.getDashboard);

export default router;
