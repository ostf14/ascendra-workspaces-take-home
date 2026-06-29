import type {
  FleetUtilizationRange,
  WorkspaceMetricsRange,
} from "@/lib/domain/types";
import type { FleetInventoryFilters } from "@/lib/api/fleet";

// Query keys per decision 07. Hierarchical so prefix-invalidation hits
// related queries in one call.

export const currentUserKeys = {
  all: ["currentUser"] as const,
} as const;

export const workspacesKeys = {
  all: ["workspaces"] as const,
  list: () => ["workspaces"] as const,
  detail: (id: string) => ["workspaces", id] as const,
  metrics: (id: string, range: WorkspaceMetricsRange) =>
    ["workspaces", id, "metrics", range] as const,
} as const;

export const adminKeys = {
  all: ["admin"] as const,
  overview: () => ["admin", "overview"] as const,
  fleet: () => ["admin", "fleet"] as const,
  fleetInventory: (filters: FleetInventoryFilters) =>
    ["admin", "fleet", filters] as const,
  fleetUtilization: (range: FleetUtilizationRange) =>
    ["admin", "fleet", "utilization", range] as const,
  templates: () => ["admin", "templates"] as const,
  template: (id: string) => ["admin", "templates", id] as const,
  users: () => ["admin", "users"] as const,
} as const;
