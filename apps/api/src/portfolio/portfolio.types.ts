import { AssetType } from '../entities/investment.entity';

export interface AssetAllocation {
  assetType: AssetType;
  currentValue: number;
  percentage: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  assetAllocation: AssetAllocation[];
}