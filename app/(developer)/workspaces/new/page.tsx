"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateCard } from "@/components/workspace/template-card";
import { useTemplates } from "@/lib/hooks/use-templates";
import { useCreateWorkspace } from "@/lib/hooks/use-workspace-lifecycle";
import { suggestWorkspaceName } from "@/lib/api/workspaces";

export default function NewWorkspacePage() {
  const router = useRouter();
  const { data: templates, isPending } = useTemplates();
  const create = useCreateWorkspace();

  const [templateId, setTemplateId] = useState<string | undefined>();
  const [name, setName] = useState("");

  useEffect(() => {
    if (!templateId && templates && templates.length > 0) {
      const first = templates[0];
      if (first) setTemplateId(first.id);
    }
  }, [templateId, templates]);

  useEffect(() => {
    let cancelled = false;
    suggestWorkspaceName().then((suggested) => {
      if (!cancelled) setName((current) => (current ? current : suggested));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function reshuffleName() {
    try {
      const fresh = await suggestWorkspaceName();
      setName(fresh);
    } catch {
      // Suggestion is cosmetic — silent fallback.
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!templateId || !name) return;
    create.mutate(
      { templateId, name },
      {
        onSuccess: (workspace) => router.push(`/workspaces/${workspace.id}`),
      }
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-6 py-10">
      <Link
        href="/workspaces"
        className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} />
        All workspaces
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-medium text-text-primary">New workspace</h1>
        <p className="text-sm text-text-secondary">
          Pick a template, name it, and we&apos;ll provision a fresh remote VM.
        </p>
      </header>

      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-text-primary">
            Template
          </legend>
          {isPending || !templates ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={templateId === template.id}
                  onSelect={() => setTemplateId(template.id)}
                />
              ))}
            </div>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <Label htmlFor="workspace-name" className="text-sm font-medium">
            Workspace name
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="workspace-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="emerald-panther-54"
              className="font-mono"
              required
              minLength={1}
              maxLength={64}
            />
            <Button type="button" variant="ghost" onClick={reshuffleName}>
              <Shuffle className="size-4" strokeWidth={1.5} />
              Suggest
            </Button>
          </div>
          <p className="text-xs text-text-tertiary">
            We use friendly adjective-animal names. Editable.
          </p>
        </fieldset>

        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="ghost">
            <Link href="/workspaces">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={!templateId || !name || create.isPending}
          >
            {create.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                Creating…
              </>
            ) : (
              "Create workspace"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
