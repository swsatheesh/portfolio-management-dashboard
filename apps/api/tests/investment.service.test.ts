import { Repository } from 'typeorm';
import { AssetType, InvestmentEntity } from '../src/entities/investment.entity';
import { UserEntity } from '../src/entities/user.entity';
import { InvestmentService } from '../src/investments/investment.service';

type MockRepo<T> = {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
};

describe('InvestmentService', () => {
  let investmentRepository: MockRepo<InvestmentEntity>;
  let userRepository: Pick<MockRepo<UserEntity>, 'findOne'>;
  let service: InvestmentService;

  beforeEach(() => {
    investmentRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    userRepository = {
      findOne: jest.fn(),
    };

    service = new InvestmentService(
      investmentRepository as unknown as Repository<InvestmentEntity>,
      userRepository as unknown as Repository<UserEntity>
    );
  });

  it('creates an investment for a user', async () => {
    const user = { id: 'user-1' } as UserEntity;

    userRepository.findOne.mockResolvedValue(user);
    investmentRepository.create.mockReturnValue({
      id: 'investment-1',
      symbol: 'AAPL',
    });
    investmentRepository.save.mockResolvedValue({
      id: 'investment-1',
      symbol: 'AAPL',
    });

    const result = await service.create('user-1', {
      name: 'Apple Inc.',
      symbol: 'aapl',
      assetType: AssetType.STOCK,
      quantity: 10,
      purchasePrice: 150,
      currentPrice: 195,
    });

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });
    expect(investmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        symbol: 'AAPL',
        user,
      })
    );
    expect(result).toEqual({
      id: 'investment-1',
      symbol: 'AAPL',
    });
  });

  it('returns null when user does not exist during create', async () => {
    userRepository.findOne.mockResolvedValue(null);

    const result = await service.create('user-1', {
      name: 'Apple Inc.',
      symbol: 'AAPL',
      assetType: AssetType.STOCK,
      quantity: 10,
      purchasePrice: 150,
      currentPrice: 195,
    });

    expect(result).toBeNull();
    expect(investmentRepository.save).not.toHaveBeenCalled();
  });

  it('returns all investments for a user', async () => {
    investmentRepository.find.mockResolvedValue([{ id: 'investment-1' }]);

    const result = await service.findAll('user-1');

    expect(investmentRepository.find).toHaveBeenCalledWith({
      where: { user: { id: 'user-1' } },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual([{ id: 'investment-1' }]);
  });

  it('updates an existing investment', async () => {
    const investment = {
      id: 'investment-1',
      symbol: 'AAPL',
      currentPrice: 195,
    } as InvestmentEntity;

    investmentRepository.findOne.mockResolvedValue(investment);
    investmentRepository.save.mockResolvedValue({
      ...investment,
      currentPrice: 200,
    });

    const result = await service.update('user-1', 'investment-1', {
      currentPrice: 200,
    });

    expect(investmentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPrice: 200,
      })
    );
    expect(result?.currentPrice).toBe(200);
  });

  it('returns null when updating missing investment', async () => {
    investmentRepository.findOne.mockResolvedValue(null);

    const result = await service.update('user-1', 'missing-id', {
      currentPrice: 200,
    });

    expect(result).toBeNull();
  });

  it('deletes an investment', async () => {
    investmentRepository.findOne.mockResolvedValue({
      id: 'investment-1',
    });

    const result = await service.delete('user-1', 'investment-1');

    expect(result).toBe(true);
    expect(investmentRepository.remove).toHaveBeenCalled();
  });
});