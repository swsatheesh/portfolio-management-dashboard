export type AssetType = 'STOCK' | 'BOND' | 'MUTUAL_FUND' | 'ETF' | 'CASH';

export interface Investment {
  id: string;
  name: string;
  symbol: string;
  assetType: AssetType;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestmentInput {
  name: string;
  symbol: string;
  assetType: AssetType;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
}