"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateListCard } from "@/components/admin/template-list-card";
import { useTemplates } from "@/lib/hooks/use-templates";

export default function AdminTemplatesPage() {
  const { data, isPending } = useTemplates();

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium text-text-primary">Templates</h1>
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

      {isPending || !data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
      ) : data.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((template) => (
            <TemplateListCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </section>
  );
}
