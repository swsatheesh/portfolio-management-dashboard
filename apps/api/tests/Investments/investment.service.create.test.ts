import { Repository } from 'typeorm';
import {
  AssetType,
  InvestmentEntity,
} from '../../src/entities/investment.entity';
import { UserEntity } from '../../src/entities/user.entity';
import { NotFoundError } from '../../src/errors/api-error';
import { InvestmentService } from '../../src/investments/investment.service';

type MockRepository<T> = {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
};

describe('InvestmentService - create', () => {
  let investmentRepository: MockRepository<InvestmentEntity>;
  let userRepository: Pick<MockRepository<UserEntity>, 'findOne'>;
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

  it('creates an investment for the authenticated user', async () => {
    const user = {
      id: 'user-1',
    } as UserEntity;

    const createdInvestment = {
      id: 'investment-1',
      name: 'Apple Inc.',
      symbol: 'AAPL',
      assetType: AssetType.STOCK,
      quantity: 10,
      purchasePrice: 150,
      currentPrice: 195,
      user,
    } as InvestmentEntity;

    userRepository.findOne.mockResolvedValue(user);
    investmentRepository.create.mockReturnValue(createdInvestment);
    investmentRepository.save.mockResolvedValue(createdInvestment);

    const result = await service.create('user-1', {
      name: 'Apple Inc.',
      symbol: 'aapl',
      assetType: AssetType.STOCK,
      quantity: 10,
      purchasePrice: 150,
      currentPrice: 195,
    });

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
      },
    });

    expect(investmentRepository.create).toHaveBeenCalledWith({
      name: 'Apple Inc.',
      symbol: 'AAPL',
      assetType: AssetType.STOCK,
      quantity: 10,
      purchasePrice: 150,
      currentPrice: 195,
      user,
    });

    expect(investmentRepository.save).toHaveBeenCalledWith(createdInvestment);
    expect(result).toEqual(createdInvestment);
  });

  it('throws NotFoundError when the authenticated user does not exist', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create('missing-user', {
        name: 'Apple Inc.',
        symbol: 'AAPL',
        assetType: AssetType.STOCK,
        quantity: 10,
        purchasePrice: 150,
        currentPrice: 195,
      })
    ).rejects.toThrow(new NotFoundError('User not found'));

    expect(investmentRepository.create).not.toHaveBeenCalled();
    expect(investmentRepository.save).not.toHaveBeenCalled();
  });

  it('normalizes the investment symbol to uppercase', async () => {
    const user = {
      id: 'user-1',
    } as UserEntity;

    const investment = {
      id: 'investment-1',
      symbol: 'MSFT',
      user,
    } as InvestmentEntity;

    userRepository.findOne.mockResolvedValue(user);
    investmentRepository.create.mockReturnValue(investment);
    investmentRepository.save.mockResolvedValue(investment);

    await service.create('user-1', {
      name: 'Microsoft Corporation',
      symbol: 'msft',
      assetType: AssetType.STOCK,
      quantity: 5,
      purchasePrice: 400,
      currentPrice: 450,
    });

    expect(investmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        symbol: 'MSFT',
        user,
      })
    );
  });
});