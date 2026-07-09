import { z } from 'zod';

export const transactionSchema = z.object({
  investmentId: z.uuid('Valid investment id is required'),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.coerce.number().positive('Quantity must be greater than zero'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  transactionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format'),
});