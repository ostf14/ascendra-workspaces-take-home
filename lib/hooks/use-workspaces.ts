"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  fetchWorkspace,
  fetchWorkspaceMetrics,
  fetchWorkspaces,
} from "@/lib/api/workspaces";
import type { VM, WorkspaceMetricsRange } from "@/lib/domain/types";
import { clearTransition } from "@/lib/transition-tracker";

import { workspacesKeys } from "./keys";

const TRANSITIONAL_STATUSES: VM["status"][] = ["starting", "stopping"];

function isTransitional(status: VM["status"]): boolean {
  return TRANSITIONAL_STATUSES.includes(status);
}

export function useWorkspaces() {
  const query = useQuery({
    queryKey: workspacesKeys.list(),
    queryFn: ({ signal }) => fetchWorkspaces(signal),
    refetchInterval: 10_000,
  });

  // Settle the transition tracker as soon as the polled status leaves the
  // transitional window — the countdown UI disappears as part of the flip.
  useEffect(() => {
    if (!query.data) return;
    for (const w of query.data) {
      if (!isTransitional(w.status)) clearTransition(w.id);
    }
  }, [query.data]);

  return query;
}

export function useWorkspace(id: string | undefined) {
  const query = useQuery({
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

  useEffect(() => {
    if (!query.data) return;
    if (!isTransitional(query.data.status)) clearTransition(query.data.id);
  }, [query.data]);

  return query;
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
