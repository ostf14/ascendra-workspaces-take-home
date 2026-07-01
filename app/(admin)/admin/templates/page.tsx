"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminTemplatePanel } from "@/components/admin/admin-template-panel";
import { CompactTemplateCard } from "@/components/admin/compact-template-card";
import { useTemplates } from "@/lib/hooks/use-templates";
import type { TemplateWithUsage } from "@/lib/domain/types";

function readSelectedFromLocation(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("t") ?? undefined;
}

export default function AdminTemplatesPage() {
  const { data, isPending } = useTemplates();
  const searchParams = useSearchParams();
  const templates = data ?? [];

  // Same state-as-truth + history.replaceState mirror as the workspaces
  // page — rapid card clicks would otherwise fight the Next.js router.
  const [selectedId, setSelectedId] = useState<string | undefined>(
    () => searchParams.get("t") ?? undefined
  );

  const selected = useMemo<TemplateWithUsage | undefined>(() => {
    if (!templates.length) return undefined;
    const fromId = selectedId
      ? templates.find((t) => t.id === selectedId)
      : undefined;
    return fromId ?? templates[0];
  }, [templates, selectedId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = selected
      ? `/admin/templates?t=${selected.id}`
      : "/admin/templates";
    if (window.location.pathname + window.location.search === target) return;
    window.history.replaceState({}, "", target);
  }, [selected]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPopState = () => setSelectedId(readSelectedFromLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const onSelect = useCallback((id: string) => setSelectedId(id), []);

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-medium leading-tight text-text-primary">Templates</h1>
          <p className="text-sm text-text-secondary">
            Base images and specs developers can provision from.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/templates/new">
            <Plus className="size-4" strokeWidth={1.5} />
            New template
          </Link>
        </Button>
      </header>

      {isPending ? (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(380px,1fr)]">
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-md" />
            ))}
          </div>
          <Skeleton className="h-[420px] w-full rounded-lg" />
        </div>
      ) : templates.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(380px,1fr)]">
          <div className="flex flex-col gap-2">
            {templates.map((template) => (
              <CompactTemplateCard
                key={template.id}
                template={template}
                selected={selected?.id === template.id}
                onSelect={onSelect}
              />
            ))}
          </div>
          <div className="sticky top-[112px] max-h-[calc(100vh-136px)] overflow-x-hidden overflow-y-auto">
            <AdminTemplatePanel template={selected} />
          </div>
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <section className="flex flex-col items-start gap-4 rounded-lg border border-border-default bg-surface-elevated p-8">
      <h2 className="text-md font-medium text-text-primary">No templates yet.</h2>
      <p className="text-sm text-text-secondary">
        Create the first one to let developers provision from a known base image.
      </p>
      <Button asChild>
        <Link href="/admin/templates/new">
          <Plus className="size-4" strokeWidth={1.5} />
          New template
        </Link>
      </Button>
    </section>
  );
}
