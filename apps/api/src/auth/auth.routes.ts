import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from './auth.middleware';
import { ProfileController } from './profile.controller';
import { validateRequest } from '../middleware/validate-request';
import { loginSchema } from './auth.validation';

export const authRouter = Router();

const authController = new AuthController();
const profileController = new ProfileController();

authRouter.post(
  '/login',
  validateRequest({ body: loginSchema }),
  authController.login
);
authRouter.get('/me', authMiddleware, profileController.getCurrentUser);