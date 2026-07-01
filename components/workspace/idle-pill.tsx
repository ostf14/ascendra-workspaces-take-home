"use client";

import { cn } from "@/lib/utils";
import { formatCompactRelative } from "@/lib/utils/format";

// Idle is not a status — a running-but-quiet workspace is still running.
// Treat it as an inline text modifier next to the status pill, not a pill of
// its own. No background, no border, no icon.
export function IdleIndicator({
  lastActiveAt,
  className,
}: {
  lastActiveAt: string;
  className?: string;
}) {
  const since = formatCompactRelative(lastActiveAt);
  return (
    <span
      aria-label={`Idle for ${since}`}
      className={cn("whitespace-nowrap", className)}
      style={{ color: "var(--status-idle)" }}
    >
      · Idle {since}
    </span>
  );
}
