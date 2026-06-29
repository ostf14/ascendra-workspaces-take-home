import { z } from "zod";

import {
  adminCreateWorkspaceRequestSchema,
  adminOverviewSchema,
  fleetInventoryItemSchema,
  fleetUtilizationRangeSchema,
  fleetUtilizationSchema,
  vmSchema,
} from "@/lib/domain/schemas";
import type {
  AdminCreateWorkspaceRequest,
  AdminOverview,
  FleetInventoryItem,
  FleetUtilization,
  FleetUtilizationRange,
  SortOrder,
  VM,
  VMStatus,
} from "@/lib/domain/types";

import { apiGet, apiPost } from "./client";

const fleetInventorySchema = z.array(fleetInventoryItemSchema);

export type FleetInventoryFilters = {
  search?: string;
  status?: VMStatus;
  templateId?: string;
  ownerId?: string;
  idleOnly?: boolean;
  sort?: string;
  order?: SortOrder;
};

export function fetchAdminOverview(signal?: AbortSignal): Promise<AdminOverview> {
  return apiGet("/api/admin/overview", adminOverviewSchema, { signal });
}

export function fetchFleetInventory(
  filters: FleetInventoryFilters,
  signal?: AbortSignal
): Promise<FleetInventoryItem[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.templateId) params.set("template", filters.templateId);
  if (filters.ownerId) params.set("owner", filters.ownerId);
  if (filters.idleOnly) params.set("idleOnly", "true");
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);
  const qs = params.toString();
  const path = qs ? `/api/admin/fleet?${qs}` : "/api/admin/fleet";
  return apiGet(path, fleetInventorySchema, { signal });
}

export function fetchFleetUtilization(
  range: FleetUtilizationRange,
  signal?: AbortSignal
): Promise<FleetUtilization> {
  fleetUtilizationRangeSchema.parse(range);
  return apiGet(
    `/api/admin/utilization?range=${range}`,
    fleetUtilizationSchema,
    { signal }
  );
}

export function adminProvisionWorkspace(
  input: AdminCreateWorkspaceRequest
): Promise<VM> {
  return apiPost(
    "/api/admin/workspaces",
    vmSchema,
    adminCreateWorkspaceRequestSchema.parse(input)
  );
}
