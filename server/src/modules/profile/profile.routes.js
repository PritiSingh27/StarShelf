import { Router } from 'express';
import * as profileController from './profile.controller.js';
import { auth } from '../../shared/middleware/auth.js';
import { validate } from '../../shared/middleware/validate.js';
import { writeLimiter } from '../../shared/middleware/rateLimiters.js';
import { updateProfileSchema, changePasswordSchema } from './profile.schema.js';

const router = Router();

router.use(auth);

router.get('/', profileController.getProfile);
router.put('/', writeLimiter, validate({ body: updateProfileSchema }), profileController.updateProfile);
router.put('/password', writeLimiter, validate({ body: changePasswordSchema }), profileController.changePassword);

export default router;
