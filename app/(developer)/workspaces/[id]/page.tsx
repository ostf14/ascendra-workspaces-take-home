import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RoutePlaceholder
      path={`/workspaces/${id}`}
      hint="Workspace detail — connect panel, metrics, lifecycle controls. Built in phase 4."
    />
  );
}
