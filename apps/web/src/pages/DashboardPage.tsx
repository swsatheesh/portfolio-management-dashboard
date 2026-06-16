import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { AssetAllocationChart } from '../components/AssetAllocationChart';
import { SummaryCard } from '../components/SummaryCard';
import { PortfolioSummary } from '../types/portfolio';

export function DashboardPage() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await apiRequest<PortfolioSummary>('/api/portfolio/summary');
        setSummary(data);
      } catch {
        setError('Unable to load portfolio summary');
      } finally {
        setIsLoading(false);
      }
    }

    loadSummary();
  }, []);

  if (isLoading) {
    return (
      <main className="app-shell">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (error || !summary) {
    return (
      <main className="app-shell">
        <p role="alert">{error || 'Portfolio summary unavailable'}</p>
      </main>
    );
  }

  const gainTone = summary.totalGainLoss >= 0 ? 'positive' : 'negative';

  return (
    <main className="app-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Portfolio Overview</p>
          <h1>Dashboard</h1>
          <a className="link-button" href="/investments">
            Manage Investments
          </a>
          <a className="link-button" href="/transactions">
            Transactions
          </a>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            localStorage.removeItem('accessToken');
            window.location.href = '/';
          }}
        >
          Logout
        </button>
      </header>

      <section className="summary-grid">
        <SummaryCard
          label="Total Invested"
          value={formatCurrency(summary.totalInvested)}
        />
        <SummaryCard
          label="Current Value"
          value={formatCurrency(summary.totalCurrentValue)}
        />
        <SummaryCard
          label="Gain / Loss"
          value={formatCurrency(summary.totalGainLoss)}
          tone={gainTone}
        />
        <SummaryCard
          label="Return"
          value={`${summary.totalGainLossPercentage.toFixed(2)}%`}
          tone={gainTone}
        />
      </section>

      <AssetAllocationChart data={summary.assetAllocation} />
    </main>
  );
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}