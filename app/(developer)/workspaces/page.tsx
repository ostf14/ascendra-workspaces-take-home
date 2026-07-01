"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Plus } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { CompactWorkspaceCard } from "@/components/workspace/compact-workspace-card";
import {
  WorkspacePanel,
  WorkspacePanelEmpty,
  WorkspacePanelSkeleton,
} from "@/components/workspace/workspace-panel";
import { WorkspacesEmptyState } from "@/components/workspace/workspaces-empty-state";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";
import type { VM } from "@/lib/domain/types";

export default function WorkspacesPage() {
  const { data, isPending } = useWorkspaces();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaces = data ?? [];

  const paramId = searchParams.get("w");
  const selected = useMemo<VM | undefined>(() => {
    if (!workspaces.length) return undefined;
    const fromParam = paramId
      ? workspaces.find((w) => w.id === paramId)
      : undefined;
    return fromParam ?? workspaces[0];
  }, [workspaces, paramId]);

  const selectWorkspace = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("w", id);
      router.replace(`/workspaces?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  if (!isPending && workspaces.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-10">
        <WorkspacesEmptyState />
      </section>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] gap-6 px-6 py-6">
      <aside
        aria-label="Workspaces"
        className="flex w-[320px] shrink-0 flex-col gap-2"
      >
        <header className="flex items-center justify-between border-b border-border-subtle px-3.5 py-3">
          <span className="text-sm font-medium text-text-primary">
            Workspaces
          </span>
          <Link
            href="/workspaces/new"
            aria-label="New workspace"
            className="inline-flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            <Plus className="size-4" strokeWidth={1.5} />
          </Link>
        </header>
        <div className="flex flex-col gap-1.5">
          {isPending
            ? [0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[88px] w-full rounded-md" />
              ))
            : workspaces.map((workspace) => (
                <CompactWorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  selected={selected?.id === workspace.id}
                  onSelect={selectWorkspace}
                />
              ))}
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {isPending ? (
          <WorkspacePanelSkeleton />
        ) : selected ? (
          <WorkspacePanel workspace={selected} />
        ) : (
          <WorkspacePanelEmpty />
        )}
      </main>
    </div>
  );
}
