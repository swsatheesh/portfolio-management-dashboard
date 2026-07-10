import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import {
  uuidParamSchema,
  validateRequest,
} from '../middleware/validate-request';
import { TransactionController } from './transaction.controller';
import { transactionSchema } from './transaction.validation';
import { transactionQuerySchema } from './transaction-query.validation';

export const transactionRouter = Router();

const controller = new TransactionController();

transactionRouter.use(authMiddleware);

transactionRouter.get(
  '/',
  validateRequest({
    query: transactionQuerySchema,
  }),
  controller.findAll
);
transactionRouter.get('/:id', controller.findById);
transactionRouter.post(
  '/',
  validateRequest({ body: transactionSchema }),
  controller.create
);
// transactionRouter.patch('/:id', controller.update);
transactionRouter.delete(
  '/:id',
  validateRequest({ params: uuidParamSchema }),
  controller.delete
);