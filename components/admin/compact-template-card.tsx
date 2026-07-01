"use client";

import { Cpu, HardDrive, MemoryStick } from "lucide-react";

import type { TemplateWithUsage } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function CompactTemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: TemplateWithUsage;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      aria-pressed={selected}
      className={cn(
        "flex w-full flex-col gap-1.5 rounded-md border px-3.5 py-3 text-left transition-colors",
        selected
          ? "bg-[color:color-mix(in_oklab,var(--accent)_5%,transparent)]"
          : "border-border-default hover:bg-surface-secondary"
      )}
      style={selected ? { borderColor: "var(--accent)" } : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-text-primary">
          {template.name}
        </span>
        <span className="font-mono text-xs text-text-tertiary tabular-nums">
          ${template.hourlyCost.toFixed(2)}/hr
        </span>
      </div>
      <p className="truncate font-mono text-xs text-text-tertiary">
        {template.baseImage}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <Cpu className="size-3.5" strokeWidth={1.5} />
          {template.vcpu} vCPU
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MemoryStick className="size-3.5" strokeWidth={1.5} />
          {template.memoryGb} GB
        </span>
        <span className="inline-flex items-center gap-1.5">
          <HardDrive className="size-3.5" strokeWidth={1.5} />
          {template.diskGb} GB
        </span>
        <span className="ml-auto text-text-secondary">
          {template.usage.workspaceCount} in use
        </span>
      </div>
    </button>
  );
}
