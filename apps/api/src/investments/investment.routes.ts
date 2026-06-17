import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import { InvestmentController } from './investment.controller';

export const investmentRouter = Router();

const investmentController = new InvestmentController();

investmentRouter.use(authMiddleware);

investmentRouter.get('/', investmentController.findAll);
investmentRouter.get('/:id', investmentController.findById);
investmentRouter.post('/', investmentController.create);
investmentRouter.patch('/:id', investmentController.update);
investmentRouter.delete('/:id', investmentController.delete);