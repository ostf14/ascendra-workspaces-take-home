// Single source of truth for number formatting across the app. en-US so the
// $ surfaces read with comma thousand separators and a period decimal,
// matching the USD convention the product uses everywhere.

const numberFmt = new Intl.NumberFormat("en-US");
const currencyWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const currencyCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNumber(value: number): string {
  return numberFmt.format(value);
}

export function formatCurrency(
  value: number,
  options?: { fractionDigits?: 0 | 2 }
): string {
  return options?.fractionDigits === 0
    ? currencyWhole.format(value)
    : currencyCents.format(value);
}

export function formatPercent(
  value: number,
  options?: { fractionDigits?: number }
): string {
  const digits = options?.fractionDigits ?? 0;
  if (digits === 0) return `${Math.round(value)}%`;
  return `${value.toFixed(digits)}%`;
}
