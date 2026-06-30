import { http, HttpResponse } from "msw";

import {
  vmStatusSchema,
  workspaceMetricsRangeSchema,
  fleetUtilizationRangeSchema,
  createWorkspaceRequestSchema,
  adminCreateWorkspaceRequestSchema,
  createTemplateRequestSchema,
  renameWorkspaceRequestSchema,
  updateTemplateRequestSchema,
} from "@/lib/domain/schemas";

import { delay } from "./delay";
import {
  buildAdminOverview,
  buildFleetUtilization,
  buildWorkspaceMetrics,
  createTemplate,
  createWorkspace,
  deleteWorkspace,
  duplicateWorkspace,
  getCurrentUser,
  getTemplate,
  getWorkspace,
  listFleet,
  listOwnWorkspaces,
  listTemplates,
  listUsers,
  renameWorkspace,
  restartWorkspace,
  startWorkspace,
  stopWorkspace,
  suggestWorkspaceName,
  updateTemplate,
} from "./data";

function notFound(message = "Not found") {
  return HttpResponse.json({ message }, { status: 404 });
}

function badRequest(message = "Bad request") {
  return HttpResponse.json({ message }, { status: 400 });
}

export const handlers = [
  http.get("/api/me", async ({ request }) => {
    await delay();
    return HttpResponse.json(getCurrentUser(request));
  }),

  http.get("/api/workspaces", async ({ request }) => {
    await delay();
    return HttpResponse.json(listOwnWorkspaces(request));
  }),

  http.get("/api/workspaces/suggest-name", async () => {
    await delay(50, 150);
    return HttpResponse.json({ name: suggestWorkspaceName() });
  }),

  http.get("/api/workspaces/:id", async ({ params }) => {
    await delay();
    const id = String(params.id);
    const w = getWorkspace(id);
    if (!w) return notFound("Workspace not found");
    return HttpResponse.json(w);
  }),

  http.get("/api/workspaces/:id/metrics", async ({ params, request }) => {
    await delay();
    const id = String(params.id);
    const url = new URL(request.url);
    const range = workspaceMetricsRangeSchema.safeParse(
      url.searchParams.get("range") ?? "24h"
    );
    if (!range.success) return badRequest("Invalid range");
    const metrics = buildWorkspaceMetrics(id, range.data);
    if (!metrics) return notFound("Workspace not found");
    return HttpResponse.json(metrics);
  }),

  http.post("/api/workspaces", async ({ request }) => {
    await delay();
    const body = await request.json();
    const parsed = createWorkspaceRequestSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid create payload");
    const w = createWorkspace(parsed.data, request);
    return HttpResponse.json(w, { status: 201 });
  }),

  http.post("/api/workspaces/:id/start", async ({ params }) => {
    await delay();
    const w = startWorkspace(String(params.id));
    if (!w) return notFound("Workspace not found");
    return HttpResponse.json(w);
  }),

  http.post("/api/workspaces/:id/stop", async ({ params }) => {
    await delay();
    const w = stopWorkspace(String(params.id));
    if (!w) return notFound("Workspace not found");
    return HttpResponse.json(w);
  }),

  http.post("/api/workspaces/:id/restart", async ({ params }) => {
    await delay();
    const w = restartWorkspace(String(params.id));
    if (!w) return notFound("Workspace not found");
    return HttpResponse.json(w);
  }),

  http.delete("/api/workspaces/:id", async ({ params }) => {
    await delay();
    const ok = deleteWorkspace(String(params.id));
    if (!ok) return notFound("Workspace not found");
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch("/api/workspaces/:id", async ({ params, request }) => {
    await delay();
    const body = await request.json();
    const parsed = renameWorkspaceRequestSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid rename payload");
    const w = renameWorkspace(String(params.id), parsed.data.name);
    if (!w) return notFound("Workspace not found");
    return HttpResponse.json(w);
  }),

  http.post("/api/workspaces/:id/duplicate", async ({ params }) => {
    await delay();
    const w = duplicateWorkspace(String(params.id));
    if (!w) return notFound("Workspace not found");
    return HttpResponse.json(w, { status: 201 });
  }),

  http.get("/api/admin/overview", async () => {
    await delay();
    return HttpResponse.json(buildAdminOverview());
  }),

  http.get("/api/admin/fleet", async ({ request }) => {
    await delay();
    const url = new URL(request.url);
    const statusRaw = url.searchParams.get("status");
    const status = statusRaw
      ? vmStatusSchema.safeParse(statusRaw)
      : { success: true as const, data: undefined };
    if (!status.success) return badRequest("Invalid status");
    const data = listFleet({
      search: url.searchParams.get("search") ?? undefined,
      status: status.data,
      templateId: url.searchParams.get("template") ?? undefined,
      ownerId: url.searchParams.get("owner") ?? undefined,
      idleOnly: url.searchParams.get("idleOnly") === "true",
      sort: url.searchParams.get("sort") ?? undefined,
      order: (url.searchParams.get("order") as "asc" | "desc" | null) ?? undefined,
    });
    return HttpResponse.json(data);
  }),

  http.get("/api/admin/utilization", async ({ request }) => {
    await delay();
    const url = new URL(request.url);
    const range = fleetUtilizationRangeSchema.safeParse(
      url.searchParams.get("range") ?? "24h"
    );
    if (!range.success) return badRequest("Invalid range");
    return HttpResponse.json(buildFleetUtilization(range.data));
  }),

  http.get("/api/admin/templates", async () => {
    await delay();
    return HttpResponse.json(listTemplates());
  }),

  http.get("/api/admin/templates/:id", async ({ params }) => {
    await delay();
    const t = getTemplate(String(params.id));
    if (!t) return notFound("Template not found");
    return HttpResponse.json(t);
  }),

  http.post("/api/admin/templates", async ({ request }) => {
    await delay();
    const body = await request.json();
    const parsed = createTemplateRequestSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid template payload");
    return HttpResponse.json(createTemplate(parsed.data), { status: 201 });
  }),

  http.patch("/api/admin/templates/:id", async ({ params, request }) => {
    await delay();
    const body = await request.json();
    const parsed = updateTemplateRequestSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid template patch");
    const t = updateTemplate(String(params.id), parsed.data);
    if (!t) return notFound("Template not found");
    return HttpResponse.json(t);
  }),

  http.post("/api/admin/workspaces", async ({ request }) => {
    await delay();
    const body = await request.json();
    const parsed = adminCreateWorkspaceRequestSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid provision payload");
    const w = createWorkspace(parsed.data);
    return HttpResponse.json(w, { status: 201 });
  }),

  http.get("/api/admin/users", async () => {
    await delay();
    return HttpResponse.json(listUsers());
  }),
];
