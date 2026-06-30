"use client";

import { Moon } from "lucide-react";
import { parseISO } from "date-fns";

// Compact relative time formatter — keeps the pill short ("38h", "1d", "7d").
// date-fns formatDistanceToNow is too verbose for a card affordance.
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

export function IdlePill({ lastActiveAt }: { lastActiveAt: string }) {
  const since = compactSince(parseISO(lastActiveAt));
  const color = "var(--status-idle)";

  return (
    <span
      aria-label={`Idle for ${since}`}
      className="inline-flex h-[18px] w-fit items-center gap-1 rounded-sm border px-1.5 text-[11px] font-medium leading-none"
      style={{
        color,
        backgroundColor: `color-mix(in oklab, ${color} 10%, transparent)`,
        borderColor: `color-mix(in oklab, ${color} 25%, transparent)`,
      }}
    >
      <Moon className="size-2.5" strokeWidth={1.5} />
      Idle · {since}
    </span>
  );
}
