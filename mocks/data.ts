// Mock data store. Generated once at module load and mutated in place so
// list endpoints reflect the effects of POST/DELETE/lifecycle calls between
// polls. Distributions follow notes/mock-data-plan.md.

import type {
  AdminOverview,
  CostByTemplate,
  Delta,
  FleetInventoryItem,
  FleetUtilization,
  FleetUtilizationRange,
  TemplateWithUsage,
  TimePoint,
  User,
  UtilizationBucket,
  VM,
  VMStatus,
  VMTemplate,
  WorkspaceMetrics,
  WorkspaceMetricsRange,
} from "@/lib/domain/types";
import {
  generateUniqueWorkspaceName,
  generateWorkspaceName,
} from "@/lib/utils/workspace-names";

import { mulberry32, pickOne, randomBetween, randomInt } from "./rng";

const SEED = 7322;
const rng = mulberry32(SEED);

const TEMPLATES: VMTemplate[] = [
  {
    id: "tpl-backend",
    name: "Backend dev",
    description: "Node + Postgres + Redis, ready for backend work.",
    baseImage: "ubuntu:22.04",
    vcpu: 4,
    memoryGb: 8,
    diskGb: 50,
    preinstalledTools: ["node@20", "pnpm", "postgresql@16", "redis"],
    hourlyCost: 0.14,
  },
  {
    id: "tpl-frontend",
    name: "Frontend dev",
    description: "Lightweight Node + browser tooling for UI work.",
    baseImage: "ubuntu:22.04",
    vcpu: 2,
    memoryGb: 4,
    diskGb: 30,
    preinstalledTools: ["node@20", "pnpm", "chromium"],
    hourlyCost: 0.08,
  },
  {
    id: "tpl-ml",
    name: "ML / Python",
    description: "CUDA-ready Python stack for training and notebooks.",
    baseImage: "nvidia/cuda:12.4-runtime",
    vcpu: 16,
    memoryGb: 32,
    diskGb: 200,
    preinstalledTools: ["python@3.12", "torch", "jupyter", "cuda"],
    hourlyCost: 0.42,
  },
  {
    id: "tpl-data",
    name: "Data eng",
    description: "Spark + DuckDB + dbt, sized for medium pipelines.",
    baseImage: "ubuntu:22.04",
    vcpu: 8,
    memoryGb: 16,
    diskGb: 100,
    preinstalledTools: ["spark@3.5", "duckdb", "dbt", "python@3.12"],
    hourlyCost: 0.22,
  },
  {
    id: "tpl-blank",
    name: "Blank Ubuntu",
    description: "Plain Ubuntu image. Bring your own stack.",
    baseImage: "ubuntu:22.04",
    vcpu: 2,
    memoryGb: 4,
    diskGb: 30,
    preinstalledTools: [],
    hourlyCost: 0.08,
  },
];

function templateById(id: string): VMTemplate {
  const t = TEMPLATES.find((tpl) => tpl.id === id);
  if (!t) throw new Error(`Unknown template ${id}`);
  return t;
}

// Default acting user. Reviewers can switch via the X-Acting-User header
// that the API client injects from localStorage — see README.
export const ACTING_USER_ID = "user-alex";
export const ACTING_USER_HEADER = "x-acting-user";

const USERS: User[] = [
  { id: ACTING_USER_ID, name: "Alex Morgan", email: "alex@ascendra.dev", role: "admin" },
  { id: "user-sam", name: "Engineer Sam", email: "sam@ascendra.dev", role: "engineer" },
  { id: "user-priya", name: "Priya Shah", email: "priya@ascendra.dev", role: "admin" },
  { id: "user-jordan", name: "Jordan Reyes", email: "jordan@ascendra.dev", role: "admin" },
  { id: "user-mei", name: "Mei Tanaka", email: "mei@ascendra.dev", role: "admin" },
  { id: "user-omar", name: "Omar Hassan", email: "omar@ascendra.dev", role: "admin" },
  { id: "user-rosa", name: "Rosa Bianchi", email: "rosa@ascendra.dev", role: "engineer" },
  { id: "user-finn", name: "Finn Caldwell", email: "finn@ascendra.dev", role: "engineer" },
  { id: "user-nina", name: "Nina Petrova", email: "nina@ascendra.dev", role: "engineer" },
  { id: "user-luc", name: "Luc Dubois", email: "luc@ascendra.dev", role: "engineer" },
  { id: "user-zoe", name: "Zoe Marshall", email: "zoe@ascendra.dev", role: "engineer" },
  { id: "user-arjun", name: "Arjun Mehta", email: "arjun@ascendra.dev", role: "engineer" },
  { id: "user-yuki", name: "Yuki Sato", email: "yuki@ascendra.dev", role: "engineer" },
  { id: "user-otis", name: "Otis Bell", email: "otis@ascendra.dev", role: "engineer" },
  { id: "user-greta", name: "Greta Lindqvist", email: "greta@ascendra.dev", role: "engineer" },
  { id: "user-malik", name: "Malik Johnson", email: "malik@ascendra.dev", role: "engineer" },
  { id: "user-iris", name: "Iris Chen", email: "iris@ascendra.dev", role: "engineer" },
  { id: "user-eli", name: "Eli Park", email: "eli@ascendra.dev", role: "engineer" },
  { id: "user-mara", name: "Mara Kowalski", email: "mara@ascendra.dev", role: "engineer" },
  { id: "user-theo", name: "Theo Almeida", email: "theo@ascendra.dev", role: "engineer" },
];

