"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplateCard } from "@/components/workspace/template-card";
import { useTemplates } from "@/lib/hooks/use-templates";
import { useUsers } from "@/lib/hooks/use-users";
import { useAdminProvisionWorkspace } from "@/lib/hooks/use-admin-provision";
import { suggestWorkspaceName } from "@/lib/api/workspaces";

export default function AdminProvisionWorkspacePage() {
  const router = useRouter();
  const { data: templates, isPending: templatesLoading } = useTemplates();
  const { data: users, isPending: usersLoading } = useUsers();
  const provision = useAdminProvisionWorkspace();

  const [templateId, setTemplateId] = useState<string | undefined>();
  const [ownerId, setOwnerId] = useState<string | undefined>();
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
      // Cosmetic.
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!templateId || !ownerId || !name) return;
    provision.mutate(
      { templateId, ownerId, name },
      {
        onSuccess: (vm) => router.push(`/admin/workspaces/${vm.id}`),
      }
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-6 py-8">
      <Link
        href="/admin/workspaces"
        className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} />
        Fleet inventory
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-medium text-text-primary">
          Provision workspace
        </h1>
        <p className="text-sm text-text-secondary">
          Pre-create a workspace for a teammate. They&apos;ll see it on next login.
        </p>
      </header>

      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <fieldset className="flex flex-col gap-2">
          <Label>Owner</Label>
          {usersLoading || !users ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={ownerId ?? ""}
              onValueChange={(next) => setOwnerId(next || undefined)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick a user" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <span className="flex flex-col items-start gap-0.5">
                        <span>{user.name}</span>
                        <span className="font-mono text-[11px] text-text-tertiary">
                          {user.email}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-text-primary">
            Template
          </legend>
          {templatesLoading || !templates ? (
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
              onChange={(e) => setName(e.target.value)}
              placeholder="emerald-panther-54"
              required
              maxLength={64}
              className="font-mono"
            />
            <Button type="button" variant="ghost" onClick={reshuffleName}>
              <Shuffle className="size-4" strokeWidth={1.5} />
              Suggest
            </Button>
          </div>
        </fieldset>

        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="ghost">
            <Link href="/admin/workspaces">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={
              !ownerId || !templateId || !name || provision.isPending
            }
          >
            {provision.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                Provisioning…
              </>
            ) : (
              "Provision workspace"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
