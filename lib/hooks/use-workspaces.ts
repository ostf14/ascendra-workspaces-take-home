"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchWorkspace,
  fetchWorkspaceMetrics,
  fetchWorkspaces,
} from "@/lib/api/workspaces";
import type { VM, WorkspaceMetricsRange } from "@/lib/domain/types";

import { workspacesKeys } from "./keys";

const TRANSITIONAL_STATUSES: VM["status"][] = ["starting", "stopping"];

export function useWorkspaces() {
  return useQuery({
    queryKey: workspacesKeys.list(),
    queryFn: ({ signal }) => fetchWorkspaces(signal),
    refetchInterval: 10_000,
  });
}

export function useWorkspace(id: string | undefined) {
  return useQuery({
    queryKey: id ? workspacesKeys.detail(id) : ["workspaces", "__none__"],
    queryFn: ({ signal }) => {
      if (!id) throw new Error("Workspace id missing");
      return fetchWorkspace(id, signal);
    },
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const data = query.state.data as VM | undefined;
      if (!data) return 5_000;
      return TRANSITIONAL_STATUSES.includes(data.status) ? 2_000 : 5_000;
    },
  });
}

export function useWorkspaceMetrics(
  id: string | undefined,
  range: WorkspaceMetricsRange
) {
  return useQuery({
    queryKey: id
      ? workspacesKeys.metrics(id, range)
      : ["workspaces", "__none__", "metrics", range],
    queryFn: ({ signal }) => {
      if (!id) throw new Error("Workspace id missing");
      return fetchWorkspaceMetrics(id, range, signal);
    },
    enabled: Boolean(id),
    refetchInterval: 10_000,
  });
}
