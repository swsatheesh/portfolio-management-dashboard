import { Repository } from 'typeorm';
import { InvestmentEntity } from '../entities/investment.entity';
import { TransactionEntity } from '../entities/transaction.entity';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';

export class TransactionService {
  constructor(
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly investmentRepository: Repository<InvestmentEntity>
  ) {}

  async findAll(userId: string) {
    return this.transactionRepository.find({
      relations: {
        investment: true,
      },
      where: {
        investment: {
          user: {
            id: userId,
          },
        },
      },
      order: {
        transactionDate: 'DESC',
      },
    });
  }

  async findById(userId: string, transactionId: string) {
    return this.transactionRepository.findOne({
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
      return null;
    }

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

    if (!transaction) {
      return null;
    }

    Object.assign(transaction, dto);

    return this.transactionRepository.save(transaction);
  }

  async delete(userId: string, transactionId: string) {
    const transaction = await this.findById(userId, transactionId);

    if (!transaction) {
      return false;
    }

    await this.transactionRepository.remove(transaction);

    return true;
  }
}