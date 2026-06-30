"use client";

import Link from "next/link";
import { useState } from "react";

import { IdlePill } from "@/components/workspace/idle-pill";
import { LifecycleControls } from "@/components/workspace/lifecycle-controls";
import { StatusBadge } from "@/components/workspace/status-badge";
import { UsageCircle } from "@/components/workspace/usage-circle";
import { WorkspaceActionsContext } from "@/components/workspace/workspace-actions-menu";
import { WorkspacePreviewSheet } from "@/components/workspace/workspace-preview-sheet";
import type { VM } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function WorkspaceCard({ workspace }: { workspace: VM }) {
  const detailHref = `/workspaces/${workspace.id}`;
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <WorkspaceActionsContext workspace={workspace}>
      <article
        className={cn(
          "flex flex-col gap-4 rounded-lg border border-border-default bg-surface-elevated p-5 transition-colors",
          "hover:border-border-strong"
        )}
      >
        <Link
          href={detailHref}
          aria-label={`Open ${workspace.name} detail`}
          className="flex flex-col gap-4 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral"
        >
          <header className="flex items-start justify-between gap-3">
            <div className="flex flex-col items-start gap-1.5">
              <h3 className="font-mono text-sm font-medium text-text-primary">
                {workspace.name}
              </h3>
              <p className="text-xs text-text-tertiary">{workspace.templateName}</p>
              {workspace.isIdle ? (
                <IdlePill lastActiveAt={workspace.lastActiveAt} />
              ) : null}
            </div>
            <StatusBadge status={workspace.status} />
          </header>

          <div className="flex items-start justify-around gap-6 py-1">
            <UsageCircle label="CPU" value={workspace.cpu} />
            <UsageCircle label="Memory" value={workspace.memory} />
            <UsageCircle label="Disk" value={workspace.disk} />
          </div>
        </Link>

        <footer className="flex items-center gap-2">
          <LifecycleControls
            workspace={workspace}
            variant="card"
            onOpen={() => setSheetOpen(true)}
          />
        </footer>

        <WorkspacePreviewSheet
          workspace={workspace}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </article>
    </WorkspaceActionsContext>
  );
}
