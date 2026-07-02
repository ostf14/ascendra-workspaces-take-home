"use client";

import { useState } from "react";
import { Check, Code2, Copy, Globe, SquareArrowOutUpRight, Terminal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { VM } from "@/lib/domain/types";

function buildConnectUrls(workspace: VM) {
  const slug = workspace.name;
  const sshUser = "developer";
  return {
    vsCode: `vscode://vscode-remote/ssh-remote+${sshUser}@${slug}.ascendra.app/home/${sshUser}`,
    browser: `https://${slug}.ascendra.app`,
    ssh: `ssh ${sshUser}@${slug}.ascendra.app`,
  };
}

export function ConnectPopover({ workspace }: { workspace: VM }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-haspopup="dialog"
          aria-label={`Open ${workspace.name}`}
          data-note="connect-methods"
        >
          <SquareArrowOutUpRight className="size-4" strokeWidth={1.5} />
          Open
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 gap-1.5 p-2">
        <ConnectRow
          href={urls.vsCode}
          onSelect={() => setOpen(false)}
          icon={<Code2 className="size-4" strokeWidth={1.5} />}
          label="VS Code desktop"
          hint="Launches vscode://"
        />
        <ConnectRow
          href={urls.browser}
          newTab
          onSelect={() => setOpen(false)}
          icon={<Globe className="size-4" strokeWidth={1.5} />}
          label="Open in browser"
          hint={urls.browser}
        />
        <button
          type="button"
          onClick={() => {
            void copySsh();
          }}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-primary transition-colors hover:bg-surface-secondary"
        >
          {copied ? (
            <Check
              className="size-4 shrink-0"
              strokeWidth={1.5}
              style={{ color: "var(--status-running)" }}
            />
          ) : (
            <Terminal className="size-4 shrink-0" strokeWidth={1.5} />
          )}
          <div className="flex min-w-0 flex-col">
            <span>{copied ? "Copied" : "Copy SSH command"}</span>
            <span className="truncate font-mono text-xs text-text-tertiary">
              {urls.ssh}
            </span>
          </div>
          <Copy
            className="ml-auto size-3.5 shrink-0 text-text-tertiary"
            strokeWidth={1.5}
          />
        </button>
      </PopoverContent>
    </Popover>
  );
}

function ConnectRow({
  href,
  newTab = false,
  onSelect,
  icon,
  label,
  hint,
}: {
  href: string;
  newTab?: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <a
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      onClick={onSelect}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-primary transition-colors hover:bg-surface-secondary"
    >
      <span className="shrink-0">{icon}</span>
      <div className="flex min-w-0 flex-col">
        <span>{label}</span>
        <span className="truncate font-mono text-xs text-text-tertiary">
          {hint}
        </span>
      </div>
    </a>
  );
}
