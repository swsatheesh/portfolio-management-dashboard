import { z } from 'zod';
import { AssetType } from '../entities/investment.entity';

export const investmentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z
    .string()
    .trim()
    .max(100)
    .transform((value) => value || undefined)
    .optional(),

  assetType: z.enum(AssetType).optional(),

  sortBy: z
    .enum([
      'createdAt',
      'updatedAt',
      'name',
      'symbol',
      'assetType',
      'quantity',
      'purchasePrice',
      'currentPrice',
    ])
    .default('createdAt'),

  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export type InvestmentQuery = z.infer<typeof investmentQuerySchema>;