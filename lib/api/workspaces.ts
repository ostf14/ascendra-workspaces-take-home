import { z } from "zod";

import {
  createWorkspaceRequestSchema,
  vmSchema,
  workspaceMetricsRangeSchema,
  workspaceMetricsSchema,
} from "@/lib/domain/schemas";
import type {
  CreateWorkspaceRequest,
  VM,
  WorkspaceMetrics,
  WorkspaceMetricsRange,
} from "@/lib/domain/types";

import { apiDelete, apiGet, apiPost } from "./client";

const workspaceListSchema = z.array(vmSchema);
const suggestNameSchema = z.object({ name: z.string().min(1) });

export function fetchWorkspaces(signal?: AbortSignal): Promise<VM[]> {
  return apiGet("/api/workspaces", workspaceListSchema, { signal });
}

export function fetchWorkspace(id: string, signal?: AbortSignal): Promise<VM> {
  return apiGet(`/api/workspaces/${encodeURIComponent(id)}`, vmSchema, { signal });
}

export function fetchWorkspaceMetrics(
  id: string,
  range: WorkspaceMetricsRange,
  signal?: AbortSignal
): Promise<WorkspaceMetrics> {
  workspaceMetricsRangeSchema.parse(range);
  return apiGet(
    `/api/workspaces/${encodeURIComponent(id)}/metrics?range=${range}`,
    workspaceMetricsSchema,
    { signal }
  );
}

export function suggestWorkspaceName(signal?: AbortSignal): Promise<string> {
  return apiGet("/api/workspaces/suggest-name", suggestNameSchema, { signal }).then(
    (r) => r.name
  );
}

export function createWorkspace(input: CreateWorkspaceRequest): Promise<VM> {
  return apiPost("/api/workspaces", vmSchema, createWorkspaceRequestSchema.parse(input));
}

export function startWorkspace(id: string): Promise<VM> {
  return apiPost(`/api/workspaces/${encodeURIComponent(id)}/start`, vmSchema);
}

export function stopWorkspace(id: string): Promise<VM> {
  return apiPost(`/api/workspaces/${encodeURIComponent(id)}/stop`, vmSchema);
}

export function restartWorkspace(id: string): Promise<VM> {
  return apiPost(`/api/workspaces/${encodeURIComponent(id)}/restart`, vmSchema);
}

export function deleteWorkspace(id: string): Promise<void> {
  return apiDelete(`/api/workspaces/${encodeURIComponent(id)}`);
}
