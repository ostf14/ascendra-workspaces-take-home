"use client";

import { Cpu, HardDrive, MemoryStick } from "lucide-react";

import type { TemplateWithUsage, VMTemplate } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export function TemplateCard({
  template,
  selected = false,
  onSelect,
  variant = "picker",
}: {
  template: VMTemplate | TemplateWithUsage;
  selected?: boolean;
  onSelect?: () => void;
  variant?: "picker" | "list";
}) {
  const interactive = variant === "picker" && Boolean(onSelect);
  const Wrapper = interactive ? "button" : "div";

  return (
    <Wrapper
      type={interactive ? "button" : undefined}
      onClick={onSelect}
      aria-pressed={interactive ? selected : undefined}
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-accent-coral bg-accent-coral/5"
          : "border-border-default bg-surface-elevated",
        interactive && "hover:border-border-strong",
        interactive && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral"
      )}
    >
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium text-text-primary">{template.name}</h3>
        <span className="font-mono text-xs text-text-tertiary">
          {formatCurrency(template.hourlyCost)}/hr
        </span>
      </header>
      <p className="text-xs text-text-secondary">{template.description}</p>
      <ul className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
        <li className="flex items-center gap-1.5">
          <Cpu className="size-3.5" strokeWidth={1.5} />
          {template.vcpu} vCPU
        </li>
        <li className="flex items-center gap-1.5">
          <MemoryStick className="size-3.5" strokeWidth={1.5} />
          {template.memoryGb} GB
        </li>
        <li className="flex items-center gap-1.5">
          <HardDrive className="size-3.5" strokeWidth={1.5} />
          {template.diskGb} GB
        </li>
      </ul>
      {template.preinstalledTools.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {template.preinstalledTools.map((tool) => (
            <li
              key={tool}
              className="rounded-sm border border-border-subtle bg-surface-secondary px-1.5 py-0.5 font-mono text-[11px] text-text-secondary"
            >
              {tool}
            </li>
          ))}
        </ul>
      ) : null}
    </Wrapper>
  );
}
