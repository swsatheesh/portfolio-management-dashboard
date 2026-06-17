import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { InvestmentEntity } from '../entities/investment.entity';
import { PortfolioService } from './portfolio.service';

export class PortfolioController {
  private readonly portfolioService: PortfolioService;

  constructor(
    portfolioService = new PortfolioService(
      AppDataSource.getRepository(InvestmentEntity)
    )
  ) {
    this.portfolioService = portfolioService;
  }

  getSummary = async (req: Request, res: Response) => {
    const summary = await this.portfolioService.getSummary(req.user!.id);

    return res.status(200).json(summary);
  };
}