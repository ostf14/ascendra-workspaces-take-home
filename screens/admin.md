# Admin view — skeleton

The admin surface serves one job: surface waste and operational problems across the fleet, and give the admin direct controls to act on them.

This is a different genre from the developer view. Developer = workplace, low object count, generous spacing. Admin = operational console, high object count, density matters. Reference frame is Datadog / Linear inbox / AWS console — not Vercel projects.

Sections live under `/admin/*`. Only users with `role: "admin"` see this section (see decision 01).

## Scenarios this needs to cover

1. **Morning health check** — 30-second scan, anything on fire.
2. **Cost investigation** — finance flagged a spike, find the leak.
3. **Developer complaint** — diagnose and intervene on one specific workspace.
4. **New template request** — create or edit a template.
5. **Pattern analysis** — fleet utilization over time and across the fleet.
6. **Onboarding a new developer** — pre-provision a workspace for someone who hasn't logged in yet, so they can start working on day one. This is the single most cited reason organizations buy CDE platforms (time-to-first-commit reduction), so the admin needs a direct affordance for it.

## Screen 1 — Overview (`/admin`)

Home page for the admin. First view after sign-in.

Layout (top to bottom):

1. **Waste insight card** — full-width, sticks to the top of the content area. Two-line anomaly layout: line 1 states the finding in bold (`N idle workspaces wasting ~$X/month`) with an inline `Review →` text link to the filtered inventory; line 2 is a subtle explanatory sentence (`Stop them to recover the spend. Files and settings are preserved.`). No border, no leading icon square — just an `--accent-muted` background at `--radius-md`. The earlier iteration used a coral outline + alarm-clock icon + filled CTA button; that stack read as three signals for one message, so it was collapsed to a single tinted plate with an inline text link. Positive empty state when zero idle stays as-is (leaf icon + reassuring copy on a neutral elevated surface).
2. **Split row** — two equal columns, 16px gap. Left column: two grouped metric cards stacked vertically (16px gap between them). Right column: aggregate utilization chart, `align-self: stretch` so it fills the left column's combined height.

The six loose `HeroMetric` cards from the earlier iteration were regrouped into two semantic cards, because the six numbers belong to three different stories and grouping surfaces that. `HeroMetric` retired; `MetricGroupCard` replaces it.

**Cost this month** card (3 columns, thin vertical divider between each):
- Hourly · Month to date · Projected — each with `--text-xs` tertiary label, `--text-2xl` (32px) JetBrains Mono weight 500 value, and the shared delta strip below.

**Fleet health** card (2 columns, thin vertical divider between each):
- Running VMs (as `running / total`) · Active users — same visual treatment as Cost.

**Aggregate utilization** card (right column):
- Header row: title + legend dots (CPU · Memory).
- Recharts area chart, Y-axis 0–100 with 25% ticks, X-axis time-of-day labels. `align-self: stretch` on the grid so the chart card fills the left column's combined height.

The **Aggregate CPU** hero number was retired. The chart already carries the same information more richly (over time, alongside memory); duplicating it as a standalone percentage next to the chart was redundant. Anyone who wants the current value reads the rightmost point of the chart.

All three cards share `--surface-secondary` background, `--radius-md`, and 24px padding — same treatment the developer workspace panel uses for its stats plates, so the two surfaces read as one design language.

Below 1200px viewport, the outer grid collapses to a single column: waste card → Cost card → Fleet health card → Chart card, all stacked.

## Screen 2 — VM Inventory (`/admin/workspaces`)

The admin's workhorse. Master-detail layout — table on the left (2/3), workspace panel on the right (1/3). No standalone route for a single VM; the standalone `/admin/workspaces/[id]` redirects into this page with `?w=<vm-id>` selected.

**Page chrome:**
- Search by name, owner email, template
- Filters: status, template, owner, idle-only toggle
- Bulk-action bar — appears on row selection, sticky to top (Stop / Restart / Delete)

**Table (left 2/3):**
- Columns: checkbox · Name · Owner (email only, mono, `--text-secondary`) · Template · Status · CPU · RAM · Disk · Last active (compact, mono, right-aligned) · kebab
- Owner name was dropped from the row after the master-detail layout landed. The right panel already surfaces the owner's name + email, so repeating both in every row was doubling the vertical noise for no extra information at the row level. Sort-by-owner now compares by email string.
- Last-active values use the shared `formatCompactRelative` (`now` / `Nm` / `Nh` / `Nd` / `Nw` / `>1mo`). date-fns's verbose `"about 3 hours ago"` broke column alignment and wrapped on narrow viewports. Mono + tabular-nums keeps the column vertically aligned.
- Hourly cost is NOT a column — it moved into the right panel where it sits next to the derived Session cost.
- Sortable on every column. Default sort: status, then hourly cost descending.
- Row-click selects the workspace and updates the URL to `?w=<vm-id>` — no route change. Selected row: subtle `--accent-muted` background + 2px left inset accent border. Checkbox and kebab cells stop propagation so those still open menus / toggle selection rather than swapping the panel.

