"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import type { VM } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

// Static-looking log stream — timestamps + INFO/WARN levels give the panel
// a believable feel when expanded. The mock backend doesn't emit real logs;
// the line shape matches what code-server / Coder emit in practice.
const SAMPLE_LOGS = [
  "12:34:56 INFO  boot    kernel 6.6.42 ready",
  "12:34:57 INFO  agent   starting code-server@4.93.0",
  "12:34:58 INFO  net     tunnel established",
  "12:34:59 INFO  agent   code-server listening on :8080",
  "12:35:14 WARN  health  response 1.2s above 800ms target",
  "12:35:30 INFO  idle    watching for inactivity (30m threshold)",
  "12:36:02 INFO  fs      snapshot complete (2.4 GB)",
  "12:36:18 WARN  net     retry on flaky upstream (1/3)",
];

function buildLines(workspace: VM): string[] {
  if (workspace.status === "error" && workspace.errorReason) {
    return [
      ...SAMPLE_LOGS.slice(0, 4),
      `12:35:02 WARN  agent   provisioning slow, retrying`,
      `12:35:21 ERROR boot    ${workspace.errorReason}`,
    ];
  }
  return SAMPLE_LOGS;
}

export function WorkspaceLogs({
  workspace,
  defaultOpen = false,
}: {
  workspace: VM;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const lines = buildLines(workspace);

  return (
    <section
      aria-label="Workspace logs"
      className="rounded-lg border border-border-default bg-surface-elevated"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-5 py-3.5 text-left",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral"
        )}
      >
        <span className="text-sm font-medium text-text-primary">Logs</span>
        <span className="flex items-center gap-2 text-xs text-text-tertiary">
          {lines.length} entries
          {open ? (
            <ChevronDown className="size-4" strokeWidth={1.5} />
          ) : (
            <ChevronRight className="size-4" strokeWidth={1.5} />
          )}
        </span>
      </button>
      {open ? (
        <pre className="max-h-72 overflow-auto border-t border-border-subtle bg-surface-page p-4 font-mono text-xs leading-relaxed text-text-secondary">
          {lines.join("\n")}
        </pre>
      ) : null}
    </section>
  );
}
