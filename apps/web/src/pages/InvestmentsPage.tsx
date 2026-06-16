import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import {
  AssetType,
  CreateInvestmentInput,
  Investment,
} from '../types/investment';

const assetTypes: AssetType[] = ['STOCK', 'BOND', 'MUTUAL_FUND', 'ETF', 'CASH'];

const initialForm: CreateInvestmentInput = {
  name: '',
  symbol: '',
  assetType: 'STOCK',
  quantity: 0,
  purchasePrice: 0,
  currentPrice: 0,
};

export function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [form, setForm] = useState<CreateInvestmentInput>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadInvestments() {
    try {
      const data = await apiRequest<Investment[]>('/api/investments');
      setInvestments(data);
    } catch {
      setError('Unable to load investments');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInvestments();
  }, []);

  function updateForm<K extends keyof CreateInvestmentInput>(
    key: K,
    value: CreateInvestmentInput[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    try {
      if (editingId) {
        await apiRequest<Investment>(`/api/investments/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      } else {
        await apiRequest<Investment>('/api/investments', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }

      setForm(initialForm);
      setEditingId(null);
      await loadInvestments();
    } catch {
      setError('Unable to save investment');
    }
  }

  function startEdit(investment: Investment) {
    setEditingId(investment.id);
    setForm({
      name: investment.name,
      symbol: investment.symbol,
      assetType: investment.assetType,
      quantity: Number(investment.quantity),
      purchasePrice: Number(investment.purchasePrice),
      currentPrice: Number(investment.currentPrice),
    });
  }

  async function deleteInvestment(id: string) {
    const confirmed = window.confirm('Delete this investment?');

    if (!confirmed) return;

    try {
      await apiRequest<void>(`/api/investments/${id}`, {
        method: 'DELETE',
      });

      await loadInvestments();
    } catch {
      setError('Unable to delete investment');
    }
  }

  return (
    <main className="app-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Portfolio Holdings</p>
          <h1>Investments</h1>
        </div>
        <a className="link-button" href="/dashboard">
          Back to Dashboard
        </a>
      </header>

      {error && <p role="alert">{error}</p>}

      <section className="panel">
        <h2>{editingId ? 'Edit Investment' : 'Add Investment'}</h2>

        <form className="investment-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              required
            />
          </label>

          <label>
            Symbol
            <input
              value={form.symbol}
              onChange={(event) =>
                updateForm('symbol', event.target.value.toUpperCase())
              }
              required
            />
          </label>

          <label>
            Asset Type
            <select
              value={form.assetType}
              onChange={(event) =>
                updateForm('assetType', event.target.value as AssetType)
              }
            >
              {assetTypes.map((assetType) => (
                <option key={assetType} value={assetType}>
                  {assetType}
                </option>
              ))}
            </select>
          </label>

          <label>
            Quantity
            <input
              type="number"
              value={form.quantity}
              onChange={(event) =>
                updateForm('quantity', Number(event.target.value))
              }
              min="0"
              step="0.0001"
              required
            />
          </label>

          <label>
            Purchase Price
            <input
              type="number"
              value={form.purchasePrice}
              onChange={(event) =>
                updateForm('purchasePrice', Number(event.target.value))
              }
              min="0"
              step="0.01"
              required
            />
          </label>

          <label>
            Current Price
            <input
              type="number"
              value={form.currentPrice}
              onChange={(event) =>
                updateForm('currentPrice', Number(event.target.value))
              }
              min="0"
              step="0.01"
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit">
              {editingId ? 'Update Investment' : 'Create Investment'}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Holdings</h2>

        {isLoading ? (
          <p>Loading investments...</p>
        ) : investments.length === 0 ? (
          <p className="empty-state">No investments found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Purchase</th>
                  <th>Current</th>
                  <th>Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((investment) => (
                  <tr key={investment.id}>
                    <td>{investment.name}</td>
                    <td>{investment.symbol}</td>
                    <td>{investment.assetType}</td>
                    <td>{Number(investment.quantity).toLocaleString()}</td>
                    <td>{formatCurrency(Number(investment.purchasePrice))}</td>
                    <td>{formatCurrency(Number(investment.currentPrice))}</td>
                    <td>
                      {formatCurrency(
                        Number(investment.quantity) *
                          Number(investment.currentPrice)
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => startEdit(investment)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="small-button danger-button"
                          onClick={() => deleteInvestment(investment.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}