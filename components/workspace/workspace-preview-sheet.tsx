"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  CircleStop,
  Code2,
  Globe,
  Loader2,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/workspace/status-badge";
import { UsageMetric } from "@/components/workspace/usage-metric";
import {
  useRestartWorkspace,
  useStopWorkspace,
} from "@/lib/hooks/use-workspace-lifecycle";
import type { VM } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const HINTS = {
  stop: "Files and settings preserved. Resume from where you left off.",
  restart: "Files preserved. Running processes will stop.",
} as const;

function buildConnectUrls(workspace: VM) {
  const slug = workspace.name;
  const sshUser = "developer";
  return {
    vsCode: `vscode://vscode-remote/ssh-remote+${sshUser}@${slug}.ascendra.app/home/${sshUser}`,
    browser: `https://${slug}.ascendra.app`,
    ssh: `ssh ${sshUser}@${slug}.ascendra.app`,
  };
}

export function WorkspacePreviewSheet({
  workspace,
  open,
  onOpenChange,
}: {
  workspace: VM;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const urls = buildConnectUrls(workspace);
  const isRunning = workspace.status === "running";
  const [copied, setCopied] = useState(false);
  const stop = useStopWorkspace();
  const restart = useRestartWorkspace();

  async function copySsh() {
    try {
      await navigator.clipboard.writeText(urls.ssh);
      setCopied(true);
      toast.success("SSH command copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-[420px] flex-col gap-0 p-0 sm:max-w-[420px]"
      >
        <SheetHeader className="border-b border-border-subtle px-5 py-4">
          <SheetTitle className="font-mono text-base font-medium text-text-primary">
            {workspace.name}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Preview and connect to {workspace.name}.
          </SheetDescription>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
            <StatusBadge status={workspace.status} />
            <span>{workspace.templateName}</span>
            <span aria-hidden>·</span>
            <span className="font-mono">{workspace.region}</span>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
          <section aria-label="Connect" className="flex flex-col gap-2">
            <header className="flex items-baseline justify-between gap-2">
              <h3 className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
                Connect
              </h3>
              <span className="text-xs text-text-tertiary">
                {isRunning ? "Pick the method you prefer." : "Workspace must be running."}
              </span>
            </header>
            <ConnectRow
              icon={<Code2 className="size-4" strokeWidth={1.5} />}
              label="VS Code desktop"
              helper="opens vscode://"
              href={isRunning ? urls.vsCode : undefined}
              disabled={!isRunning}
            />
            <ConnectRow
              icon={<Globe className="size-4" strokeWidth={1.5} />}
              label="Open in browser"
              helper={isRunning ? urls.browser : "—"}
              href={isRunning ? urls.browser : undefined}
              disabled={!isRunning}
              newTab
            />
            <button
              type="button"
              onClick={isRunning ? copySsh : undefined}
              disabled={!isRunning}
              className={cn(
                "flex flex-col items-start gap-1 rounded-md border border-border-default px-3 py-2.5 text-left transition-colors",
                isRunning
                  ? "hover:border-border-strong hover:bg-surface-secondary"
                  : "cursor-not-allowed opacity-60"
              )}
            >
              <span className="flex items-center gap-2 text-sm text-text-primary">
                {copied ? (
                  <Check
                    className="size-4"
                    strokeWidth={1.5}
                    style={{ color: "var(--status-running)" }}
                  />
                ) : (
                  <Terminal className="size-4" strokeWidth={1.5} />
                )}
                {copied ? "Copied" : "Copy SSH command"}
              </span>
              <span className="font-mono text-xs text-text-tertiary">
                {isRunning ? urls.ssh : "—"}
              </span>
            </button>
          </section>

          <section aria-label="Current usage" className="flex flex-col gap-2">
            <h3 className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
              Current usage
            </h3>
            <div className="grid grid-cols-3 gap-3 rounded-md border border-border-default p-3">
              <UsageMetric label="CPU" value={workspace.cpu} compact />
              <UsageMetric label="Memory" value={workspace.memory} compact />
              <UsageMetric label="Disk" value={workspace.disk} compact />
            </div>
          </section>

          <section aria-label="Quick actions" className="flex flex-col gap-2">
            <h3 className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
              Quick actions
            </h3>
            <div className="flex items-center gap-2">
              <QuickActionButton
                tooltip={HINTS.stop}
                onClick={() => stop.mutate(workspace.id)}
                disabled={!isRunning || stop.isPending}
              >
                <CircleStop className="size-4" strokeWidth={1.5} />
                Stop
              </QuickActionButton>
              <QuickActionButton
                tooltip={HINTS.restart}
                onClick={() => restart.mutate(workspace.id)}
                disabled={
                  workspace.status === "stopped" ||
                  workspace.status === "starting" ||
                  workspace.status === "stopping" ||
                  restart.isPending
                }
              >
                {restart.isPending ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  <RotateCcw className="size-4" strokeWidth={1.5} />
                )}
                Restart
              </QuickActionButton>
            </div>
          </section>
        </div>

        <footer className="border-t border-border-subtle px-5 py-3">
          <Link
            href={`/workspaces/${workspace.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-text-primary hover:text-accent-coral"
            onClick={() => onOpenChange(false)}
          >
            Open full workspace detail
            <ArrowRight className="size-3.5" strokeWidth={1.5} />
          </Link>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

function ConnectRow({
  icon,
  label,
  helper,
  href,
  newTab,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  helper: string;
  href?: string;
  newTab?: boolean;
  disabled: boolean;
}) {
  const className = cn(
    "flex flex-col items-start gap-1 rounded-md border border-border-default px-3 py-2.5 text-left transition-colors",
    disabled
      ? "cursor-not-allowed opacity-60"
      : "hover:border-border-strong hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral"
  );
  const body = (
    <>
      <span className="flex items-center gap-2 text-sm text-text-primary">
        {icon}
        {label}
      </span>
      <span className="font-mono text-xs text-text-tertiary">{helper}</span>
    </>
  );

  if (disabled || !href) {
    return (
      <button type="button" disabled aria-disabled className={className}>
        {body}
      </button>
    );
  }
  return (
    <a
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      className={className}
    >
      {body}
    </a>
  );
}

function QuickActionButton({
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
        <Button size="sm" variant="ghost" {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[240px]">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
