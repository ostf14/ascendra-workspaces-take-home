"use client";

import { formatDistanceToNow, parseISO } from "date-fns";
import { Moon } from "lucide-react";

import type { VM } from "@/lib/domain/types";

// Auto-stop default — out of scope to configure here; matches mock plan timing.
const AUTO_STOP_MINUTES = 30;

export function WorkspaceIdleHint({ workspace }: { workspace: VM }) {
  if (!workspace.isIdle) return null;

  const lastActive = parseISO(workspace.lastActiveAt);
  const idleMinutes = Math.max(
    0,
    Math.round((Date.now() - lastActive.getTime()) / 60_000)
  );
  const stopsIn = Math.max(0, AUTO_STOP_MINUTES - (idleMinutes % AUTO_STOP_MINUTES));

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-lg border border-border-default bg-surface-secondary px-4 py-3"
      style={{ color: "var(--status-idle)" }}
    >
      <Moon className="mt-0.5 size-4" strokeWidth={1.5} />
      <div className="flex flex-col gap-0.5 text-sm">
        <p className="font-medium">
          Idle for {formatDistanceToNow(lastActive)}.
        </p>
        <p className="text-xs text-text-secondary">
          Auto-stop in about {stopsIn} minutes. Files and settings will be preserved.
        </p>
      </div>
    </div>
  );
}
