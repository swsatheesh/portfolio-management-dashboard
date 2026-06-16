import { Repository } from 'typeorm';
import { AssetType, InvestmentEntity } from '../src/entities/investment.entity';
import { PortfolioService } from '../src/portfolio/portfolio.service';

type MockInvestmentRepository = {
  find: jest.Mock;
};

describe('PortfolioService', () => {
  let investmentRepository: MockInvestmentRepository;
  let service: PortfolioService;

  beforeEach(() => {
    investmentRepository = {
      find: jest.fn(),
    };

    service = new PortfolioService(
      investmentRepository as unknown as Repository<InvestmentEntity>
    );
  });

  it('calculates portfolio summary and performance metrics', async () => {
    investmentRepository.find.mockResolvedValue([
      {
        assetType: AssetType.STOCK,
        quantity: 10,
        purchasePrice: 150,
        currentPrice: 200,
      },
      {
        assetType: AssetType.BOND,
        quantity: 5,
        purchasePrice: 100,
        currentPrice: 110,
      },
    ]);

    const result = await service.getSummary('user-1');

    expect(investmentRepository.find).toHaveBeenCalledWith({
      where: {
        user: {
          id: 'user-1',
        },
      },
    });

    expect(result.totalInvested).toBe(2000);
    expect(result.totalCurrentValue).toBe(2550);
    expect(result.totalGainLoss).toBe(550);
    expect(result.totalGainLossPercentage).toBe(27.500000000000004);

    expect(result.assetAllocation).toEqual([
      {
        assetType: AssetType.STOCK,
        currentValue: 2000,
        percentage: 78.43137254901961,
      },
      {
        assetType: AssetType.BOND,
        currentValue: 550,
        percentage: 21.568627450980394,
      },
    ]);
  });

  it('returns zero metrics when user has no investments', async () => {
    investmentRepository.find.mockResolvedValue([]);

    const result = await service.getSummary('user-1');

    expect(result).toEqual({
      totalInvested: 0,
      totalCurrentValue: 0,
      totalGainLoss: 0,
      totalGainLossPercentage: 0,
      assetAllocation: [],
    });
  });
});