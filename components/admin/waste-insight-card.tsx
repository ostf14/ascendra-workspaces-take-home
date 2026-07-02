"use client";

import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { AdminOverview } from "@/lib/domain/types";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

export function WasteInsightCard({
  data,
  loading = false,
}: {
  data?: AdminOverview;
  loading?: boolean;
}) {
  if (loading || !data) {
    return (
      <section
        className="rounded-md p-5"
        style={{ background: "var(--accent-muted)" }}
      >
        <Skeleton className="h-14 w-full" />
      </section>
    );
  }

  const { idleCount, estimatedMonthlyWaste } = data.waste;
  if (idleCount === 0) {
    return (
      <section
        aria-label="Fleet waste"
        className="flex items-center justify-between gap-6 rounded-lg border border-border-default bg-surface-elevated p-6"
      >
        <div className="flex items-start gap-4">
          <span
            className="inline-flex size-9 items-center justify-center rounded-md border border-border-default bg-surface-secondary"
            style={{ color: "var(--status-running)" }}
          >
            <Leaf className="size-4" strokeWidth={1.5} />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-md font-medium text-text-primary">
              No idle workspaces detected.
            </h2>
            <p className="text-sm text-text-secondary">
              The fleet is efficient. We&apos;ll flag waste here as soon as it appears.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Fleet waste"
      data-note="waste-primacy"
      className="flex flex-col gap-1.5 rounded-md p-5"
      style={{ background: "var(--accent-muted)" }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="text-md font-medium text-text-primary">
          {formatNumber(idleCount)} idle workspaces wasting ~
          {formatCurrency(estimatedMonthlyWaste, { fractionDigits: 0 })}/month
        </p>
        <Link
          href="/admin/workspaces?idleOnly=true"
          className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Review
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </div>
      <p className="text-sm text-text-tertiary">
        Stop them to recover the spend. Files and settings are preserved.
      </p>
    </section>
  );
}
