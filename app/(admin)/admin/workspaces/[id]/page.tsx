import { redirect } from "next/navigation";

export default async function AdminWorkspaceDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/workspaces?w=${encodeURIComponent(id)}`);
}
