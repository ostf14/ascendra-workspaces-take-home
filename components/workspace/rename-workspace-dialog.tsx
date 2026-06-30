"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRenameWorkspace } from "@/lib/hooks/use-workspace-lifecycle";
import type { VM } from "@/lib/domain/types";

const SLUG_RE = /^[a-zA-Z0-9-]+$/;

function validate(name: string): string | null {
  if (name.length < 1) return "Name is required.";
  if (name.length > 50) return "Use at most 50 characters.";
  if (!SLUG_RE.test(name)) return "Only letters, digits, and hyphens.";
  return null;
}

export function RenameWorkspaceDialog({
  workspace,
  open,
  onOpenChange,
}: {
  workspace: VM;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(workspace.name);
  const rename = useRenameWorkspace();

  useEffect(() => {
    if (open) setName(workspace.name);
  }, [open, workspace.name]);

  const error = name === workspace.name ? null : validate(name);
  const submitting = rename.isPending;
  const canSubmit = !error && name !== workspace.name && !submitting;

  function handleSubmit() {
    if (!canSubmit) return;
    rename.mutate(
      { id: workspace.id, input: { name } },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename workspace</DialogTitle>
          <DialogDescription>
            Names should be slug-shaped — letters, digits, and hyphens, 1 to
            50 characters.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rename-input" className="text-sm">
            Workspace name
          </Label>
          <Input
            id="rename-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={workspace.name}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          {error ? (
            <p className="text-xs" style={{ color: "var(--status-error)" }}>
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? "Renaming…" : "Save name"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
