"use client";

import type { CostByTemplate } from "@/lib/domain/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";

export function CostByTemplateCard({ rows }: { rows: CostByTemplate[] }) {
  const total = rows.reduce((acc, row) => acc + row.monthlyCost, 0) || 1;
  const sorted = [...rows].sort((a, b) => b.monthlyCost - a.monthlyCost);

  return (
    <section
      aria-label="Monthly cost by template"
      className="rounded-lg border border-border-default bg-surface-elevated"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3.5">
        <h2 className="text-sm font-medium text-text-primary">
          Monthly cost by template
        </h2>
        <span className="text-xs text-text-tertiary">
          Projected from current hourly run-rate
        </span>
      </header>
      <ul className="flex flex-col gap-3 p-5">
        {sorted.map((row) => {
          const sharePct = (row.monthlyCost / total) * 100;
          return (
            <li
              key={row.templateId}
              className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1"
            >
              <span className="text-sm text-text-primary">{row.templateName}</span>
              <span className="font-mono text-sm tabular-nums text-text-primary">
                {formatCurrency(row.monthlyCost, { fractionDigits: 0 })}
              </span>
              <div className="col-span-2 h-1.5 overflow-hidden rounded-sm bg-surface-secondary">
                <span
                  className="block h-full rounded-sm bg-accent-coral/70"
                  style={{ width: `${Math.max(sharePct, 1)}%` }}
                />
              </div>
              <span className="text-xs text-text-tertiary">
                {formatNumber(row.workspaceCount)} workspace
                {row.workspaceCount === 1 ? "" : "s"}
              </span>
              <span className="text-right text-xs text-text-tertiary tabular-nums">
                {formatPercent(sharePct)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
