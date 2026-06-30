"use client";

import { useState } from "react";
import { Check, Code2, Globe, Terminal } from "lucide-react";
import { toast } from "sonner";

import type { VM } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

function buildConnectUrls(workspace: VM) {
  const slug = workspace.name;
  const sshUser = "developer";
  return {
    vsCode: `vscode://vscode-remote/ssh-remote+${sshUser}@${slug}.ascendra.app/home/${sshUser}`,
    browser: `https://${slug}.ascendra.app`,
    ssh: `ssh ${sshUser}@${slug}.ascendra.app`,
  };
}

export function ConnectPanel({ workspace }: { workspace: VM }) {
  const [copied, setCopied] = useState(false);
  const isRunning = workspace.status === "running";
  const urls = buildConnectUrls(workspace);

  async function copySsh() {
    try {
      await navigator.clipboard.writeText(urls.ssh);
      setCopied(true);
      toast.success("SSH command copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  return (
    <section
      aria-label="Connect"
      className={cn(
        "rounded-lg border border-border-default bg-surface-elevated p-4",
        "flex flex-col gap-3"
      )}
    >
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-text-primary">Connect</h2>
        <span className="text-xs text-text-tertiary">
          {isRunning ? "Pick the method you prefer." : "Workspace must be running."}
        </span>
      </header>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ConnectButton
          href={isRunning ? urls.vsCode : undefined}
          disabled={!isRunning}
          icon={<Code2 className="size-4" strokeWidth={1.5} />}
          label="VS Code desktop"
          helper={`opens vscode://`}
        />
        <ConnectButton
          href={isRunning ? urls.browser : undefined}
          disabled={!isRunning}
          newTab
          icon={<Globe className="size-4" strokeWidth={1.5} />}
          label="Open in browser"
          helper={isRunning ? `${urls.browser}` : "—"}
        />
        <button
          type="button"
          onClick={isRunning ? copySsh : undefined}
          disabled={!isRunning}
          className={cn(
            "group flex flex-col items-start gap-1 rounded-md border border-border-default px-3 py-2.5 text-left transition-colors",
            isRunning
              ? "hover:border-border-strong hover:bg-surface-secondary"
              : "cursor-not-allowed opacity-60"
          )}
        >
          <span className="flex items-center gap-2 text-sm text-text-primary">
            {copied ? (
              <Check className="size-4 text-status-running" strokeWidth={1.5} />
            ) : (
              <Terminal className="size-4" strokeWidth={1.5} />
            )}
            {copied ? "Copied" : "Copy SSH command"}
          </span>
          <span className="font-mono text-xs text-text-tertiary">
            {isRunning ? urls.ssh : "—"}
          </span>
        </button>
      </div>
    </section>
  );
}

function ConnectButton({
  href,
  newTab = false,
  disabled,
  icon,
  label,
  helper,
}: {
  href?: string;
  newTab?: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  helper: string;
}) {
  const className = cn(
    "flex flex-col items-start gap-1 rounded-md border border-border-default px-3 py-2.5 text-left transition-colors",
    disabled
      ? "cursor-not-allowed opacity-60"
      : "hover:border-border-strong hover:bg-surface-secondary"
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
      className={cn(
        className,
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral"
      )}
    >
      {body}
    </a>
  );
}
