"use client";

import { useQuery } from "@tanstack/react-query";

import type { FleetInventoryFilters } from "@/lib/api/fleet";
import {
  fetchAdminOverview,
  fetchFleetInventory,
  fetchFleetUtilization,
} from "@/lib/api/fleet";
import type { FleetUtilizationRange } from "@/lib/domain/types";

import { adminKeys } from "./keys";

export function useAdminOverview() {
  return useQuery({
    queryKey: adminKeys.overview(),
    queryFn: ({ signal }) => fetchAdminOverview(signal),
    refetchInterval: 30_000,
  });
}

export function useFleetInventory(filters: FleetInventoryFilters = {}) {
  return useQuery({
    queryKey: adminKeys.fleetInventory(filters),
    queryFn: ({ signal }) => fetchFleetInventory(filters, signal),
    refetchInterval: 15_000,
    placeholderData: (previous) => previous,
  });
}

export function useFleetUtilization(range: FleetUtilizationRange) {
  return useQuery({
    queryKey: adminKeys.fleetUtilization(range),
    queryFn: ({ signal }) => fetchFleetUtilization(range, signal),
    staleTime: 60_000,
  });
}
