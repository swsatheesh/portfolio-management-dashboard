import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
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
      <p>Loading dashboard...</p>
    );
  }

  if (error || !summary) {
    return (
      <p role="alert">{error || 'Portfolio summary unavailable'}</p>
    );
  }

  const gainTone = summary.totalGainLoss >= 0 ? 'positive' : 'negative';

  return (
    <>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Portfolio Overview</p>
          <h1>Dashboard</h1>
        </div>
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
    </>
  );
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}