import { AssetType } from '../../entities/investment.entity';

export interface CreateInvestmentDto {
  name: string;
  symbol: string;
  assetType: AssetType;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
}

export type UpdateInvestmentDto = Partial<CreateInvestmentDto>;