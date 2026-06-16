import { TransactionType } from '../../entities/transaction.entity';

export interface CreateTransactionDto {
  investmentId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  transactionDate: Date;
}

export type UpdateTransactionDto = Partial<CreateTransactionDto>;