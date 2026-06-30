"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRestartWorkspace } from "@/lib/hooks/use-workspace-lifecycle";
import type { VM } from "@/lib/domain/types";

// Recreate isn't a distinct backend action — it's destroy-and-rebuild from the
// same template. The mock fakes it as a restart so the UI affordance still works.
export function RecreateWorkspaceDialog({
  workspace,
  open,
  onOpenChange,
}: {
  workspace: VM;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate, isPending } = useRestartWorkspace();

  function handleConfirm() {
    mutate(workspace.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recreate workspace</DialogTitle>
          <DialogDescription>
            <span className="font-mono text-text-primary">{workspace.name}</span>{" "}
            will be destroyed and rebuilt from the same template. Your home
            directory is preserved. Installed packages and system changes will be
            reset.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Recreating…" : "Recreate workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
