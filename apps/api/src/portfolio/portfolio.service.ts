import { Repository } from 'typeorm';
import { AssetType, InvestmentEntity } from '../entities/investment.entity';
import { AssetAllocation, PortfolioSummary } from './portfolio.types';

export class PortfolioService {
  constructor(
    private readonly investmentRepository: Repository<InvestmentEntity>
  ) {}

  async getSummary(userId: string): Promise<PortfolioSummary> {
    const investments = await this.investmentRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });

    const totalInvested = investments.reduce(
      (sum: number, investment: InvestmentEntity): number =>
        sum +
        Number(investment.quantity) *
          Number(investment.purchasePrice),
      0
    );

    const totalCurrentValue = investments.reduce(
      (sum: number, investment: InvestmentEntity): number =>
        sum +
        Number(investment.quantity) *
          Number(investment.currentPrice),
      0
    );

    const totalGainLoss = totalCurrentValue - totalInvested;

    const totalGainLossPercentage =
      totalInvested === 0
        ? 0
        : (totalGainLoss / totalInvested) * 100;

    const allocationMap = new Map<AssetType, number>();

    for (const investment of investments) {
      const value =
        Number(investment.quantity) *
        Number(investment.currentPrice);

      allocationMap.set(
        investment.assetType,
        (allocationMap.get(investment.assetType) ?? 0) + value
      );
    }

    const assetAllocation: AssetAllocation[] = [];

    allocationMap.forEach((currentValue, assetType) => {
      assetAllocation.push({
        assetType,
        currentValue,
        percentage:
          totalCurrentValue === 0
            ? 0
            : (currentValue / totalCurrentValue) * 100,
      });
    });

    return {
      totalInvested,
      totalCurrentValue,
      totalGainLoss,
      totalGainLossPercentage,
      assetAllocation,
    };
  }
}