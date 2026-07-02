"use client";

import { AdminOverviewChart } from "@/components/admin/admin-overview-chart";
import { MetricGroupCard } from "@/components/admin/metric-group-card";
import { WasteInsightCard } from "@/components/admin/waste-insight-card";
import { useAdminOverview } from "@/lib/hooks/use-fleet";
import { formatCurrency } from "@/lib/utils/format";

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

      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <MetricGroupCard
            title="Cost this month"
            dataNote="cost-grouping"
            loading={isPending}
            items={[
              {
                label: "Hourly",
                value: data ? formatCurrency(data.hourlyCost) : "—",
                delta: data?.deltas.hourlyCost,
              },
              {
                label: "Month to date",
                value: data
                  ? formatCurrency(data.monthToDateCost, { fractionDigits: 0 })
                  : "—",
                delta: data?.deltas.monthToDateCost,
              },
              {
                label: "Projected",
                value: data
                  ? formatCurrency(data.projectedMonthlyCost, { fractionDigits: 0 })
                  : "—",
                delta: data?.deltas.projectedMonthlyCost,
              },
            ]}
          />
          <MetricGroupCard
            title="Fleet health"
            loading={isPending}
            items={[
              {
                label: "Running VMs",
                value: data ? `${data.runningCount} / ${data.totalCount}` : "—",
                delta: data?.deltas.runningCount,
              },
              {
                label: "Active users",
                value: data ? `${data.activeUsers}` : "—",
                delta: data?.deltas.activeUsers,
              },
            ]}
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
