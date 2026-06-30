"use client";

import Link from "next/link";
import { ArrowRight, Leaf, MoonStar } from "lucide-react";

import { Button } from "@/components/ui/button";
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
      <section className="rounded-lg border border-border-default bg-surface-elevated p-6">
        <Skeleton className="h-24 w-full" />
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
      className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-accent-coral/40 bg-accent-coral/5 p-6"
    >
      <div className="flex items-start gap-4">
        <span
          className="inline-flex size-9 items-center justify-center rounded-md border border-accent-coral/40 bg-accent-coral/10"
          style={{ color: "var(--accent)" }}
        >
          <MoonStar className="size-4" strokeWidth={1.5} />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-md font-medium text-text-primary">
            {formatNumber(idleCount)} idle workspaces, ~
            {formatCurrency(estimatedMonthlyWaste, { fractionDigits: 0 })}/month
            wasted
          </h2>
          <p className="text-sm text-text-secondary">
            Stop them to recover the spend. Files and settings are preserved.
          </p>
        </div>
      </div>
      <Button asChild>
        <Link href="/admin/workspaces?idleOnly=true">
          Review idle workspaces
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </Button>
    </section>
  );
}
