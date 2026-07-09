import { z } from 'zod';

export const investmentSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  symbol: z.string().trim().min(1, 'Symbol is required').max(20),
  assetType: z.enum(['STOCK', 'BOND', 'MUTUAL_FUND', 'ETF', 'CASH']),
  quantity: z.coerce.number().positive('Quantity must be greater than zero'),
  purchasePrice: z.coerce
    .number()
    .nonnegative('Purchase price cannot be negative'),
  currentPrice: z.coerce.number().nonnegative('Current price cannot be negative'),
});

export const updateInvestmentSchema = investmentSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: 'At least one field is required for update',
  }
);