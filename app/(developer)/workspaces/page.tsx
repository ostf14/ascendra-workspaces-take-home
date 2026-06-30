"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspaceCard } from "@/components/workspace/workspace-card";
import { WorkspacesEmptyState } from "@/components/workspace/workspaces-empty-state";
import { WorkspacesListSkeleton } from "@/components/workspace/workspaces-list-skeleton";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";

export default function WorkspacesPage() {
  const { data, isPending } = useWorkspaces();
  const workspaces = data ?? [];

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-medium text-text-primary">Workspaces</h1>
          <p className="text-sm text-text-secondary">
            Your remote development environments.
          </p>
        </div>
        <Button asChild>
          <Link href="/workspaces/new">
            <Plus className="size-4" strokeWidth={1.5} />
            New workspace
          </Link>
        </Button>
      </header>

      {isPending ? (
        <WorkspacesListSkeleton />
      ) : workspaces.length === 0 ? (
        <WorkspacesEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      )}
    </section>
  );
}
