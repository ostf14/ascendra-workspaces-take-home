"use client";

import { Mail } from "lucide-react";

import { useUsers } from "@/lib/hooks/use-users";

export function OwnerInfoCard({ ownerId }: { ownerId: string }) {
  const { data } = useUsers();
  const owner = data?.find((u) => u.id === ownerId);

  return (
    <section
      aria-label="Workspace owner"
      className="rounded-lg border border-border-default bg-surface-elevated"
    >
      <header className="border-b border-border-subtle px-5 py-3.5">
        <h2 className="text-sm font-medium text-text-primary">Owner</h2>
      </header>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm text-text-primary">{owner?.name ?? "—"}</p>
          <p className="font-mono text-xs text-text-tertiary">
            {owner?.email ?? "—"}
          </p>
          {owner ? (
            <p className="text-xs text-text-tertiary">
              {owner.role === "admin" ? "Admin" : "Engineer"}
            </p>
          ) : null}
        </div>
        {owner ? (
          <a
            href={`mailto:${owner.email}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            <Mail className="size-3.5" strokeWidth={1.5} />
            Email
          </a>
        ) : null}
      </div>
    </section>
  );
}
