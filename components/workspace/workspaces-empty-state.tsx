import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function WorkspacesEmptyState() {
  return (
    <section className="flex flex-col items-start gap-5 rounded-lg border border-border-default bg-surface-elevated p-8">
      <span className="inline-flex size-9 items-center justify-center rounded-md border border-border-default bg-surface-secondary text-accent-coral">
        <Sparkles className="size-4" strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-md font-medium text-text-primary">
          No workspaces yet
        </h2>
        <p className="max-w-prose text-sm text-text-secondary">
          Create one from a template to get a remote development environment
          provisioned in a minute or two.
        </p>
      </div>
      <Button asChild>
        <Link href="/workspaces/new">
          <Plus className="size-4" strokeWidth={1.5} />
          New workspace
        </Link>
      </Button>
    </section>
  );
}
