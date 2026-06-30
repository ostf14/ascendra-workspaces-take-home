"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OctagonX, RotateCcw, Trash2, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteWorkspaceDialog } from "@/components/workspace/delete-workspace-dialog";
import { RecreateWorkspaceDialog } from "@/components/workspace/recreate-workspace-dialog";
import { useStopWorkspace } from "@/lib/hooks/use-workspace-lifecycle";
import type { VM } from "@/lib/domain/types";

export function AdminActionsPanel({ workspace }: { workspace: VM }) {
  const router = useRouter();
  const [recreate, setRecreate] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const stop = useStopWorkspace();

  return (
    <section
      aria-label="Admin actions"
      className="rounded-lg border border-border-default bg-surface-elevated"
    >
      <header className="border-b border-border-subtle px-5 py-3.5">
        <h2 className="text-sm font-medium text-text-primary">Admin actions</h2>
        <p className="text-xs text-text-tertiary">
          Privileged actions on this workspace.
        </p>
      </header>
      <div className="flex flex-col gap-2 p-4">
        <ActionRow
          icon={<OctagonX className="size-4" strokeWidth={1.5} />}
          label="Force-stop"
          hint="Bypass user; flips status to stopping immediately. Files preserved."
          onClick={() => stop.mutate(workspace.id)}
          disabled={
            stop.isPending ||
            workspace.status === "stopped" ||
            workspace.status === "stopping"
          }
        />
        <ActionRow
          icon={<RotateCcw className="size-4" strokeWidth={1.5} />}
          label="Recreate"
          hint="Rebuild from the same template. Home directory preserved."
          onClick={() => setRecreate(true)}
        />
        <ActionRow
          icon={<UserCog className="size-4" strokeWidth={1.5} />}
          label="Reassign owner"
          hint="Transfer this workspace to another user."
          onClick={() => setReassignOpen(true)}
        />
        <ActionRow
          icon={<Trash2 className="size-4" strokeWidth={1.5} />}
          label="Delete"
          hint="All data on this workspace will be deleted."
          onClick={() => setRemoveOpen(true)}
          destructive
        />
      </div>

      <RecreateWorkspaceDialog
        workspace={workspace}
        open={recreate}
        onOpenChange={setRecreate}
      />
      <DeleteWorkspaceDialog
        workspace={workspace}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        redirectAfterDelete
      />
      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
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
            <Button onClick={() => setReassignOpen(false)}>Got it</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setReassignOpen(false);
                router.push("/admin/workspaces");
              }}
            >
              Back to fleet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ActionRow({
  icon,
  label,
  hint,
  onClick,
  disabled = false,
  destructive = false,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border-subtle bg-surface-page px-3 py-2.5">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 text-text-tertiary"
          aria-hidden
          style={destructive ? { color: "var(--status-error)" } : undefined}
        >
          {icon}
        </span>
        <div className="flex flex-col">
          <span
            className="text-sm font-medium"
            style={{
              color: destructive ? "var(--status-error)" : "var(--text-primary)",
            }}
          >
            {label}
          </span>
          <span className="text-xs text-text-tertiary">{hint}</span>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onClick}
        disabled={disabled}
        className={destructive ? "border-status-error/40 text-status-error hover:bg-status-error/10 hover:text-status-error" : undefined}
      >
        {label}
      </Button>
    </div>
  );
}
