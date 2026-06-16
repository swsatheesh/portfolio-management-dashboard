import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { InvestmentEntity } from '../entities/investment.entity';
import { UserEntity } from '../entities/user.entity';
import { InvestmentService } from './investment.service';

type InvestmentIdParams = {
  id: string;
};

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

  findAll = async (req: Request, res: Response) => {
    const investments = await this.investmentService.findAll(req.user!.id);
    return res.status(200).json(investments);
  };

  findById = async (req: Request<InvestmentIdParams>, res: Response) => {
    const investment = await this.investmentService.findById(
      req.user!.id,
      req.params.id
    );

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    return res.status(200).json(investment);
  };

  create = async (req: Request, res: Response) => {
    const investment = await this.investmentService.create(req.user!.id, req.body);

    if (!investment) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(201).json(investment);
  };

  update = async (req: Request<InvestmentIdParams>, res: Response) => {
    const investment = await this.investmentService.update(
      req.user!.id,
      req.params.id,
      req.body
    );

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    return res.status(200).json(investment);
  };

  delete = async (req: Request<InvestmentIdParams>, res: Response) => {
    const deleted = await this.investmentService.delete(req.user!.id, req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    return res.status(204).send();
  };
}