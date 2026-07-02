# Ascendra Workspaces

Take-home for the Product Design Engineer role. Cloud dev environment platform: developer machines, admin fleet management, all wired to a mock backend.

**Live:** https://ascendra-workspaces-take-home.vercel.app
**Repo:** this one.
**Demo:** Alex Morgan is auto-signed in with both engineer and admin roles. Everything is mocked.

## Stack

- Next.js 15 App Router, TypeScript strict
- Tailwind v4, shadcn/ui primitives
- TanStack Query, MSW for the mock backend
- Recharts for visualizations
- Space Grotesk + JetBrains Mono
- Vercel deployment

## Run locally

```bash
pnpm install
pnpm dev
```

Then http://localhost:3000. Everything runs off MSW; no external services required.

---

## How I read the brief

The brief has one implicit tension worth naming up front: two audiences with different mental models sharing one product.

**Developers** want a fast, uncluttered surface to reach their workspace. They don't care about the fleet. They care about "is my machine running, is it responsive, how do I connect?"

**Admins** want the opposite — density, tables, actionable insight into money and utilization. They care about the fleet, not individual machines.

Building a single dashboard that serves both means one of two failure modes: over-simplify and lose admin depth, or over-instrument and drown developers in metrics they don't need. I chose to separate the two experiences by URL and layout register while keeping the same design system so it still reads as one product.

The second implicit ask: the brief lists a lot of admin capabilities (utilization visualization, distribution, templates, policies, per-user analysis...). Trying to build all of them in 4–6 hours would produce shallow versions of each. I picked a smaller set to execute at real quality — waste-first admin overview, master-detail inventory, distribution as a decision surface — and left the rest with honest notes.

---

## Key decisions

### One product, two registers

- **Developer surface** at `/workspaces` uses master-detail with a permanent right panel showing full workspace context. Fewer surfaces, direct action, roomier spacing.
- **Admin surface** at `/admin/*` uses a sub-nav (Overview / Workspaces / Utilization / Templates) with denser tables and more chart surface.

Both share typography, spacing grid, radii, and the cool blue accent — they read as one system. But content density and interaction rhythm differ because the users differ.

### Waste-first admin overview

Most admin dashboards open with a metrics grid. That's a passive read. I opened `/admin` with a single-line waste insight: **"12 idle workspaces wasting ~$346/month · Review →"**

Admins visit the utilization page with one goal: find the money leak. Surface that first, with the action attached. Metrics come below for context. The waste card is what pays for the whole tool.

### Distribution as a decision surface, not a chart

The CPU distribution card on `/admin/utilization` started as five horizontal bars — accurate but hard to read. I rebuilt it as a hybrid: **vertical histogram with three semantic zone bands (IDLE / HEALTHY / NEAR CAP)** plus three actionable summary rows below.

Bimodal shape (some idle, some hot) is visible in one glance. The three summary rows give the three actions: stop idle workspaces (~$1,470/month recoverable), do nothing (healthy), consider larger templates (near capacity). Chart plus decision surface in one view.

### Three connect methods, not one

The brief mentions "Open in IDE." Coder, Gitpod, Codespaces all support at least three: browser IDE, VS Code Desktop with Remote SSH, plain SSH. Locking developers into browser-only would be a real product regression. I show all three via a popover on the primary Open action.

### State as source of truth, URL as mirror

Selection state on both developer and admin master-detail lives in React state. The URL param (`?w=<id>`, `?t=<id>`) is mirrored via `window.history.replaceState` in an effect. A `popstate` listener syncs state back when the browser back/forward changes the URL.

This bypasses Next.js router coalescing entirely. Rapid clicks (I tested with 8 clicks in 40ms) never drop selections. Without this, the router batched replaces and occasionally dropped the whole batch — the panel just wouldn't update. Not a design decision per se, but the kind of thing that shows up as "the app feels laggy" in real product review, and I wanted it fixed properly.

### Palette diverged from my portfolio system

