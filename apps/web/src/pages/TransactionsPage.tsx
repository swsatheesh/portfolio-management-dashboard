import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { Investment } from '../types/investment';
import {
  CreateTransactionInput,
  Transaction,
  TransactionType,
} from '../types/transaction';
import { AppLayout } from '../components/layout/AppLayout';
import { formatDate } from '../utils/date';

type TransactionValidationErrors = Partial<
  Record<keyof CreateTransactionInput, string>
>;

const initialForm: CreateTransactionInput = {
  investmentId: '',
  type: 'BUY',
  quantity: 0,
  price: 0,
  transactionDate: new Date().toISOString().split('T')[0],
};

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [form, setForm] = useState<CreateTransactionInput>(initialForm);
  const [validationErrors, setValidationErrors] =
    useState<TransactionValidationErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadPage() {
    try {
      setError('');

      const [transactionData, investmentData] = await Promise.all([
        apiRequest<Transaction[]>('/api/transactions'),
        apiRequest<Investment[]>('/api/investments'),
      ]);

      setTransactions(transactionData);
      setInvestments(investmentData);

      setForm((current) => ({
        ...current,
        investmentId: current.investmentId || investmentData[0]?.id || '',
      }));
    } catch {
      setError('Unable to load transactions');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, []);

  function updateForm<K extends keyof CreateTransactionInput>(
    key: K,
    value: CreateTransactionInput[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setValidationErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
  }

  function validateTransactionForm() {
    const errors: TransactionValidationErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!form.investmentId) {
      errors.investmentId = 'Investment is required';
    }

    if (!form.type) {
      errors.type = 'Transaction type is required';
    }

    if (form.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    if (form.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (!form.transactionDate) {
      errors.transactionDate = 'Transaction date is required';
    }

    if (form.transactionDate && form.transactionDate > today) {
      errors.transactionDate = 'Future date is not allowed';
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const errors = validateTransactionForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setError('');
      setValidationErrors({});

      await apiRequest('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setForm({
        ...initialForm,
        investmentId: investments[0]?.id ?? '',
      });

      await loadPage();
    } catch {
      setError('Unable to create transaction');
    }
  }

  async function deleteTransaction(id: string) {
    const confirmed = window.confirm('Delete this transaction?');

    if (!confirmed) return;

    try {
      setError('');

      await apiRequest(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      await loadPage();
    } catch {
      setError('Unable to delete transaction');
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <p>Loading transactions...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Portfolio Activity</p>
          <h1>Transactions</h1>
        </div>
      </header>

      {error && <p role="alert">{error}</p>}

      <section className="panel">
        <h2>Add Transaction</h2>

        <form
          className="transaction-form"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <label>
            Investment
            <select
              value={form.investmentId}
              onChange={(event) =>
                updateForm('investmentId', event.target.value)
              }
            >
              <option value="">Select investment</option>

              {investments.map((investment) => (
                <option key={investment.id} value={investment.id}>
                  {investment.symbol}
                </option>
              ))}
            </select>

            {validationErrors.investmentId && (
              <span className="field-error">
                {validationErrors.investmentId}
              </span>
            )}
          </label>

          <label>
            Type
            <select
              value={form.type}
              onChange={(event) =>
                updateForm('type', event.target.value as TransactionType)
              }
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>

            {validationErrors.type && (
              <span className="field-error">{validationErrors.type}</span>
            )}
          </label>

          <label>
            Quantity
            <input
              type="number"
              value={form.quantity}
              min="0"
              step="0.01"
              onChange={(event) =>
                updateForm('quantity', Number(event.target.value))
              }
            />

            {validationErrors.quantity && (
              <span className="field-error">{validationErrors.quantity}</span>
            )}
          </label>

          <label>
            Price
            <input
              type="number"
              value={form.price}
              min="0"
              step="0.01"
              onChange={(event) =>
                updateForm('price', Number(event.target.value))
              }
            />

            {validationErrors.price && (
              <span className="field-error">{validationErrors.price}</span>
            )}
          </label>

          <label>
            Date
            <input
              type="date"
              value={form.transactionDate}
              onChange={(event) =>
                updateForm('transactionDate', event.target.value)
              }
            />

            {validationErrors.transactionDate && (
              <span className="field-error">
                {validationErrors.transactionDate}
              </span>
            )}
          </label>

          <div className="form-actions">
            <button className="button button--primary" type="submit">
              Create Transaction
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>History</h2>

        {transactions.length === 0 ? (
          <p className="empty-state">No transactions found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Investment</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.investment.symbol}</td>
                    <td>{transaction.type}</td>
                    <td>{transaction.quantity}</td>
                    <td>{formatCurrency(transaction.price)}</td>
                    <td>{formatDate(transaction.transactionDate)}</td>
                    <td>
                      <button
                        type="button"
                        className="small-button danger-button"
                        onClick={() => deleteTransaction(transaction.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}