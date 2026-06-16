import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import { PortfolioController } from './portfolio.controller';

export const portfolioRouter = Router();

const controller = new PortfolioController();

portfolioRouter.use(authMiddleware);

portfolioRouter.get('/summary', controller.getSummary);