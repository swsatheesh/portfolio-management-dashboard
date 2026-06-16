import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { Investment } from '../types/investment';
import {
  CreateTransactionInput,
  Transaction,
  TransactionType,
} from '../types/transaction';

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
  const [isLoading, setIsLoading] = useState(true);

  async function loadPage() {
    const [transactionData, investmentData] = await Promise.all([
      apiRequest<Transaction[]>('/api/transactions'),
      apiRequest<Investment[]>('/api/investments'),
    ]);

    setTransactions(transactionData);
    setInvestments(investmentData);

    if (investmentData.length > 0 && !form.investmentId) {
      setForm((current) => ({
        ...current,
        investmentId: investmentData[0].id,
      }));
    }

    setIsLoading(false);
  }

  useEffect(() => {
    loadPage();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    await apiRequest('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    setForm({
      ...initialForm,
      investmentId: investments[0]?.id ?? '',
    });

    await loadPage();
  }

  async function deleteTransaction(id: string) {
    await apiRequest(`/api/transactions/${id}`, {
      method: 'DELETE',
    });

    await loadPage();
  }

  if (isLoading) {
    return (
      <main className="app-shell">
        <p>Loading transactions...</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Portfolio Activity</p>
          <h1>Transactions</h1>
        </div>

        <a className="link-button" href="/dashboard">
          Back to Dashboard
        </a>
      </header>

      <section className="panel">
        <h2>Add Transaction</h2>

        <form className="investment-form" onSubmit={handleSubmit}>
          <label>
            Investment
            <select
              value={form.investmentId}
              onChange={(e) =>
                setForm({
                  ...form,
                  investmentId: e.target.value,
                })
              }
            >
              {investments.map((investment) => (
                <option key={investment.id} value={investment.id}>
                  {investment.symbol}
                </option>
              ))}
            </select>
          </label>

          <label>
            Type
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as TransactionType,
                })
              }
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </label>

          <label>
            Quantity
            <input
              type="number"
              value={form.quantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  quantity: Number(e.target.value),
                })
              }
            />
          </label>

          <label>
            Price
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: Number(e.target.value),
                })
              }
            />
          </label>

          <label>
            Date
            <input
              type="date"
              value={form.transactionDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  transactionDate: e.target.value,
                })
              }
            />
          </label>

          <button type="submit">
            Create Transaction
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>History</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Investment</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.investment.symbol}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.quantity}</td>
                  <td>${transaction.price}</td>
                  <td>{transaction.transactionDate}</td>

                  <td>
                    <button
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
      </section>
    </main>
  );
}