**Panel (right 1/3, min-width 380px):**
Top to bottom:
- Header: mono workspace name + status pill + idle text modifier if applicable
- Sub-header: `templateName · region · Provisioned MMM d, yyyy` (`--text-sm`, tertiary)
- Admin actions row: Force-stop · Recreate · Reassign owner · Delete (Delete uses destructive styling; Force-stop is disabled when stopped or stopping)
- Owner card: user icon in a circle + name + email + Email link
- Live usage plate: three 56px `UsageCircle`s (CPU / Memory / Disk) on a `--surface-secondary` plate
- Cost plate: Session cost + Hourly cost, both `--text-base` mono, weight 500
- Recent activity: last 5 lifecycle events with relative timestamps. Derived from the workspace's `createdAt` / `lastActiveAt` / current status — no activity-log endpoint exists in the mock store yet, so the list is synthesized deterministically from the VM record.

**Panel empty state:** when no workspace is selected, the panel shows a centered "Select a workspace / Pick a row from the table to see details and take action." with a `MousePointerClick` icon in `--text-tertiary`.

Selection state uses the same state-as-truth + `history.replaceState` mirror pattern as the developer surface (see screens/developer.md) — rapid row-clicks won't drop panel updates via Next.js router coalescing.

**Sticky panel:** the right column is `position: sticky` with `top: 112px` (top-nav 56px + admin sub-nav 44px + 12px breathing room) and `max-height: calc(100vh - 136px)` with internal overflow-y. As the admin scrolls through a long inventory table, the selected workspace's detail panel stays pinned within the viewport; the panel's internal content scrolls if it exceeds the available height. Filter row and page header are not sticky.

Below ~1200px viewport width, the grid collapses to a single column: table on top, panel below. The sticky positioning has no effect in single-column mode because the panel sits below the table in normal flow.

## Screen 3 — Fleet Utilization (`/admin/utilization`)

Analytical view. Where the admin goes to understand patterns, not to act.

- Time range selector: 1h / 24h / 7d / 30d
- Aggregate CPU and memory line chart over the selected range
- **Distribution chart** — histogram of current CPU% across all running workspaces. Not a pie chart (see decision 03). Reveals "half the fleet is idle, half is hot" vs "everything sits at 50%" — these look identical in an aggregate average.
- Optional: cost breakdown by template

## Screen 4 — Templates (`/admin/templates`)

List or grid of all templates.

**Per template card:**
- Name, base image, specs, preinstalled tools
- Usage stats: currently running workspaces, monthly cost contribution
- Edit action

**"New template"** button → create form (`/admin/templates/new`).

**Form fields** map directly to `VMTemplate`: name, description, base image, vCPU, memory GB, disk GB, preinstalled tools.

## Drill-down — Admin VM detail (`/admin/workspaces/[id]`)

Reached from inventory. Not in primary nav.

Extends developer detail with:
- **Owner info** — name, email, contact link (mailto or Slack handle)
- **Full logs** — expanded by default
- **Admin actions** — force-stop, recreate, delete, reassign owner

Same metrics, lifecycle controls, and metadata as the developer detail page. Conceptually one component with an `isAdmin` slot.

## Flow — Provision workspace for a developer

The admin equivalent of the developer's create flow, with one extra step. Triggered from inventory ("New workspace") or from a template card ("Provision for user").

1. Pick a user — searchable dropdown of org members.
2. Pick a template — same template picker as the developer flow.
3. Name the workspace — autogenerated suggestion, editable.
4. Confirm.
5. Workspace appears in inventory with status `starting`, owned by the chosen user. The user receives it on next login (or via notification, out of scope for this exercise).

This closes scenario 6 (onboarding). It's also the only path by which an `engineer` ends up with a workspace they didn't create themselves — useful for first-day setup or for short-lived "you'll need this for the next sprint" provisioning.

## Component inventory (admin-specific)

- **MetricGroupCard** — surface-secondary plate that hosts a row of related metrics (Cost this month, Fleet health) with a small section header, per-column labels + `--text-2xl` mono values + delta strip, thin vertical dividers between columns. Replaces the earlier single-metric `HeroMetric` primitive.
- **WasteInsightCard** — full-width two-line anomaly plate (`--accent-muted` background, no border, no icon) with an inline `Review →` text link to the filtered inventory; positive empty state when no waste
- **AdminVMTable** — dense table, sortable columns, row selection
- **BulkActionBar** — appears on selection, sticky to top of table
- **DistributionChart** — histogram of resource utilization across the fleet
- **TemplateUsageStats** — inline stats on template cards

Shared with developer view: StatusBadge, UsageMetric, LifecycleControls.

## States to handle

Baseline same as developer view: loading (skeleton), empty, error, transitional.

Admin-specific:
- **Zero fleet** — no workspaces exist anywhere. Probably never on a real deployment, but worth handling for first launch. Overview becomes onboarding.
- **Zero idle** — waste card flips to positive empty state.
- **Filter-result empty** — inventory shows "no workspaces match your filters" with a reset button.

## Open questions

- **Idle threshold** — current plan: CPU < 5% AND last_active > 1h AND status running. Defensible default; should be tunable later via policy.
- **Cost truth source** — for this exercise, computed client-side from `hourlyCost * uptime`. In production this is backend-authoritative with line items.
- **Distribution granularity** — histogram bins (0–20, 20–40, etc) or per-VM scatter? Histogram reads faster; outliers can still surface via table sort. Lean histogram.
