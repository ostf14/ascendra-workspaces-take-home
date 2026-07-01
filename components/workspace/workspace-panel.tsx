"use client";

import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { LayoutGrid } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { ConnectPopover } from "@/components/workspace/connect-popover";
import { IdleIndicator } from "@/components/workspace/idle-pill";
import { LifecycleControls } from "@/components/workspace/lifecycle-controls";
import { StatusBadge } from "@/components/workspace/status-badge";
import { UsageCircle } from "@/components/workspace/usage-circle";
import { WorkspaceLogs } from "@/components/workspace/workspace-logs";
import { WorkspaceMetricsChart } from "@/components/workspace/workspace-metrics-chart";
import type { VM } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/utils/format";

function formatUptime(workspace: VM): string {
  if (workspace.status !== "running") return "—";
  return formatDistanceToNowStrict(parseISO(workspace.createdAt));
}

function sessionCost(workspace: VM): number {
  const created = parseISO(workspace.createdAt);
  const hours = Math.max(0, (Date.now() - created.getTime()) / (1000 * 60 * 60));
  return workspace.hourlyCost * hours;
}

export function WorkspacePanel({ workspace }: { workspace: VM }) {
  return (
    <section
      aria-label={`Workspace ${workspace.name}`}
      className="flex flex-col gap-6 rounded-lg border border-border-default bg-surface-elevated p-6"
    >
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-medium text-text-primary">
              {workspace.name}
            </h1>
            <StatusBadge status={workspace.status} />
            {workspace.isIdle ? (
              <IdleIndicator
                lastActiveAt={workspace.lastActiveAt}
                className="text-sm"
              />
            ) : null}
          </div>
          <LifecycleControls
            workspace={workspace}
            onOpen={() => <ConnectPopover workspace={workspace} />}
          />
        </div>
        <p className="text-sm text-text-tertiary">
          {workspace.templateName} · {workspace.region} · Provisioned{" "}
          {format(parseISO(workspace.createdAt), "MMM d, yyyy")}
        </p>
      </header>

      <StatsRow workspace={workspace} />

      <WorkspaceMetricsChart id={workspace.id} />

      <WorkspaceLogs
        workspace={workspace}
        defaultOpen={workspace.status === "error"}
      />
    </section>
  );
}

function StatsRow({ workspace }: { workspace: VM }) {
  return (
    <div
      role="group"
      aria-label="Workspace stats"
      className="@container/stats"
    >
      <div className="flex flex-wrap items-center gap-x-16 gap-y-6 rounded-md bg-surface-secondary px-6 py-5 @max-[880px]/stats:flex-col @max-[880px]/stats:items-start">
        <div className="flex items-center gap-8">
          <UsageCircle label="CPU" value={workspace.cpu} size="md" />
          <UsageCircle label="Memory" value={workspace.memory} size="md" />
          <UsageCircle label="Disk" value={workspace.disk} size="md" />
        </div>
        <dl className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
          <StatField label="Uptime" value={formatUptime(workspace)} />
          <StatField
            label="Session cost"
            value={formatCurrency(sessionCost(workspace))}
          />
          <StatField
            label="Hourly cost"
            value={`${formatCurrency(workspace.hourlyCost)}/hr`}
          />
        </dl>
      </div>
    </div>
  );
}

function StatField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className="font-mono text-base font-medium text-text-primary tabular-nums">
        {value}
      </dd>
    </div>
  );
}

export function WorkspacePanelEmpty() {
  return (
    <section
      aria-label="No workspace selected"
      className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-lg border border-border-default bg-surface-elevated p-8 text-center"
    >
      <span className="inline-flex size-10 items-center justify-center rounded-md border border-border-subtle text-text-tertiary">
        <LayoutGrid className="size-5" strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-text-tertiary">
          Select a workspace
        </p>
        <p className="text-sm text-text-tertiary">
          Pick one from the list to see details and take action.
        </p>
      </div>
    </section>
  );
}

export function WorkspacePanelSkeleton() {
  return (
    <section className="flex flex-col gap-6 rounded-lg border border-border-default bg-surface-elevated p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-56" />
      </div>
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-40 w-full" />
    </section>
  );
}
