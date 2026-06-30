"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteWorkspace } from "@/lib/hooks/use-workspace-lifecycle";
import type { VM } from "@/lib/domain/types";

export function DeleteWorkspaceDialog({
  workspace,
  open,
  onOpenChange,
  redirectAfterDelete = false,
}: {
  workspace: VM;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectAfterDelete?: boolean;
}) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const { mutate, isPending } = useDeleteWorkspace();
  const canDelete = confirmation === workspace.name;

  function close(next: boolean) {
    if (!next) setConfirmation("");
    onOpenChange(next);
  }

  function handleDelete() {
    mutate(workspace.id, {
      onSuccess: () => {
        close(false);
        if (redirectAfterDelete) router.push("/workspaces");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete workspace</DialogTitle>
          <DialogDescription>
            All data for{" "}
            <span className="font-mono text-text-primary">{workspace.name}</span> will
            be deleted. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="delete-confirmation" className="text-sm">
            Type the workspace name to confirm.
          </Label>
          <Input
            id="delete-confirmation"
            autoComplete="off"
            spellCheck={false}
            value={confirmation}
            placeholder={workspace.name}
            onChange={(e) => setConfirmation(e.target.value)}
            className="font-mono"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => close(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleDelete}
            disabled={!canDelete || isPending}
            style={{
              backgroundColor: canDelete ? "var(--status-error)" : undefined,
              color: canDelete ? "#ffffff" : undefined,
              borderColor: canDelete ? "var(--status-error)" : undefined,
            }}
          >
            {isPending ? "Deleting…" : "Delete workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
