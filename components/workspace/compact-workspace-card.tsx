"use client";

import { IdlePill } from "@/components/workspace/idle-pill";
import { StatusBadge } from "@/components/workspace/status-badge";
import { UsageCircle } from "@/components/workspace/usage-circle";
import { WorkspaceActionsContext } from "@/components/workspace/workspace-actions-menu";
import type { VM } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function CompactWorkspaceCard({
  workspace,
  selected,
  onSelect,
}: {
  workspace: VM;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <WorkspaceActionsContext workspace={workspace}>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "flex w-full flex-col gap-1.5 rounded-md border px-3.5 py-3 text-left transition-colors",
          selected
            ? "bg-[color:color-mix(in_oklab,var(--accent)_5%,transparent)]"
            : "border-border-default hover:bg-surface-secondary"
        )}
        style={selected ? { borderColor: "var(--accent)" } : undefined}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-mono text-sm font-medium text-text-primary">
            {workspace.name}
          </span>
          <StatusBadge status={workspace.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-text-tertiary">
          <span className="truncate">{workspace.templateName}</span>
          {workspace.isIdle ? (
            <IdlePill lastActiveAt={workspace.lastActiveAt} />
          ) : null}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <UsageCircle
            label="CPU"
            value={workspace.cpu}
            size={16}
            showLabel={false}
          />
          <span className="text-xs text-text-secondary">
            CPU {Math.round(workspace.cpu)}%
          </span>
        </div>
      </button>
    </WorkspaceActionsContext>
  );
}
