"use client";

import type { UtilizationBucket } from "@/lib/domain/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

// Horizontal bar histogram (per decision 03): reveals "half hot, half cold"
// vs "everything mid" — info a flat aggregate average hides.

export function DistributionChart({ buckets }: { buckets: UtilizationBucket[] }) {
  const total = buckets.reduce((acc, b) => acc + b.count, 0);
  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <section
      aria-label="CPU distribution across running workspaces"
      className="rounded-lg border border-border-default bg-surface-elevated"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3.5">
        <h2 className="text-sm font-medium text-text-primary">
          CPU distribution · running workspaces
        </h2>
        <span className="text-xs text-text-tertiary">
          {formatNumber(total)} workspace{total === 1 ? "" : "s"}
        </span>
      </header>
      <ul className="flex flex-col gap-2 p-5">
        {buckets.map((bucket) => {
          const widthPct = (bucket.count / max) * 100;
          const sharePct = total > 0 ? (bucket.count / total) * 100 : 0;
          const recoverable = bucket.recoverableMonthlyCost;
          return (
            <li key={bucket.label} className="flex flex-col gap-1">
              <div className="grid grid-cols-[80px_1fr_64px] items-center gap-3">
                <span className="font-mono text-xs text-text-tertiary">
                  {bucket.label}
                </span>
                <div className="relative h-5 rounded-sm bg-surface-secondary">
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-sm",
                      bucket.count === 0
                        ? "bg-border-default"
                        : "bg-accent-coral/70"
                    )}
                    style={{
                      width: `${Math.max(widthPct, bucket.count > 0 ? 1.5 : 0)}%`,
                    }}
                  />
                </div>
                <span className="text-right font-mono text-xs tabular-nums text-text-secondary">
                  {formatNumber(bucket.count)} · {formatPercent(sharePct)}
                </span>
              </div>
              {recoverable && recoverable > 0 ? (
                <p className="pl-[92px] text-[11px] italic text-text-tertiary">
                  {bucket.count} idle candidate{bucket.count === 1 ? "" : "s"} ·{" "}
                  <span
                    className="font-mono not-italic tabular-nums"
                    style={{ color: "var(--status-idle)" }}
                  >
                    ~{formatCurrency(recoverable, { fractionDigits: 0 })}/month
                  </span>{" "}
                  recoverable
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
