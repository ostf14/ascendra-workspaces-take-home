"use client";

import { format, parseISO } from "date-fns";
import { LayoutGrid } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { IdlePill } from "@/components/workspace/idle-pill";
import { StatusBadge } from "@/components/workspace/status-badge";
import type { VM } from "@/lib/domain/types";

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
    </section>
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
