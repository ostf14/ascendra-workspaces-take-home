# 05 — Design direction

**Decision:** Use the ReMargin design system as the foundation. Filter out reader-specific tokens that don't apply to a dashboard. Extend with operational tooling primitives (status semantics, data-viz palette, hero metric typography, table density spec).

## Context

The brief uses words like "modern, clean, functional" — these are baseline expectations, not direction. The real question: what tone does the product carry?

Four directions were considered:

**A. Neutral default.** Inter, gray scale, blue accent, shadcn defaults. Safe. Identity-free. The direction most candidates will pick — and the reason most submissions look interchangeable.

**B. Technical-precise (Linear-like).** Tight letter-spacing, capped weights, density, 1px borders, mono numbers. Right register for operational tooling. Risk: easy to read as a Linear clone without personal voice.

**C. Technical-warm (Vercel / Resend-like).** Geist family, generous whitespace, single strong accent. Modern dev-tool look. Distinctive over A, less personal than B done well.

**D. Editorial-technical.** Sans body + serif moments in hero metrics, warm neutrals, character-driven. Strong identity. Risk: editorial register can read as inappropriate for a dashboard.

ReMargin (existing portfolio project at `mihhailovski-product-designer.vercel.app/case/remargin`) already implements a tested hybrid of B's precision and D's warmth: near-black dark surfaces, weights capped at 500, coral accent against warm cream light theme, Space Grotesk paired with JetBrains Mono.

## Options considered

**A. Build fresh tokens for Ascendra.** Treat each project as a separate visual exercise. Clean slate, but no signal of system thinking across work.

**B. Adopt ReMargin DS verbatim.** Fast, but inherits reader-surface concepts that don't apply (sepia mode, annotation highlights, Newsreader serif body).

**C. Adopt ReMargin DS as foundation, filter reader-specific tokens, extend with operational primitives.**

## Choice: C

A leaves no portfolio continuity — every project reads as a one-off execution. C demonstrates the candidate ships a system across work, not just isolated screens. This is a credibility signal at senior level: two projects in the same visual language read as "this person has voice"; two in unrelated languages read as "this person executes briefs."

## Rationale

- Cross-project coherence is a strong hire signal for design-leaning roles. A reviewer who clicks from this submission to the ReMargin case study should immediately recognise the same hand.
- Time saved — refined tokens already exist for spacing, radii, transitions, weights, dark surfaces, light theme, type scale. Hours go into core features instead of bikeshedding shades of gray.
- ReMargin's foundation is already structurally close to Linear-precise: capped weights, near-black surfaces, tight 1px borders, density-friendly type scale. It maps to the operational-dashboard register without major changes.

## Implementation notes

### Adopted from ReMargin DS verbatim

- **Sans**: Space Grotesk, weights 400 / 500 (no 600+, no 700)
- **Mono**: JetBrains Mono, same weight scale
- **Size scale**: 11 / 13 / 15 / 18 / 24 / 32 — base 15px
- **Spacing**: 4px grid (4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64)
- **Radii**: 4 (badges, chips) / 8 (cards, inputs, buttons) / 12 (dialogs, overlays)
- **Transitions**: 100 / 150 / 300 ms; ease-out `cubic-bezier(0.16, 1, 0.3, 1)`
- **Dark surfaces**: #0f0f11 / #161618 / #1c1e21 / #252627
- **Dark text scale**: #ffffff → #e2e3e5 → #97979a → #6b6f76
- **Border alpha pattern over surfaces**: rgba(255,255,255,0.13 / 0.2 / 0.07)
- **Light theme — warm cream**: #fdfcf5 page / #f5efdf secondary / #ebe6d6 tertiary / #ffffff elevated
- **Light text scale**: #3d3a34 → #524e46 → #787570 → #a8a39a
- **Coral accent**: #d97757 (scope redefined below)

### Removed (not applicable to a dashboard)

- DM Serif Display — no editorial logo moment in this product
- Newsreader — no reading surface
- Reader surface variables (page / ink / desk / sepia modes)
- Annotation highlight colors (yellow / green / blue / red / purple)

### Added for operational tooling

**Status semantic colors** — independent family from accent:

| Status | Color | Notes |
|---|---|---|
| Running | `#10B981` | Deep green, warm |
| Starting / Stopping | `#D97706` | Warm amber, muted (not bright) |
| Stopped | `--text-tertiary` | No dedicated color — stopped reads as neutral |
| Error | `#DC2626` | Warm red, not aggressive |
| Idle | `#CA8A04` | Deeper amber — distinct from starting |

**Coral accent (`#d97757`) keeps its meaning as product action color** — "Open in IDE", "New workspace", primary CTAs. Coral never appears as a status. Status semantics are independent of brand accent.

**Data viz palette:**
- Single-line charts: coral accent
- Two-series (CPU vs memory): coral + `#14B8A6` (teal complement — finalised side-by-side with coral in code)
- Max three series per chart
- Grid lines: `--border-subtle` (rgba alpha 0.07)
- No standalone legends if avoidable; inline label in chart title or tooltip

**Hero metric typography** (admin overview metric values like `$4,820`, `42 idle`):
- New token `--text-3xl`: 48px
- Style: **JetBrains Mono, weight 500** — gives system-generated voice. Distinct touch.
- Label above metric: `--text-sm` (13px), weight 500, `--text-tertiary`

**Table density spec** (admin inventory):
- Row height: 36px default, 32px compact toggle
- Cell padding: 12px horizontal, 8px vertical
- Column header: `--text-sm` (13px), weight 500, `--text-tertiary`
- Cell text: `--text-sm` (13px), weight 400
- Row separator: 1px `--border-subtle`; suppressed on hover row

**Status badge spec:**
- Height: 22px
- Padding: 8px horizontal
- Font: `--text-xs` (11px), weight 500, status color
- Background: status color at 10% opacity
- Border: 1px status color at 25% opacity
- Radius: 4px (`--radius-sm`)

### Default theme

Light primary (warm cream). B2B convention for admin dashboards; better readability for dense data over long sessions. Dark mode is a toggle, prioritized for stretch time but not blocking.

## What this rules out

- shadcn default appearance — cool slate, Inter, 600–700 weights, soft shadows
- Multiple accent colors. One accent (coral) for action; status colors are not accents
- Title Case anywhere — sentence case throughout the product
- Filled icon variants — outline only, stroke 1.5px max
- Motion beyond 150ms easing and skeleton loaders. No bouncy curves
- Decorative shadows beyond ReMargin's "felt, not seen" set

## Cross-portfolio note

This direction reuses tokens from ReMargin. The README will mention this explicitly as a continuity choice — a personal design system applied across two projects. Framing matters here: this is "I bring a system to my work", not "I reused what I had". The system was extended for this product's job, not pasted in.
