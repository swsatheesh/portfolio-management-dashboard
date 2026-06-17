import { Repository } from 'typeorm';
import { InvestmentEntity } from '../src/entities/investment.entity';
import {
  TransactionEntity,
  TransactionType,
} from '../src/entities/transaction.entity';
import { TransactionService } from '../src/transactions/transaction.service';

type MockRepository<T> = {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
};

describe('TransactionService', () => {
  let transactionRepository: MockRepository<TransactionEntity>;
  let investmentRepository: Pick<MockRepository<InvestmentEntity>, 'findOne'>;
  let service: TransactionService;

  beforeEach(() => {
    transactionRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    investmentRepository = {
      findOne: jest.fn(),
    };

    service = new TransactionService(
      transactionRepository as unknown as Repository<TransactionEntity>,
      investmentRepository as unknown as Repository<InvestmentEntity>
    );
  });

  it('lists transactions for a user', async () => {
    transactionRepository.find.mockResolvedValue([
      {
        id: 'transaction-1',
        type: TransactionType.BUY,
      },
    ]);

    const result = await service.findAll('user-1');

    expect(transactionRepository.find).toHaveBeenCalledWith({
      relations: {
        investment: true,
      },
      where: {
        investment: {
          user: {
            id: 'user-1',
          },
        },
      },
      order: {
        transactionDate: 'DESC',
      },
    });

    expect(result).toEqual([
      {
        id: 'transaction-1',
        type: TransactionType.BUY,
      },
    ]);
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

  it('returns null when creating transaction for missing investment', async () => {
    investmentRepository.findOne.mockResolvedValue(null);

    const result = await service.create('user-1', {
      investmentId: 'missing-investment',
      type: TransactionType.BUY,
      quantity: 10,
      price: 150,
      transactionDate: new Date('2026-06-16T00:00:00.000Z'),
    });

    expect(result).toBeNull();
    expect(transactionRepository.create).not.toHaveBeenCalled();
    expect(transactionRepository.save).not.toHaveBeenCalled();
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

  it('returns null when updating missing transaction', async () => {
    transactionRepository.findOne.mockResolvedValue(null);

    const result = await service.update('user-1', 'missing-transaction', {
      quantity: 12,
    });

    expect(result).toBeNull();
    expect(transactionRepository.save).not.toHaveBeenCalled();
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

  it('returns false when deleting missing transaction', async () => {
    transactionRepository.findOne.mockResolvedValue(null);

    const result = await service.delete('user-1', 'missing-transaction');

    expect(transactionRepository.remove).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
});