import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { auth } from '../../shared/middleware/auth.js';
import {
  loginLimiter,
  registerLimiter,
  authActionLimiter,
} from '../../shared/middleware/rateLimiters.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema.js';

const router = Router();

router.post('/register', registerLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', loginLimiter, validate({ body: loginSchema }), authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.me);
router.post('/verify-email', authActionLimiter, validate({ body: verifyEmailSchema }), authController.verifyEmail);
router.post('/resend-verification', auth, authActionLimiter, authController.resendVerification);
router.post('/forgot-password', authActionLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', authActionLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);

export default router;
