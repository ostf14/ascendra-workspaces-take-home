"use client";

import { parseISO } from "date-fns";

import { cn } from "@/lib/utils";

// Compact relative time formatter — keeps the label short ("38h", "1d", "7d").
// date-fns formatDistanceToNow is too verbose for a status-line modifier.
function compactSince(date: Date): string {
  const ms = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

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
  const since = compactSince(parseISO(lastActiveAt));
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
