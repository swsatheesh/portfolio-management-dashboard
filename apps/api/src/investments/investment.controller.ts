import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { InvestmentEntity } from '../entities/investment.entity';
import { UserEntity } from '../entities/user.entity';
import { InvestmentService } from './investment.service';
import { getParamAsString } from '../common/utils/param.util';
import stocks from '../seeds/stocks.json';

import { asyncHandler } from '../middleware/async-handler';
import { NotFoundError } from '../errors/api-error';

export class InvestmentController {
  private readonly investmentService: InvestmentService;

  constructor(
    investmentService = new InvestmentService(
      AppDataSource.getRepository(InvestmentEntity),
      AppDataSource.getRepository(UserEntity)
    )
  ) {
    this.investmentService = investmentService;
  }

  fetchSymbol(req: Request, res: Response) {
    const symbol = req.params.symbol;

    if (symbol) {
      const stockDetails = stocks.stocks.find(
        stock => stock.symbol.toUpperCase() === symbol
      );
      console.log(stocks.stocks.map(ele => ele.symbol));
      if (!stockDetails) {
        throw new NotFoundError("Stock symbol not found");
      }

      return res.status(200).json(stockDetails);
    }

    return res.status(200).json(stocks.stocks);
  }

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const investments = await this.investmentService.findAll(req.user!.id);
    return res.status(200).json(investments);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const transactionId = getParamAsString(req.params.id);
    
    const investment = await this.investmentService.findById(
      req.user!.id,
      transactionId
    );

    if (!investment) {
      throw new NotFoundError("Investment not found");
    }

    return res.status(200).json(investment);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const investment = await this.investmentService.create(req.user!.id, req.body);

    if (!investment) {
      throw new NotFoundError("User not found");
    }

    return res.status(201).json(investment);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const transactionId = getParamAsString(req.params.id);

    const investment = await this.investmentService.update(
      req.user!.id,
      transactionId,
      req.body
    );

    if (!investment) {
      throw new NotFoundError("Investment not found");
    }

    return res.status(200).json(investment);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const transactionId = getParamAsString(req.params.id);
    const deleted = await this.investmentService.delete(req.user!.id, transactionId);

    if (!deleted) {
      throw new NotFoundError("Investment not found");
    }

    return res.status(204).send();
  });
}