"use client";

import { AdminOverviewChart } from "@/components/admin/admin-overview-chart";
import { HeroMetric } from "@/components/admin/hero-metric";
import { WasteInsightCard } from "@/components/admin/waste-insight-card";
import { useAdminOverview } from "@/lib/hooks/use-fleet";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

export default function AdminOverviewPage() {
  const { data, isPending } = useAdminOverview();

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-medium leading-tight text-text-primary">Overview</h1>
        <p className="text-sm text-text-secondary">
          Fleet-wide health, cost, and anything that&apos;s wasting spend.
        </p>
      </header>

      <WasteInsightCard data={data} loading={isPending} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          <HeroMetric
            label="Running VMs"
            loading={isPending}
            value={data ? `${data.runningCount} / ${data.totalCount}` : "—"}
            delta={data?.deltas.runningCount}
          />
          <HeroMetric
            label="Month to date"
            loading={isPending}
            value={data ? formatCurrency(data.monthToDateCost, { fractionDigits: 0 }) : "—"}
            delta={data?.deltas.monthToDateCost}
          />
          <HeroMetric
            label="Active users"
            loading={isPending}
            value={data ? `${data.activeUsers}` : "—"}
            delta={data?.deltas.activeUsers}
          />
          <HeroMetric
            label="Projected month"
            loading={isPending}
            value={data ? formatCurrency(data.projectedMonthlyCost, { fractionDigits: 0 }) : "—"}
            delta={data?.deltas.projectedMonthlyCost}
          />
          <HeroMetric
            label="Hourly cost"
            loading={isPending}
            value={data ? formatCurrency(data.hourlyCost) : "—"}
            delta={data?.deltas.hourlyCost}
          />
          <HeroMetric
            label="Aggregate CPU"
            loading={isPending}
            value={data ? formatPercent(data.aggregateCpu) : "—"}
            delta={data?.deltas.aggregateCpu}
          />
        </div>
        <AdminOverviewChart
          series={data?.aggregateUtilization24h}
          loading={isPending}
        />
      </div>
    </section>
  );
}
