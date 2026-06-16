export interface AssetAllocation {
  assetType: string;
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