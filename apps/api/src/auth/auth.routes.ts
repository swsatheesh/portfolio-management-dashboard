import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from './auth.middleware';
import { ProfileController } from './profile.controller';

export const authRouter = Router();

const authController = new AuthController();
const profileController = new ProfileController();

authRouter.post('/login', authController.login);
authRouter.get('/profile', authMiddleware, profileController.getProfile);