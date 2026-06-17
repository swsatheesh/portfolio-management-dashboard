interface SummaryCardProps {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'negative';
}

export function SummaryCard({ label, value, tone = 'default' }: SummaryCardProps) {
  return (
    <article className={`summary-card summary-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}