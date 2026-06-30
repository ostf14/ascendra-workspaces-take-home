"use client";

import { useState } from "react";

import { AdminOverviewChart } from "@/components/admin/admin-overview-chart";
import { CostByTemplateCard } from "@/components/admin/cost-by-template-card";
import { DistributionChart } from "@/components/admin/distribution-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useFleetUtilization } from "@/lib/hooks/use-fleet";
import type { FleetUtilizationRange } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const RANGES: { value: FleetUtilizationRange; label: string }[] = [
  { value: "1h", label: "1h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

export default function AdminUtilizationPage() {
  const [range, setRange] = useState<FleetUtilizationRange>("24h");
  const { data, isPending } = useFleetUtilization(range);

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-medium text-text-primary">Utilization</h1>
          <p className="text-sm text-text-secondary">
            Where the fleet sits, and how the load shifts across the day.
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Time range"
          className="inline-flex items-center gap-1 rounded-md border border-border-default p-0.5"
        >
          {RANGES.map((option) => (
            <button
              key={option.value}
              role="tab"
              aria-selected={range === option.value}
              type="button"
              onClick={() => setRange(option.value)}
              className={cn(
                "rounded-sm px-2.5 py-1 text-xs transition-colors",
                range === option.value
                  ? "bg-surface-secondary text-text-primary"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <div key={range} className="animate-fade-in">
        <AdminOverviewChart
          series={
            data ? { cpu: data.cpu, memory: data.memory } : undefined
          }
          loading={isPending}
        />
      </div>

      <div key={`${range}-bottom`} className="grid animate-fade-in grid-cols-1 gap-5 lg:grid-cols-2">
        {isPending || !data ? (
          <>
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </>
        ) : (
          <>
            <DistributionChart buckets={data.distribution} />
            <CostByTemplateCard rows={data.costByTemplate} />
          </>
        )}
      </div>
    </section>
  );
}
