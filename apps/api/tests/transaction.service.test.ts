import { Repository } from 'typeorm';
import { InvestmentEntity } from '../src/entities/investment.entity';
import {
  TransactionEntity,
  TransactionType,
} from '../src/entities/transaction.entity';
import { TransactionService } from '../src/transactions/transaction.service';
import { NotFoundError } from '../src/errors/api-error';
import { createMockQueryBuilder } from './mocks/query-builder.mock';

type MockRepository<T> = {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
  createQueryBuilder: jest.Mock;
};

describe('TransactionService', () => {
  let transactionRepository: MockRepository<TransactionEntity>;
  let investmentRepository: Pick<MockRepository<InvestmentEntity>, 'findOne' | 'save'>;
  let service: TransactionService;

  beforeEach(() => {
    transactionRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn()
    };

    investmentRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    service = new TransactionService(
      transactionRepository as unknown as Repository<TransactionEntity>,
      investmentRepository as unknown as Repository<InvestmentEntity>
    );
  });

  describe('TransactionService - pagination', () => {
    it('returns paginated transactions for the user', async () => {
      const queryBuilder = createMockQueryBuilder<TransactionEntity>();

      const transactions = [
        {
          id: "transaction-1",
          type: "BUY",
        },
      ] as TransactionEntity[];

      queryBuilder.getManyAndCount.mockResolvedValue([transactions, 21]);

      transactionRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      const result = await service.findAll(
        'user-1',
        {
          page: 1,
          limit: 10,
          sortBy: 'transactionDate',
          sortOrder: 'DESC',
        }
      );

      expect(transactionRepository.createQueryBuilder).toHaveBeenCalledWith("transaction");

      expect(queryBuilder.where).toHaveBeenCalledWith("user.id = :userId", {
        userId: "user-1",
      });

      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 21,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      });

      expect(result.data).toEqual(transactions);
    });

    it('applies transaction filters', async () => {
      const queryBuilder = createMockQueryBuilder<TransactionEntity>();

      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      transactionRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      await service.findAll('user-1', {
        page: 1,
        limit: 10,
        type: 'BUY',
        investmentId: '72be15f0-a9f2-49ba-a8d6-68fce45a8eba',
        dateFrom: '2026-01-01',
        dateTo: '2026-07-10',
        search: 'AAPL',
        sortBy: 'transactionDate',
        sortOrder: 'DESC',
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "transaction.type = :type",
        {
          type: "BUY",
        },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'investment.id = :investmentId',
        {
          investmentId: '72be15f0-a9f2-49ba-a8d6-68fce45a8eba',
        }
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.transactionDate >= :dateFrom',
        {
          dateFrom: '2026-01-01',
        }
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.transactionDate <= :dateTo',
        {
          dateTo: '2026-07-10',
        }
      );
    });
  });

  it('finds a transaction by id for a user', async () => {
    transactionRepository.findOne.mockResolvedValue({
      id: 'transaction-1',
      type: TransactionType.BUY,
    });

    const result = await service.findById('user-1', 'transaction-1');

    expect(transactionRepository.findOne).toHaveBeenCalledWith({
      relations: {
        investment: true,
      },
      where: {
        id: 'transaction-1',
        investment: {
          user: {
            id: 'user-1',
          },
        },
      },
    });

    expect(result).toEqual({
      id: 'transaction-1',
      type: TransactionType.BUY,
    });
  });

  it('creates a transaction for an existing investment owned by user', async () => {
    const investment = {
      id: 'investment-1',
    } as InvestmentEntity;

    const transaction = {
      id: 'transaction-1',
      type: TransactionType.BUY,
      quantity: 10,
      price: 150,
      transactionDate: new Date('2026-06-16T00:00:00.000Z'),
      investment,
    } as TransactionEntity;

    investmentRepository.findOne.mockResolvedValue(investment);
    transactionRepository.create.mockReturnValue(transaction);
    transactionRepository.save.mockResolvedValue(transaction);

    const result = await service.create('user-1', {
      investmentId: 'investment-1',
      type: TransactionType.BUY,
      quantity: 10,
      price: 150,
      transactionDate: new Date('2026-06-16T00:00:00.000Z'),
    });

    expect(investmentRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'investment-1',
        user: {
          id: 'user-1',
        },
      },
    });

    expect(transactionRepository.create).toHaveBeenCalledWith({
      type: TransactionType.BUY,
      quantity: 10,
      price: 150,
      transactionDate: new Date('2026-06-16T00:00:00.000Z'),
      investment,
    });

    expect(transactionRepository.save).toHaveBeenCalledWith(transaction);
    expect(result).toEqual(transaction);
  });

  it('returns error when creating transaction for missing investment', async () => {
    investmentRepository.findOne.mockResolvedValue(null);
    
    try {
      const result = await service.create('user-1', {
        investmentId: 'missing-investment',
        type: TransactionType.BUY,
        quantity: 10,
        price: 150,
        transactionDate: new Date('2026-06-16T00:00:00.000Z'),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(transactionRepository.create).not.toHaveBeenCalled();
      expect(transactionRepository.save).not.toHaveBeenCalled();
      if (error instanceof NotFoundError) {
        expect(error.message).toEqual('Investment not found')
      }
    }
  });

  it('updates an existing transaction', async () => {
    const transaction = {
      id: 'transaction-1',
      type: TransactionType.BUY,
      quantity: 10,
      price: 150,
      transactionDate: new Date('2026-06-16T00:00:00.000Z'),
    } as TransactionEntity;

    transactionRepository.findOne.mockResolvedValue(transaction);
    transactionRepository.save.mockResolvedValue({
      ...transaction,
      quantity: 12,
      price: 155,
    });

    const result = await service.update('user-1', 'transaction-1', {
      quantity: 12,
      price: 155,
    });

    expect(transactionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'transaction-1',
        quantity: 12,
        price: 155,
      })
    );

    expect(result).toEqual({
      ...transaction,
      quantity: 12,
      price: 155,
    });
  });

  it('returns error when updating missing transaction', async () => {
    transactionRepository.findOne.mockResolvedValue(null);

    try {
      const result = await service.update('user-1', 'missing-transaction', {
        quantity: 12,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(transactionRepository.save).not.toHaveBeenCalled();
      if (error instanceof NotFoundError) {
        expect(error.message).toEqual('Transaction not found')
      }
    }


  });

  it('deletes an existing transaction', async () => {
    const transaction = {
      id: 'transaction-1',
    } as TransactionEntity;

    transactionRepository.findOne.mockResolvedValue(transaction);
    transactionRepository.remove.mockResolvedValue(transaction);

    const result = await service.delete('user-1', 'transaction-1');

    expect(transactionRepository.remove).toHaveBeenCalledWith(transaction);
    expect(result).toBe(true);
  });

  it('returns error when deleting missing transaction', async () => {
    transactionRepository.findOne.mockResolvedValue(null);

    try {
      const result = await service.delete('user-1', 'missing-transaction');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(transactionRepository.remove).not.toHaveBeenCalled();
      if (error instanceof NotFoundError) {
        expect(error.message).toEqual('Transaction not found')
      }
    }
  });
});