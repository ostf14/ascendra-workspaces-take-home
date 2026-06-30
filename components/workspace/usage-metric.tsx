"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

import type { TimePoint } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "warm" | "hot";

function tone(value: number): Tone {
  if (value >= 85) return "hot";
  if (value >= 60) return "warm";
  return "neutral";
}

const TONE_STROKE: Record<Tone, string> = {
  neutral: "var(--text-tertiary)",
  warm: "var(--status-idle)",
  hot: "var(--status-error)",
};

export function UsageMetric({
  label,
  value,
  unit = "%",
  series,
  compact = false,
  className,
}: {
  label: string;
  value: number;
  unit?: string;
  series?: TimePoint[];
  compact?: boolean;
  className?: string;
}) {
  const stroke = TONE_STROKE[tone(value)];
  const formatted = unit === "%" ? Math.round(value).toString() : value.toFixed(1);

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        compact ? "min-w-0" : "min-w-[120px]",
        className
      )}
    >
      <span className="text-xs text-text-tertiary">{label}</span>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-mono font-medium tabular-nums text-text-primary",
            compact ? "text-sm" : "text-md"
          )}
        >
          {formatted}
        </span>
        <span className="text-xs text-text-tertiary">{unit}</span>
      </div>
      {series && series.length > 1 ? (
        <div className={cn("h-5", compact ? "w-full" : "w-24")}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={[0, 100]} />
              <Area
                type="monotone"
                dataKey="v"
                stroke={stroke}
                strokeWidth={1.25}
                fill={`url(#spark-${label})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
}
