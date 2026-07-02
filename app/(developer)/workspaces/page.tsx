"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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

function readParamFromLocation(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("w") ?? undefined;
}

export default function WorkspacesPage() {
  const { data, isPending } = useWorkspaces();
  const searchParams = useSearchParams();
  const workspaces = data ?? [];

  // Selection lives in React state. The URL is a mirror, not the source of
  // truth — see notes below. Initial value comes from the ?w= param the page
  // was loaded with; after that, state drives the URL, not the other way
  // around (except for popstate — see effect below).
  const [selectedId, setSelectedId] = useState<string | undefined>(
    () => searchParams.get("w") ?? undefined
  );

  const selected = useMemo<VM | undefined>(() => {
    if (!workspaces.length) return undefined;
    const fromId = selectedId
      ? workspaces.find((w) => w.id === selectedId)
      : undefined;
    return fromId ?? workspaces[0];
  }, [workspaces, selectedId]);

  const selectWorkspace = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  // Mirror selection into the URL for bookmarking / sharing. Uses the History
  // API directly instead of Next.js's router: router.replace() coalesces
  // synchronous calls under rapid-fire clicks and can drop them entirely.
  // replaceState is synchronous, cannot be coalesced, and does NOT trigger
  // a Next.js route transition — which is what we want, since selection is
  // already reflected in local state.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = selectedId ? `/workspaces?w=${selectedId}` : "/workspaces";
    if (window.location.pathname + window.location.search === target) return;
    window.history.replaceState({}, "", target);
  }, [selectedId]);

  // Two-way sync: react to the URL changing from outside — browser back /
  // forward, or a paste-in-tab. popstate fires on those transitions; we
  // re-read the param and update state to match. Our own replaceState calls
  // do NOT fire popstate, so this loop can't feed itself.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPopState = () => {
      setSelectedId(readParamFromLocation());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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
        data-note="master-detail-dev"
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
