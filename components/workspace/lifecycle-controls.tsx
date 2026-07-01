"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import {
  CircleStop,
  Loader2,
  MoreHorizontal,
  Play,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { useTransitionProgress } from "@/lib/transition-tracker";

import { RecreateWorkspaceDialog } from "./recreate-workspace-dialog";
import { WorkspaceActionsDropdown } from "./workspace-actions-menu";

const HINTS = {
  start: "Resumes from the saved disk. Files and settings preserved.",
  stop: "Files and settings preserved. Resume from where you left off.",
  restart: "Files preserved. Running processes will stop.",
  recreate:
    "Home directory preserved. Installed packages and system changes will be reset.",
  delete: "All data for this workspace will be deleted.",
} as const;

// State machine — see screens/developer.md "Card / detail action group".
// Exactly one primary; transitions hide everything except the pseudo-button.
//
// | Status     | Primary               | Sec 1   | Sec 2    | Kebab  |
// | running    | Open (when onOpen)    | Stop    | Restart  | Delete |
// | stopped    | Start                 | —       | —        | Delete |
// | starting   | Starting… (disabled)  | hidden  | hidden   | hidden |
// | stopping   | Stopping… (disabled)  | hidden  | hidden   | hidden |
// | error      | Restart               | Recreate| —        | Delete |

export function LifecycleControls({
  workspace,
  variant = "detail",
  redirectAfterDelete = false,
  onOpen,
}: {
  workspace: VM;
  variant?: "detail" | "card";
  redirectAfterDelete?: boolean;
  onOpen?: () => ReactNode;
}) {
  const [recreateOpen, setRecreateOpen] = useState(false);

  const start = useStartWorkspace();
  const stop = useStopWorkspace();
  const restart = useRestartWorkspace();

  const buttonSize = variant === "card" ? "sm" : "default";
  const kebabSize = variant === "card" ? "sm" : "icon";
  const status = workspace.status;
  const isTransitional = status === "starting" || status === "stopping";
  const progress = useTransitionProgress(workspace.id);

  const transitionalLabel = (verb: "Starting" | "Stopping") => {
    if (!progress.started) return `${verb}…`;
    if (progress.almostDone) return `${verb} · almost done…`;
    return `${verb} · ~${progress.secondsRemaining}s`;
  };

  const onStart = () => start.mutate(workspace.id);
  const onStop = () => stop.mutate(workspace.id);
  const onRestart = () => restart.mutate(workspace.id);

  return (
    <div className="flex items-center gap-2">
      {status === "running" ? (
        <>
          <HintButton
            tooltip={HINTS.restart}
            onClick={onRestart}
            disabled={restart.isPending}
            size={buttonSize}
            variant="ghost"
          >
            <RotateCcw className="size-4" strokeWidth={1.5} />
            Restart
          </HintButton>
          <HintButton
            tooltip={HINTS.stop}
            onClick={onStop}
            disabled={stop.isPending}
            size={buttonSize}
            variant="ghost"
          >
            <CircleStop className="size-4" strokeWidth={1.5} />
            Stop
          </HintButton>
          {onOpen ? onOpen() : null}
        </>
      ) : null}

      {status === "stopped" ? (
        <HintButton
          tooltip={HINTS.start}
          onClick={onStart}
          disabled={start.isPending}
          size={buttonSize}
          variant="default"
        >
          <Play className="size-4" strokeWidth={1.5} />
          Start
        </HintButton>
      ) : null}

      {status === "starting" ? (
        <Button size={buttonSize} variant="default" disabled>
          <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
          {transitionalLabel("Starting")}
        </Button>
      ) : null}

      {status === "stopping" ? (
        <Button size={buttonSize} variant="default" disabled>
          <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
          {transitionalLabel("Stopping")}
        </Button>
      ) : null}

      {status === "error" ? (
        <>
          <HintButton
            tooltip={HINTS.recreate}
            onClick={() => setRecreateOpen(true)}
            size={buttonSize}
            variant="ghost"
          >
            <RotateCcw className="size-4" strokeWidth={1.5} />
            Recreate
          </HintButton>
          <HintButton
            tooltip={HINTS.restart}
            onClick={onRestart}
            disabled={restart.isPending}
            size={buttonSize}
            variant="default"
          >
            <RotateCcw className="size-4" strokeWidth={1.5} />
            Restart
          </HintButton>
        </>
      ) : null}

      {/* Kebab — always right-adjacent to the primary; hidden during transitions */}
      {!isTransitional ? (
        <WorkspaceActionsDropdown
          workspace={workspace}
          redirectAfterDelete={redirectAfterDelete}
          trigger={
            <Button
              size={kebabSize}
              variant="ghost"
              aria-label="More actions"
            >
              <MoreHorizontal className="size-4" strokeWidth={1.5} />
            </Button>
          }
        />
      ) : null}

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
  children: ReactNode;
} & ComponentProps<typeof Button>) {
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
