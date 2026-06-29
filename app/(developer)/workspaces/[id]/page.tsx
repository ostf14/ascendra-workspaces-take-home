"use client";

import { use } from "react";

import { useWorkspace } from "@/lib/hooks/use-workspaces";

// Phase 3 acceptance wiring: status-aware polling visible in raw JSON. Phase 4
// replaces with the real detail UI from screens/developer.md.
export default function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isPending } = useWorkspace(id);

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
          Hook wiring · phase 3
        </p>
        <h1 className="font-mono text-lg text-text-primary">/workspaces/{id}</h1>
      </header>
      {isPending ? (
        <p className="text-sm text-text-tertiary">Loading…</p>
      ) : (
        <pre className="overflow-auto rounded-md border border-border-default bg-surface-secondary p-4 text-xs text-text-secondary">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </section>
  );
}
