"use client";

import { formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

function colorForValue(value: number): string {
  if (value >= 85) return "var(--status-error)";
  if (value >= 60) return "var(--status-pending)";
  return "var(--text-secondary)";
}

export function UsageCircle({
  label,
  value,
  size = 36,
  showLabel = true,
  className,
}: {
  label: string;
  value: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const stroke = size >= 56 ? 2 : 1.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const arc = (clamped / 100) * circumference;
  const color = colorForValue(clamped);
  const valueFontSize =
    size >= 56 ? "var(--text-md)" : size >= 32 ? "var(--text-sm)" : "10px";

  return (
    <figure className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-default)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        {size >= 32 ? (
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono font-medium tabular-nums text-text-primary"
            style={{ fontSize: valueFontSize, lineHeight: 1 }}
          >
            {Math.round(clamped)}
          </span>
        ) : null}
      </div>
      {showLabel ? (
        <figcaption className="text-xs text-text-tertiary">{label}</figcaption>
      ) : null}
      <span className="sr-only">{`${label} ${formatPercent(clamped)}`}</span>
    </figure>
  );
}
