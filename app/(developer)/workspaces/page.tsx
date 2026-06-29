"use client";

import { useWorkspaces } from "@/lib/hooks/use-workspaces";

// Phase 3 acceptance wiring: hooks render raw JSON. Phase 4 replaces with the
// real list UI from screens/developer.md.
export default function WorkspacesPage() {
  const { data, isPending, isError } = useWorkspaces();

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
          Hook wiring · phase 3
        </p>
        <h1 className="font-mono text-lg text-text-primary">/workspaces</h1>
        <p className="text-sm text-text-secondary">
          Raw data from <code className="font-mono">useWorkspaces()</code> while the
          UI is being built.
        </p>
      </header>
      {isPending ? (
        <p className="text-sm text-text-tertiary">Loading…</p>
      ) : isError ? (
        <p className="text-sm text-status-error">Failed to load workspaces.</p>
      ) : (
        <pre className="overflow-auto rounded-md border border-border-default bg-surface-secondary p-4 text-xs text-text-secondary">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </section>
  );
}
