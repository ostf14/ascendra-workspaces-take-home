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
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-medium leading-tight text-text-primary">Utilization</h1>
        <p className="text-sm text-text-secondary">
          Where the fleet sits, and how the load shifts across the day.
        </p>
      </header>

      {/*
        The chart card lives inside a definite-height wrapper so the
        recharts ResponsiveContainer (height="100%") has a real parent
        height to resolve against. Without it the section only carries
        min-height, which CSS percentage heights don't resolve to, and
        the SVG paints at zero height. On /admin the sibling grid cell
        supplies that definite height via items-stretch — here we have
        no sibling, so we supply the height directly.
      */}
      <div key={range} className="h-[320px] animate-fade-in">
        <AdminOverviewChart
          series={data ? { cpu: data.cpu, memory: data.memory } : undefined}
          loading={isPending}
          rangeLabel={range}
          rangeControl={<RangeTabs value={range} onChange={setRange} />}
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

function RangeTabs({
  value,
  onChange,
}: {
  value: FleetUtilizationRange;
  onChange: (next: FleetUtilizationRange) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Time range"
      className="inline-flex items-center gap-0.5 rounded-md border border-border-default p-0.5"
    >
      {RANGES.map((option) => (
        <button
          key={option.value}
          role="tab"
          aria-selected={value === option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-sm px-2 py-0.5 font-mono text-[11px] transition-colors",
            value === option.value
              ? "bg-surface-elevated text-text-primary"
              : "text-text-tertiary hover:text-text-primary"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