// Exclude the demo engineer (user-sam) so swapping the acting user to him
// shows a real empty state — the role-gating demo lands on the onboarding
// affordance from screens/developer.md.
const ROUND_ROBIN_EXCLUDED = new Set([ACTING_USER_ID, "user-sam"]);
const NON_ACTING_USER_IDS = USERS.filter(
  (u) => !ROUND_ROBIN_EXCLUDED.has(u.id)
).map((u) => u.id);

function userById(id: string): User {
  const u = USERS.find((user) => user.id === id);
  if (!u) throw new Error(`Unknown user ${id}`);
  return u;
}

const REGIONS = ["us-east-1", "us-west-2", "eu-central-1", "ap-southeast-1"];

type CostBin = "cheap" | "standard" | "medium" | "expensive";
const COST_FOR_BIN: Record<CostBin, number> = {
  cheap: 0.04,
  standard: 0.14,
  medium: 0.22,
  expensive: 0.42,
};

type CpuBin = 0 | 1 | 2 | 3 | 4;
const CPU_RANGE_FOR_BIN: Record<CpuBin, [number, number]> = {
  0: [1, 9],
  1: [10, 29],
  2: [30, 59],
  3: [60, 84],
  4: [85, 99],
};

type IdleBucket = "1-6h" | "12-48h" | "3-5d" | "7d+";
const IDLE_RANGE_HOURS: Record<IdleBucket, [number, number]> = {
  "1-6h": [1, 6],
  "12-48h": [12, 48],
  "3-5d": [72, 120],
  "7d+": [168, 336],
};

type SlotPlan = {
  templateId: string;
  cost: CostBin;
  status: VMStatus;
  cpuBin: CpuBin | null;
  idleBucket: IdleBucket | null;
  memoryOutlier: boolean;
};

