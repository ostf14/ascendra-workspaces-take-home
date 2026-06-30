"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { AdminActionsPanel } from "@/components/admin/admin-actions-panel";
import { OwnerInfoCard } from "@/components/admin/owner-info-card";
import { ConnectPanel } from "@/components/workspace/connect-panel";
import { LifecycleControls } from "@/components/workspace/lifecycle-controls";
import { StartingProgress } from "@/components/workspace/starting-progress";
import { StatusBadge } from "@/components/workspace/status-badge";
import { WorkspaceIdleHint } from "@/components/workspace/workspace-idle-hint";
import { WorkspaceLogs } from "@/components/workspace/workspace-logs";
import { WorkspaceMetadata } from "@/components/workspace/workspace-metadata";
import { WorkspaceMetricsChart } from "@/components/workspace/workspace-metrics-chart";
import { useWorkspace } from "@/lib/hooks/use-workspaces";

export default function AdminWorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isPending } = useWorkspace(id);

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-6 py-8">
      <Link
        href="/admin/workspaces"
        className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} />
        Fleet inventory
      </Link>

      {isPending || !data ? (
        <DetailSkeleton />
      ) : (
        <>
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
                Admin view
              </p>
              <h1 className="font-mono text-lg text-text-primary">{data.name}</h1>
              <div className="flex items-center gap-3">
                <StatusBadge status={data.status} />
                <span className="text-xs text-text-tertiary">
                  {data.templateName}
                </span>
              </div>
            </div>
            <LifecycleControls workspace={data} redirectAfterDelete />
          </header>

          <WorkspaceIdleHint workspace={data} />
          <StartingProgress workspace={data} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-4">
              <ConnectPanel workspace={data} />
              <WorkspaceMetricsChart id={data.id} />
              <WorkspaceMetadata workspace={data} />
              <WorkspaceLogs workspace={data} defaultOpen />
            </div>
            <div className="flex flex-col gap-4">
              <OwnerInfoCard ownerId={data.ownerId} />
              <AdminActionsPanel workspace={data} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
