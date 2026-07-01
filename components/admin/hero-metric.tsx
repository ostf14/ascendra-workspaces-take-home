"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import type { Delta } from "@/lib/domain/types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export function HeroMetric({
  label,
  value,
  delta,
  loading = false,
  className,
}: {
  label: string;
  value: string;
  delta?: Delta;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md bg-surface-secondary p-5",
        className
      )}
    >
      <p className="text-sm font-medium text-text-tertiary">{label}</p>
      {loading ? (
        <Skeleton className="h-9 w-28" />
      ) : (
        <p
          className="font-mono font-medium tabular-nums text-text-primary"
          style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--text-2xl--line-height)" }}
        >
          {value}
        </p>
      )}
      {delta && !loading ? <DeltaPill delta={delta} /> : null}
    </div>
  );
}

function DeltaPill({ delta }: { delta: Delta }) {
  const direction = delta.percent === 0 ? "flat" : delta.percent > 0 ? "up" : "down";
  const Icon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus;
  // "Up" is good for hourly cost rising? No — but the brief expects raw delta direction.
  // We render the raw direction; the consumer decides what "good" means by context.
  const color =
    direction === "flat"
      ? "var(--text-tertiary)"
      : direction === "up"
        ? "var(--status-running)"
        : "var(--status-error)";

  return (
    <span
      className="inline-flex items-center gap-1 text-xs"
      style={{ color }}
    >
      <Icon className="size-3" strokeWidth={1.5} />
      <span className="font-mono tabular-nums">
        {formatPercent(Math.abs(delta.percent), { fractionDigits: 1 })}
      </span>
      <span className="text-text-tertiary">vs last week</span>
    </span>
  );
}
