# Developer view — skeleton

The developer surface serves one job: get the developer into their working environment with minimum friction, and surface anything that interrupts that.

Sections live under `/workspaces/*`. Admins see this section too — these are their own VMs, parallel to the fleet view.

## Scenarios this needs to cover

1. **Resume work** on an existing workspace (most common path).
2. **Diagnose** a slow or stuck workspace.
3. **Create** a new workspace from a template.
4. **Step away** — stop manually or let auto-stop kick in, with confidence that unsaved work survives.
5. **Recover** from a failed workspace (error state).
6. **Wait through a long start** — provisioning or cold-start that takes minutes, not seconds. Common enough in the category to design around (community discussions of Codespaces and Coder repeatedly cite multi-minute starts as a top frustration).

These collapse into one screen (`/workspaces`) and one flow (`/workspaces/new`). The standalone `/workspaces/[id]` route is retired — it now redirects to `/workspaces?w=[id]`, and the detail lives inside the always-visible right-hand panel.

## Screen — Workspaces (`/workspaces`)

Home page for the developer. First view after sign-in. Master-detail layout — the workspace list is a permanent 320px left column, the detail sits in a right panel that fills the remaining width and is always visible.

Selection is a URL param: `/workspaces?w=vm-acting-1`. On page load, if `?w=` is present and valid, that workspace is selected; otherwise the first workspace in the list. If the list is empty, the empty state replaces both columns.

### Left column — compact card list

Header row above the list: "Workspaces" label on the left, "+" icon button on the right (new workspace). 1px bottom border, sits flush with the first card.

One card per row. Padding 12/14, gap 6 between cards, `--radius-md` corners.

Content per compact card:
- **Row 1** — workspace name (mono, `--text-sm`, weight 500) + status pill on the right
- **Row 2** — template name (`--text-xs`, `--text-tertiary`) with " · Idle 38h" as an inline text modifier in `--status-idle` when applicable (idle is NOT a pill — see the rename note below)
- **Row 3** — one 16px `UsageCircle` (same threshold coloring as the panel; value hidden at that size) + "CPU 34%" text

No memory, disk, or action buttons at this altitude — the panel handles all of that.

Selected state: border becomes `--accent` (1px, not thicker), background gets a very light tint via `color-mix(in oklab, var(--accent) 5%, transparent)`.

Hover state (unselected): background swaps to `--surface-secondary`, cursor is pointer.

Right-click any compact card opens a context menu with **Rename / Duplicate / Copy ID / Delete** — same items the panel kebab shows, backed by the shared `useWorkspaceActionsState`.

### Right column — detail panel

Layout top to bottom (no section titles inside, apart from the collapsible logs):

**Header block.** Workspace name in mono, `--text-2xl`, weight 500. Status pill sits inline to the right, followed by " · Idle 38h" text modifier when applicable. Below the name row: template · region · provisioned date, joined by " · " separators, all in `--text-sm`, `--text-tertiary`.

**Actions row.** One horizontal row of buttons, aligned left. Same state machine described below.

**Metadata strip.** Single horizontal row with vertical dividers:
- Uptime (relative — "3h 14m")
- Session cost (`--text-md`, JetBrains Mono — the emphasised value)
- Hourly cost (`--text-xs`, `--text-tertiary`)

Uptime is "—" when the workspace is stopped.

**Current usage.** Three 56px `UsageCircle`s (CPU / Memory / Disk) in a row inside a bordered strip.

**Metrics charts.** Two-column grid — CPU on the left, Memory on the right. Range toggle (1h / 24h) sits in the section's own header (unchanged from before).

**Logs.** Collapsible, closed by default (open by default when the workspace is in error).

### Empty state (panel)

When no workspace is selected — the list is empty of a fallback for `?w=` — the panel shows a centered empty state: a small icon (Lucide `LayoutGrid`), "Select a workspace" headline, and a one-line hint below in `--text-tertiary`.

### State machine (applied to the panel actions row)

| Status | Primary | Sec 1 | Sec 2 | Kebab |
|---|---|---|---|---|
| running | Open (opens Connect popover) | Stop | Restart | Rename / Duplicate / Copy ID / Delete |
| stopped | Start | — | — | Rename / Duplicate / Copy ID / Delete |
| starting | Starting · ~12s (disabled, live countdown) | — | — | — |
| stopping | Stopping · ~12s (disabled, live countdown) | — | — | — |
| error | Restart | Recreate | — | Rename / Duplicate / Copy ID / Delete |

