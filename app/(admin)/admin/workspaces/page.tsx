"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminVMTable } from "@/components/admin/admin-vm-table";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { FleetFilters, type FleetFiltersValue } from "@/components/admin/fleet-filters";
import { DeleteWorkspaceDialog } from "@/components/workspace/delete-workspace-dialog";
import { useFleetInventory } from "@/lib/hooks/use-fleet";
import { useTemplates } from "@/lib/hooks/use-templates";
import { useUsers } from "@/lib/hooks/use-users";
import {
  useRestartWorkspace,
  useStartWorkspace,
  useStopWorkspace,
} from "@/lib/hooks/use-workspace-lifecycle";
import type {
  FleetInventoryItem,
  FleetSortKey,
  SortOrder,
  VMStatus,
} from "@/lib/domain/types";
import { vmStatusSchema } from "@/lib/domain/schemas";

const DEFAULT_SORT: FleetSortKey = "status";
const DEFAULT_ORDER: SortOrder = "desc";

function readFiltersFromUrl(params: URLSearchParams): {
  filters: FleetFiltersValue;
  sort: FleetSortKey;
  order: SortOrder;
} {
  const statusRaw = params.get("status");
  const statusParsed = statusRaw ? vmStatusSchema.safeParse(statusRaw) : undefined;
  const filters: FleetFiltersValue = {
    search: params.get("search") ?? "",
    status: statusParsed?.success ? statusParsed.data : "",
    templateId: params.get("template") ?? "",
    ownerId: params.get("owner") ?? "",
    idleOnly: params.get("idleOnly") === "true",
  };
  const sortRaw = params.get("sort");
  const orderRaw = params.get("order");
  const sort: FleetSortKey =
    sortRaw && isFleetSortKey(sortRaw) ? sortRaw : DEFAULT_SORT;
  const order: SortOrder = orderRaw === "asc" || orderRaw === "desc" ? orderRaw : DEFAULT_ORDER;
  return { filters, sort, order };
}

function isFleetSortKey(value: string): value is FleetSortKey {
  return [
    "name",
    "owner",
    "template",
    "status",
    "cpu",
    "memory",
    "disk",
    "lastActiveAt",
    "hourlyCost",
  ].includes(value);
}

function writeFiltersToUrl(
  filters: FleetFiltersValue,
  sort: FleetSortKey,
  order: SortOrder
): string {
  const next = new URLSearchParams();
  if (filters.search) next.set("search", filters.search);
  if (filters.status) next.set("status", filters.status);
  if (filters.templateId) next.set("template", filters.templateId);
  if (filters.ownerId) next.set("owner", filters.ownerId);
  if (filters.idleOnly) next.set("idleOnly", "true");
  if (sort !== DEFAULT_SORT) next.set("sort", sort);
  if (order !== DEFAULT_ORDER) next.set("order", order);
  const qs = next.toString();
  return qs ? `?${qs}` : "";
}

export default function AdminWorkspacesPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { filters, sort, order } = useMemo(
    () => readFiltersFromUrl(new URLSearchParams(params.toString())),
    [params]
  );

  const inventoryQuery = useFleetInventory({
    search: filters.search || undefined,
    status: filters.status || undefined,
    templateId: filters.templateId || undefined,
    ownerId: filters.ownerId || undefined,
    idleOnly: filters.idleOnly || undefined,
  });

  const templatesQuery = useTemplates();
  const usersQuery = useUsers();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<FleetInventoryItem | null>(null);
  const start = useStartWorkspace();
  const stop = useStopWorkspace();
  const restart = useRestartWorkspace();

  const rows = inventoryQuery.data ?? [];

  const updateUrl = useCallback(
    (nextFilters: FleetFiltersValue, nextSort: FleetSortKey, nextOrder: SortOrder) => {
      const search = writeFiltersToUrl(nextFilters, nextSort, nextOrder);
      router.replace(`/admin/workspaces${search}`);
      setSelected(new Set());
    },
    [router]
  );

  const onChangeFilters = (next: FleetFiltersValue) => updateUrl(next, sort, order);

  const onResetFilters = () =>
    updateUrl(
      { search: "", status: "", templateId: "", ownerId: "", idleOnly: false },
      DEFAULT_SORT,
      DEFAULT_ORDER
    );

  const onSortChange = (key: FleetSortKey) => {
    const nextOrder: SortOrder =
      sort === key ? (order === "asc" ? "desc" : "asc") : "desc";
    updateUrl(filters, key, nextOrder);
  };

  const onToggleRow = (id: string, next: boolean) => {
    setSelected((prev) => {
      const draft = new Set(prev);
      if (next) draft.add(id);
      else draft.delete(id);
      return draft;
    });
  };

  const onToggleAll = (next: boolean) => {
    setSelected(next ? new Set(rows.map((r) => r.id)) : new Set());
  };

  const onRowAction = (
    action: "start" | "stop" | "restart" | "delete",
    id: string
  ) => {
    if (action === "delete") {
      const target = rows.find((r) => r.id === id);
      if (target) setDeleteTarget(target);
      return;
    }
    if (action === "start") start.mutate(id);
    if (action === "stop") stop.mutate(id);
    if (action === "restart") restart.mutate(id);
  };

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium text-text-primary">Workspaces</h1>
          <p className="text-sm text-text-secondary">
            Every VM in the org. Filter, sort, and take action.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/workspaces/new">
            <Plus className="size-4" strokeWidth={1.5} />
            New workspace
          </Link>
        </Button>
      </header>

      <FleetFilters
        value={filters}
        onChange={onChangeFilters}
        onReset={onResetFilters}
        templates={templatesQuery.data}
        users={usersQuery.data}
      />

      <BulkActionBar
        selectedIds={Array.from(selected)}
        onClear={() => setSelected(new Set())}
      />

      {inventoryQuery.isPending ? (
        <Skeleton className="h-[480px] w-full" />
      ) : rows.length === 0 ? (
        <EmptyState onReset={onResetFilters} />
      ) : (
        <>
          <p className="text-xs text-text-tertiary">
            {rows.length} workspace{rows.length === 1 ? "" : "s"}
          </p>
          <AdminVMTable
            rows={rows}
            selected={selected}
            onToggleRow={onToggleRow}
            onToggleAll={onToggleAll}
            sort={sort}
            order={order}
            onSortChange={onSortChange}
            onAction={onRowAction}
          />
        </>
      )}

      {deleteTarget ? (
        <DeleteWorkspaceDialog
          workspace={deleteTargetAsVm(deleteTarget)}
          open
          onOpenChange={(next) => !next && setDeleteTarget(null)}
        />
      ) : null}
    </section>
  );
}

function deleteTargetAsVm(item: FleetInventoryItem) {
  // FleetInventoryItem extends VM with owner fields. The delete dialog only
  // reads VM fields, so unwrap to keep TS happy without inventing structure.
  const { ownerName: _ownerName, ownerEmail: _ownerEmail, ...vm } = item;
  void _ownerName;
  void _ownerEmail;
  return vm;
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <section className="flex flex-col items-start gap-4 rounded-lg border border-border-default bg-surface-elevated p-8">
      <h2 className="text-md font-medium text-text-primary">
        No workspaces match your filters.
      </h2>
      <p className="text-sm text-text-secondary">
        Loosen the filters above to widen the search.
      </p>
      <Button variant="outline" onClick={onReset}>
        Reset filters
      </Button>
    </section>
  );
}
