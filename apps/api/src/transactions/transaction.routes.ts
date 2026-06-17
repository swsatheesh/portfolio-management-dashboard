import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import { TransactionController } from './transaction.controller';

export const transactionRouter = Router();

const controller = new TransactionController();

transactionRouter.use(authMiddleware);

transactionRouter.get('/', controller.findAll);
transactionRouter.get('/:id', controller.findById);
transactionRouter.post('/', controller.create);
transactionRouter.patch('/:id', controller.update);
transactionRouter.delete('/:id', controller.delete);