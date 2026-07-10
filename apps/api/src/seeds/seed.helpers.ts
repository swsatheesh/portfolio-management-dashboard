export function roundToTwoDecimals(value: number): number {
  return Number(value.toFixed(2));
}

export function createSeedDate(index: number): string {
  const date = new Date(Date.UTC(2026, 6, 1));

  date.setUTCDate(date.getUTCDate() - index * 3);

  return date.toISOString().slice(0, 10);
}