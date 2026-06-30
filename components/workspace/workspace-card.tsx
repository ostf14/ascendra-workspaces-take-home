"use client";

import Link from "next/link";
import { Loader2, Play, SquareArrowOutUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LifecycleControls } from "@/components/workspace/lifecycle-controls";
import { StatusBadge } from "@/components/workspace/status-badge";
import { UsageMetric } from "@/components/workspace/usage-metric";
import { useStartWorkspace } from "@/lib/hooks/use-workspace-lifecycle";
import type { VM } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function WorkspaceCard({ workspace }: { workspace: VM }) {
  const detailHref = `/workspaces/${workspace.id}`;
  const start = useStartWorkspace();
  const isTransitional =
    workspace.status === "starting" || workspace.status === "stopping";

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border-default bg-surface-elevated p-5 transition-colors",
        "hover:border-border-strong"
      )}
    >
      <Link
        href={detailHref}
        aria-label={`Open ${workspace.name}`}
        className="flex flex-col gap-4 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral"
      >
        <header className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-mono text-sm font-medium text-text-primary">
              {workspace.name}
            </h3>
            <p className="text-xs text-text-tertiary">{workspace.templateName}</p>
          </div>
          <StatusBadge status={workspace.status} />
        </header>

        <div className="grid grid-cols-3 gap-3">
          <UsageMetric label="CPU" value={workspace.cpu} compact />
          <UsageMetric label="Memory" value={workspace.memory} compact />
          <UsageMetric label="Disk" value={workspace.disk} compact />
        </div>
      </Link>

      <footer className="flex items-center justify-between gap-2">
        {workspace.status === "running" ? (
          <Button asChild size="sm" variant="default">
            <Link href={detailHref}>
              <SquareArrowOutUpRight className="size-4" strokeWidth={1.5} />
              Open
            </Link>
          </Button>
        ) : workspace.status === "stopped" ? (
          <Button
            size="sm"
            variant="default"
            onClick={() => start.mutate(workspace.id)}
            disabled={start.isPending}
          >
            <Play className="size-4" strokeWidth={1.5} />
            Start
          </Button>
        ) : isTransitional ? (
          <Button size="sm" variant="default" disabled>
            <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            {workspace.status === "starting" ? "Starting…" : "Stopping…"}
          </Button>
        ) : (
          <Button asChild size="sm" variant="default">
            <Link href={detailHref}>View details</Link>
          </Button>
        )}
        <LifecycleControls workspace={workspace} variant="card" />
      </footer>
    </article>
  );
}
