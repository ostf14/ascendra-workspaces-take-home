# Mock data plan

Seed data is generated with intent, not randomness. Every distribution below exists to make some part of the UI demonstrate itself — waste card, distribution chart, inventory sort, status diversity. The plan is the spec; the generator code in `mocks/data.ts` implements it.

## Acting identity

Default signed-in user is **`admin`** with their own workspaces. This means:

- The developer surface (`/workspaces`) is populated on load — no manual login flow needed for the reviewer to see it.
- The admin surface (`/admin`) is also accessible immediately.
- Both halves of the product are demonstrable in one session.

User: `Alex Morgan` (`alex@ascendra.dev`), role `admin`, owns 4 workspaces.

A second seeded user (`Engineer Sam`) exists as a non-admin so the role gating in nav + 403 routing can be demonstrated by switching the active user in dev tools — explained in README.

## Fleet totals

- **~60 workspaces** total across the org
- **~20 users** (15 engineers, 5 admins)
- **5 templates**

Sixty is large enough that filters and sort matter; small enough to avoid pagination work. Twenty users gives the owner column variety without bloating mock data.

## Workspace status distribution

| Status | Count | Notes |
|---|---|---|
| `running` | 42 | Of these, 12 are flagged idle (see below) |
| `stopped` | 14 | Mix of recent and stale |
| `starting` | 2 | One mid-provisioning (long start), one quick start |
| `stopping` | 1 | |
| `error` | 1 | Provides a real error-state row to design around |

Sum is 60. The 1 error and 1 stopping aren't statistically significant in production data, but they're essential for showing the UI handles edge states.

## Idle subset (powers waste card + decision 03)

12 of the 42 running workspaces are idle by our rule: CPU < 5%, `lastActive` more than 1h ago, status `running`.

Within those 12, distribute the staleness so the inventory is interesting to sort:

- **4 workspaces idle 1–6 hours** — recent inactivity, normal forgetfulness
- **5 workspaces idle 12–48 hours** — overnight + weekend forgets
- **2 workspaces idle 3–5 days** — stale, worth flagging
- **1 workspace idle 7+ days** — clear waste, hero outlier

Sum of `hourlyCost * 24 * 30` across these 12 should land around **$340–360 estimated monthly waste**. Pick `hourlyCost` values that produce that number to one decimal place — round figure makes the waste card read as believable.

## Utilization distribution (powers distribution chart)

Current CPU% across the 42 running workspaces (admin utilization view) should be **bimodal**, not uniform. Bimodal reveals what a distribution chart is for — a flat 50% average hides whether everything sits at 50% or half sits at 0% and half at 100%.

| CPU% bucket | Workspace count | Notes |
|---|---|---|
| 0–10% | 14 | The idle pool + lightly-used dev machines |
| 10–30% | 8 | Background loads |
| 30–60% | 5 | Active dev work |
| 60–85% | 9 | Heavy builds, ML training |
| 85–100% | 6 | Hot — should surface as a "needs more resources" group |

Memory% distribution: roughly correlated with CPU% but with three intentional **outliers** — workspaces at high RAM% (90%+) but low CPU%. These are the "stuck on a Java build" or "leaking memory" cases. Surfaces as interesting rows when sorting inventory by memory.

## Cost distribution

`hourlyCost` per workspace ranges $0.04 to $0.48, distributed:

- ~10 workspaces at $0.04–$0.08 (small dev templates)
- ~30 at $0.10–$0.18 (standard backend / frontend templates)
- ~15 at $0.20–$0.30 (heavier templates)
- ~5 at $0.40+ (ML/GPU template — explains why one template's total cost contribution dominates)

Sum of `hourlyCost` across running workspaces gives the admin overview's "current hourly cost" metric. Aim for it to land **around $5.40–$5.80/hour** — translates to a believable monthly burn of $3.9k–$4.2k.

## Templates

Five templates, each with intentional usage skew (powers template usage stats + cost breakdown by template):

| Template | Usage | vCPU / RAM / Disk | Hourly cost | Notes |
|---|---|---|---|---|
| Backend dev | 24 workspaces | 4 / 8GB / 50GB | $0.14 | Default workhorse |
| Frontend dev | 14 workspaces | 2 / 4GB / 30GB | $0.08 | Common, cheap |
| ML / Python | 6 workspaces | 16 / 32GB / 200GB | $0.42 | Expensive, low count, dominates cost |
| Data eng | 11 workspaces | 8 / 16GB / 100GB | $0.22 | Medium |
| Blank Ubuntu | 5 workspaces | 2 / 4GB / 30GB | $0.08 | Catch-all, low usage |

Sum = 60 workspaces. The ML template is the storytelling outlier — 10% of fleet, ~30% of cost. Demonstrates why "cost breakdown by template" is useful at all.

## My workspaces (developer surface)

The signed-in admin owns 4 workspaces. Picked to cover the visible states across the developer view:

1. `emerald-panther-54` — running, Backend dev template, moderate utilization (CPU 34%, RAM 52%), used today
2. `quiet-fox-12` — running, ML/Python template, high utilization (CPU 78%, RAM 84%), large hourly cost — shows what an expensive workspace looks like
3. `lonely-otter-89` — stopped 6 hours ago, Frontend dev template — shows the "stopped" card state and Start primary action
4. `stale-mountain-03` — running but idle (CPU 2%, last active 38h ago), Blank Ubuntu — shows the idle indicator on workspace detail

This gives the reviewer all card states visible on first load of `/workspaces`.

## Time-series shape

Per-workspace time-series (CPU and memory over time) and aggregate fleet time-series both use a **shaped sine pattern**, not random noise:

- Daily rhythm: low at night (~10–20% baseline), ramps up 09:00, peaks 11:00–17:00, drops after 19:00
- Workday vs weekend: weekends are flat at baseline
- Small random jitter on top (±5%) so it doesn't look mechanical
- The currently visible "now" point lands wherever the local time is when the page loads

Aggregate fleet utilization (admin `/admin/utilization`) follows the same shape but smoothed across all workspaces.

This makes charts feel like they're showing a system that has a working day, not a random walk. Cheap to implement, big visual payoff.

## Activity (lastActive) distribution

For the 42 running workspaces:

- ~28 active within last 30 minutes
- ~6 active 30min–6h ago
- ~8 active 6h–7d ago (the idle pool)

This gives the inventory's "Last active" column a real range to sort on.

## Names

Workspace names follow Coder's convention — `<adjective>-<animal>-<2digit>`. Cheap signature touch, makes the product feel like a system that **gives** names rather than a form that asked for them. Generator picks from ~30 adjectives + ~30 animals to keep variety.

## What this rules out

- Random distributions everywhere. Each distribution above is shaped to demonstrate something.
- "Lorem ipsum" workspace names like `test-vm-1`, `workspace-2`. Names are a small but visible quality signal.
- Identical-looking rows. Every row should give the eye something to land on (an outlier cost, a stale last-active, an unusual CPU%).
- Time-series as `Math.random()`. Daily rhythm is one extra `sin()` and transforms the perceived realism.

## Implementation note

The generator in `mocks/data.ts` produces this data once at startup and keeps it as a mutable store. Mutations (start, stop, create, delete) modify the store in place; polling queries read the current state. This makes the mock behave coherently within a session — an action taken in one tab shows up on the next poll in another.
