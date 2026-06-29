# Execution plan

Eight phases, each a self-contained prompt for Claude Code. Phases have hard dependencies — don't start phase N+1 until phase N's acceptance criteria pass.

**Standing instructions for Claude Code across all phases:**

- Read the referenced decision and screen files **before** writing any code in the phase. They are the authoritative spec.
- Commit after each completed task with a clear message describing the change.
- Don't invent endpoints, route names, status values, or data shapes that aren't in the spec. If something is missing, ask before guessing.
- TypeScript strict — no `any`, no `as unknown as`. Use Zod parsing at the API boundary if a type isn't inferrable.
- Sentence case in all UI strings, no Title Case.
- No 600/700 font weights anywhere. 400 / 500 only.

---

## Phase 1 — Bootstrap

**Goal:** Working Next.js app with full design token system in CSS, light/dark theme toggle, empty route shell. No functionality yet.

**References:** `decisions/05-design-direction.md`, `decisions/06-tech-stack.md`, `sitemap.md`

**Tasks:**

1. Initialize Next.js 15 with App Router, TypeScript strict, no `src/` directory (routes live in `app/`)
2. Install dependencies: `tailwindcss@latest`, `@tanstack/react-query`, `zod`, `msw`, `recharts`, `lucide-react`, `date-fns`, `class-variance-authority`, `clsx`, `tailwind-merge`, `sonner`
3. Configure `tsconfig.json` with `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitAny: true`
4. Install shadcn/ui base primitives: `button`, `input`, `label`, `dialog`, `popover`, `dropdown-menu`, `table`, `tabs`, `badge`, `skeleton`, `select`, `tooltip`, `sonner`
5. Configure Tailwind v4 with CSS-first `@theme` block in `app/globals.css`. Map **every token** from decision 05:
   - Fonts: Space Grotesk (sans), JetBrains Mono (mono)
   - Sizes: 11/13/15/18/24/32, plus new `--text-3xl: 48px`
   - Weights: 400 and 500 only
   - Spacing: 4/8/12/16/20/24/32/40/48/64
   - Radii: 4/8/12
   - Transitions: 100/150/300ms with `ease-out` cubic-bezier
   - Light theme: warm cream surfaces (#fdfcf5 / #f5efdf / #ebe6d6 / #ffffff) + warm text scale
   - Dark theme: near-black (#0f0f11 / #161618 / #1c1e21 / #252627) + white text scale + alpha borders
   - Coral accent: #d97757
   - Status colors: running #10B981, starting/stopping #D97706, error #DC2626, idle #CA8A04
6. Load Space Grotesk and JetBrains Mono from Google Fonts in `app/layout.tsx` using `next/font`
7. Create root providers wrapper (`app/providers.tsx`) with `QueryClientProvider` (TanStack Query) and a theme provider (light default, dark toggle, persists to localStorage)
8. Create `components/layout/top-nav.tsx` — renders `Workspaces` always, plus `Admin` if role is admin (hardcode role as `"admin"` for now, will read from API in phase 3)
9. Create `components/theme-toggle.tsx` — switches between light and dark
10. Create empty placeholder pages at every route in `sitemap.md`. Each page renders just the route path as a heading. Use Next.js route groups: `app/(auth)/`, `app/(developer)/`, `app/(admin)/`

**Acceptance:**

- `npm run dev` boots without errors
- All sitemap routes resolve to a placeholder page
- Theme toggle switches the entire app between light cream and dark themes
- Fonts loaded — Space Grotesk visible in headings, JetBrains Mono ready for use later
- Top nav shows `Workspaces` and `Admin` links
- Lighthouse accessibility score ≥ 90 on the empty pages (semantic html, focus styles)

**Don't do:**

- Any real data fetching
- Pretty placeholder content — just route names
- Charts, tables, forms, status badges yet
- Real role gating (still hardcoded)

---

## Phase 2 — Domain + mock backend

**Goal:** Full Zod schemas for the domain, MSW intercepting every endpoint the app will ever call, mock data generated with the distributions specified in mock-data-plan.

**References:** `notes/mock-data-plan.md` (authoritative for distributions), `decisions/07-data-layer.md` (file structure)

The brief's starter data shapes (`VM`, `VMTemplate`, `User`, `Policy`, `FleetUtilization`) are the canonical schema — extend but don't change field names.

**Tasks:**

1. Create `lib/domain/schemas.ts` — Zod schemas for `VM`, `VMTemplate`, `User`, `FleetUtilization`. Add `isIdle: boolean` as a derived field on VM (computed by backend, not stored). Status enum: `running | stopped | starting | stopping | error`.
2. Create `lib/domain/types.ts` — re-export `z.infer<>` types for all schemas
3. Create `mocks/data.ts` — generator producing the seed state per `mock-data-plan.md`:
   - 20 users (15 engineers, 5 admins). Acting user is `Alex Morgan`, role admin. Second seeded user `Engineer Sam` for role testing.
   - 5 templates with the usage skew and costs from the plan
   - 60 workspaces total with status mix (42 running / 14 stopped / 2 starting / 1 stopping / 1 error)
   - 12 of running are idle, distributed across 1-6h / 12-48h / 3-5d / 7d+ buckets
   - Bimodal CPU% distribution per the plan's table
   - Memory% correlated with CPU% plus 3 high-memory low-CPU outliers
   - Cost distribution: 10 cheap / 30 standard / 15 medium / 5 expensive
   - Acting admin owns 4 specific workspaces (emerald-panther-54, quiet-fox-12, lonely-otter-89, stale-mountain-03) covering all developer card states
   - Time-series generator: 24h CPU/memory with daily sine pattern (low at night, peak 11-17, weekend baseline) + small jitter. Generator returns 96 points (15-min granularity).
4. Create `mocks/delay.ts` — random 100-400ms latency helper for all handlers
5. Create `mocks/handlers.ts` — REST handlers for:
   - `GET /api/me` — current acting user
   - `GET /api/workspaces` — acting user's own workspaces
   - `GET /api/workspaces/:id`
   - `GET /api/workspaces/:id/metrics?range=1h|24h` — time series
   - `POST /api/workspaces` — create (returns workspace with status `starting`)
   - `POST /api/workspaces/:id/start | /stop | /restart` — lifecycle (returns updated workspace, transitions complete after 8-15s via setTimeout)
   - `DELETE /api/workspaces/:id`
   - `GET /api/admin/overview` — hero metrics, waste card data, 24h aggregate utilization
   - `GET /api/admin/fleet?search=&status=&template=&owner=&idleOnly=&sort=&order=` — fleet inventory with server-side filter/sort
   - `GET /api/admin/utilization?range=1h|24h|7d|30d` — aggregate series + distribution data
   - `GET /api/admin/templates`
   - `POST /api/admin/templates`
   - `GET /api/admin/templates/:id`
   - `PATCH /api/admin/templates/:id`
   - `POST /api/admin/workspaces` — admin provisioning with `ownerId`
   - `GET /api/admin/users` — for owner picker
6. Create `mocks/browser.ts` — `setupWorker(...handlers)` setup
7. Initialize MSW in `app/providers.tsx` — `worker.start()` before first render in dev and production builds

**Acceptance:**

- Open browser devtools → Network → reload page
- Fetch any mock endpoint manually from console — get typed response with realistic shape
- `POST /api/workspaces/:id/start` — workspace status flips to `starting`, then after 8-15 seconds the next `GET` returns `running`
- Time series response has visible daily pattern when plotted in console
- Mutations persist within session — `GET /api/workspaces` after a `DELETE` shows the workspace gone

**Don't do:**

- Hooks layer or actual UI consumption yet
- Optimistic updates
- Pagination (60 is small enough to send everything)

---

## Phase 3 — Hooks + API client

**Goal:** Typed hooks for every endpoint, following query key conventions from decision 07. Components in later phases consume only hooks, never raw fetch.

**References:** `decisions/07-data-layer.md`

**Tasks:**

1. Create `lib/api/client.ts` — thin fetch wrapper that always parses through a Zod schema. Throws `ApiError` on non-2xx.
2. Create `lib/api/workspaces.ts`, `lib/api/templates.ts`, `lib/api/fleet.ts`, `lib/api/users.ts` — endpoint functions per resource
3. Create hooks per decision 07's query key convention:
   - `lib/hooks/use-current-user.ts` — `useCurrentUser()`
   - `lib/hooks/use-workspaces.ts` — `useWorkspaces()`, `useWorkspace(id)`, `useWorkspaceMetrics(id, range)`
   - `lib/hooks/use-workspace-lifecycle.ts` — `useStartWorkspace()`, `useStopWorkspace()`, `useRestartWorkspace()`, `useCreateWorkspace()`, `useDeleteWorkspace()` — all with optimistic updates and rollback
   - `lib/hooks/use-fleet.ts` — `useAdminOverview()`, `useFleetInventory(filters)`, `useFleetUtilization(range)`
   - `lib/hooks/use-templates.ts` — `useTemplates()`, `useTemplate(id)`, `useCreateTemplate()`, `useUpdateTemplate()`
   - `lib/hooks/use-admin-provision.ts` — `useAdminProvisionWorkspace()` (with owner)
   - `lib/hooks/use-users.ts` — `useUsers()`
4. Apply per-resource polling intervals from decision 07 (10s workspaces list, 5s stable detail, 2s transitional detail, 30s admin overview, 15s fleet, no polling for templates/utilization)
5. Implement optimistic update pattern shared by all lifecycle mutations:
   - `onMutate` — snapshot, apply update
   - `onError` — restore snapshot, surface error via `sonner` toast
   - `onSettled` — invalidate the query key(s) affected
6. Replace hardcoded role in `components/layout/top-nav.tsx` with `useCurrentUser()` data
7. Add a global QueryClient config with `retry: 1`, `throwOnError: true` for queries (to trigger route error boundaries)
8. Create `app/error.tsx` and per-segment error boundaries with retry buttons

**Acceptance:**

- Top nav reads role from API — shows correct items for the seeded admin user
- A test page (`/workspaces` placeholder) can be temporarily wired to `useWorkspaces()` and renders raw JSON of the 4 acting-user workspaces
- Lifecycle mutation triggered manually from console flips status optimistically, then settles on the server-confirmed value
- Disconnect MSW worker temporarily — error boundary shows with retry button, queries throw correctly

**Don't do:**

- Real UI components (still placeholders, just wiring)
- URL state for filters (next phase)
- Charts yet

---

## Phase 4 — Developer surface

**Goal:** Fully working developer side end-to-end. List, detail, create flow, lifecycle controls with all states, connect panel, persistence hints.

**References:** `screens/developer.md` (authoritative), `decisions/02-connect-methods.md`, `decisions/04-state-and-persistence.md`

**Tasks:**

1. Build `components/workspace/status-badge.tsx` — per decision 05 spec (22px height, 11px font, 10% bg, 25% border, color per status enum)
2. Build `components/workspace/usage-metric.tsx` — number + unit + percentage + optional sparkline (use Recharts area chart, no axes, no grid, just the shape)
3. Build `components/workspace/lifecycle-controls.tsx` — context-aware buttons:
   - `running` → shows Stop, Restart
   - `stopped` → shows Start, Delete
   - `starting | stopping` → shows current action as disabled with spinner
   - `error` → shows Restart, Delete, Recreate
   - Each button has a tooltip/hint with persistence behaviour from decision 04
   - Destructive actions (Delete) have a different visual register (no coral, uses error red) + confirmation modal with typed-name verification
4. Build `components/workspace/connect-panel.tsx` per decision 02:
   - Three buttons: VS Code Desktop, Open in browser, Copy SSH command
   - All three are stubs but behave correctly (vscode:// anchor, new-tab anchor, clipboard copy)
   - Panel is disabled when status is not `running`, with hint
5. Build `components/workspace/workspace-card.tsx` — list item:
   - Name, status badge, template, current usage (CPU/RAM/Disk as compact UsageMetrics)
   - Primary action contextual to status (`Open` if running, `Start` if stopped, spinner if transitioning)
   - Kebab for secondary actions
6. Build the workspaces list page at `app/(developer)/workspaces/page.tsx`:
   - Header with `New workspace` button (right-aligned)
   - Grid of `WorkspaceCard`s
   - Empty state if no workspaces
   - Loading skeleton state
7. Build workspace detail page at `app/(developer)/workspaces/[id]/page.tsx` per `screens/developer.md` Screen 2:
   - Top region: name, status badge, lifecycle controls with persistence hints, connect panel
   - Metrics region: current usage as JetBrains Mono numbers + CPU/memory line charts (24h with toggle to 1h)
   - Metadata region: template, specs, region, uptime, created at, hourly cost, accumulated session cost
   - Optional idle hint when `isIdle` is true
   - Logs section (collapsed, expandable)
8. Build create workspace flow at `app/(developer)/workspaces/new/page.tsx`:
   - Template picker (grid of template cards)
   - Workspace name input with autogenerated suggestion (use the same name generator as mocks)
   - Confirm button
   - On submit: optimistic add to list, navigate to detail page showing `starting` state
9. Implement progress communication for `starting` state per decision 04:
   - Labelled step indicator: "Provisioning VM → Pulling image → Installing dependencies → Starting services"
   - Steps advance over time, not from real data (cosmetic but believable)
10. Verify all transitions feel responsive — optimistic updates work, no UI freeze on click

**Acceptance:**

- Navigate `/workspaces` — see 4 workspaces in expected states
- Click any card → workspace detail loads
- Start a stopped workspace → instant `starting` state, transition to `running` after backend timer
- Stop a running workspace → instant `stopping`, confirm transition
- Click connect actions on running workspace → VS Code opens (browser will show URL handler prompt), browser tab opens, clipboard contains SSH command
- Click Delete on a workspace → typed-name confirmation modal, then optimistic removal
- Create new workspace → flow completes, lands on detail page with progress steps
- All persistence hints visible (tooltip or inline) per decision 04

**Don't do:**

- Admin pages (next phase)
- Real-time websocket — polling is enough
- Mobile responsive yet — desktop-first

---

## Phase 5 — Admin overview + inventory

**Goal:** The two hero admin screens — overview with waste card, fleet inventory table with filters and bulk actions.

**References:** `screens/admin.md` Screens 1 and 2, `decisions/03-actionable-waste.md`

**Tasks:**

1. Build `components/admin/hero-metric.tsx` — large number (`--text-3xl`, JetBrains Mono, weight 500) + label (`--text-sm`, weight 500, tertiary color) + delta with trend arrow (Lucide `ArrowUp`/`ArrowDown`)
2. Build `components/admin/waste-insight-card.tsx`:
   - Hero card at top of overview
   - Shows count of idle workspaces + estimated monthly waste
   - Primary action button → links to `/admin/workspaces?filter=idle`
   - Positive empty state when zero idle ("No idle workspaces detected — fleet is efficient")
3. Build the admin overview page at `app/(admin)/admin/page.tsx`:
   - Waste insight card (hero, full-width)
   - Metrics strip: 6 hero metrics (Running VMs, Active users, Hourly cost, Month-to-date cost, Projected monthly cost, Aggregate CPU)
   - 24h aggregate CPU + memory utilization chart (Recharts line chart, minimal chrome, coral + teal for the two series)
4. Build `components/admin/admin-vm-table.tsx` — dense table per decision 05 density spec:
   - 36px row height, 13px font, sortable columns
   - Columns: name, owner, template, status, CPU%, RAM%, Disk%, last active, hourly cost, kebab
   - Row selection with checkboxes
   - Click row → navigate to admin VM detail
5. Build `components/admin/bulk-action-bar.tsx`:
   - Appears sticky-top when rows selected
   - Shows count + actions (Stop, Restart, Delete)
   - Each action confirms before executing
6. Build fleet inventory page at `app/(admin)/admin/workspaces/page.tsx`:
   - Page header: title + admin "New workspace" button
   - Filter row: search input, status dropdown, template dropdown, owner dropdown, idle-only toggle
   - Filter state in URL (search params) — shareable, refresh-safe
   - Table with current data
   - Bulk action bar appears on selection
   - Loading skeleton, empty state ("no workspaces match your filters" with reset button), error boundary

**Acceptance:**

- Navigate `/admin` — waste card shows 12 idle workspaces and ~$340-360 estimated waste
- Hero metrics are populated and have deltas
- Utilization chart renders with the daily sine pattern visible
- Navigate `/admin/workspaces` — table populated with 60 rows
- Filter by status `running` — count drops to 42
- Search "emerald" — table filters to one row
- Click idle-only toggle — table shows 12 rows
- Sort by hourly cost — most expensive at top
- Select 3 rows → bulk action bar appears → click Stop → status flips on all 3
- URL reflects current filters; copy URL, paste in new tab — same state

**Don't do:**

- Templates UI (next phase)
- Utilization analytical view (next phase)
- Admin VM detail page (next phase)

---

## Phase 6 — Admin utilization + templates + admin VM detail

**Goal:** Remaining admin functionality. Utilization analytics, templates CRUD, admin drill-down to a workspace.

**References:** `screens/admin.md` Screens 3 and 4 + Drill-down + provision flow

**Tasks:**

1. Build the utilization page at `app/(admin)/admin/utilization/page.tsx`:
   - Time range selector: 1h / 24h / 7d / 30d (pill toggle)
   - Aggregate CPU + memory line chart over selected range
   - Distribution chart — horizontal bar histogram of current CPU% across all running workspaces (NOT pie chart, per decision 03). Bins from mock-data-plan.
   - Optional: small cost-by-template breakdown below
2. Build templates list page at `app/(admin)/admin/templates/page.tsx`:
   - Grid of template cards
   - Per card: name, base image, specs, preinstalled tools (as small pills), usage stats (currently running workspaces, monthly cost contribution)
   - Edit action per card
   - "New template" button → opens create form
3. Build template create/edit form at `app/(admin)/admin/templates/new/page.tsx` and `app/(admin)/admin/templates/[id]/page.tsx`:
   - Fields: name, description, base image (dropdown), vCPU (radio: 2/4/8/16), memory GB (radio: 4/8/16/32), disk GB (number input), preinstalled tools (tag input)
   - Submit creates/updates template, returns to list
4. Build admin VM detail at `app/(admin)/admin/workspaces/[id]/page.tsx`:
   - Reuses developer detail layout
   - Adds owner info panel (name, email, mailto link)
   - Expands logs by default
   - Adds admin actions section (force-stop, recreate, delete, reassign owner)
5. Build admin provisioning flow at `app/(admin)/admin/workspaces/new/page.tsx`:
   - Same as developer create flow + owner picker (searchable dropdown of users)
   - Submits to admin endpoint with `ownerId`
   - Workspace appears in fleet inventory with the chosen owner

**Acceptance:**

- Utilization page shows bimodal distribution clearly (matches mock-data-plan distribution)
- Range selector switches the time-series data
- Templates list shows 5 templates with correct usage stats (Backend dev = 24 workspaces, ML/Python = 6, etc.)
- Create new template → appears in list
- Edit existing template → changes persist
- Admin VM detail page shows everything developer detail shows, plus owner info and admin actions
- Admin provisioning: pick user → pick template → submit → workspace appears in fleet inventory owned by chosen user

**Don't do:**

- Policy CRUD (out of scope, see future-considerations)
- User management (out of scope)
- Audit log (out of scope)

---

## Phase 7 — States polish

**Goal:** Every data-driven surface handles loading / empty / error / transitional states with care. This is where the work goes from "functional" to "polished".

**References:** `screens/developer.md` and `screens/admin.md` "States to handle" sections + `decisions/05-design-direction.md` motion notes

**Tasks:**

1. Audit every page and ensure:
   - Loading state uses skeleton (not spinner) — proper shape that hints at the final layout
   - Empty state has heading + one-line description + CTA where applicable
   - Error state has retry button
   - Transitional state (workspace starting/stopping) shows progress meaningfully
2. Add subtle motion per decision 05:
   - Status badge in `starting`/`stopping` state has a pulse animation (opacity, 1.5s loop)
   - Optimistic updates fade in/out softly
   - Modal opens/closes with 150ms ease-out
   - Page transitions: none (instant), but in-page tab/range switches fade content briefly (100ms)
3. Verify all destructive actions per decision 04:
   - Delete workspace: typed-name confirmation modal
   - Recreate: confirmation modal with persistence explanation
   - Stop: tooltip hint (no modal)
   - Restart: tooltip hint (no modal)
4. Verify accessibility baseline:
   - All interactive elements keyboard-reachable
   - Focus visible on every focusable element
   - Status colors paired with icons or text (not color-only)
   - Form labels associated with inputs
   - Run Lighthouse — accessibility score ≥ 95
5. Verify responsive baseline:
   - Desktop (1280px+) — primary target, perfect
   - Tablet (768px-1280px) — usable, tables become scrollable
   - Mobile (<768px) — readable but minimal effort, just doesn't break

**Acceptance:**

- Navigate to every page once with throttled network (DevTools "Slow 3G") — every page shows skeleton, not blank
- Disable MSW temporarily — every page shows error boundary with retry
- Empty cases (filter to nothing, no workspaces in a fresh user) — all handled
- All keyboard nav works
- Lighthouse accessibility ≥ 95

**Don't do:**

- Major redesigns of any screen — polish only
- Animations heavier than opacity + transform

---

## Phase 8 — README + deploy

**Goal:** Ship it. README written from the decisions/notes files, deployed to Vercel, URL works.

**References:** every file in `decisions/`, `screens/`, `notes/`, `sitemap.md`

**Tasks:**

1. Write `README.md` at the root of the repo with the following structure:
   - **Overview** — one paragraph: what was built and the deployed URL
   - **Run it** — `pnpm install && pnpm dev` + node version + any flags
   - **The product, in one paragraph** — what Ascendra Workspaces is, who it's for (synthesised from screens/developer.md and screens/admin.md openings)
   - **Information architecture** — embed or summarise sitemap.md
   - **Key product decisions** — pull the Decision + Choice + one-line Rationale from each `decisions/*.md` file as a bullet list. Link to the full files in-repo.
   - **Design direction** — short prose on the visual language, mention cross-portfolio continuity with ReMargin
   - **Stack** — quick table from decision 06
   - **Data layer notes** — brief on Zod + MSW + TanStack Query patterns from decision 07
   - **What I'd add with more time** — include `notes/future-considerations.md` content
   - **Time spent** — honest number
2. Add a section explaining how to switch the acting user from `admin` to `engineer` for role-gating demo (likely a constant in `mocks/data.ts` flipped + reload)
3. Deploy to Vercel:
   - Connect GitHub repo
   - Ensure MSW worker is enabled in production build
   - Verify deployed URL renders both halves of the product correctly
4. Add the deployed URL to README at the top
5. Final commit: `Ship`

**Acceptance:**

- Fresh git clone + `pnpm install && pnpm dev` works from scratch on a clean machine
- Production deployed URL works in incognito with no console errors
- README is the entry point a reviewer reads and feels they got the full picture

---

## Time budget

Rough split for a single 6-hour session:

- Phase 1: 30 min
- Phase 2: 60 min
- Phase 3: 45 min
- Phase 4: 75 min
- Phase 5: 75 min
- Phase 6: 45 min
- Phase 7: 30 min
- Phase 8: 20 min

Total: ~6 hours. If running long, cut from phase 6 (templates create/edit can be view-only with a "coming soon" on edit) or phase 7 (responsive can be desktop-only).

## What to cut if time runs out

In priority order — cut from the top first, never cut from the bottom:

1. Template create/edit form (mark out of scope in README)
2. Admin VM detail (link from inventory to developer detail with admin actions appended)
3. Bulk actions (single-row actions only)
4. Distribution chart on utilization page (line chart only)
5. Admin provisioning flow (mention in README, link out)

**Never cut:**
- Developer list + detail + lifecycle
- Admin overview + waste card
- Admin inventory (table + filters)
- States polish on what does exist
- README + deploy
