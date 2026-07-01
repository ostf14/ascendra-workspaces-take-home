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

// Compact relative time used across the product — table columns, activity
// lists, idle modifiers, uptime. Table density and column widths depend on
// short labels ("3h", "2d"); date-fns's "about 3 hours ago" wraps and shifts
// alignment. Values are meant to be rendered in mono for column alignment.
//
// Buckets:
//   < 60s  → "now"
//   < 60m  → "Nm"
//   < 24h  → "Nh"
//   < 7d   → "Nd"
//   < 4w   → "Nw"
//   older  → ">1mo"
//
// Called with a Date, ISO string, or ms since epoch. `now` is injectable for
// tests; defaults to `Date.now()`.
export function formatCompactRelative(
  input: Date | string | number,
  now: number = Date.now()
): string {
  const then =
    input instanceof Date
      ? input.getTime()
      : typeof input === "number"
        ? input
        : new Date(input).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks <= 4) return `${weeks}w`;
  return ">1mo";
}
