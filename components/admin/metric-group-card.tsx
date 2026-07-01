"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { Delta } from "@/lib/domain/types";
import { formatPercent } from "@/lib/utils/format";

export type MetricGroupItem = {
  label: string;
  value: string;
  delta?: Delta;
};

export function MetricGroupCard({
  title,
  items,
  loading = false,
}: {
  title: string;
  items: MetricGroupItem[];
  loading?: boolean;
}) {
  return (
    <section
      aria-label={title}
      className="flex flex-col gap-4 rounded-md bg-surface-secondary p-6"
    >
      <h2 className="text-xs font-medium uppercase tracking-[0.06em] text-text-tertiary">
        {title}
      </h2>
      <dl
        className="grid gap-6"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item, i) => (
          <div
            key={item.label}
            className={
              i === 0
                ? "flex flex-col gap-1"
                : "flex flex-col gap-1 border-l border-border-subtle pl-6"
            }
          >
            <dt className="text-xs text-text-tertiary">{item.label}</dt>
            {loading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <dd
                className="font-mono font-medium tabular-nums text-text-primary"
                style={{
                  fontSize: "var(--text-2xl)",
                  lineHeight: "var(--text-2xl--line-height)",
                }}
              >
                {item.value}
              </dd>
            )}
            {item.delta && !loading ? <DeltaPill delta={item.delta} /> : null}
          </div>
        ))}
      </dl>
    </section>
  );
}

function DeltaPill({ delta }: { delta: Delta }) {
  const direction = delta.percent === 0 ? "flat" : delta.percent > 0 ? "up" : "down";
  const Icon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus;
  const color =
    direction === "flat"
      ? "var(--text-tertiary)"
      : direction === "up"
        ? "var(--status-running)"
        : "var(--status-error)";

  return (
    <span className="inline-flex items-center gap-1 text-xs" style={{ color }}>
      <Icon className="size-3" strokeWidth={1.5} />
      <span className="font-mono tabular-nums">
        {formatPercent(Math.abs(delta.percent), { fractionDigits: 1 })}
      </span>
      <span className="text-text-tertiary">vs last week</span>
    </span>
  );
}
