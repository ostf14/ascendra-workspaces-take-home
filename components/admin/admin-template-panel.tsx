"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Copy,
  Cpu,
  HardDrive,
  LayoutTemplate,
  Loader2,
  MemoryStick,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/workspace/status-badge";
import { useFleetInventory } from "@/lib/hooks/use-fleet";
import {
  useCreateTemplate,
  useDeleteTemplate,
  useUpdateTemplate,
} from "@/lib/hooks/use-templates";
import type { TemplateWithUsage } from "@/lib/domain/types";
import { formatCompactRelative, formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export function AdminTemplatePanel({
  template,
}: {
  template: TemplateWithUsage | undefined;
}) {
  if (!template) return <AdminTemplatePanelEmpty />;
  // Keying by template.id resets internal state (mode, form draft, dialogs)
  // whenever the parent switches templates — no need to plumb a reset effect.
  return <AdminTemplatePanelBody key={template.id} template={template} />;
}

function AdminTemplatePanelBody({ template }: { template: TemplateWithUsage }) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  if (mode === "edit") {
    return (
      <TemplateEdit template={template} onDone={() => setMode("view")} />
    );
  }
  return <TemplateView template={template} onEdit={() => setMode("edit")} />;
}

// ---------- view mode ----------

function TemplateView({
  template,
  onEdit,
}: {
  template: TemplateWithUsage;
  onEdit: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const clone = useCreateTemplate();

  async function handleClone() {
    const suffix = " (copy)";
    const nextName = template.name.endsWith(suffix)
      ? template.name
      : `${template.name}${suffix}`;
    try {
      const result = await clone.mutateAsync({
        name: nextName,
        description: template.description,
        baseImage: template.baseImage,
        vcpu: template.vcpu,
        memoryGb: template.memoryGb,
        diskGb: template.diskGb,
        preinstalledTools: [...template.preinstalledTools],
        hourlyCost: template.hourlyCost,
      });
      toast.success(`Duplicated as ${result.name}`);
    } catch {
      /* mutation shows its own error toast */
    }
  }

  return (
    <section
      aria-label={`Template ${template.name}`}
      className="flex flex-col gap-5 rounded-lg border border-border-default bg-surface-elevated p-5"
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h2 className="min-w-0 flex-1 truncate text-lg font-medium leading-tight text-text-primary">
            {template.name}
          </h2>
          <span className="shrink-0 rounded-sm bg-surface-secondary px-1.5 py-0.5 font-mono text-xs text-text-secondary tabular-nums">
            {formatCurrency(template.hourlyCost)}/hr
          </span>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Edit template"
                  data-note="templates-edit"
                  onClick={onEdit}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <Pencil className="size-4" strokeWidth={1.5} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit template</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Duplicate template"
                  onClick={handleClone}
                  disabled={clone.isPending}
                  className="text-text-secondary hover:text-text-primary"
                >
                  {clone.isPending ? (
                    <Loader2
                      className="size-4 animate-spin"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <Copy className="size-4" strokeWidth={1.5} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate template</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Delete template"
                  onClick={() => setDeleteOpen(true)}
                  className="text-status-error hover:bg-status-error/10 hover:text-status-error"
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete template</TooltipContent>
            </Tooltip>
          </div>
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
        templateId={template.id}
        totalCount={template.usage.workspaceCount}
      />

      <DeleteTemplateDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        template={template}
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
  templateId,
  totalCount,
}: {
  templateId: string;
  totalCount: number;
}) {
  const { data: rows, isPending } = useFleetInventory({ templateId });
  const recent = (rows ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
    )
    .slice(0, 5);

  return (
    <section aria-label="Recent workspaces" className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-text-tertiary">
        Recent workspaces {totalCount > 0 ? `(${totalCount})` : ""}
      </h3>
      {isPending ? (
        <div className="flex flex-col gap-1.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <p className="text-xs text-text-tertiary">
          No workspaces are currently provisioned from this template.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {recent.map((w) => (
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

// ---------- edit mode ----------

type EditDraft = {
  description: string;
  baseImage: string;
  vcpu: string;
  memoryGb: string;
  diskGb: string;
  hourlyCost: string;
  preinstalledTools: string[];
};

type FieldErrors = Partial<Record<keyof EditDraft, string>>;

const BASE_IMAGE_RE = /^[a-zA-Z0-9._:@\-/]+$/;
const TOOL_RE = /^[A-Za-z0-9@.\-]+$/;

function makeDraft(t: TemplateWithUsage): EditDraft {
  return {
    description: t.description,
    baseImage: t.baseImage,
    vcpu: String(t.vcpu),
    memoryGb: String(t.memoryGb),
    diskGb: String(t.diskGb),
    hourlyCost: t.hourlyCost.toFixed(2),
    preinstalledTools: [...t.preinstalledTools],
  };
}

function validate(draft: EditDraft): FieldErrors {
  const errors: FieldErrors = {};
  const desc = draft.description.trim();
  if (desc.length < 1) errors.description = "Description is required.";
  else if (desc.length > 200) errors.description = "Max 200 characters.";

  if (!draft.baseImage.trim()) errors.baseImage = "Base image is required.";
  else if (!BASE_IMAGE_RE.test(draft.baseImage.trim()))
    errors.baseImage = "Use letters, digits, . _ - : / @";

  const vcpu = Number(draft.vcpu);
  if (!Number.isInteger(vcpu) || vcpu < 1 || vcpu > 64)
    errors.vcpu = "1 – 64, whole number.";

  const memory = Number(draft.memoryGb);
  if (!Number.isFinite(memory) || memory < 1 || memory > 256)
    errors.memoryGb = "1 – 256 GB.";

  const disk = Number(draft.diskGb);
  if (!Number.isFinite(disk) || disk < 10 || disk > 2000)
    errors.diskGb = "10 – 2000 GB.";

  const cost = Number(draft.hourlyCost);
  if (!Number.isFinite(cost) || cost < 0.01 || cost > 100)
    errors.hourlyCost = "$0.01 – $100 / hr.";

  const tools = draft.preinstalledTools;
  if (tools.length > 20) errors.preinstalledTools = "Max 20 tools.";
  else if (new Set(tools).size !== tools.length)
    errors.preinstalledTools = "Tool names must be unique.";
  else if (tools.some((t) => !TOOL_RE.test(t)))
    errors.preinstalledTools = "Tool names: letters, digits, @ . -";

  return errors;
}

function TemplateEdit({
  template,
  onDone,
}: {
  template: TemplateWithUsage;
  onDone: () => void;
}) {
  const update = useUpdateTemplate(template.id);
  const [draft, setDraft] = useState<EditDraft>(() => makeDraft(template));
  const [toolInput, setToolInput] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function patch<K extends keyof EditDraft>(key: K, value: EditDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function addTool() {
    const t = toolInput.trim();
    if (!t) return;
    if (draft.preinstalledTools.includes(t)) {
      setToolInput("");
      return;
    }
    patch("preinstalledTools", [...draft.preinstalledTools, t]);
    setToolInput("");
  }

  function removeTool(tool: string) {
    patch(
      "preinstalledTools",
      draft.preinstalledTools.filter((t) => t !== tool)
    );
  }

  async function handleSave() {
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    try {
      await update.mutateAsync({
        description: draft.description.trim(),
        baseImage: draft.baseImage.trim(),
        vcpu: Number(draft.vcpu),
        memoryGb: Number(draft.memoryGb),
        diskGb: Number(draft.diskGb),
        hourlyCost: Number(draft.hourlyCost),
        preinstalledTools: draft.preinstalledTools,
      });
      toast.success(`Saved ${template.name}`);
      onDone();
    } catch {
      /* mutation shows its own error toast */
    }
  }

  return (
    <section
      aria-label={`Editing template ${template.name}`}
      className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface-elevated p-5"
    >
      <header className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-tertiary">Editing template</p>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDone}
          disabled={update.isPending}
          className="text-text-tertiary hover:text-text-primary"
        >
          Cancel
        </Button>
      </header>

      <FormField
        id="tpl-description"
        label="Description"
        error={errors.description}
        hint={`${draft.description.length} / 200`}
      >
        <textarea
          id="tpl-description"
          rows={2}
          value={draft.description}
          onChange={(e) => patch("description", e.target.value)}
          className="rounded-md border border-border-default bg-transparent px-3 py-2 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </FormField>

      <FormField
        id="tpl-base-image"
        label="Base image"
        error={errors.baseImage}
      >
        <Input
          id="tpl-base-image"
          value={draft.baseImage}
          onChange={(e) => patch("baseImage", e.target.value)}
          className="font-mono"
        />
      </FormField>

      <div className="grid grid-cols-3 gap-3">
        <FormField id="tpl-vcpu" label="vCPU" error={errors.vcpu}>
          <Input
            id="tpl-vcpu"
            type="number"
            inputMode="numeric"
            min={1}
            max={64}
            value={draft.vcpu}
            onChange={(e) => patch("vcpu", e.target.value)}
            className="font-mono tabular-nums"
          />
        </FormField>
        <FormField id="tpl-memory" label="Memory (GB)" error={errors.memoryGb}>
          <Input
            id="tpl-memory"
            type="number"
            inputMode="numeric"
            min={1}
            max={256}
            value={draft.memoryGb}
            onChange={(e) => patch("memoryGb", e.target.value)}
            className="font-mono tabular-nums"
          />
        </FormField>
        <FormField id="tpl-disk" label="Disk (GB)" error={errors.diskGb}>
          <Input
            id="tpl-disk"
            type="number"
            inputMode="numeric"
            min={10}
            max={2000}
            step={10}
            value={draft.diskGb}
            onChange={(e) => patch("diskGb", e.target.value)}
            className="font-mono tabular-nums"
          />
        </FormField>
      </div>

      <FormField id="tpl-cost" label="Hourly cost" error={errors.hourlyCost}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-tertiary">$</span>
          <Input
            id="tpl-cost"
            type="number"
            inputMode="decimal"
            min={0.01}
            max={100}
            step={0.01}
            value={draft.hourlyCost}
            onChange={(e) => patch("hourlyCost", e.target.value)}
            className="w-32 font-mono tabular-nums"
          />
          <span className="text-sm text-text-tertiary">/ hr</span>
        </div>
      </FormField>

      <FormField
        id="tpl-tools"
        label="Preinstalled tools"
        error={errors.preinstalledTools}
        hint={`${draft.preinstalledTools.length} / 20`}
      >
        <div className="flex items-center gap-2">
          <Input
            id="tpl-tools"
            value={toolInput}
            onChange={(e) => setToolInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTool();
              }
            }}
            placeholder="node@20"
            className="flex-1 font-mono"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addTool}
            disabled={!toolInput.trim()}
          >
            Add
          </Button>
        </div>
        {draft.preinstalledTools.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {draft.preinstalledTools.map((tool) => (
              <li
                key={tool}
                className="inline-flex items-center gap-1 rounded-sm border border-border-subtle bg-surface-secondary px-1.5 py-0.5 font-mono text-[11px] text-text-secondary"
              >
                {tool}
                <button
                  type="button"
                  aria-label={`Remove ${tool}`}
                  onClick={() => removeTool(tool)}
                  className="rounded-sm p-0.5 hover:bg-border-default"
                >
                  <X className="size-3" strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </FormField>

      <footer className="sticky bottom-0 -mx-5 -mb-5 flex items-center justify-end gap-2 border-t border-border-subtle bg-surface-elevated px-5 py-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={onDone}
          disabled={update.isPending}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={update.isPending}
          className="min-w-24"
        >
          {update.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </footer>
    </section>
  );
}

function FormField({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id} className="text-xs text-text-tertiary">
          {label}
        </Label>
        {hint ? (
          <span className="text-[11px] text-text-tertiary">{hint}</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p className="text-xs text-status-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// ---------- delete confirmation ----------

function DeleteTemplateDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  template: TemplateWithUsage;
}) {
  const del = useDeleteTemplate();

  async function handleConfirm() {
    try {
      await del.mutateAsync(template.id);
      toast.success(`Deleted ${template.name}`);
      onOpenChange(false);
    } catch {
      /* mutation shows its own error toast */
    }
  }

  const inUse = template.usage.workspaceCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {inUse ? "Cannot delete template" : `Delete ${template.name}?`}
          </DialogTitle>
          <DialogDescription>
            {inUse
              ? `${template.usage.workspaceCount} workspace${template.usage.workspaceCount === 1 ? " is" : "s are"} still provisioned from this template. Reassign or delete them first.`
              : "This removes the template from the picker. Existing workspaces are unaffected."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {inUse ? "Close" : "Cancel"}
          </Button>
          {inUse ? null : (
            <Button
              onClick={handleConfirm}
              disabled={del.isPending}
              className={cn(
                "bg-status-error/10 text-status-error hover:bg-status-error/20"
              )}
            >
              {del.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                  Deleting…
                </>
              ) : (
                "Delete template"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- empty state ----------

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
