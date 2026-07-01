"use client";

import { format, parseISO } from "date-fns";
import {
  Mail,
  MousePointerClick,
  OctagonX,
  RotateCcw,
  Trash2,
  User,
  UserCog,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteWorkspaceDialog } from "@/components/workspace/delete-workspace-dialog";
import { IdleIndicator } from "@/components/workspace/idle-pill";
import { RecreateWorkspaceDialog } from "@/components/workspace/recreate-workspace-dialog";
import { StatusBadge } from "@/components/workspace/status-badge";
import { UsageCircle } from "@/components/workspace/usage-circle";
import { useStopWorkspace } from "@/lib/hooks/use-workspace-lifecycle";
import { useUsers } from "@/lib/hooks/use-users";
import type { FleetInventoryItem, VM } from "@/lib/domain/types";
import { formatCompactRelative, formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

function sessionCost(workspace: VM): number {
  const created = parseISO(workspace.createdAt);
  const hours = Math.max(0, (Date.now() - created.getTime()) / (1000 * 60 * 60));
  return workspace.hourlyCost * hours;
}

type ActivityEvent = { at: string; kind: string; detail?: string };

// Synthesize a plausible activity trail from the VM's known timestamps.
// No activity-log endpoint exists in the mock; if the store gains one later
// this whole function goes away.
function deriveActivity(workspace: VM): ActivityEvent[] {
  const created = parseISO(workspace.createdAt);
  const lastActive = parseISO(workspace.lastActiveAt);
  const events: ActivityEvent[] = [
    { at: workspace.createdAt, kind: "Provisioned", detail: workspace.templateName },
    {
      at: new Date(created.getTime() + 60_000).toISOString(),
      kind: "Started",
    },
  ];
  const spanMs = Math.max(0, lastActive.getTime() - created.getTime());
  // Two synthetic mid-life events if the workspace has been around for more
  // than a day; otherwise the workspace is too fresh for filler events.
  if (spanMs > 24 * 60 * 60 * 1000) {
    const q1 = new Date(created.getTime() + spanMs * 0.35).toISOString();
    const q3 = new Date(created.getTime() + spanMs * 0.7).toISOString();
    events.push({ at: q1, kind: "Stopped", detail: "Auto-stop, idle" });
    events.push({ at: q3, kind: "Restarted" });
  }
  events.push({
    at: workspace.lastActiveAt,
    kind:
      workspace.status === "running"
        ? "Active"
        : workspace.status === "error"
          ? "Error"
          : workspace.status === "stopped"
            ? "Stopped"
            : workspace.status === "starting"
              ? "Starting"
              : "Stopping",
  });
  // Latest first, cap at 5.
  return events.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 5);
}

export function AdminWorkspacePanel({
  workspace,
}: {
  workspace: FleetInventoryItem | undefined;
}) {
  if (!workspace) return <AdminPanelEmpty />;
  return <AdminPanelBody workspace={workspace} />;
}

