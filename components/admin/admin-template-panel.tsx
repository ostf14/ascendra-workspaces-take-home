"use client";

import Link from "next/link";
import { Cpu, HardDrive, LayoutTemplate, MemoryStick, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/workspace/status-badge";
import { useFleetInventory } from "@/lib/hooks/use-fleet";
import type { TemplateWithUsage } from "@/lib/domain/types";
import { formatCompactRelative, formatCurrency } from "@/lib/utils/format";

export function AdminTemplatePanel({
  template,
}: {
  template: TemplateWithUsage | undefined;
}) {
  if (!template) return <AdminTemplatePanelEmpty />;
  return <AdminTemplatePanelBody template={template} />;
}

function AdminTemplatePanelBody({ template }: { template: TemplateWithUsage }) {
  const { data: rows, isPending } = useFleetInventory({ templateId: template.id });
  const workspaces = rows ?? [];
  const recent = [...workspaces]
    .sort(
      (a, b) =>
        new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
    )
    .slice(0, 5);

  return (
    <section
      aria-label={`Template ${template.name}`}
      className="flex flex-col gap-5 rounded-lg border border-border-default bg-surface-elevated p-5"
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 flex-1 truncate text-lg font-medium leading-tight text-text-primary">
            {template.name}
          </h2>
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/templates/${template.id}`}>
              <Pencil className="size-4" strokeWidth={1.5} />
              Edit
            </Link>
          </Button>
        </div>
        <p className="truncate font-mono text-sm text-text-tertiary">
          {template.baseImage}
        </p>
        {template.description ? (
          <p className="text-sm text-text-secondary">{template.description}</p>
        ) : null}
      </header>

      <dl className="grid grid-cols-3 gap-3 rounded-md bg-surface-secondary px-4 py-3">
        <SpecField
          icon={<Cpu className="size-4" strokeWidth={1.5} />}
          label="vCPU"
          value={`${template.vcpu}`}
        />
        <SpecField
          icon={<MemoryStick className="size-4" strokeWidth={1.5} />}
          label="Memory"
          value={`${template.memoryGb} GB`}
        />
        <SpecField
          icon={<HardDrive className="size-4" strokeWidth={1.5} />}
          label="Disk"
          value={`${template.diskGb} GB`}
        />
      </dl>

      {template.preinstalledTools.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-text-tertiary">
            Preinstalled
          </h3>
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
        </section>
      ) : null}

      <dl className="grid grid-cols-2 gap-3 rounded-md bg-surface-secondary px-4 py-3">
        <UsageField
          label="In use"
          value={`${template.usage.workspaceCount}`}
          hint={template.usage.workspaceCount === 1 ? "workspace" : "workspaces"}
        />
        <UsageField
          label="Est. monthly"
          value={formatCurrency(template.usage.monthlyCostContribution, {
            fractionDigits: 0,
          })}
          hint={`${formatCurrency(template.hourlyCost)}/hr`}
        />
      </dl>

      <RecentWorkspaces
        workspaces={recent}
        loading={isPending}
        totalCount={template.usage.workspaceCount}
      />
    </section>
  );
}

function SpecField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="flex items-center gap-1.5 text-xs text-text-tertiary">
        {icon}
        {label}
      </dt>
      <dd className="font-mono text-base font-medium text-text-primary tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function UsageField({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className="font-mono text-base font-medium text-text-primary tabular-nums">
        {value}
      </dd>
      <span className="text-xs text-text-tertiary">{hint}</span>
    </div>
  );
}

function RecentWorkspaces({
  workspaces,
  loading,
  totalCount,
}: {
  workspaces: Array<{
    id: string;
    name: string;
    ownerEmail: string;
    status: import("@/lib/domain/types").VMStatus;
    lastActiveAt: string;
  }>;
  loading: boolean;
  totalCount: number;
}) {
  return (
    <section aria-label="Recent workspaces" className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-text-tertiary">
        Recent workspaces {totalCount > 0 ? `(${totalCount})` : ""}
      </h3>
      {loading ? (
        <div className="flex flex-col gap-1.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <p className="text-xs text-text-tertiary">
          No workspaces are currently provisioned from this template.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {workspaces.map((w) => (
            <li key={w.id}>
              <Link
                href={`/admin/workspaces?w=${w.id}`}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-surface-secondary"
              >
                <span className="min-w-0 flex-1 truncate font-mono text-text-primary">
                  {w.name}
                </span>
                <span className="min-w-0 max-w-[45%] truncate font-mono text-text-tertiary">
                  {w.ownerEmail}
                </span>
                <StatusBadge status={w.status} />
                <span className="font-mono text-text-tertiary tabular-nums">
                  {formatCompactRelative(w.lastActiveAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AdminTemplatePanelEmpty() {
  return (
    <section
      aria-label="No template selected"
      className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-lg border border-border-default bg-surface-elevated p-8 text-center"
    >
      <span className="inline-flex size-10 items-center justify-center rounded-md border border-border-subtle text-text-tertiary">
        <LayoutTemplate className="size-5" strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-text-tertiary">
          Select a template
        </p>
        <p className="text-sm text-text-tertiary">
          Pick one from the list to see specs and the workspaces provisioned
          from it.
        </p>
      </div>
    </section>
  );
}
