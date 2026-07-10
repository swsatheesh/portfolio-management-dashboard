import { DataSource } from 'typeorm';
import {
  TransactionEntity,
  TransactionType,
} from '../entities/transaction.entity';
import { InvestmentEntity } from '../entities/investment.entity';
import { UserEntity } from '../entities/user.entity';
import {
  createSeedDate,
  roundToTwoDecimals,
} from './seed.helpers';

const DEVELOPMENT_USER_EMAIL = 'admin@test.com';
const TRANSACTION_SEED_LIMIT = 50;

export async function seedTransactions(
  dataSource: DataSource
): Promise<TransactionEntity[]> {
  if (process.env.NODE_ENV === 'production') {
    return [];
  }

  const transactionRepository =
    dataSource.getRepository(TransactionEntity);

  const investmentRepository =
    dataSource.getRepository(InvestmentEntity);

  const userRepository = dataSource.getRepository(UserEntity);

  const user = await userRepository.findOne({
    where: {
      email: DEVELOPMENT_USER_EMAIL,
    },
  });

  if (!user) {
    throw new Error(
      `Development user ${DEVELOPMENT_USER_EMAIL} must be seeded before transactions`
    );
  }

  const existingTransactions =
    await transactionRepository.find({
        where: {
            investment: {
                user: {
                    id: user.id,
                },
            },
        },
        relations: {
            investment: {
                user: true,
            },
        },
    });

  if (existingTransactions.length > 0) {
    return existingTransactions;
  }

  const investments = await investmentRepository.find({
    where: {
      user: {
        id: user.id,
      },
    },
    order: {
      createdAt: 'ASC',
    },
    take: TRANSACTION_SEED_LIMIT,
  });

  if (investments.length < TRANSACTION_SEED_LIMIT) {
    throw new Error(
      `Expected ${TRANSACTION_SEED_LIMIT} seeded investments before creating transactions, but found ${investments.length}`
    );
  }

  const transactions = investments.map((investment, index) => {
    const type =
      index % 4 === 3
        ? TransactionType.SELL
        : TransactionType.BUY;

    const holdingQuantity = Number(investment.quantity);

    const quantity =
      type === TransactionType.SELL
        ? Math.max(1, Math.floor(holdingQuantity * 0.2))
        : Math.max(1, Math.floor(holdingQuantity * 0.6));

    const priceAdjustment =
      type === TransactionType.BUY
        ? 0.94 + (index % 5) * 0.01
        : 1.01 + (index % 4) * 0.01;

    const price = roundToTwoDecimals(
      Number(investment.currentPrice) * priceAdjustment
    );

    return transactionRepository.create({
      type,
      quantity,
      price,
      transactionDate: createSeedDate(index),
      investment
    });
  });

  return transactionRepository.save(transactions);
}