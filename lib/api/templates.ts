import { z } from "zod";

import {
  createTemplateRequestSchema,
  templateWithUsageSchema,
  updateTemplateRequestSchema,
} from "@/lib/domain/schemas";
import type {
  CreateTemplateRequest,
  TemplateWithUsage,
  UpdateTemplateRequest,
} from "@/lib/domain/types";

import { apiGet, apiPatch, apiPost } from "./client";

const templatesListSchema = z.array(templateWithUsageSchema);

export function fetchTemplates(signal?: AbortSignal): Promise<TemplateWithUsage[]> {
  return apiGet("/api/admin/templates", templatesListSchema, { signal });
}

export function fetchTemplate(
  id: string,
  signal?: AbortSignal
): Promise<TemplateWithUsage> {
  return apiGet(
    `/api/admin/templates/${encodeURIComponent(id)}`,
    templateWithUsageSchema,
    { signal }
  );
}

export function createTemplate(
  input: CreateTemplateRequest
): Promise<TemplateWithUsage> {
  return apiPost(
    "/api/admin/templates",
    templateWithUsageSchema,
    createTemplateRequestSchema.parse(input)
  );
}

export function updateTemplate(
  id: string,
  patch: UpdateTemplateRequest
): Promise<TemplateWithUsage> {
  return apiPatch(
    `/api/admin/templates/${encodeURIComponent(id)}`,
    templateWithUsageSchema,
    updateTemplateRequestSchema.parse(patch)
  );
}
