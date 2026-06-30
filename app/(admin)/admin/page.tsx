"use client";

import { AdminOverviewChart } from "@/components/admin/admin-overview-chart";
import { HeroMetric } from "@/components/admin/hero-metric";
import { WasteInsightCard } from "@/components/admin/waste-insight-card";
import { useAdminOverview } from "@/lib/hooks/use-fleet";

function formatCurrency(value: number, fractionDigits = 2): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export default function AdminOverviewPage() {
  const { data, isPending } = useAdminOverview();

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium text-text-primary">Overview</h1>
        <p className="text-sm text-text-secondary">
          Fleet-wide health, cost, and anything that&apos;s wasting spend.
        </p>
      </header>

      <WasteInsightCard data={data} loading={isPending} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <HeroMetric
          label="Running VMs"
          loading={isPending}
          value={data ? `${data.runningCount} / ${data.totalCount}` : "—"}
          delta={data?.deltas.runningCount}
        />
        <HeroMetric
          label="Active users"
          loading={isPending}
          value={data ? `${data.activeUsers}` : "—"}
          delta={data?.deltas.activeUsers}
        />
        <HeroMetric
          label="Hourly cost"
          loading={isPending}
          value={data ? formatCurrency(data.hourlyCost) : "—"}
          delta={data?.deltas.hourlyCost}
        />
        <HeroMetric
          label="Month to date"
          loading={isPending}
          value={data ? formatCurrency(data.monthToDateCost, 0) : "—"}
          delta={data?.deltas.monthToDateCost}
        />
        <HeroMetric
          label="Projected month"
          loading={isPending}
          value={data ? formatCurrency(data.projectedMonthlyCost, 0) : "—"}
          delta={data?.deltas.projectedMonthlyCost}
        />
        <HeroMetric
          label="Aggregate CPU"
          loading={isPending}
          value={data ? `${Math.round(data.aggregateCpu)}%` : "—"}
          delta={data?.deltas.aggregateCpu}
        />
      </div>

      <AdminOverviewChart
        series={data?.aggregateUtilization24h}
        loading={isPending}
      />
    </section>
  );
}
