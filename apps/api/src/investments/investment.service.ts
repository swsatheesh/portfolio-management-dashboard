import { Repository } from 'typeorm';
import { InvestmentEntity } from '../entities/investment.entity';
import { UserEntity } from '../entities/user.entity';
import { CreateInvestmentDto, UpdateInvestmentDto } from './dto/investment.dto';
import { InvestmentQuery } from './investment-query.validation';

import { NotFoundError } from '../errors/api-error';
import { createPaginatedResponse, PaginatedResponse } from '../common/pagination';

export class InvestmentService {
  constructor(
    private readonly investmentRepository: Repository<InvestmentEntity>,
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findAll(userId: string, query: InvestmentQuery): Promise<PaginatedResponse<InvestmentEntity>> {
    const {
      page,
      limit,
      search,
      assetType,
      sortBy,
      sortOrder,
    } = query;

    const queryBuilder = this.investmentRepository
      .createQueryBuilder('investment')
      .innerJoin('investment.user', 'user')
      .where('user.id = :userId', { userId });
    
    if (search) {
      queryBuilder.andWhere(
        `(
          LOWER(investment.name) LIKE LOWER(:search)
          OR LOWER(investment.symbol) LIKE LOWER(:search)
        )`,
        {
          search: `%${search}%`,
        }
      );
    }

    if (assetType) {
      queryBuilder.andWhere('investment.assetType = :assetType', {
        assetType,
      });
    }

    const sortColumns: Record<
      InvestmentQuery['sortBy'],
      string
    > = {
      createdAt: 'investment.createdAt',
      updatedAt: 'investment.updatedAt',
      name: 'investment.name',
      symbol: 'investment.symbol',
      assetType: 'investment.assetType',
      quantity: 'investment.quantity',
      purchasePrice: 'investment.purchasePrice',
      currentPrice: 'investment.currentPrice',
    };

    queryBuilder
      .orderBy(sortColumns[sortBy], sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [investments, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(
      investments,
      total,
      page,
      limit
    );
  }

  async findById(userId: string, investmentId: string) {
    const investment = await this.investmentRepository.findOne({
      where: {
        id: investmentId,
        user: { id: userId },
      },
    });

    if (!investment) {
      throw new NotFoundError('Investment not found');
    }

    return investment;
  }

  async create(userId: string, dto: CreateInvestmentDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError('User not found');
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

    Object.assign(investment, {
      ...dto,
      symbol: dto.symbol ? dto.symbol.toUpperCase() : investment.symbol,
    });

    return this.investmentRepository.save(investment);
  }

  async delete(userId: string, investmentId: string) {
    const investment = await this.findById(userId, investmentId);

    await this.investmentRepository.remove(investment);
    return true;
  }
}