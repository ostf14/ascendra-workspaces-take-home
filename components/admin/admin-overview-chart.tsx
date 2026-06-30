"use client";

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
import type { TimePoint } from "@/lib/domain/types";

type Series = { cpu: TimePoint[]; memory: TimePoint[] };

type MergedPoint = {
  t: string;
  cpu: number;
  memory: number;
};

function merge(series: Series): MergedPoint[] {
  const length = Math.min(series.cpu.length, series.memory.length);
  const out: MergedPoint[] = [];
  for (let i = 0; i < length; i += 1) {
    const cpu = series.cpu[i];
    const memory = series.memory[i];
    if (!cpu || !memory) continue;
    out.push({ t: cpu.t, cpu: cpu.v, memory: memory.v });
  }
  return out;
}

export function AdminOverviewChart({
  series,
  loading = false,
}: {
  series?: Series;
  loading?: boolean;
}) {
  if (loading || !series) {
    return (
      <section className="rounded-lg border border-border-default bg-surface-elevated p-5">
        <Skeleton className="h-56 w-full" />
      </section>
    );
  }

  const data = merge(series);

  return (
    <section
      aria-label="Aggregate utilization, last 24h"
      className="rounded-lg border border-border-default bg-surface-elevated"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-3.5">
        <h2 className="text-sm font-medium text-text-primary">
          Aggregate utilization · last 24h
        </h2>
        <ul className="flex items-center gap-4 text-xs text-text-tertiary">
          <li className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block size-2 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            CPU
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block size-2 rounded-full"
              style={{ background: "#14b8a6" }}
            />
            Memory
          </li>
        </ul>
      </header>
      <div className="h-64 px-5 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="agg-cpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="agg-memory" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--border-subtle)"
              strokeDasharray="2 2"
            />
            <XAxis
              dataKey="t"
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={false}
              tickLine={false}
              minTickGap={48}
              tickFormatter={(value: string) =>
                new Date(value).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
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
                const raw = item.payload as MergedPoint;
                return (
                  <div className="rounded-md border border-border-default bg-surface-elevated px-3 py-2 text-xs shadow-sm">
                    <p className="font-mono text-text-tertiary">
                      {new Date(raw.t).toLocaleString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="flex items-center gap-2 font-mono text-text-primary">
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{ background: "var(--accent)" }}
                      />
                      CPU {Math.round(raw.cpu)}%
                    </p>
                    <p className="flex items-center gap-2 font-mono text-text-primary">
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{ background: "#14b8a6" }}
                      />
                      Memory {Math.round(raw.memory)}%
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="cpu"
              stroke="var(--accent)"
              strokeWidth={1.5}
              fill="url(#agg-cpu)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="memory"
              stroke="#14b8a6"
              strokeWidth={1.5}
              fill="url(#agg-memory)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
