# Ascendra Workspaces

A take-home for a Product Design Engineer role at Ascendra Networks: a thin slice of a managed remote-development-environment platform — the developer's home for their own VMs and the admin console for the fleet — built end-to-end with TypeScript, a mock backend, and a design system.

> **Deployed:** _add Vercel URL after deploy_

---

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

- Node 22 (`.nvmrc`-friendly; tested on 22.22)
- `pnpm` 10+
- Optional: `pnpm build && pnpm start` for the production build (same MSW mock baked in)

The acting user is seeded as **Alex Morgan** (admin) so both surfaces are immediately demoable. See [Demoing both roles](#demoing-both-roles) below to switch to the engineer surface.

## The product

Ascendra Workspaces is a managed CDE platform — like Coder or GitHub Codespaces — for engineering organizations that need to give developers consistent, remote dev environments without manual VM ops. The product has two distinct surfaces under one shell:

- **Developer surface** (`/workspaces/*`) — minimum friction to resume work, surface anything that interrupts it, and recover from failures.
- **Admin surface** (`/admin/*`) — operational console that surfaces waste, lets the admin act on it, and manages templates + fleet inventory + utilization.

Role determines which surfaces are visible in the top nav. There's no role switcher; that's a deliberate IA choice ([decision 01](decisions/01-role-based-navigation.md)).

## Information architecture

| Route | Surface | Purpose |
|---|---|---|
| `/login` | Auth | Sign-in stub |
| `/` | — | Role-gated redirect to `/admin` or `/workspaces` |
| `/403` · `/404` | — | Forbidden / unknown route |
| `/workspaces` | Developer | List of the signed-in user's workspaces |
| `/workspaces/new` | Developer | Template picker → name → confirm |
| `/workspaces/[id]` | Developer | Connect, metrics, lifecycle, metadata |
| `/admin` | Admin | Overview: waste card, hero metrics, 24h utilization |
| `/admin/workspaces` | Admin | Fleet inventory: filters, sort, bulk actions |
| `/admin/workspaces/new` | Admin | Provision workspace for a teammate |
| `/admin/workspaces/[id]` | Admin | Drill-down with owner info + admin actions |
| `/admin/utilization` | Admin | Aggregate trends + CPU distribution + cost by template |
| `/admin/templates` | Admin | Templates list with usage stats |
| `/admin/templates/new` · `/[id]` | Admin | Template create + edit |

Reserved but out of scope for this exercise: `/settings`, `/admin/policies`, `/admin/users`, `/admin/audit`. See [future considerations](notes/future-considerations.md).

Full file: [sitemap.md](sitemap.md).

## Key product decisions

Each decision lives in [`decisions/`](decisions/) as a short doc with context, options considered, the choice, and rationale.

1. **[Role-based navigation](decisions/01-role-based-navigation.md)** — no role switcher, no login prompt. The user's role determines which sections appear in nav. Engineers see only Workspaces; admins see Workspaces + Admin. Direct engineer hits to `/admin/*` return 403, not a redirect, because the route shouldn't appear to exist for them.
2. **[Multiple connect methods](decisions/02-connect-methods.md)** — the connect affordance exposes three methods (VS Code Desktop, browser IDE, raw SSH) at the same level of visibility. Auto-detection silently chooses for the user; a single button forces a default the product has no basis to pick.
3. **[Actionable waste over raw metrics](decisions/03-actionable-waste.md)** — admin overview leads with `X idle workspaces, $Y wasted` as a hero card. Aggregate utilization is supporting context, not the primary surface. Frames Ascendra as a tool that **solves** waste, not one that helps you find it.
4. **[State and persistence guarantees](decisions/04-state-and-persistence.md)** — every lifecycle action surfaces its persistence behaviour at the point of click (stop preserves state, restart drops processes, recreate keeps home directory, delete destroys everything). Typed-name confirmation modal on delete.
5. **[ReMargin design direction](decisions/05-design-direction.md)** — adopt the existing ReMargin design system (Space Grotesk + JetBrains Mono, weights 400 / 500 only, warm-cream light / near-black dark, coral accent, capped 600+ weights) as the foundation. Filter out reader-specific tokens. Extend with operational primitives: status semantics, data-viz palette, hero metric typography, table density spec.
6. **[Tech stack](decisions/06-tech-stack.md)** — Next.js (App Router) + React 19 + TypeScript strict, Tailwind v4 CSS-first config, restyled shadcn/ui primitives, TanStack Query for server state, MSW for a real mock backend that ships with the deploy, Recharts for charts, Zod for runtime validation at the API boundary.
7. **[Data layer](decisions/07-data-layer.md)** — all data flows through typed API client → TanStack Query hooks → components. Hierarchical query keys for prefix invalidation. Per-resource polling intervals. Lifecycle mutations use optimistic updates with rollback on error.

## Design direction

The visual language is shared with my [ReMargin case study](https://mihhailovski-product-designer.vercel.app/case/remargin) — same fonts, same warm-cream and near-black surfaces, same coral accent, same capped weight scale. This is intentional: a personal design system applied across two projects reads as "this person has voice"; two projects in unrelated languages read as "this person executes briefs." The system is extended here for operational tooling — status semantics independent of the brand accent, hero metric typography in JetBrains Mono 500 at 48px, dense table spec for the admin inventory.

Sentence case throughout. Font weights 400 and 500 only — never 600 or 700. Motion is opacity + transform, capped at 150ms, with a `prefers-reduced-motion` clamp.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) | Route groups for the two surfaces, integrated routing, native Vercel deploy, MSW boots in a single process |
| Language | TypeScript strict | `noImplicitAny` + `noUncheckedIndexedAccess` on top of strict |
| Styling | Tailwind v4 + restyled shadcn/ui | CSS-first `@theme` block maps directly to ReMargin tokens |
| Server state | TanStack Query | Industry default; handles loading / error / refetch / optimistic / invalidation |
| Mock backend | MSW (Mock Service Worker) | Intercepts real `fetch` — UI code doesn't know the backend is fake; ships with the deploy |
| Validation | Zod | Runtime parse of every API response; types via `z.infer<>` |
| Charts | Recharts | Restylable to the design direction, minimal chrome possible |
| Icons | Lucide | Outline-only, 1.5px stroke |
| Dates | date-fns | Tree-shakeable, no globals |
| Deploy | Vercel | One-click for Next.js |

Full rationale: [decisions/06-tech-stack.md](decisions/06-tech-stack.md).

## Data layer notes

- **Domain shapes** live in [`lib/domain/schemas.ts`](lib/domain/schemas.ts) as Zod schemas (`vmSchema`, `vmTemplateSchema`, `userSchema`, `fleetUtilizationSchema`, etc.). Types are derived via `z.infer<>` in [`lib/domain/types.ts`](lib/domain/types.ts).
- **API client** at [`lib/api/client.ts`](lib/api/client.ts) is a thin `fetch` wrapper that always parses through a Zod schema. `ApiError` carries status + optional code and is thrown on non-2xx. Per-resource modules live next to it.
- **Hooks** at [`lib/hooks/*`](lib/hooks/) follow the query-key convention from decision 07. Polling intervals: workspaces list 10s, workspace detail 5s when stable and 2s when starting/stopping (read from cached status), admin overview 30s, fleet inventory 15s. Templates and utilization don't poll.
- **Optimistic updates** for every lifecycle mutation: snapshot list + detail in `onMutate`, apply the optimistic status, rollback in `onError` with a sonner toast, invalidate workspaces + admin fleet + overview in `onSettled` so the admin surface stays in sync with developer actions.
- **Mock backend** at [`mocks/`](mocks/) seeds 20 users, 5 templates, and 60 workspaces with the distributions in [`notes/mock-data-plan.md`](notes/mock-data-plan.md): 42 running (12 idle, ~$346/month wasted), 14 stopped, 2 starting, 1 stopping, 1 error; CPU bins of 14/8/5/9/6 for the bimodal distribution chart; shaped-sine time-series with a daily rhythm (low overnight, peak 11-17). Latency simulated at 100-400ms.
- **Lifecycle transitions** are real: triggering `/start` flips status to `starting`, then to `running` after an 8-15s timer baked into the mock store. The 2s polling on transitional detail catches the transition without the user refreshing.

## Demoing both roles

The default seeded user is **Alex Morgan** (admin) so both surfaces are demoable on first load. To preview the engineer experience, set the localStorage override the API client picks up:

```js
// in DevTools console
localStorage.setItem("ascendra-acting-user", "user-sam");
location.reload();
```

You'll see the admin section disappear from the top nav (engineers see only Workspaces) and the workspaces list empty (Engineer Sam owns nothing in the seed) — the empty state shows the onboarding affordance from `screens/developer.md`.

To switch back:

```js
localStorage.removeItem("ascendra-acting-user");
location.reload();
```

Mechanically: the API client at [`lib/api/client.ts`](lib/api/client.ts) reads the `ascendra-acting-user` localStorage key on every request and injects an `X-Acting-User` header. The MSW handler at [`mocks/handlers.ts`](mocks/handlers.ts) reads that header in `/api/me` and `/api/workspaces` to resolve the acting user. No rebuild required.

## What I'd add with more time

Conscious gaps, documented to show awareness of where the category is heading. Full text in [notes/future-considerations.md](notes/future-considerations.md).

- **Prebuilds + template caching** — CI-triggered build that pre-installs deps and caches the image so new workspaces start in seconds, not minutes. The single biggest lever on the slow-start problem.
- **Per-PR ephemeral workspaces** — workspaces tied to a branch, provisioned when a PR opens and destroyed when it merges. Different ownership and cost attribution from persistent personal workspaces.
- **AI agents as workspace owners** — Coder and others launched governance features for this in 2025/26. Implies extending `User.role` to include `agent`, with different policies (cost ceilings, idle thresholds, audit requirements per agent type).
- **Multi-region** — `region` is a static descriptive field today. In production it drives placement, latency, compliance.
- **Audit log** — chronological record of who created / started / stopped / deleted / reassigned each workspace.
- **Policies and quotas as a first-class section** — the idle threshold powering the waste card is hardcoded; in production it's a tunable policy attached to a team.
- **Users and teams management** — owner info is read inline on inventory rows; a dedicated section with per-user VM count, utilization, total cost.
- **Notification surface** — when an admin provisions a workspace for a developer, when auto-stop fires, when a workspace errors out.
- **Real-time updates** — polling is enough for this exercise; WebSocket or SSE for status transitions in production.

## Repository layout

```
app/                            # Next.js App Router
├── (auth)/                     # login, 403, 404
├── (developer)/workspaces/     # list, detail, new
├── (admin)/admin/              # overview, workspaces, utilization, templates
├── error.tsx                   # global error boundary
├── not-found.tsx
├── providers.tsx               # QueryClient + ThemeProvider + MSWProvider + Tooltip + Toaster
└── globals.css                 # design tokens via @theme

components/
├── admin/                      # hero metric, waste card, table, bulk bar, distribution chart, owner card, admin actions, template form/list
├── workspace/                  # status badge, usage metric, lifecycle controls, connect panel, card, template card, metrics chart, metadata, idle hint, logs, starting progress
├── layout/                     # top nav, sub nav, error boundary, centered card, route placeholder
└── ui/                         # shadcn primitives, restyled

lib/
├── api/                        # client.ts (typed fetch + Zod) + per-resource modules
├── hooks/                      # TanStack Query hooks + key factory
├── domain/                     # Zod schemas + inferred types
└── utils/                      # workspace name generator (Coder-style adjective-animal-NN)

mocks/                          # MSW handlers + seed data + service worker
```

## Time spent

About **6 hours** end-to-end, split across the eight phases from [`notes/execution-plan.md`](notes/execution-plan.md):

| Phase | Goal | ~time |
|---|---|---|
| 1 | Next bootstrap, tokens, theme toggle, route shell | 30 min |
| 2 | Zod schemas, MSW handlers, mock data per plan | 60 min |
| 3 | Typed API client, hooks with polling + optimistic | 45 min |
| 4 | Developer surface end-to-end | 75 min |
| 5 | Admin overview + fleet inventory | 75 min |
| 6 | Utilization + templates + admin detail + provision | 45 min |
| 7 | States polish, motion, a11y baseline | 30 min |
| 8 | README + deploy | 20 min |

## Planning artifacts

This repo opens with the planning pack I wrote before code:

- [`sitemap.md`](sitemap.md) — every route in scope
- [`decisions/`](decisions/) — seven decision docs (01-07)
- [`screens/developer.md`](screens/developer.md), [`screens/admin.md`](screens/admin.md) — skeleton specs per surface
- [`notes/mock-data-plan.md`](notes/mock-data-plan.md) — seed distribution plan
- [`notes/future-considerations.md`](notes/future-considerations.md) — conscious gaps
- [`notes/execution-plan.md`](notes/execution-plan.md) — eight-phase roadmap