function AdminPanelBody({ workspace }: { workspace: VM }) {
  const [recreateOpen, setRecreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const stop = useStopWorkspace();

  const canForceStop =
    workspace.status !== "stopped" && workspace.status !== "stopping";

  const events = deriveActivity(workspace);

  return (
    <section
      aria-label={`Workspace ${workspace.name}`}
      className="flex flex-col gap-5 rounded-lg border border-border-default bg-surface-elevated p-5"
    >
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-mono text-lg font-medium leading-tight text-text-primary">
            {workspace.name}
          </h2>
          <StatusBadge status={workspace.status} />
          {workspace.isIdle ? (
            <IdleIndicator
              lastActiveAt={workspace.lastActiveAt}
              className="text-xs"
            />
          ) : null}
        </div>
        <p className="text-sm text-text-tertiary">
          {workspace.templateName} · {workspace.region} · Provisioned{" "}
          {format(parseISO(workspace.createdAt), "MMM d, yyyy")}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => stop.mutate(workspace.id)}
          disabled={!canForceStop || stop.isPending}
        >
          <OctagonX className="size-4" strokeWidth={1.5} />
          Force-stop
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRecreateOpen(true)}
        >
          <RotateCcw className="size-4" strokeWidth={1.5} />
          Recreate
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setReassignOpen(true)}
        >
          <UserCog className="size-4" strokeWidth={1.5} />
          Reassign owner
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Delete workspace"
              onClick={() => setDeleteOpen(true)}
              className="ml-auto text-status-error hover:bg-status-error/10 hover:text-status-error"
            >
              <Trash2 className="size-4" strokeWidth={1.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete workspace</TooltipContent>
        </Tooltip>
      </div>

      <OwnerRow ownerId={workspace.ownerId} />

      <div className="flex items-center justify-around gap-6 rounded-md bg-surface-secondary px-5 py-4">
        <UsageCircle label="CPU" value={workspace.cpu} size="md" />
        <UsageCircle label="Memory" value={workspace.memory} size="md" />
        <UsageCircle label="Disk" value={workspace.disk} size="md" />
      </div>

      <dl className="flex flex-wrap items-center justify-around gap-6 rounded-md bg-surface-secondary px-5 py-4">
        <CostField
          label="Session cost"
          value={formatCurrency(sessionCost(workspace))}
        />
        <CostField
          label="Hourly cost"
          value={`${formatCurrency(workspace.hourlyCost)}/hr`}
        />
      </dl>

      <RecentActivity events={events} />

      <RecreateWorkspaceDialog
        workspace={workspace}
        open={recreateOpen}
        onOpenChange={setRecreateOpen}
      />
      <DeleteWorkspaceDialog
        workspace={workspace}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      <ReassignDialog open={reassignOpen} onOpenChange={setReassignOpen} />
    </section>
  );
}

function OwnerRow({ ownerId }: { ownerId: string }) {
  const { data: users } = useUsers();
  const owner = users?.find((u) => u.id === ownerId);

  return (
    <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-text-secondary">
        <User className="size-4" strokeWidth={1.5} />
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="truncate text-sm font-medium text-text-primary">
          {owner?.name ?? "Unknown owner"}
        </span>
        <span className="truncate font-mono text-sm text-text-secondary">
          {owner?.email ?? "—"}
        </span>
      </div>
      {owner ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              size="icon-sm"
              variant="ghost"
              className="text-text-tertiary hover:text-text-primary"
            >
              <a href={`mailto:${owner.email}`} aria-label={`Email ${owner.name}`}>
                <Mail className="size-4" strokeWidth={1.5} />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Email owner</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}

function CostField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className="font-mono text-base font-medium text-text-primary tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function RecentActivity({ events }: { events: ActivityEvent[] }) {
  return (
    <section aria-label="Recent activity" className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-text-tertiary">Recent activity</h3>
      <ol className="flex flex-col gap-1.5">
        {events.map((event, i) => (
          <li
            key={`${event.at}-${i}`}
            className="flex items-baseline justify-between gap-3 text-xs"
          >
            <span className="flex items-baseline gap-1.5">
              <ActivityDot kind={event.kind} />
              <span className="text-text-primary">{event.kind}</span>
              {event.detail ? (
                <span className="text-text-tertiary">— {event.detail}</span>
              ) : null}
            </span>
            <span className="font-mono text-text-tertiary tabular-nums">
              {formatCompactRelative(event.at)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ActivityDot({ kind }: { kind: string }) {
  const color =
    kind === "Started" || kind === "Active"
      ? "var(--status-running)"
      : kind === "Error"
        ? "var(--status-error)"
        : kind === "Starting" || kind === "Stopping"
          ? "var(--status-pending)"
          : "var(--text-tertiary)";
  return (
    <span
      aria-hidden
      className="inline-block size-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function ReassignDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign owner</DialogTitle>
          <DialogDescription>
            The reassign-owner API is part of the policies surface that&apos;s
            out of scope for this exercise. The visible affordance documents
            the future workflow.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminPanelEmpty() {
  return (
    <section
      aria-label="No workspace selected"
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-lg border border-border-default bg-surface-elevated p-8 text-center"
      )}
    >
      <span className="inline-flex size-10 items-center justify-center rounded-md border border-border-subtle text-text-tertiary">
        <MousePointerClick className="size-5" strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-text-tertiary">
          Select a workspace
        </p>
        <p className="text-sm text-text-tertiary">
          Pick a row from the table to see details and take action.
        </p>
      </div>
    </section>
  );
}


