export type TransactionType = 'BUY' | 'SELL';

export interface Transaction {
  id: string;
  type: TransactionType;
  quantity: number;
  price: number;
  transactionDate: string;

  investment: {
    id: string;
    name: string;
    symbol: string;
  };
}

export interface CreateTransactionInput {
  investmentId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  transactionDate: string;
}