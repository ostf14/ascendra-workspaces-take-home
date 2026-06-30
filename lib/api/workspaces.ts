import { z } from "zod";

import {
  createWorkspaceRequestSchema,
  renameWorkspaceRequestSchema,
  vmSchema,
  workspaceMetricsRangeSchema,
  workspaceMetricsSchema,
} from "@/lib/domain/schemas";
import type {
  CreateWorkspaceRequest,
  RenameWorkspaceRequest,
  VM,
  WorkspaceMetrics,
  WorkspaceMetricsRange,
} from "@/lib/domain/types";

import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

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

export function renameWorkspace(id: string, input: RenameWorkspaceRequest): Promise<VM> {
  return apiPatch(
    `/api/workspaces/${encodeURIComponent(id)}`,
    vmSchema,
    renameWorkspaceRequestSchema.parse(input)
  );
}

export function duplicateWorkspace(id: string): Promise<VM> {
  return apiPost(`/api/workspaces/${encodeURIComponent(id)}/duplicate`, vmSchema);
}