// Each entry below is one workspace. Distributions tuned per
// notes/mock-data-plan.md: 60 total, 42 running (12 idle), 14 stopped,
// 2 starting, 1 stopping, 1 error. CPU bins for running: 14/8/5/9/6.
const NON_ACTING_SLOTS: SlotPlan[] = [
  // --- 11 idle running, cheap, CPU bin 0 — distributed over staleness buckets
  // 4 in 1-6h
  { templateId: "tpl-frontend", cost: "cheap", status: "running", cpuBin: 0, idleBucket: "1-6h", memoryOutlier: false },
  { templateId: "tpl-frontend", cost: "cheap", status: "running", cpuBin: 0, idleBucket: "1-6h", memoryOutlier: false },
  { templateId: "tpl-blank", cost: "cheap", status: "running", cpuBin: 0, idleBucket: "1-6h", memoryOutlier: false },
  { templateId: "tpl-backend", cost: "cheap", status: "running", cpuBin: 0, idleBucket: "1-6h", memoryOutlier: false },
  // 4 in 12-48h (1 mem outlier here)
  { templateId: "tpl-backend", cost: "cheap", status: "running", cpuBin: 0, idleBucket: "12-48h", memoryOutlier: true },
  { templateId: "tpl-data", cost: "cheap", status: "running", cpuBin: 0, idleBucket: "12-48h", memoryOutlier: false },
  { templateId: "tpl-frontend", cost: "cheap", status: "running", cpuBin: 0, idleBucket: "12-48h", memoryOutlier: false },
  { templateId: "tpl-frontend", cost: "cheap", status: "running", cpuBin: 0, idleBucket: "12-48h", memoryOutlier: false },
  // 2 in 3-5d (1 mem outlier)
  { templateId: "tpl-blank", cost: "cheap", status: "running", cpuBin: 0, idleBucket: "3-5d", memoryOutlier: true },
  { templateId: "tpl-frontend", cost: "cheap", status: "running", cpuBin: 0, idleBucket: "3-5d", memoryOutlier: false },
  // 1 in 7d+ (1 mem outlier)
  { templateId: "tpl-backend", cost: "cheap", status: "running", cpuBin: 0, idleBucket: "7d+", memoryOutlier: true },

  // --- 2 non-idle running in CPU bin 0 (recently active, low CPU)
  { templateId: "tpl-backend", cost: "standard", status: "running", cpuBin: 0, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-data", cost: "standard", status: "running", cpuBin: 0, idleBucket: null, memoryOutlier: false },

  // --- 8 running in bin 1 (10-30%)
  { templateId: "tpl-backend", cost: "standard", status: "running", cpuBin: 1, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-backend", cost: "standard", status: "running", cpuBin: 1, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-backend", cost: "standard", status: "running", cpuBin: 1, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-frontend", cost: "standard", status: "running", cpuBin: 1, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-data", cost: "medium", status: "running", cpuBin: 1, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-data", cost: "medium", status: "running", cpuBin: 1, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-blank", cost: "standard", status: "running", cpuBin: 1, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-backend", cost: "standard", status: "running", cpuBin: 1, idleBucket: null, memoryOutlier: false },

  // --- 4 running in bin 2 (30-60%) — acting admin emerald-panther covers the fifth
  { templateId: "tpl-backend", cost: "standard", status: "running", cpuBin: 2, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-backend", cost: "standard", status: "running", cpuBin: 2, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-frontend", cost: "standard", status: "running", cpuBin: 2, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-data", cost: "medium", status: "running", cpuBin: 2, idleBucket: null, memoryOutlier: false },

  // --- 8 running in bin 3 (60-85%) — acting admin quiet-fox covers the ninth
  { templateId: "tpl-backend", cost: "standard", status: "running", cpuBin: 3, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-backend", cost: "standard", status: "running", cpuBin: 3, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-backend", cost: "standard", status: "running", cpuBin: 3, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-ml", cost: "expensive", status: "running", cpuBin: 3, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-data", cost: "medium", status: "running", cpuBin: 3, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-data", cost: "medium", status: "running", cpuBin: 3, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-frontend", cost: "standard", status: "running", cpuBin: 3, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-data", cost: "medium", status: "running", cpuBin: 3, idleBucket: null, memoryOutlier: false },

  // --- 6 running in bin 4 (85-100%)
  { templateId: "tpl-ml", cost: "expensive", status: "running", cpuBin: 4, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-ml", cost: "expensive", status: "running", cpuBin: 4, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-data", cost: "medium", status: "running", cpuBin: 4, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-data", cost: "medium", status: "running", cpuBin: 4, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-backend", cost: "standard", status: "running", cpuBin: 4, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-backend", cost: "standard", status: "running", cpuBin: 4, idleBucket: null, memoryOutlier: false },

  // --- 13 stopped (14th is acting admin lonely-otter)
  { templateId: "tpl-backend", cost: "standard", status: "stopped", cpuBin: null, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-backend", cost: "standard", status: "stopped", cpuBin: null, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-backend", cost: "standard", status: "stopped", cpuBin: null, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-backend", cost: "standard", status: "stopped", cpuBin: null, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-backend", cost: "standard", status: "stopped", cpuBin: null, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-frontend", cost: "standard", status: "stopped", cpuBin: null, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-frontend", cost: "standard", status: "stopped", cpuBin: null, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-frontend", cost: "standard", status: "stopped", cpuBin: null, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-frontend", cost: "standard", status: "stopped", cpuBin: null, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-data", cost: "medium", status: "stopped", cpuBin: null, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-data", cost: "medium", status: "stopped", cpuBin: null, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-data", cost: "medium", status: "stopped", cpuBin: null, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-ml", cost: "expensive", status: "stopped", cpuBin: null, idleBucket: null, memoryOutlier: false },

  // --- 2 starting (one quick start, one mid-provisioning long start)
  { templateId: "tpl-backend", cost: "standard", status: "starting", cpuBin: null, idleBucket: null, memoryOutlier: false },
  { templateId: "tpl-ml", cost: "expensive", status: "starting", cpuBin: null, idleBucket: null, memoryOutlier: false },

  // --- 1 stopping
  { templateId: "tpl-backend", cost: "standard", status: "stopping", cpuBin: null, idleBucket: null, memoryOutlier: false },

  // --- 1 error
  { templateId: "tpl-data", cost: "medium", status: "error", cpuBin: null, idleBucket: null, memoryOutlier: false },
];

// Sanity check the slot list size matches plan.
if (NON_ACTING_SLOTS.length !== 56) {
  throw new Error(
    `Non-acting slot list has ${NON_ACTING_SLOTS.length}, expected 56`
  );
}

const ACTING_SLOTS: Array<
  SlotPlan & { name: string; cpu: number; memory: number; disk: number; lastActiveHoursAgo: number }
> = [
  {
    name: "emerald-panther-54",
    templateId: "tpl-backend",
    cost: "standard",
    status: "running",
    cpuBin: 2,
    idleBucket: null,
    memoryOutlier: false,
    cpu: 34,
    memory: 52,
    disk: 41,
    lastActiveHoursAgo: 0.2,
  },
  {
    name: "quiet-fox-12",
    templateId: "tpl-ml",
    cost: "expensive",
    status: "running",
    cpuBin: 3,
    idleBucket: null,
    memoryOutlier: false,
    cpu: 78,
    memory: 84,
    disk: 68,
    lastActiveHoursAgo: 0.05,
  },
  {
    name: "lonely-otter-89",
    templateId: "tpl-frontend",
    cost: "cheap",
    status: "stopped",
    cpuBin: null,
    idleBucket: null,
    memoryOutlier: false,
    cpu: 0,
    memory: 0,
    disk: 18,
    lastActiveHoursAgo: 6,
  },
  {
    name: "stale-mountain-03",
    templateId: "tpl-blank",
    cost: "cheap",
    status: "running",
    cpuBin: 0,
    idleBucket: "12-48h",
    memoryOutlier: false,
    cpu: 2,
    memory: 12,
    disk: 22,
    lastActiveHoursAgo: 38,
  },
];

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function nowDate(): Date {
  return new Date();
}

function isoMinusHours(hours: number): string {
  return new Date(nowDate().getTime() - hours * HOUR).toISOString();
}

function isoMinusDays(days: number): string {
  return new Date(nowDate().getTime() - days * DAY).toISOString();
}

function pickIdleHours(bucket: IdleBucket): number {
  const [min, max] = IDLE_RANGE_HOURS[bucket];
  return randomBetween(rng, min, max);
}

function buildWorkspace(
  id: string,
  ownerId: string,
  name: string,
  slot: SlotPlan,
  overrides: {
    cpu?: number;
    memory?: number;
    disk?: number;
    lastActiveHoursAgo?: number;
  }
): VM {
  const template = templateById(slot.templateId);
  const region = pickOne(rng, REGIONS);
  const createdAtDays = randomBetween(rng, 4, 220);
  const createdAt = isoMinusDays(createdAtDays);

  let cpu = overrides.cpu;
  let memory = overrides.memory;
  let lastActiveHoursAgo = overrides.lastActiveHoursAgo;

  if (cpu === undefined) {
    if (slot.cpuBin === null) {
      cpu = 0;
    } else if (slot.idleBucket) {
      // Idle: CPU must stay under 5 to trip the isIdle predicate.
      cpu = Number(randomBetween(rng, 0.4, 4.4).toFixed(1));
    } else if (slot.cpuBin === 0) {
      // Non-idle bin 0: occupy the upper half so the distribution still reads as 0-10.
      cpu = Number(randomBetween(rng, 5, 9.5).toFixed(1));
    } else {
      const [lo, hi] = CPU_RANGE_FOR_BIN[slot.cpuBin];
      cpu = Number(randomBetween(rng, lo, hi).toFixed(1));
    }
  }

  if (memory === undefined) {
    if (slot.memoryOutlier) {
      memory = Number(randomBetween(rng, 90, 97).toFixed(1));
    } else if (slot.status === "stopped" || slot.status === "error") {
      memory = 0;
    } else {
      // Correlate with CPU plus some noise.
      const correlated = (cpu ?? 0) * 0.9 + randomBetween(rng, 8, 18);
      memory = Number(Math.max(5, Math.min(94, correlated)).toFixed(1));
    }
  }

  if (lastActiveHoursAgo === undefined) {
    if (slot.idleBucket) {
      lastActiveHoursAgo = pickIdleHours(slot.idleBucket);
    } else if (slot.status === "running") {
      lastActiveHoursAgo = randomBetween(rng, 0.01, 0.4);
    } else if (slot.status === "stopped") {
      lastActiveHoursAgo = randomBetween(rng, 4, 96);
    } else if (slot.status === "starting") {
      lastActiveHoursAgo = randomBetween(rng, 0.05, 0.5);
    } else if (slot.status === "stopping") {
      lastActiveHoursAgo = randomBetween(rng, 0.05, 0.3);
    } else {
      lastActiveHoursAgo = randomBetween(rng, 0.5, 4);
    }
  }

  const disk =
    overrides.disk ??
    Number(randomBetween(rng, 18, slot.status === "error" ? 78 : 82).toFixed(1));

  const lastActiveAt = isoMinusHours(lastActiveHoursAgo);
  const isIdle =
    slot.status === "running" &&
    cpu < 5 &&
    nowDate().getTime() - new Date(lastActiveAt).getTime() > HOUR;

  return {
    id,
    name,
    ownerId,
    templateId: template.id,
    templateName: template.name,
    status: slot.status,
    cpu,
    memory,
    disk,
    vcpu: template.vcpu,
    memoryGb: template.memoryGb,
    diskGb: template.diskGb,
    region,
    hourlyCost: COST_FOR_BIN[slot.cost],
    createdAt,
    lastActiveAt,
    isIdle,
    errorReason:
      slot.status === "error"
        ? "Provisioning failed: image pull timeout. Retry to recover."
        : undefined,
  };
}

const usedNames = new Set<string>();
ACTING_SLOTS.forEach((s) => usedNames.add(s.name));

function nextNonActingName(): string {
  const name = generateUniqueWorkspaceName(usedNames, rng);
  usedNames.add(name);
  return name;
}

function ownerRoundRobin(index: number): string {
  const id = NON_ACTING_USER_IDS[index % NON_ACTING_USER_IDS.length];
  if (!id) throw new Error("Round-robin owner missing");
  return id;
}

function generateInitialWorkspaces(): VM[] {
  const list: VM[] = [];

  ACTING_SLOTS.forEach((slot, index) => {
    list.push(
      buildWorkspace(
        `vm-acting-${index + 1}`,
        ACTING_USER_ID,
        slot.name,
        slot,
        {
          cpu: slot.cpu,
          memory: slot.memory,
          disk: slot.disk,
          lastActiveHoursAgo: slot.lastActiveHoursAgo,
        }
      )
    );
  });

  NON_ACTING_SLOTS.forEach((slot, index) => {
    list.push(
      buildWorkspace(
        `vm-${String(index + 1).padStart(3, "0")}`,
        ownerRoundRobin(index),
        nextNonActingName(),
        slot,
        {}
      )
    );
  });

  return list;
}

const workspaces: VM[] = generateInitialWorkspaces();

if (workspaces.length !== 60) {
  throw new Error(`Workspaces length ${workspaces.length}, expected 60`);
}

// In-flight lifecycle transitions: set by mutations, processed by tick().
type Transition = {
  vmId: string;
  endsAt: number;
  toStatus: Extract<VMStatus, "running" | "stopped">;
};
const transitions = new Map<string, Transition>();

function tickTransitions(): void {
  const now = Date.now();
  for (const [id, t] of transitions) {
    if (now >= t.endsAt) {
      const vm = workspaces.find((w) => w.id === id);
      if (vm) {
        vm.status = t.toStatus;
        if (t.toStatus === "running") {
          const tpl = templateById(vm.templateId);
          vm.cpu = Number(randomBetween(rng, 25, 55).toFixed(1));
          vm.memory = Number(randomBetween(rng, 28, 58).toFixed(1));
          vm.lastActiveAt = new Date().toISOString();
          vm.isIdle = false;
          vm.errorReason = undefined;
          vm.diskGb = tpl.diskGb;
        } else {
          vm.cpu = 0;
          vm.memory = 0;
        }
      }
      transitions.delete(id);
    }
  }
}

// Shaped sine for time-series + aggregates. Cheap to compute, big payoff in
// "feels real": low at night, peak 11-17, weekend flat at baseline.
function shapedSineFactor(at: Date): number {
  const hour = at.getHours() + at.getMinutes() / 60;
  const day = at.getDay();
  const isWeekend = day === 0 || day === 6;
  if (isWeekend) return 0.18;
  const peak = 14;
  const sigma = 4.2;
  const factor = Math.exp(-((hour - peak) ** 2) / (2 * sigma * sigma));
  return 0.18 + factor * 0.62;
}

function buildShapedSeries(
  end: Date,
  intervalMinutes: number,
  count: number,
  intensity: number,
  jitter: number
): TimePoint[] {
  const series: TimePoint[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const at = new Date(end.getTime() - i * intervalMinutes * 60_000);
    const base = shapedSineFactor(at);
    const noise = (rng() - 0.5) * 2 * jitter;
    const value = Math.max(0, Math.min(100, base * intensity + noise));
    series.push({ t: at.toISOString(), v: Number(value.toFixed(1)) });
  }
  return series;
}

const RANGE_CONFIG: Record<
  FleetUtilizationRange,
  { intervalMinutes: number; count: number }
> = {
  "1h": { intervalMinutes: 5, count: 12 },
  "24h": { intervalMinutes: 15, count: 96 },
  "7d": { intervalMinutes: 60, count: 168 },
  "30d": { intervalMinutes: 60 * 6, count: 120 },
};

function aggregateRunning(): { cpu: number; memory: number; hourly: number; count: number } {
  let cpu = 0;
  let memory = 0;
  let hourly = 0;
  let count = 0;
  for (const w of workspaces) {
    if (w.status === "running") {
      cpu += w.cpu;
      memory += w.memory;
      hourly += w.hourlyCost;
      count += 1;
    }
  }
  return {
    cpu: count > 0 ? Number((cpu / count).toFixed(1)) : 0,
    memory: count > 0 ? Number((memory / count).toFixed(1)) : 0,
    hourly: Number(hourly.toFixed(2)),
    count,
  };
}

function computeDistribution(): UtilizationBucket[] {
  const bins: (UtilizationBucket & { hourlyCostSum: number })[] = [
    { label: "0–10%", min: 0, max: 10, count: 0, hourlyCostSum: 0 },
    { label: "10–30%", min: 10, max: 30, count: 0, hourlyCostSum: 0 },
    { label: "30–60%", min: 30, max: 60, count: 0, hourlyCostSum: 0 },
    { label: "60–85%", min: 60, max: 85, count: 0, hourlyCostSum: 0 },
    { label: "85–100%", min: 85, max: 100, count: 0, hourlyCostSum: 0 },
  ];
  for (const w of workspaces) {
    if (w.status !== "running") continue;
    for (const b of bins) {
      const inRange =
        (w.cpu >= b.min && w.cpu < b.max) || (w.cpu === 100 && b.max === 100);
      if (!inRange) continue;
      b.count += 1;
      b.hourlyCostSum += w.hourlyCost;
      break;
    }
  }
  // Attach a "recoverable if these were stopped" projection to the two low
  // buckets, since those are the ones an admin can act on. 720 hours ≈ month.
  // Rounded to the nearest $10 so the number reads as a signal, not a
  // precise accounting figure.
  const HOURS_PER_MONTH = 720;
  return bins.map((b) => {
    const { hourlyCostSum, ...rest } = b;
    const isUnderutilized = b.max <= 30 && b.count > 0;
    if (!isUnderutilized) return rest;
    const raw = hourlyCostSum * HOURS_PER_MONTH;
    const rounded = Math.round(raw / 10) * 10;
    return { ...rest, recoverableMonthlyCost: rounded };
  });
}

function computeCostByTemplate(): CostByTemplate[] {
  return TEMPLATES.map((tpl) => {
    const owned = workspaces.filter((w) => w.templateId === tpl.id);
    const runningHourly = owned
      .filter((w) => w.status === "running")
      .reduce((acc, w) => acc + w.hourlyCost, 0);
    return {
      templateId: tpl.id,
      templateName: tpl.name,
      workspaceCount: owned.length,
      monthlyCost: Number((runningHourly * 24 * 30).toFixed(2)),
    };
  });
}

function activeUserCount(): number {
  const set = new Set<string>();
  for (const w of workspaces) {
    if (w.status === "running") set.add(w.ownerId);
  }
  return set.size;
}

function syntheticDelta(value: number, percent: number): Delta {
  return {
    value: Number(value.toFixed(2)),
    percent: Number(percent.toFixed(1)),
  };
}

export function listUsers(): User[] {
  return USERS.map((u) => ({ ...u }));
}

export function resolveActingUserId(request?: Request): string {
  if (!request) return ACTING_USER_ID;
  const header = request.headers.get(ACTING_USER_HEADER);
  if (header && USERS.some((u) => u.id === header)) return header;
  return ACTING_USER_ID;
}

export function getCurrentUser(request?: Request): User {
  return { ...userById(resolveActingUserId(request)) };
}

export function listTemplates(): TemplateWithUsage[] {
  return TEMPLATES.map((tpl) => {
    const owned = workspaces.filter((w) => w.templateId === tpl.id);
    const runningHourly = owned
      .filter((w) => w.status === "running")
      .reduce((acc, w) => acc + w.hourlyCost, 0);
    return {
      ...tpl,
      usage: {
        workspaceCount: owned.length,
        monthlyCostContribution: Number((runningHourly * 24 * 30).toFixed(2)),
      },
    };
  });
}

export function getTemplate(id: string): TemplateWithUsage | undefined {
  const list = listTemplates();
  return list.find((t) => t.id === id);
}

export function createTemplate(input: Omit<VMTemplate, "id">): TemplateWithUsage {
  const id = `tpl-${Date.now().toString(36)}-${Math.floor(rng() * 1000)}`;
  const template: VMTemplate = { ...input, id };
  TEMPLATES.push(template);
  return {
    ...template,
    usage: { workspaceCount: 0, monthlyCostContribution: 0 },
  };
}

export function updateTemplate(
  id: string,
  patch: Partial<Omit<VMTemplate, "id">>
): TemplateWithUsage | undefined {
  const index = TEMPLATES.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  const existing = TEMPLATES[index];
  if (!existing) return undefined;
  const next: VMTemplate = {
    id: existing.id,
    name: patch.name ?? existing.name,
    description: patch.description ?? existing.description,
    baseImage: patch.baseImage ?? existing.baseImage,
    vcpu: patch.vcpu ?? existing.vcpu,
    memoryGb: patch.memoryGb ?? existing.memoryGb,
    diskGb: patch.diskGb ?? existing.diskGb,
    preinstalledTools: patch.preinstalledTools ?? existing.preinstalledTools,
    hourlyCost: patch.hourlyCost ?? existing.hourlyCost,
  };
  TEMPLATES[index] = next;
  return {
    ...next,
    usage: getTemplate(id)?.usage ?? {
      workspaceCount: 0,
      monthlyCostContribution: 0,
    },
  };
}

export function deleteTemplate(id: string): { deleted: boolean; workspaceCount: number } {
  const index = TEMPLATES.findIndex((t) => t.id === id);
  if (index === -1) return { deleted: false, workspaceCount: 0 };
  // Refuse to delete a template that still has workspaces attached — mirrors
  // real backends and keeps referential integrity on the mock inventory.
  const workspaceCount = workspaces.filter((w) => w.templateId === id).length;
  if (workspaceCount > 0) return { deleted: false, workspaceCount };
  TEMPLATES.splice(index, 1);
  return { deleted: true, workspaceCount: 0 };
}

export function listOwnWorkspaces(request?: Request): VM[] {
  tickTransitions();
  const ownerId = resolveActingUserId(request);
  return workspaces
    .filter((w) => w.ownerId === ownerId)
    .map((w) => ({ ...w }));
}

export function getWorkspace(id: string): VM | undefined {
  tickTransitions();
  const w = workspaces.find((x) => x.id === id);
  return w ? { ...w } : undefined;
}

export function listFleet(filters: {
  search?: string;
  status?: VMStatus;
  templateId?: string;
  ownerId?: string;
  idleOnly?: boolean;
  sort?: string;
  order?: "asc" | "desc";
}): FleetInventoryItem[] {
  tickTransitions();
  let rows: FleetInventoryItem[] = workspaces.map((w) => {
    const owner = userById(w.ownerId);
    return { ...w, ownerName: owner.name, ownerEmail: owner.email };
  });

  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.ownerEmail.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q) ||
        r.templateName.toLowerCase().includes(q)
    );
  }
  if (filters.status) rows = rows.filter((r) => r.status === filters.status);
  if (filters.templateId) rows = rows.filter((r) => r.templateId === filters.templateId);
  if (filters.ownerId) rows = rows.filter((r) => r.ownerId === filters.ownerId);
  if (filters.idleOnly) rows = rows.filter((r) => r.isIdle);

  const order = filters.order === "asc" ? 1 : -1;
  const sort = filters.sort ?? "status";
  rows.sort((a, b) => {
    const av = readSortValue(a, sort);
    const bv = readSortValue(b, sort);
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * order;
    return String(av).localeCompare(String(bv)) * order;
  });

  return rows;
}

function readSortValue(row: FleetInventoryItem, key: string): string | number {
  switch (key) {
    case "name":
      return row.name;
    case "owner":
      return row.ownerName;
    case "template":
      return row.templateName;
    case "status":
      return row.status;
    case "cpu":
      return row.cpu;
    case "memory":
      return row.memory;
    case "disk":
      return row.disk;
    case "lastActiveAt":
      return row.lastActiveAt;
    case "hourlyCost":
      return row.hourlyCost;
    default:
      return row.status;
  }
}

type CreateWorkspaceInput = {
  templateId: string;
  name?: string;
  ownerId?: string;
};

export function createWorkspace(
  input: CreateWorkspaceInput,
  request?: Request
): VM {
  const template = templateById(input.templateId);
  const ownerId = input.ownerId ?? resolveActingUserId(request);
  const name = input.name ?? generateUniqueWorkspaceName(usedNames, rng);
  usedNames.add(name);
  const id = `vm-new-${Date.now().toString(36)}`;
  const vm: VM = {
    id,
    name,
    ownerId,
    templateId: template.id,
    templateName: template.name,
    status: "starting",
    cpu: 0,
    memory: 0,
    disk: 12,
    vcpu: template.vcpu,
    memoryGb: template.memoryGb,
    diskGb: template.diskGb,
    region: pickOne(rng, REGIONS),
    hourlyCost: template.hourlyCost,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    isIdle: false,
  };
  workspaces.unshift(vm);
  scheduleTransition(id, "running");
  return { ...vm };
}

function scheduleTransition(
  vmId: string,
  toStatus: Extract<VMStatus, "running" | "stopped">
): void {
  const delaySeconds = randomInt(rng, 8, 15);
  transitions.set(vmId, {
    vmId,
    toStatus,
    endsAt: Date.now() + delaySeconds * 1000,
  });
}

export function startWorkspace(id: string): VM | undefined {
  tickTransitions();
  const w = workspaces.find((x) => x.id === id);
  if (!w) return undefined;
  if (w.status === "running" || w.status === "starting") return { ...w };
  w.status = "starting";
  scheduleTransition(id, "running");
  return { ...w };
}

export function stopWorkspace(id: string): VM | undefined {
  tickTransitions();
  const w = workspaces.find((x) => x.id === id);
  if (!w) return undefined;
  if (w.status === "stopped" || w.status === "stopping") return { ...w };
  w.status = "stopping";
  scheduleTransition(id, "stopped");
  return { ...w };
}

export function restartWorkspace(id: string): VM | undefined {
  tickTransitions();
  const w = workspaces.find((x) => x.id === id);
  if (!w) return undefined;
  w.status = "starting";
  scheduleTransition(id, "running");
  return { ...w };
}

export function deleteWorkspace(id: string): boolean {
  const index = workspaces.findIndex((w) => w.id === id);
  if (index === -1) return false;
  workspaces.splice(index, 1);
  transitions.delete(id);
  return true;
}

export function renameWorkspace(id: string, name: string): VM | undefined {
  const w = workspaces.find((x) => x.id === id);
  if (!w) return undefined;
  w.name = name;
  usedNames.add(name);
  return { ...w };
}

export function duplicateWorkspace(id: string): VM | undefined {
  const original = workspaces.find((x) => x.id === id);
  if (!original) return undefined;
  const name = generateUniqueWorkspaceName(usedNames, rng);
  usedNames.add(name);
  const newId = `vm-dup-${Date.now().toString(36)}`;
  const tpl = templateById(original.templateId);
  const vm: VM = {
    id: newId,
    name,
    ownerId: original.ownerId,
    templateId: original.templateId,
    templateName: original.templateName,
    status: "starting",
    cpu: 0,
    memory: 0,
    disk: 12,
    vcpu: tpl.vcpu,
    memoryGb: tpl.memoryGb,
    diskGb: tpl.diskGb,
    region: original.region,
    hourlyCost: original.hourlyCost,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    isIdle: false,
  };
  workspaces.unshift(vm);
  scheduleTransition(newId, "running");
  return { ...vm };
}

export function buildWorkspaceMetrics(
  id: string,
  range: WorkspaceMetricsRange
): WorkspaceMetrics | undefined {
  const w = workspaces.find((x) => x.id === id);
  if (!w) return undefined;
  const end = new Date();
  const cfg = range === "1h" ? { interval: 5, count: 12 } : { interval: 15, count: 96 };
  const intensity = Math.max(w.cpu, 5);
  const memoryIntensity = Math.max(w.memory, 5);
  return {
    range,
    cpu: buildShapedSeries(end, cfg.interval, cfg.count, intensity, 4),
    memory: buildShapedSeries(end, cfg.interval, cfg.count, memoryIntensity, 5),
  };
}

export function buildFleetUtilization(
  range: FleetUtilizationRange
): FleetUtilization {
  const end = new Date();
  const cfg = RANGE_CONFIG[range];
  const agg = aggregateRunning();
  const cpuIntensity = Math.max(agg.cpu, 12);
  const memoryIntensity = Math.max(agg.memory, 18);
  return {
    range,
    cpu: buildShapedSeries(end, cfg.intervalMinutes, cfg.count, cpuIntensity, 3),
    memory: buildShapedSeries(end, cfg.intervalMinutes, cfg.count, memoryIntensity, 3.5),
    distribution: computeDistribution(),
    costByTemplate: computeCostByTemplate(),
  };
}

export function buildAdminOverview(): AdminOverview {
  tickTransitions();
  const agg = aggregateRunning();
  const idle = workspaces.filter((w) => w.isIdle);
  const estimatedMonthlyWaste = Number(
    idle.reduce((acc, w) => acc + w.hourlyCost * 24 * 30, 0).toFixed(2)
  );
  const projected = Number((agg.hourly * 24 * 30).toFixed(2));
  return {
    runningCount: agg.count,
    totalCount: workspaces.length,
    activeUsers: activeUserCount(),
    hourlyCost: agg.hourly,
    monthToDateCost: Number((agg.hourly * 24 * 18).toFixed(2)),
    projectedMonthlyCost: projected,
    aggregateCpu: agg.cpu,
    deltas: {
      runningCount: syntheticDelta(2, 4.9),
      activeUsers: syntheticDelta(1, 6.7),
      hourlyCost: syntheticDelta(0.32, 5.8),
      monthToDateCost: syntheticDelta(184, 8.4),
      projectedMonthlyCost: syntheticDelta(212, 5.2),
      aggregateCpu: syntheticDelta(-1.4, -3.1),
    },
    waste: {
      idleCount: idle.length,
      estimatedMonthlyWaste,
    },
    aggregateUtilization24h: {
      cpu: buildShapedSeries(new Date(), 15, 96, cpuIntensityOrDefault(agg.cpu), 3),
      memory: buildShapedSeries(
        new Date(),
        15,
        96,
        cpuIntensityOrDefault(agg.memory),
        3.5
      ),
    },
  };
}

function cpuIntensityOrDefault(value: number): number {
  return Math.max(value, 12);
}

export function suggestWorkspaceName(): string {
  return generateWorkspaceName(rng);
}
