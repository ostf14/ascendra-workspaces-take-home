import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default async function AdminEditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RoutePlaceholder
      path={`/admin/templates/${id}`}
      hint="Edit template — same fields as create, prefilled. Built in phase 6."
    />
  );
}
