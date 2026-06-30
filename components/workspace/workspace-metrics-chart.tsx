"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceMetrics } from "@/lib/hooks/use-workspaces";
import type { WorkspaceMetricsRange } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const RANGES: { value: WorkspaceMetricsRange; label: string }[] = [
  { value: "1h", label: "1h" },
  { value: "24h", label: "24h" },
];

export function WorkspaceMetricsChart({ id }: { id: string }) {
  const [range, setRange] = useState<WorkspaceMetricsRange>("24h");
  const { data, isPending } = useWorkspaceMetrics(id, range);

  return (
    <section
      aria-label="Resource metrics"
      className="rounded-lg border border-border-default bg-surface-elevated"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3.5">
        <h2 className="text-sm font-medium text-text-primary">Resource use</h2>
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
                "rounded-sm px-2 py-1 text-xs transition-colors",
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
      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2">
        <ChartPanel
          title="CPU"
          color="var(--accent)"
          data={data?.cpu}
          loading={isPending}
        />
        <ChartPanel
          title="Memory"
          color="#14b8a6"
          data={data?.memory}
          loading={isPending}
        />
      </div>
    </section>
  );
}

function ChartPanel({
  title,
  color,
  data,
  loading,
}: {
  title: string;
  color: string;
  data?: { t: string; v: number }[];
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-text-tertiary">{title} %</p>
      <div className="h-40">
        {loading || !data ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient
                  id={`metric-${title}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--border-subtle)"
                strokeDasharray="2 2"
              />
              <XAxis
                dataKey="t"
                hide
                interval="preserveStartEnd"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                width={32}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                tickFormatter={(value: number) => `${value}`}
              />
              <Tooltip
                cursor={{
                  stroke: "var(--border-strong)",
                  strokeWidth: 1,
                  strokeDasharray: "2 2",
                }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0];
                  if (!item) return null;
                  const raw = item.payload as { t: string; v: number };
                  return (
                    <div className="rounded-md border border-border-default bg-surface-elevated px-2.5 py-1.5 text-xs shadow-sm">
                      <div className="font-mono text-text-tertiary">
                        {new Date(raw.t).toLocaleString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="font-mono text-text-primary">
                        {Math.round(raw.v)}%
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#metric-${title})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
