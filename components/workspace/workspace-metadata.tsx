"use client";

import { format, formatDistanceToNow, parseISO } from "date-fns";

import type { VM } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

function formatUptime(workspace: VM): string {
  if (workspace.status !== "running") return "—";
  const created = parseISO(workspace.createdAt);
  return `${formatDistanceToNow(created)} (since provision)`;
}

function sessionCost(workspace: VM): number {
  if (workspace.status !== "running") return 0;
  const created = parseISO(workspace.createdAt);
  const hours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
  return workspace.hourlyCost * hours;
}

export function WorkspaceMetadata({
  workspace,
  className,
}: {
  workspace: VM;
  className?: string;
}) {
  const entries: { label: string; value: string }[] = [
    { label: "Template", value: workspace.templateName },
    {
      label: "Specs",
      value: `${workspace.vcpu} vCPU · ${workspace.memoryGb} GB · ${workspace.diskGb} GB`,
    },
    { label: "Region", value: workspace.region },
    {
      label: "Created",
      value: format(parseISO(workspace.createdAt), "MMM d, yyyy"),
    },
    { label: "Uptime", value: formatUptime(workspace) },
    {
      label: "Hourly cost",
      value: `$${workspace.hourlyCost.toFixed(2)}`,
    },
    {
      label: "Session cost",
      value: `$${sessionCost(workspace).toFixed(2)}`,
    },
  ];

  return (
    <section
      aria-label="Workspace details"
      className={cn(
        "rounded-lg border border-border-default bg-surface-elevated",
        className
      )}
    >
      <header className="border-b border-border-subtle px-5 py-3.5">
        <h2 className="text-sm font-medium text-text-primary">Details</h2>
      </header>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-2">
        {entries.map((entry) => (
          <div
            key={entry.label}
            className="flex flex-col gap-0.5 border-b border-border-subtle pb-3 last:border-b-0 last:pb-0 sm:last:border-b sm:last:pb-3"
          >
            <dt className="text-xs text-text-tertiary">{entry.label}</dt>
            <dd className="font-mono text-sm tabular-nums text-text-primary">
              {entry.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
