import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { PieLabelRenderProps } from 'recharts/types/polar/Pie';
import { AssetAllocation } from '../types/portfolio';

interface AssetAllocationChartProps {
  data: AssetAllocation[];
}

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];

export function AssetAllocationChart({ data }: AssetAllocationChartProps) {
  if (data.length === 0) {
    return <p className="empty-state">No asset allocation data available.</p>;
  }

  return (
    <div className="chart-card">
      <h2>Asset Allocation</h2>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="currentValue"
              nameKey="assetType"
              outerRadius={90}
              label={renderAssetLabel}
            >
              {data.map((item, index) => (
                <Cell
                  key={item.assetType}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function renderAssetLabel(props: PieLabelRenderProps) {
  const payload = props.payload as AssetAllocation | undefined;

  if (!payload) {
    return '';
  }

  return `${payload.assetType} ${Number(payload.percentage).toFixed(1)}%`;
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}