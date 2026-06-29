import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default async function AdminWorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RoutePlaceholder
      path={`/admin/workspaces/${id}`}
      hint="Admin VM detail — extends developer detail with owner info, full logs, admin actions. Built in phase 6."
    />
  );
}
