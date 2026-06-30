"use client";

import Link from "next/link";
import { use } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { TemplateForm } from "@/components/admin/template-form";
import { useTemplate } from "@/lib/hooks/use-templates";

export default function AdminEditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isPending } = useTemplate(id);

  if (isPending) {
    return (
      <section className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-6 py-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-72 w-full" />
      </section>
    );
  }

  if (!data) {
    return (
      <section className="mx-auto flex w-full max-w-[760px] flex-col gap-3 px-6 py-12">
        <h1 className="text-lg font-medium text-text-primary">Template not found</h1>
        <p className="text-sm text-text-secondary">
          It may have been deleted.{" "}
          <Link className="underline" href="/admin/templates">
            Return to templates
          </Link>
          .
        </p>
      </section>
    );
  }

  return <TemplateForm mode="edit" initial={data} templateId={id} />;
}
