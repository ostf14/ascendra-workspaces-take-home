import type { z } from "zod";
import type {
  adminCreateWorkspaceRequestSchema,
  adminOverviewSchema,
  apiErrorSchema,
  costByTemplateSchema,
  createTemplateRequestSchema,
  createWorkspaceRequestSchema,
  deltaSchema,
  fleetInventoryItemSchema,
  fleetSortKeySchema,
  fleetUtilizationRangeSchema,
  fleetUtilizationSchema,
  sortOrderSchema,
  templateUsageStatsSchema,
  templateWithUsageSchema,
  timePointSchema,
  updateTemplateRequestSchema,
  userRoleSchema,
  userSchema,
  utilizationBucketSchema,
  vmSchema,
  vmStatusSchema,
  vmTemplateSchema,
  workspaceMetricsRangeSchema,
  workspaceMetricsSchema,
} from "@/lib/domain/schemas";

export type VMStatus = z.infer<typeof vmStatusSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type WorkspaceMetricsRange = z.infer<typeof workspaceMetricsRangeSchema>;
export type FleetUtilizationRange = z.infer<typeof fleetUtilizationRangeSchema>;
export type FleetSortKey = z.infer<typeof fleetSortKeySchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;

export type User = z.infer<typeof userSchema>;
export type VMTemplate = z.infer<typeof vmTemplateSchema>;
export type VM = z.infer<typeof vmSchema>;
export type TimePoint = z.infer<typeof timePointSchema>;
export type WorkspaceMetrics = z.infer<typeof workspaceMetricsSchema>;
export type UtilizationBucket = z.infer<typeof utilizationBucketSchema>;
export type CostByTemplate = z.infer<typeof costByTemplateSchema>;
export type FleetUtilization = z.infer<typeof fleetUtilizationSchema>;
export type Delta = z.infer<typeof deltaSchema>;
export type AdminOverview = z.infer<typeof adminOverviewSchema>;
export type TemplateUsageStats = z.infer<typeof templateUsageStatsSchema>;
export type TemplateWithUsage = z.infer<typeof templateWithUsageSchema>;
export type FleetInventoryItem = z.infer<typeof fleetInventoryItemSchema>;

export type CreateWorkspaceRequest = z.infer<typeof createWorkspaceRequestSchema>;
export type AdminCreateWorkspaceRequest = z.infer<
  typeof adminCreateWorkspaceRequestSchema
>;
export type CreateTemplateRequest = z.infer<typeof createTemplateRequestSchema>;
export type UpdateTemplateRequest = z.infer<typeof updateTemplateRequestSchema>;

export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
