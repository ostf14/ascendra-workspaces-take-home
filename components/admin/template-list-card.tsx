"use client";

import Link from "next/link";
import { Cpu, HardDrive, MemoryStick, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TemplateWithUsage } from "@/lib/domain/types";

function formatMonthly(value: number): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function TemplateListCard({ template }: { template: TemplateWithUsage }) {
  const editHref = `/admin/templates/${template.id}`;
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface-elevated p-5">
      <header className="flex items-baseline justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium text-text-primary">{template.name}</h3>
          <p className="font-mono text-xs text-text-tertiary">
            {template.baseImage}
          </p>
        </div>
        <span className="font-mono text-xs text-text-tertiary">
          ${template.hourlyCost.toFixed(2)}/hr
        </span>
      </header>
      <p className="text-sm text-text-secondary">{template.description}</p>
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
      <footer className="mt-auto flex items-end justify-between gap-3 border-t border-border-subtle pt-3">
        <dl className="flex flex-col gap-0.5">
          <dt className="text-[11px] uppercase tracking-wide text-text-tertiary">
            In use
          </dt>
          <dd className="font-mono text-sm tabular-nums text-text-primary">
            {template.usage.workspaceCount} workspace
            {template.usage.workspaceCount === 1 ? "" : "s"}
          </dd>
          <dd className="text-xs text-text-tertiary">
            ~{formatMonthly(template.usage.monthlyCostContribution)} / month
          </dd>
        </dl>
        <Button asChild size="sm" variant="ghost">
          <Link href={editHref}>
            <Pencil className="size-3.5" strokeWidth={1.5} />
            Edit
          </Link>
        </Button>
      </footer>
    </article>
  );
}