I reuse the systemic layer from my personal design system (typography, spacing grid, radii, transition curves, weight rules) across projects — that's the cross-portfolio signature.

The surface palette here diverged. My reading product uses warm cream surfaces (editorial register). For an operational dashboard, warm cream + cool blue read as a register mismatch. I did a color audit of Integrity — operational tool in an adjacent category — and settled on cool off-white neutrals (`#f7f8fa` page, `#1f242b` text, solid hex borders) plus softened status colors: pinkish red for error instead of pure red, warm orange for pending. Less alarmist, better for a tool you look at all day.

Two products in the same design system can (and should) have different surface treatments. What travels is the underlying rhythm, not the wallpaper.

### Number formatting

Persistent hint on lifecycle transitions ("Starting · ~12s") because "starting" without duration is anxiety. Compact time notation in tables (`13m`, `3h`, `2d`) because "about 3 hours ago" is twenty characters of noise. US number format ($6.44, $2,782) because the product is in USD. Small choices, big cumulative effect on density.

---

## What I intentionally skipped

- **Policies & quotas.** Interesting design surface but rabbit-hole in 4–6 hours. Would need per-team scoping, effective-vs-declared distinction, override rules. Deferred.
- **User and team management.** Same reason. Also felt lower-value than executing the utilization story well.
- **Real backend integration.** Everything runs off MSW handlers. The API surface is designed swap-compatible — the query layer expects HTTP responses, not mocks.
- **Fully audited accessibility.** Semantic markup, `aria-current` on navigation, keyboard-navigable primary flows, adequate contrast. But I haven't done a full VoiceOver pass. That would be day one of production work.
- **Mobile.** Layouts adapt to ~880px viewports (master-detail wraps to single column), but this is a desktop tool. A real mobile experience would need a different information architecture, not a shrunk one.
- **Component tests.** This is a design engineering prototype, not a production module. In a real codebase, I'd write E2E tests for the master-detail selection paths and unit tests for the cost calculations on distribution.

---

## What I'd do next

**Persona switcher.** Alex Morgan has both roles. The current top nav treats developer / admin as sections of one product, but they're two audiences. A segmented mode switcher (`[👤 My workspaces | ⚙️ Admin]`) would frame it correctly.

**Auto-stop policies via distribution.** The utilization distribution and idle indicator naturally point toward a schedule-based auto-stop feature. The 24h chart shows fleet activity dropping to near-zero overnight — that's the feature's value proposition written in the data.

**Idle filter wire-up.** The waste card's "Review →" link should filter the inventory to idle-only. I wired the intent, not the implementation.

**Template usage analytics.** Which templates are most-used, which are stale, which are overpowered for their workload. Would nest inside the templates panel.

**Design notes overlay.** In-product annotations that surface the rationale on hover. Turns the prototype into a walkable case study without leaving the UI.

---

## A note on Claude Code

I used Claude Code as my implementation partner throughout. Every design decision is mine, every product decision is mine. Claude Code handled the code writing, TypeScript wrangling, MSW handler wiring, and a lot of debugging I'd rather not have debugged myself (Next.js router coalescing on rapid replaces; Recharts `ResponsiveContainer` height gotchas). I directed the work through prompts written like design briefs — decisions first, implementation as consequence.

I mention this because it changes how you should read the code. Organizational quality (component structure, typing consistency, data layer discipline) is Claude Code doing what it does well. Product judgment — what's in, what's out, what goes where, why the waste card comes first — is mine. If you want to evaluate my code taste specifically, the `decisions/` folder shows the shape of my prompts.

---

## File layout
```

app/ Next.js App Router (developer)/ Developer surface (admin)/ Admin surface components/ UI components, split by domain lib/ API client, hooks, formatters mocks/ MSW handlers and seed data screens/ Per-screen design specs decisions/ Design decision records notes/ Working notes (mock-data plan, color inventory)

```

---

Live: https://ascendra-workspaces-take-home.vercel.app

Thanks for reading.
