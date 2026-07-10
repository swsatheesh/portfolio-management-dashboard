import { Repository } from 'typeorm';
import { InvestmentEntity } from '../entities/investment.entity';
import { TransactionEntity } from '../entities/transaction.entity';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { BadRequestError, NotFoundError } from '../errors/api-error';
import { TransactionQuery } from './transaction-query.validation';
import { createPaginatedResponse } from '../common/pagination';

export class TransactionService {
  constructor(
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly investmentRepository: Repository<InvestmentEntity>
  ) {}

  async findAll(userId: string, query: TransactionQuery) {

    const {
      page,
      limit,
      type,
      investmentId,
      dateFrom,
      dateTo,
      search,
      sortBy,
      sortOrder,
    } = query;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoinAndSelect('transaction.investment', 'investment')
      .innerJoin('investment.user', 'user')
      .where('user.id = :userId', {
        userId,
      });

    if (type) {
      queryBuilder.andWhere(
        'transaction.type = :type',
        {
          type,
        }
      );
    }

    if (investmentId) {
      queryBuilder.andWhere(
        'investment.id = :investmentId',
        {
          investmentId,
        }
      );
    }

    if (dateFrom) {
      queryBuilder.andWhere(
        'transaction.transactionDate >= :dateFrom',
        {
          dateFrom,
        }
      );
    }

    if (dateTo) {
      queryBuilder.andWhere(
        'transaction.transactionDate <= :dateTo',
        {
          dateTo,
        }
      );
    }

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

    const sortColumns: Record<
      TransactionQuery['sortBy'],
      string
    > = {
      createdAt: 'transaction.createdAt',
      transactionDate: 'transaction.transactionDate',
      type: 'transaction.type',
      quantity: 'transaction.quantity',
      price: 'transaction.price',
    };

    queryBuilder
      .orderBy(sortColumns[sortBy], sortOrder)
      .addOrderBy('transaction.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [transactions, total] =
      await queryBuilder.getManyAndCount();

    return createPaginatedResponse(
      transactions,
      total,
      page,
      limit
    );
  }

  async findById(userId: string, transactionId: string) {
    const transaction = await this.transactionRepository.findOne({
      relations: {
        investment: true,
      },
      where: {
        id: transactionId,
        investment: {
          user: {
            id: userId,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    return transaction;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const investment = await this.investmentRepository.findOne({
      where: {
        id: dto.investmentId,
        user: {
          id: userId,
        },
      },
    });

    if (!investment) {
      throw new NotFoundError("Investment not found");
    }

    const quantity = Number(investment.quantity);
    const transactionQuantity = Number(dto.quantity);

    if (dto.type === 'SELL' && transactionQuantity > quantity) {
      throw new BadRequestError('Sell quantity exceeds current holding');
    }

    investment.quantity = dto.type === 'BUY' ? quantity + transactionQuantity : quantity - transactionQuantity;

    await this.investmentRepository.save(investment);
    const transaction = this.transactionRepository.create({
      type: dto.type,
      quantity: dto.quantity,
      price: dto.price,
      transactionDate: dto.transactionDate,
      investment,
    });

    return this.transactionRepository.save(transaction);
  }

  async update(
    userId: string,
    transactionId: string,
    dto: UpdateTransactionDto
  ) {
    const transaction = await this.findById(userId, transactionId);

    Object.assign(transaction, dto);

    return this.transactionRepository.save(transaction);
  }

  async delete(userId: string, transactionId: string) {
    const transaction = await this.findById(userId, transactionId);

    await this.transactionRepository.remove(transaction);

    return true;
  }
}