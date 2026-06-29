import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function AdminProvisionWorkspacePage() {
  return (
    <RoutePlaceholder
      path="/admin/workspaces/new"
      hint="Admin provisioning — pick user, pick template, name, confirm. Built in phase 6."
    />
  );
}
