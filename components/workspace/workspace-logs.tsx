"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import type { VM } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const SAMPLE_LOGS = [
  "[boot] kernel 6.6.42 ready",
  "[runtime] starting code-server@4.93.0",
  "[net] tunnel established",
  "[runtime] code-server listening on :8080",
  "[idle] watching for inactivity",
];

export function WorkspaceLogs({
  workspace,
  defaultOpen = false,
}: {
  workspace: VM;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const lines = workspace.status === "error" && workspace.errorReason
    ? [...SAMPLE_LOGS.slice(0, 2), `[error] ${workspace.errorReason}`]
    : SAMPLE_LOGS;

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