Rules:
- Exactly one primary button visible at a time.
- Secondary actions are HIDDEN (not disabled) during transitions to avoid a wall of dimmed controls.
- The kebab is hidden during transitions; it comes back once the state settles.
- Open behaviour: the button opens a Popover anchored below it with the three connect methods (VS Code desktop / Open in browser / Copy SSH). The popover closes on selection or click outside. There is no route change on Open.

Persistence hints (per decision 04) surface as tooltips on Stop / Restart / Recreate, and as an inline confirmation modal for Delete (typed-name verification).

## Rename — idle is text, not a pill

Idle stops being a badge. It becomes an inline text modifier that follows the status pill wherever the status pill appears:

`● Running · Idle 38h`

The status pill remains a pill (green for Running, etc.). The " · Idle 38h" text sits next to it in `--status-idle`, no background, no border, no icon. Same rule on the compact card and in the panel header. The admin detail page follows the same rule.

## Flow — Create new workspace

Triggered by "+" in the list header. Modal or route (`/workspaces/new`).

1. Pick a template — card grid with name, base image, specs, preinstalled tools.
2. Name the workspace — autogenerated suggestion, editable.
3. Confirm.
4. Redirect to `/workspaces?w=[new-id]`; status passes through `starting` to `running`.

Provisioning a new VM takes longer than starting an existing one — typically minutes for first launch. This is reflected as a longer `starting` phase, not a separate state, but the UI communicates progress: a labelled step indicator ("Provisioning VM → Pulling image → Installing dependencies → Starting services") plus elapsed time. The user can navigate away and return; on return, selection is restored via `?w=`.

## Lifecycle transitions

Not a screen — UI behaviour shared by both the compact card row (status pill flips) and the panel actions row (state machine table above).

- Optimistic update — card AND panel reflect intended status immediately on click.
- During `starting` / `stopping`, the panel shows the disabled countdown button (`Starting · ~12s`, decrementing every second; `almost done…` once the expected 12s window is past). The compact card's status pill shows the transitional variant with soft pulse.
- Buttons that don't apply in the transitional state are hidden, not disabled.
- On success, status moves to the terminal state; kebab and secondary actions reappear.
- On failure, status flips to `error` with a brief reason and a retry action.

## Component inventory

- **StatusBadge** — visual treatment per status: running (green), stopped (gray), starting / stopping (amber with motion), error (red). Never carries idle.
- **IdleIndicator** — inline text " · Idle N" in `--status-idle` when `workspace.isIdle` is true. No background, no border. Lives at `components/workspace/idle-pill.tsx` (path kept from the pill it replaces to avoid rename churn).
- **UsageCircle** — SVG donut sized 16 / 36 / 56px, threshold-coloured (neutral < 60, amber 60–85, red ≥ 85). 16px on the compact card (no value inside), 56px in the panel usage row (value inside).
- **CompactWorkspaceCard** — the left-column row: name + status + template · idle text + one 16px CPU circle. Wrapped in `WorkspaceActionsContext` so right-click opens the shared menu.
- **WorkspacePanel / WorkspacePanelEmpty / WorkspacePanelSkeleton** — right-column contents in the three states.
- **LifecycleControls** — the state-machine actions row. Takes an optional `onOpen` render prop that returns the running-state primary — the developer surface plugs `ConnectPopover` in.
- **ConnectPopover** — Popover anchored on the Open button; renders the three connect methods (VS Code desktop / Open in browser / Copy SSH).
- **WorkspaceActionsDropdown / WorkspaceActionsContext** — kebab and right-click wrappers around the shared `useWorkspaceActionsState` (Rename / Duplicate / Copy ID / Delete).
- **useTransitionProgress** — hook that returns `secondsRemaining` / `almostDone`; backed by a module-level Map + 1s interval.
- **TemplateCard** — used in flow 1; reused in the admin templates view.

## States to handle

For every data-driven surface:
- Loading — skeleton, not spinner (the panel has its own skeleton variant)
- Empty — panel empty state when nothing is selected; page-level empty when the workspace list is empty
- Error — data fetch failed; distinct from workspace-error status
- Transitional — panel actions row shows the disabled countdown button

## Open questions

- Does cost appear on the compact card, or only in the panel? Current plan: panel only — cost is mostly an admin concern and would noisy up a 3-line card.
- Does the developer ever see other people's workspaces? Default no; revisit if admin and developer roles share screens.
