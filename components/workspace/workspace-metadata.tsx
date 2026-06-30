"use client";

import { format, formatDistanceToNow, parseISO } from "date-fns";

import type { VM } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/utils/format";
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
  variant = "developer",
  className,
}: {
  workspace: VM;
  variant?: "developer" | "admin";
  className?: string;
}) {
  // Developer surface: session cost is the meaningful number (what they've
  // burned this uptime). Hourly cost is demoted to a small metadata row
  // alongside Region / Created — cost is an admin concern.
  // Admin surface: hourly cost stays in the grid as a peer of session cost.
  const isAdmin = variant === "admin";
  const sessionValue = formatCurrency(sessionCost(workspace));
  const hourlyValue = formatCurrency(workspace.hourlyCost);

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
    { label: "Hourly cost", value: hourlyValue },
  ];

  if (isAdmin) {
    entries.push({ label: "Session cost", value: sessionValue });
  }

  return (
    <section
      aria-label="Workspace details"
      className={cn(
        "rounded-lg border border-border-default bg-surface-elevated",
        className
      )}
    >
      <header className="flex items-baseline justify-between gap-4 border-b border-border-subtle px-5 py-3.5">
        <h2 className="text-sm font-medium text-text-primary">Details</h2>
        {!isAdmin ? (
          <span className="text-xs text-text-tertiary">
            Session cost{" "}
            <span className="font-mono text-sm tabular-nums text-text-primary">
              {sessionValue}
            </span>
          </span>
        ) : null}
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
