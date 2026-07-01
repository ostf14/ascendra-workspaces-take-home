"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Copy,
  CopyPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteWorkspaceDialog } from "@/components/workspace/delete-workspace-dialog";
import { RenameWorkspaceDialog } from "@/components/workspace/rename-workspace-dialog";
import { useDuplicateWorkspace } from "@/lib/hooks/use-workspace-lifecycle";
import type { VM } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

type ActionItem =
  | "separator"
  | {
      key: string;
      label: string;
      icon: ReactNode;
      onSelect: () => void;
      destructive?: boolean;
    };

// Shared menu definition for the workspace kebab and the right-click context
// menu. The hook owns the rename / delete dialog state plus the duplicate
// mutation so the two consumers stay in sync without prop-drilling.
function useWorkspaceActionsState(
  workspace: VM,
  options: { redirectAfterDelete?: boolean } = {}
) {
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const duplicate = useDuplicateWorkspace();

  async function copyId() {
    try {
      await navigator.clipboard.writeText(workspace.id);
      toast.success("Workspace ID copied");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  function runDuplicate() {
    duplicate.mutate(workspace.id, {
      onSuccess: (vm) => {
        router.push(`/workspaces?w=${encodeURIComponent(vm.id)}`);
      },
    });
  }

  const items: ActionItem[] = [
    {
      key: "rename",
      label: "Rename",
      icon: <Pencil className="size-4" strokeWidth={1.5} />,
      onSelect: () => setRenameOpen(true),
    },
    {
      key: "duplicate",
      label: "Duplicate",
      icon: <CopyPlus className="size-4" strokeWidth={1.5} />,
      onSelect: runDuplicate,
    },
    {
      key: "copy-id",
      label: "Copy ID",
      icon: <Copy className="size-4" strokeWidth={1.5} />,
      onSelect: copyId,
    },
    "separator",
    {
      key: "delete",
      label: "Delete workspace",
      icon: <Trash2 className="size-4" strokeWidth={1.5} />,
      onSelect: () => setDeleteOpen(true),
      destructive: true,
    },
  ];

  const dialogs = (
    <>
      <RenameWorkspaceDialog
        workspace={workspace}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
      <DeleteWorkspaceDialog
        workspace={workspace}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectAfterDelete={options.redirectAfterDelete}
      />
    </>
  );

  return { items, dialogs };
}

const DESTRUCTIVE_DROPDOWN_CLASSES = cn(
  "text-status-error focus:bg-status-error/10 focus:text-status-error",
  "data-[highlighted]:bg-status-error/10 data-[highlighted]:text-status-error"
);

const DESTRUCTIVE_CONTEXT_CLASSES = cn(
  "text-status-error focus:bg-status-error/10 focus:text-status-error",
  "data-[highlighted]:bg-status-error/10 data-[highlighted]:text-status-error"
);

export function WorkspaceActionsDropdown({
  workspace,
  trigger,
  redirectAfterDelete,
  align = "end",
}: {
  workspace: VM;
  trigger: ReactNode;
  redirectAfterDelete?: boolean;
  align?: "start" | "center" | "end";
}) {
  const { items, dialogs } = useWorkspaceActionsState(workspace, {
    redirectAfterDelete,
  });
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-56">
          {items.map((it, index) =>
            it === "separator" ? (
              <DropdownMenuSeparator key={`sep-${index}`} />
            ) : (
              <DropdownMenuItem
                key={it.key}
                onSelect={it.onSelect}
                className={cn(it.destructive && DESTRUCTIVE_DROPDOWN_CLASSES)}
              >
                {it.icon}
                {it.label}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {dialogs}
    </>
  );
}

export function WorkspaceActionsContext({
  workspace,
  children,
  redirectAfterDelete,
}: {
  workspace: VM;
  children: ReactNode;
  redirectAfterDelete?: boolean;
}) {
  const { items, dialogs } = useWorkspaceActionsState(workspace, {
    redirectAfterDelete,
  });
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          {items.map((it, index) =>
            it === "separator" ? (
              <ContextMenuSeparator key={`sep-${index}`} />
            ) : (
              <ContextMenuItem
                key={it.key}
                onSelect={it.onSelect}
                className={cn(it.destructive && DESTRUCTIVE_CONTEXT_CLASSES)}
              >
                {it.icon}
                {it.label}
              </ContextMenuItem>
            )
          )}
        </ContextMenuContent>
      </ContextMenu>
      {dialogs}
    </>
  );
}
