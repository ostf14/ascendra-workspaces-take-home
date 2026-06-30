"use client";

import { useState } from "react";
import {
  CircleStop,
  Loader2,
  MoreHorizontal,
  Play,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useRestartWorkspace,
  useStartWorkspace,
  useStopWorkspace,
} from "@/lib/hooks/use-workspace-lifecycle";
import type { VM } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

import { DeleteWorkspaceDialog } from "./delete-workspace-dialog";
import { RecreateWorkspaceDialog } from "./recreate-workspace-dialog";

const HINTS = {
  start: "Resumes from the saved disk. Files and settings preserved.",
  stop: "Files and settings preserved. Resume from where you left off.",
  restart: "Files preserved. Running processes will stop.",
  recreate:
    "Home directory preserved. Installed packages and system changes will be reset.",
  delete: "All data for this workspace will be deleted.",
} as const;

export function LifecycleControls({
  workspace,
  variant = "detail",
  redirectAfterDelete = false,
}: {
  workspace: VM;
  variant?: "detail" | "card";
  redirectAfterDelete?: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recreateOpen, setRecreateOpen] = useState(false);

  const start = useStartWorkspace();
  const stop = useStopWorkspace();
  const restart = useRestartWorkspace();

  const busy = start.isPending || stop.isPending || restart.isPending;

  const onStart = () => start.mutate(workspace.id);
  const onStop = () => stop.mutate(workspace.id);
  const onRestart = () => restart.mutate(workspace.id);

  const buttonSize = variant === "card" ? "sm" : "default";

  return (
    <div className="flex items-center gap-2">
      {workspace.status === "running" ? (
        <>
          <HintButton
            tooltip={HINTS.stop}
            onClick={onStop}
            disabled={busy}
            size={buttonSize}
            variant="outline"
          >
            <CircleStop className="size-4" strokeWidth={1.5} />
            Stop
          </HintButton>
          <HintButton
            tooltip={HINTS.restart}
            onClick={onRestart}
            disabled={busy}
            size={buttonSize}
            variant="ghost"
          >
            <RotateCcw className="size-4" strokeWidth={1.5} />
            Restart
          </HintButton>
        </>
      ) : null}

      {workspace.status === "stopped" ? (
        <HintButton
          tooltip={HINTS.start}
          onClick={onStart}
          disabled={busy}
          size={buttonSize}
          variant="default"
        >
          <Play className="size-4" strokeWidth={1.5} />
          Start
        </HintButton>
      ) : null}

      {workspace.status === "starting" ? (
        <Button size={buttonSize} variant="default" disabled>
          <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
          Starting…
        </Button>
      ) : null}

      {workspace.status === "stopping" ? (
        <Button size={buttonSize} variant="outline" disabled>
          <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
          Stopping…
        </Button>
      ) : null}

      {workspace.status === "error" ? (
        <>
          <HintButton
            tooltip={HINTS.restart}
            onClick={onRestart}
            disabled={busy}
            size={buttonSize}
            variant="default"
          >
            <RefreshCw className="size-4" strokeWidth={1.5} />
            Retry
          </HintButton>
          <HintButton
            tooltip={HINTS.recreate}
            onClick={() => setRecreateOpen(true)}
            disabled={busy}
            size={buttonSize}
            variant="outline"
          >
            <RotateCcw className="size-4" strokeWidth={1.5} />
            Recreate
          </HintButton>
        </>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size={buttonSize === "default" ? "icon" : "sm"}
            variant="ghost"
            aria-label="More actions"
          >
            <MoreHorizontal className="size-4" strokeWidth={1.5} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {workspace.status === "running" ? (
            <DropdownMenuItem onClick={() => setRecreateOpen(true)}>
              <RotateCcw className="size-4" strokeWidth={1.5} />
              Recreate
            </DropdownMenuItem>
          ) : null}
          {workspace.status !== "starting" && workspace.status !== "stopping" ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className={cn(
                  "text-status-error focus:bg-status-error/10 focus:text-status-error",
                  "data-[highlighted]:text-status-error data-[highlighted]:bg-status-error/10"
                )}
              >
                <Trash2 className="size-4" strokeWidth={1.5} />
                Delete workspace
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteWorkspaceDialog
        workspace={workspace}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectAfterDelete={redirectAfterDelete}
      />
      <RecreateWorkspaceDialog
        workspace={workspace}
        open={recreateOpen}
        onOpenChange={setRecreateOpen}
      />
    </div>
  );
}

function HintButton({
  tooltip,
  children,
  ...props
}: {
  tooltip: string;
  children: React.ReactNode;
} & React.ComponentProps<typeof Button>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...props}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[240px]">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
