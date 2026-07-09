import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import {
  uuidParamSchema,
  validateRequest,
} from '../middleware/validate-request';
import { InvestmentController } from './investment.controller';
import {
  investmentSchema,
  updateInvestmentSchema,
} from './investment.validation';

export const investmentRouter = Router();

const investmentController = new InvestmentController();

investmentRouter.use(authMiddleware);

investmentRouter.get('/symbols/:symbol?', investmentController.fetchSymbol);

investmentRouter.get('/', investmentController.findAll);
investmentRouter.get('/:id', investmentController.findById);
investmentRouter.post(
  '/',
  validateRequest({ body: investmentSchema }),
  investmentController.create
);
investmentRouter.patch(
  '/:id',
  validateRequest({
    params: uuidParamSchema,
    body: updateInvestmentSchema,
  }),
  investmentController.update
);
investmentRouter.delete(
  '/:id',
  validateRequest({ params: uuidParamSchema }),
  investmentController.delete
);