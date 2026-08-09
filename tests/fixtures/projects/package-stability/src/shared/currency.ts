export function cents(value: number): number {
  return value * 100;
}

export function formatCurrency(value: number): string {
  return `$${(value / 100).toFixed(2)}`;
}
