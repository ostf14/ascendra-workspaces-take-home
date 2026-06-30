"use client";

import { useState } from "react";
import { CircleStop, Loader2, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";

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
  useDeleteWorkspace,
  useRestartWorkspace,
  useStopWorkspace,
} from "@/lib/hooks/use-workspace-lifecycle";

type Action = "stop" | "restart" | "delete";

const ACTION_LABEL: Record<Action, string> = {
  stop: "Stop",
  restart: "Restart",
  delete: "Delete",
};

const ACTION_DESCRIPTION: Record<Action, string> = {
  stop: "Files and settings will be preserved on each workspace.",
  restart:
    "Each workspace will reboot. Running processes will stop. Files preserved.",
  delete:
    "All data on the selected workspaces will be destroyed. This cannot be undone.",
};

export function BulkActionBar({
  selectedIds,
  onClear,
}: {
  selectedIds: string[];
  onClear: () => void;
}) {
  const [pending, setPending] = useState<Action | null>(null);
  const [confirm, setConfirm] = useState<Action | null>(null);

  const stop = useStopWorkspace();
  const restart = useRestartWorkspace();
  const remove = useDeleteWorkspace();

  if (selectedIds.length === 0) return null;

  async function runBulk(action: Action) {
    setPending(action);
    try {
      const tasks = selectedIds.map((id) => {
        if (action === "stop") return stop.mutateAsync(id);
        if (action === "restart") return restart.mutateAsync(id);
        return remove.mutateAsync(id);
      });
      const results = await Promise.allSettled(tasks);
      const failed = results.filter((r) => r.status === "rejected").length;
      const succeeded = results.length - failed;
      if (succeeded > 0) {
        const verb = action === "delete" ? "deleted" : `${action}ed`;
        toast.success(`${verb.charAt(0).toUpperCase()}${verb.slice(1)} ${succeeded} workspaces`);
      }
      if (failed > 0) toast.error(`${failed} actions failed`);
      onClear();
    } finally {
      setPending(null);
      setConfirm(null);
    }
  }

  return (
    <>
      <div
        role="region"
        aria-label="Bulk actions"
        className="sticky top-[6.5rem] z-20 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent-coral/40 bg-accent-coral/5 px-4 py-2.5 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" onClick={onClear} aria-label="Clear selection">
            <X className="size-4" strokeWidth={1.5} />
          </Button>
          <span className="text-sm text-text-primary">
            {selectedIds.length} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={pending !== null}
            onClick={() => setConfirm("stop")}
          >
            <CircleStop className="size-4" strokeWidth={1.5} />
            Stop
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending !== null}
            onClick={() => setConfirm("restart")}
          >
            <RotateCcw className="size-4" strokeWidth={1.5} />
            Restart
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending !== null}
            onClick={() => setConfirm("delete")}
            className="border-status-error/40 text-status-error hover:bg-status-error/10 hover:text-status-error"
          >
            <Trash2 className="size-4" strokeWidth={1.5} />
            Delete
          </Button>
          {pending ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
              <Loader2 className="size-3 animate-spin" strokeWidth={1.5} />
              Running {ACTION_LABEL[pending].toLowerCase()}…
            </span>
          ) : null}
        </div>
      </div>

      <Dialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent>
          {confirm ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {ACTION_LABEL[confirm]} {selectedIds.length} workspaces
                </DialogTitle>
                <DialogDescription>{ACTION_DESCRIPTION[confirm]}</DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setConfirm(null)}
                  disabled={pending !== null}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => runBulk(confirm)}
                  disabled={pending !== null}
                  style={
                    confirm === "delete"
                      ? {
                          backgroundColor: "var(--status-error)",
                          color: "#ffffff",
                          borderColor: "var(--status-error)",
                        }
                      : undefined
                  }
                >
                  {pending === confirm
                    ? "Running…"
                    : `${ACTION_LABEL[confirm]} ${selectedIds.length} workspaces`}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
