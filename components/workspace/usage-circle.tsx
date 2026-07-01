"use client";

import { formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md";

const PRESETS: Record<
  Size,
  { diameter: number; stroke: number; showValue: boolean; valueFontSize: string }
> = {
  xs: { diameter: 16, stroke: 1.5, showValue: false, valueFontSize: "" },
  sm: { diameter: 36, stroke: 1.5, showValue: true, valueFontSize: "var(--text-sm)" },
  md: { diameter: 56, stroke: 2, showValue: true, valueFontSize: "var(--text-md)" },
};

function colorForValue(value: number): string {
  if (value >= 85) return "var(--status-error)";
  if (value >= 60) return "var(--status-pending)";
  return "var(--text-secondary)";
}

export function UsageCircle({
  label,
  value,
  size = "sm",
  showCaption = true,
  className,
}: {
  label: string;
  value: number;
  size?: Size;
  showCaption?: boolean;
  className?: string;
}) {
  const preset = PRESETS[size];
  const radius = (preset.diameter - preset.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const arc = (clamped / 100) * circumference;
  const color = colorForValue(clamped);

  return (
    <figure className={cn("flex flex-col items-center gap-1.5", className)}>
      <div
        className="relative"
        style={{ width: preset.diameter, height: preset.diameter }}
      >
        <svg
          width={preset.diameter}
          height={preset.diameter}
          viewBox={`0 0 ${preset.diameter} ${preset.diameter}`}
          aria-hidden
        >
          <circle
            cx={preset.diameter / 2}
            cy={preset.diameter / 2}
            r={radius}
            fill="none"
            stroke="var(--border-default)"
            strokeWidth={preset.stroke}
          />
          <circle
            cx={preset.diameter / 2}
            cy={preset.diameter / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={preset.stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circumference}`}
            transform={`rotate(-90 ${preset.diameter / 2} ${preset.diameter / 2})`}
          />
        </svg>
        {preset.showValue ? (
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono font-medium tabular-nums text-text-primary"
            style={{ fontSize: preset.valueFontSize, lineHeight: 1 }}
          >
            {Math.round(clamped)}
          </span>
        ) : null}
      </div>
      {showCaption && preset.showValue ? (
        <figcaption className="text-xs text-text-tertiary">{label}</figcaption>
      ) : null}
      <span className="sr-only">{`${label} ${formatPercent(clamped)}`}</span>
    </figure>
  );
}
