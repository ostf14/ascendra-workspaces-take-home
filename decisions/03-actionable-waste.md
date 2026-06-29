# 03 — Actionable waste over raw metrics

**Decision:** The admin overview leads with waste detection ("X idle workspaces, $Y wasted") as a hero card. Raw aggregate utilization is supporting context, not the primary surface.

## Context

The brief asks for "complete visibility into the infrastructure" — VM counts, utilization, cost. A literal reading lands the product in the same visual category as Grafana, Datadog, or AWS CloudWatch: a panel of charts and numbers. Those products optimize for **observation**.

Ascendra is positioned differently. It's a managed platform; its value proposition is operational efficiency, not raw infrastructure monitoring. The job an admin opens this dashboard to do, most days, is reduce cloud spend without making developers angry. Aggregate CPU at 47% does not help with that job. "Twelve workspaces idle 24h+, costing $340/month, [Stop them]" does.

## Options considered

**A. Faithful dashboard.** Hero strip of six aggregate metrics (VMs, users, CPU%, memory%, cost), charts below. Mirrors every monitoring tool on the market.

**B. Waste-first overview.** Waste insight as hero with a primary action. Raw metrics as a secondary strip. Utilization chart below for context.

**C. Insights feed.** Generated alerts and recommendations as the entire main view, like a CRM "next best action" feed.

## Choice: B

A is the safe default and reads as generic — the kind of thing every candidate will ship. C overpromises; generating useful insights at scale needs real signal, not test-task heuristics. B gives the product a distinctive frame without making claims it can't back up.

## Rationale

- Frames Ascendra as a tool that **solves** waste, not one that helps you find it.
- Distinguishes the submission from candidates who treat the brief literally.
- Idle detection is computable from existing data (low CPU + stale last-active over time) — no fabricated intelligence.
- Raw metrics remain visible; we just stop pretending they're the answer.

## Implementation notes

**Idle definition for this exercise:** workspace status is `running` AND avg CPU < 5% over the last hour AND `lastActiveAt` is more than 1 hour ago. Computed client-side from mock data.

**Waste card placement:** top of `/admin`, full-width.
- Count of idle workspaces
- Estimated monthly waste — sum of `hourlyCost * 24 * 30` across idle workspaces
- Primary action → links to `/admin/workspaces?filter=idle`

**Positive empty state:** when no idle workspaces exist, the card flips to "No idle workspaces detected — fleet is efficient." It does not disappear, because absence of waste is itself worth communicating.

## What this rules out

- Pie charts of utilization. (A distribution visualization that doesn't show distribution.)
- Burying cost in a side panel. Cost is a headline metric for the admin.
- Composite "health score" metrics. They obscure rather than reveal.
