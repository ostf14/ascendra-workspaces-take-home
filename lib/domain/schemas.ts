import { z } from "zod";

export const vmStatusSchema = z.enum([
  "running",
  "stopped",
  "starting",
  "stopping",
  "error",
]);

export const userRoleSchema = z.enum(["engineer", "admin"]);

export const workspaceMetricsRangeSchema = z.enum(["1h", "24h"]);

export const fleetUtilizationRangeSchema = z.enum(["1h", "24h", "7d", "30d"]);

export const fleetSortKeySchema = z.enum([
  "name",
  "owner",
  "template",
  "status",
  "cpu",
  "memory",
  "disk",
  "lastActiveAt",
  "hourlyCost",
]);

export const sortOrderSchema = z.enum(["asc", "desc"]);

const isoDateTime = z.iso.datetime({ offset: true });

export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  role: userRoleSchema,
});

export const vmTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  baseImage: z.string().min(1),
  vcpu: z.number().int().positive(),
  memoryGb: z.number().positive(),
  diskGb: z.number().positive(),
  preinstalledTools: z.array(z.string()),
  hourlyCost: z.number().nonnegative(),
});

export const vmSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ownerId: z.string().min(1),
  templateId: z.string().min(1),
  templateName: z.string().min(1),
  status: vmStatusSchema,
  cpu: z.number().min(0).max(100),
  memory: z.number().min(0).max(100),
  disk: z.number().min(0).max(100),
  vcpu: z.number().int().positive(),
  memoryGb: z.number().positive(),
  diskGb: z.number().positive(),
  region: z.string().min(1),
  hourlyCost: z.number().nonnegative(),
  createdAt: isoDateTime,
  lastActiveAt: isoDateTime,
  isIdle: z.boolean(),
  errorReason: z.string().optional(),
});

export const timePointSchema = z.object({
  t: isoDateTime,
  v: z.number(),
});

export const workspaceMetricsSchema = z.object({
  range: workspaceMetricsRangeSchema,
  cpu: z.array(timePointSchema),
  memory: z.array(timePointSchema),
});

export const utilizationBucketSchema = z.object({
  label: z.string(),
  min: z.number(),
  max: z.number(),
  count: z.number().int().nonnegative(),
});

export const costByTemplateSchema = z.object({
  templateId: z.string().min(1),
  templateName: z.string().min(1),
  monthlyCost: z.number().nonnegative(),
  workspaceCount: z.number().int().nonnegative(),
});

export const fleetUtilizationSchema = z.object({
  range: fleetUtilizationRangeSchema,
  cpu: z.array(timePointSchema),
  memory: z.array(timePointSchema),
  distribution: z.array(utilizationBucketSchema),
  costByTemplate: z.array(costByTemplateSchema),
});

export const deltaSchema = z.object({
  value: z.number(),
  percent: z.number(),
});

export const adminOverviewSchema = z.object({
  runningCount: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative(),
  activeUsers: z.number().int().nonnegative(),
  hourlyCost: z.number().nonnegative(),
  monthToDateCost: z.number().nonnegative(),
  projectedMonthlyCost: z.number().nonnegative(),
  aggregateCpu: z.number().min(0).max(100),
  deltas: z.object({
    runningCount: deltaSchema,
    activeUsers: deltaSchema,
    hourlyCost: deltaSchema,
    monthToDateCost: deltaSchema,
    projectedMonthlyCost: deltaSchema,
    aggregateCpu: deltaSchema,
  }),
  waste: z.object({
    idleCount: z.number().int().nonnegative(),
    estimatedMonthlyWaste: z.number().nonnegative(),
  }),
  aggregateUtilization24h: z.object({
    cpu: z.array(timePointSchema),
    memory: z.array(timePointSchema),
  }),
});

export const templateUsageStatsSchema = z.object({
  workspaceCount: z.number().int().nonnegative(),
  monthlyCostContribution: z.number().nonnegative(),
});

export const templateWithUsageSchema = vmTemplateSchema.extend({
  usage: templateUsageStatsSchema,
});

export const fleetInventoryItemSchema = vmSchema.extend({
  ownerName: z.string().min(1),
  ownerEmail: z.email(),
});

export const createWorkspaceRequestSchema = z.object({
  templateId: z.string().min(1),
  name: z.string().min(1).max(64),
});

// Rename: same slug shape as the auto-generator (lowercase letters, digits,
// hyphens). 1-50 chars per the actions menu contract.
export const renameWorkspaceRequestSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9-]+$/),
});

export const adminCreateWorkspaceRequestSchema =
  createWorkspaceRequestSchema.extend({
    ownerId: z.string().min(1),
  });

export const createTemplateRequestSchema = vmTemplateSchema.omit({ id: true });

export const updateTemplateRequestSchema = createTemplateRequestSchema.partial();

export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});
