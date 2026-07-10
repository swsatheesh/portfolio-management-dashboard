import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { InvestmentEntity } from '../entities/investment.entity';
import { TransactionEntity } from '../entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { getParamAsString } from '../common/utils/param.util';

import { asyncHandler } from '../middleware/async-handler';
import { TransactionQuery } from './transaction-query.validation';

export class TransactionController {
  private readonly transactionService: TransactionService;

  constructor(
    transactionService = new TransactionService(
      AppDataSource.getRepository(TransactionEntity),
      AppDataSource.getRepository(InvestmentEntity)
    )
  ) {
    this.transactionService = transactionService;
  }

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const query = res.locals.validated.query as TransactionQuery;

    const transactions = await this.transactionService.findAll(
      req.user!.id,
      query
    );

    return res.status(200).json(transactions);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const transactionId = getParamAsString(req.params.id);

    const transaction = await this.transactionService.findById(
      req.user!.id,
      transactionId
    );

    return res.status(200).json(transaction);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const transaction = await this.transactionService.create(
      req.user!.id,
      req.body
    );

    return res.status(201).json(transaction);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const transactionId = getParamAsString(req.params.id);

    const transaction = await this.transactionService.update(
      req.user!.id,
      transactionId,
      req.body
    );

    return res.status(200).json(transaction);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const transactionId = getParamAsString(req.params.id);

    const deleted = await this.transactionService.delete(
      req.user!.id,
      transactionId
    );

    return res.status(204).send({ message: 'Transaction deleted successfully' });
  });
}