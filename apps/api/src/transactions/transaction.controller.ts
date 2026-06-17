import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { InvestmentEntity } from '../entities/investment.entity';
import { TransactionEntity } from '../entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { getParamAsString } from '../common/utils/param.util';

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

  findAll = async (req: Request, res: Response) => {
    const transactions = await this.transactionService.findAll(req.user!.id);

    return res.status(200).json(transactions);
  };

  findById = async (req: Request, res: Response) => {
    const transactionId = getParamAsString(req.params.id);

    const transaction = await this.transactionService.findById(
      req.user!.id,
      transactionId
    );

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found',
      });
    }

    return res.status(200).json(transaction);
  };

  create = async (req: Request, res: Response) => {
    const transaction = await this.transactionService.create(
      req.user!.id,
      req.body
    );

    if (!transaction) {
      return res.status(404).json({
        message: 'Investment not found',
      });
    }

    return res.status(201).json(transaction);
  };

  update = async (req: Request, res: Response) => {
    const transactionId = getParamAsString(req.params.id);

    const transaction = await this.transactionService.update(
      req.user!.id,
      transactionId,
      req.body
    );

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found',
      });
    }

    return res.status(200).json(transaction);
  };

  delete = async (req: Request, res: Response) => {
    const transactionId = getParamAsString(req.params.id);

    const deleted = await this.transactionService.delete(
      req.user!.id,
      transactionId
    );

    if (!deleted) {
      return res.status(404).json({
        message: 'Transaction not found',
      });
    }

    return res.status(204).send();
  };
}