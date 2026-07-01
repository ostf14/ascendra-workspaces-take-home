"use client";

import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { LayoutGrid } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { ConnectPanel } from "@/components/workspace/connect-panel";
import { IdlePill } from "@/components/workspace/idle-pill";
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
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-medium text-text-primary">
            {workspace.name}
          </h1>
          <StatusBadge status={workspace.status} />
          {workspace.isIdle ? (
            <IdlePill lastActiveAt={workspace.lastActiveAt} />
          ) : null}
        </div>
        <p className="text-sm text-text-tertiary">
          {workspace.templateName} · {workspace.region} · Provisioned{" "}
          {format(parseISO(workspace.createdAt), "MMM d, yyyy")}
        </p>
      </header>

      <LifecycleControls workspace={workspace} />

      <MetadataStrip workspace={workspace} />

      <div
        role="group"
        aria-label="Current usage"
        className="flex items-center justify-around gap-6 rounded-md border border-border-subtle bg-surface-page px-6 py-5"
      >
        <UsageCircle label="CPU" value={workspace.cpu} size={56} />
        <UsageCircle label="Memory" value={workspace.memory} size={56} />
        <UsageCircle label="Disk" value={workspace.disk} size={56} />
      </div>

      <ConnectPanel workspace={workspace} />

      <WorkspaceMetricsChart id={workspace.id} />

      <WorkspaceLogs
        workspace={workspace}
        defaultOpen={workspace.status === "error"}
      />
    </section>
  );
}

function MetadataStrip({ workspace }: { workspace: VM }) {
  return (
    <dl className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-md border border-border-subtle bg-surface-page px-5 py-4">
      <StripField label="Uptime" value={formatUptime(workspace)} />
      <Divider />
      <StripField
        label="Session cost"
        value={formatCurrency(sessionCost(workspace))}
        emphasis
      />
      <Divider />
      <StripField
        label="Hourly cost"
        value={`${formatCurrency(workspace.hourlyCost)}/hr`}
        muted
      />
    </dl>
  );
}

function StripField({
  label,
  value,
  emphasis = false,
  muted = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd
        className={
          emphasis
            ? "font-mono text-md font-medium text-text-primary tabular-nums"
            : muted
            ? "font-mono text-xs text-text-tertiary tabular-nums"
            : "font-mono text-sm text-text-primary tabular-nums"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="hidden h-8 w-px bg-border-subtle sm:inline-block"
    />
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
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-40 w-full" />
    </section>
  );
}
