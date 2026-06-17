import { Repository } from 'typeorm';
import { InvestmentEntity } from '../entities/investment.entity';
import { UserEntity } from '../entities/user.entity';
import { CreateInvestmentDto, UpdateInvestmentDto } from './dto/investment.dto';

export class InvestmentService {
  constructor(
    private readonly investmentRepository: Repository<InvestmentEntity>,
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findAll(userId: string) {
    return this.investmentRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(userId: string, investmentId: string) {
    return this.investmentRepository.findOne({
      where: {
        id: investmentId,
        user: { id: userId },
      },
    });
  }

  async create(userId: string, dto: CreateInvestmentDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return null;
    }

    const investment = this.investmentRepository.create({
      ...dto,
      symbol: dto.symbol.toUpperCase(),
      user,
    });

    return this.investmentRepository.save(investment);
  }

  async update(userId: string, investmentId: string, dto: UpdateInvestmentDto) {
    const investment = await this.findById(userId, investmentId);

    if (!investment) {
      return null;
    }

    Object.assign(investment, {
      ...dto,
      symbol: dto.symbol ? dto.symbol.toUpperCase() : investment.symbol,
    });

    return this.investmentRepository.save(investment);
  }

  async delete(userId: string, investmentId: string) {
    const investment = await this.findById(userId, investmentId);

    if (!investment) {
      return false;
    }

    await this.investmentRepository.remove(investment);
    return true;
  }
}