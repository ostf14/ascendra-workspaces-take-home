"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateTemplate,
  useUpdateTemplate,
} from "@/lib/hooks/use-templates";
import type { TemplateWithUsage, VMTemplate } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const BASE_IMAGES = [
  "ubuntu:22.04",
  "ubuntu:24.04",
  "debian:12",
  "fedora:40",
  "nvidia/cuda:12.4-runtime",
];

const VCPU_CHOICES = [2, 4, 8, 16] as const;
const MEMORY_CHOICES = [4, 8, 16, 32] as const;

type FormState = Omit<VMTemplate, "id">;

const EMPTY: FormState = {
  name: "",
  description: "",
  baseImage: BASE_IMAGES[0] ?? "ubuntu:22.04",
  vcpu: 4,
  memoryGb: 8,
  diskGb: 50,
  preinstalledTools: [],
  hourlyCost: 0.14,
};

export function TemplateForm({
  mode,
  initial,
  templateId,
}: {
  mode: "create" | "edit";
  initial?: TemplateWithUsage;
  templateId?: string;
}) {
  const router = useRouter();
  const create = useCreateTemplate();
  const update = useUpdateTemplate(templateId ?? "");

  const [form, setForm] = useState<FormState>(() =>
    initial
      ? {
          name: initial.name,
          description: initial.description,
          baseImage: initial.baseImage,
          vcpu: initial.vcpu,
          memoryGb: initial.memoryGb,
          diskGb: initial.diskGb,
          preinstalledTools: [...initial.preinstalledTools],
          hourlyCost: initial.hourlyCost,
        }
      : EMPTY
  );
  const [toolDraft, setToolDraft] = useState("");

  const isPending = mode === "create" ? create.isPending : update.isPending;

  function addTool() {
    const tool = toolDraft.trim();
    if (!tool || form.preinstalledTools.includes(tool)) {
      setToolDraft("");
      return;
    }
    setForm((f) => ({ ...f, preinstalledTools: [...f.preinstalledTools, tool] }));
    setToolDraft("");
  }

  function removeTool(tool: string) {
    setForm((f) => ({
      ...f,
      preinstalledTools: f.preinstalledTools.filter((t) => t !== tool),
    }));
  }

  function handleToolKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTool();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name || !form.baseImage) return;
    try {
      if (mode === "create") {
        const result = await create.mutateAsync(form);
        toast.success(`Template ${result.name} created`);
      } else {
        await update.mutateAsync(form);
        toast.success(`Template ${form.name} updated`);
      }
      router.push("/admin/templates");
    } catch {
      // Hook already shows a toast on error.
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-6 py-8">
      <Link
        href="/admin/templates"
        className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} />
        All templates
      </Link>
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-medium text-text-primary">
          {mode === "create" ? "New template" : "Edit template"}
        </h1>
        <p className="text-sm text-text-secondary">
          {mode === "create"
            ? "Define a base image, specs, and tools developers can provision from."
            : "Changes apply to future provisioning, not running workspaces."}
        </p>
      </header>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <fieldset className="flex flex-col gap-2">
          <Label htmlFor="template-name">Name</Label>
          <Input
            id="template-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Backend dev"
            required
            maxLength={64}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <Label htmlFor="template-description">Description</Label>
          <textarea
            id="template-description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="rounded-md border border-border-default bg-transparent px-3 py-2 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-coral"
            placeholder="One sentence developers see in the picker."
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <Label>Base image</Label>
          <Select
            value={form.baseImage}
            onValueChange={(next) => setForm((f) => ({ ...f, baseImage: next }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pick an image" />
            </SelectTrigger>
            <SelectContent>
              {BASE_IMAGES.map((image) => (
                <SelectItem key={image} value={image}>
                  {image}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <RadioPills
            label="vCPU"
            value={form.vcpu}
            choices={VCPU_CHOICES}
            onChange={(next) => setForm((f) => ({ ...f, vcpu: next }))}
            suffix=""
          />
          <RadioPills
            label="Memory"
            value={form.memoryGb}
            choices={MEMORY_CHOICES}
            onChange={(next) => setForm((f) => ({ ...f, memoryGb: next }))}
            suffix=" GB"
          />
          <fieldset className="flex flex-col gap-2">
            <Label htmlFor="template-disk">Disk (GB)</Label>
            <Input
              id="template-disk"
              type="number"
              min={10}
              max={2000}
              step={10}
              value={form.diskGb}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  diskGb: Math.max(10, Number(e.target.value || 0)),
                }))
              }
            />
          </fieldset>
        </div>

        <fieldset className="flex flex-col gap-2">
          <Label htmlFor="template-cost">Hourly cost</Label>
          <Input
            id="template-cost"
            type="number"
            min={0}
            step={0.01}
            value={form.hourlyCost}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                hourlyCost: Math.max(0, Number(e.target.value || 0)),
              }))
            }
            className="w-32"
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <Label htmlFor="template-tools">Preinstalled tools</Label>
          <div className="flex items-center gap-2">
            <Input
              id="template-tools"
              value={toolDraft}
              onChange={(e) => setToolDraft(e.target.value)}
              onKeyDown={handleToolKey}
              placeholder="node@20"
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addTool}>
              Add
            </Button>
          </div>
          {form.preinstalledTools.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {form.preinstalledTools.map((tool) => (
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
          ) : (
            <p className="text-xs text-text-tertiary">Press enter or comma to add.</p>
          )}
        </fieldset>

        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="ghost">
            <Link href="/admin/templates">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending || !form.name}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                Saving…
              </>
            ) : mode === "create" ? (
              "Create template"
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}

function RadioPills<T extends number>({
  label,
  value,
  choices,
  onChange,
  suffix,
}: {
  label: string;
  value: T;
  choices: readonly T[];
  onChange: (next: T) => void;
  suffix: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div
        role="radiogroup"
        aria-label={label}
        className="inline-flex flex-wrap items-center gap-1 rounded-md border border-border-default p-0.5"
      >
        {choices.map((choice) => {
          const isActive = choice === value;
          return (
            <button
              key={choice}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(choice)}
              className={cn(
                "rounded-sm px-2.5 py-1 font-mono text-xs tabular-nums transition-colors",
                isActive
                  ? "bg-surface-secondary text-text-primary"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              {choice}
              {suffix}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
