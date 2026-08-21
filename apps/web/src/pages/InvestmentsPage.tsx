import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import {
  AssetType,
  CreateInvestmentInput,
  Investment,
} from '../types/investment';

const assetTypes: AssetType[] = ['STOCK', 'BOND', 'MUTUAL_FUND', 'ETF', 'CASH'];

type InvestmentValidationErrors = Partial<
  Record<keyof CreateInvestmentInput, string>
>;

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
  const [validationErrors, setValidationErrors] =
    useState<InvestmentValidationErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadInvestments() {
    try {
      setError('');

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

    setValidationErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
  }

  function validateInvestmentForm() {
    const errors: InvestmentValidationErrors = {};
    const symbolPattern = /^[A-Z0-9._-]+$/;

    if (!form.name.trim()) {
      errors.name = 'Investment name is required';
    }

    if (form.name.trim().length > 80) {
      errors.name = 'Investment name must be less than 80 characters';
    }

    if (!form.symbol.trim()) {
      errors.symbol = 'Symbol is required';
    }

    if (form.symbol.trim().length > 20) {
      errors.symbol = 'Symbol must be less than 20 characters';
    }

    if (form.symbol.trim() && !symbolPattern.test(form.symbol.trim())) {
      errors.symbol = 'Symbol can contain only uppercase letters, numbers, dot, dash or underscore';
    }

    if (!form.assetType) {
      errors.assetType = 'Asset type is required';
    }

    if (form.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    if (form.purchasePrice <= 0) {
      errors.purchasePrice = 'Purchase price must be greater than 0';
    }

    if (form.currentPrice < 0) {
      errors.currentPrice = 'Current price cannot be negative';
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const errors = validateInvestmentForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const payload: CreateInvestmentInput = {
      ...form,
      name: form.name.trim(),
      symbol: form.symbol.trim().toUpperCase(),
    };

    try {
      if (editingId) {
        await apiRequest<Investment>(`/api/investments/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest<Investment>('/api/investments', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setForm(initialForm);
      setValidationErrors({});
      setEditingId(null);
      await loadInvestments();
    } catch {
      setError('Unable to save investment');
    }
  }

  function startEdit(investment: Investment) {
    setEditingId(investment.id);
    setError('');
    setValidationErrors({});

    setForm({
      name: investment.name,
      symbol: investment.symbol,
      assetType: investment.assetType,
      quantity: Number(investment.quantity),
      purchasePrice: Number(investment.purchasePrice),
      currentPrice: Number(investment.currentPrice),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm);
    setValidationErrors({});
    setError('');
  }

  async function deleteInvestment(id: string) {
    const confirmed = window.confirm('Delete this investment?');

    if (!confirmed) return;

    try {
      setError('');

      await apiRequest<void>(`/api/investments/${id}`, {
        method: 'DELETE',
      });

      await loadInvestments();
    } catch {
      setError('Unable to delete investment');
    }
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Portfolio Holdings</p>
          <h1>Investments</h1>
        </div>
      </header>

      {error && <p role="alert">{error}</p>}

      <section className="panel">
        <h2>{editingId ? 'Edit Investment' : 'Add Investment'}</h2>

        <form
          className="investment-form"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
            />

            {validationErrors.name && (
              <span className="field-error">{validationErrors.name}</span>
            )}
          </label>

          <label>
            Symbol
            <input
              value={form.symbol}
              onChange={(event) =>
                updateForm('symbol', event.target.value.toUpperCase())
              }
            />

            {validationErrors.symbol && (
              <span className="field-error">{validationErrors.symbol}</span>
            )}
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

            {validationErrors.assetType && (
              <span className="field-error">{validationErrors.assetType}</span>
            )}
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
              step="0.01"
            />

            {validationErrors.quantity && (
              <span className="field-error">{validationErrors.quantity}</span>
            )}
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
            />

            {validationErrors.purchasePrice && (
              <span className="field-error">
                {validationErrors.purchasePrice}
              </span>
            )}
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
            />

            {validationErrors.currentPrice && (
              <span className="field-error">
                {validationErrors.currentPrice}
              </span>
            )}
          </label>

          <div className="form-actions">
            <button className="button button--primary" type="submit">
              {editingId ? 'Update Investment' : 'Create Investment'}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={cancelEdit}
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
    </>
  );
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}