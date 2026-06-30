"use client";

import { formatPercent } from "@/lib/utils/format";

const SIZE = 36;
const STROKE = 1.5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function colorForValue(value: number): string {
  if (value >= 85) return "var(--status-error)";
  if (value >= 60) return "var(--status-pending)";
  return "var(--text-secondary)";
}

export function UsageCircle({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const arc = (clamped / 100) * CIRCUMFERENCE;
  const stroke = colorForValue(clamped);

  return (
    <figure className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          aria-hidden
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--border-default)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={stroke}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${CIRCUMFERENCE}`}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </svg>
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono font-medium tabular-nums text-text-primary"
          style={{ fontSize: "var(--text-sm)", lineHeight: 1 }}
        >
          {Math.round(clamped)}
        </span>
      </div>
      <figcaption className="text-xs text-text-tertiary">{label}</figcaption>
      <span className="sr-only">{`${label} ${formatPercent(clamped)}`}</span>
    </figure>
  );
}
