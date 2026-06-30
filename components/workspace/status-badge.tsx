import type { CSSProperties } from "react";

import type { VMStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

type StatusLabel = { label: string; color: string; isTransitional: boolean };

const STATUS_TABLE: Record<VMStatus, StatusLabel> = {
  running: { label: "Running", color: "var(--status-running)", isTransitional: false },
  stopped: { label: "Stopped", color: "var(--text-tertiary)", isTransitional: false },
  starting: { label: "Starting", color: "var(--status-pending)", isTransitional: true },
  stopping: { label: "Stopping", color: "var(--status-pending)", isTransitional: true },
  error: { label: "Error", color: "var(--status-error)", isTransitional: false },
};

export function statusLabel(status: VMStatus): string {
  return STATUS_TABLE[status].label;
}

export function StatusBadge({
  status,
  className,
}: {
  status: VMStatus;
  className?: string;
}) {
  const entry = STATUS_TABLE[status];
  const style: CSSProperties = {
    color: entry.color,
    backgroundColor: `color-mix(in oklab, ${entry.color} 10%, transparent)`,
    borderColor: `color-mix(in oklab, ${entry.color} 25%, transparent)`,
  };

  return (
    <span
      aria-label={`Status: ${entry.label}`}
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 rounded-sm border px-2 text-[11px] font-medium leading-none",
        entry.isTransitional && "animate-pulse-soft",
        className
      )}
      style={style}
    >
      <span
        aria-hidden
        className="inline-block size-1.5 rounded-full"
        style={{ backgroundColor: entry.color }}
      />
      {entry.label}
    </span>
  );
}
