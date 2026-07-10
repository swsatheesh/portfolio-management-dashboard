import { z } from 'zod';

const dateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must use YYYY-MM-DD format'
  );

export const transactionQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    type: z.enum(['BUY', 'SELL']).optional(),

    investmentId: z.uuid('Invalid investment id').optional(),

    dateFrom: dateSchema.optional(),

    dateTo: dateSchema.optional(),

    search: z.string().trim().max(100).transform((value) => value || undefined).optional(),

    sortBy: z
      .enum(['createdAt', 'transactionDate', 'type', 'quantity', 'price'])
      .default('transactionDate'),

    sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
  })
  .refine(
    ({ dateFrom, dateTo }) => {
      if (!dateFrom || !dateTo) {
        return true;
      }

      return dateFrom <= dateTo;
    },
    {
      path: ['dateTo'],
      message: 'dateTo must be on or after dateFrom',
    }
  );

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;