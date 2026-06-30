# Current colours

Sourced verbatim from `app/globals.css` (the `:root` light scope and the `.dark` scope) plus every hardcoded hex / rgba found in `components/**` and `app/**`. The mapping tokens under `@theme inline` (the `--color-*` block) all resolve to one of the base variables in the two themed scopes; only the bare hex values that the design system actually paints are listed here.

## Surfaces

| Token | Light | Dark |
|---|---|---|
| `--surface-page` | `#fdfcf5` | `#0f0f11` |
| `--surface-secondary` | `#f5efdf` | `#161618` |
| `--surface-tertiary` | `#ebe6d6` | `#1c1e21` |
| `--surface-elevated` | `#ffffff` | `#252627` |

## Text

| Token | Light | Dark |
|---|---|---|
| `--text-primary` | `#3d3a34` | `#ffffff` |
| `--text-secondary` | `#524e46` | `#e2e3e5` |
| `--text-tertiary` | `#787570` | `#97979a` |
| `--text-disabled` | `#a8a39a` | `#6b6f76` |

## Borders

| Token | Light | Dark |
|---|---|---|
| `--border-default` | `rgba(61, 58, 52, 0.13)` | `rgba(255, 255, 255, 0.13)` |
| `--border-strong` | `rgba(61, 58, 52, 0.22)` | `rgba(255, 255, 255, 0.2)` |
| `--border-subtle` | `rgba(61, 58, 52, 0.07)` | `rgba(255, 255, 255, 0.07)` |

## Brand accent

| Token | Light | Dark |
|---|---|---|
| `--accent` | `#498dfa` | `#498dfa` |
| `--accent-hover` | `#3878e0` | `#3878e0` |
| `--accent-muted` | `rgba(73, 141, 250, 0.12)` | `rgba(73, 141, 250, 0.15)` |
| `--accent-foreground` | `#ffffff` | `#ffffff` |

The Tailwind `@theme inline` block also re-exports the brand accent as `--color-accent`, `--color-accent-hover`, `--color-accent-muted`, `--color-accent-foreground`, and the legacy aliases `--color-accent-coral` / `--color-accent-coral-foreground`. All resolve to the values above.

## Status semantics

Light and dark scopes share the same status palette — semantics don't shift with theme.

| Token | Light | Dark |
|---|---|---|
| `--status-running` | `#10b981` | `#10b981` |
| `--status-pending` | `#d97706` | `#d97706` |
| `--status-error` | `#dc2626` | `#dc2626` |
| `--status-idle` | `#ca8a04` | `#ca8a04` |
| `--color-status-stopped` (alias) | `var(--text-tertiary)` → `#787570` | `var(--text-tertiary)` → `#97979a` |

## Data viz palette

Defined in the `@theme inline` block. Theme-invariant.

| Token | Value |
|---|---|
| `--color-chart-1` | `var(--accent)` → `#498dfa` |
| `--color-chart-2` | `#14b8a6` |
| `--color-chart-3` | `var(--status-idle)` → `#ca8a04` |
| `--color-chart-4` | `var(--text-tertiary)` → `#787570` (light) / `#97979a` (dark) |
| `--color-chart-5` | `var(--status-error)` → `#dc2626` |

## Shadcn mapping tokens

These are aliases under `@theme inline` that point at one of the base variables above. Listed for completeness; the colour comes from the target.

| Token | Resolves to |
|---|---|
| `--color-background` | `var(--surface-page)` |
| `--color-foreground` | `var(--text-primary)` |
| `--color-card` | `var(--surface-elevated)` |
| `--color-card-foreground` | `var(--text-primary)` |
| `--color-popover` | `var(--surface-elevated)` |
| `--color-popover-foreground` | `var(--text-primary)` |
| `--color-primary` | `var(--accent)` |
| `--color-primary-foreground` | `var(--accent-foreground)` |
| `--color-secondary` | `var(--surface-secondary)` |
| `--color-secondary-foreground` | `var(--text-primary)` |
| `--color-muted` | `var(--surface-secondary)` |
| `--color-muted-foreground` | `var(--text-tertiary)` |
| `--color-destructive` | `var(--status-error)` |
| `--color-destructive-foreground` | `#ffffff` |
| `--color-border` | `var(--border-default)` |
| `--color-input` | `var(--border-default)` |
| `--color-ring` | `var(--accent)` |
| `--color-surface-page` | `var(--surface-page)` |
| `--color-surface-secondary` | `var(--surface-secondary)` |
| `--color-surface-tertiary` | `var(--surface-tertiary)` |
| `--color-surface-elevated` | `var(--surface-elevated)` |
| `--color-text-primary` | `var(--text-primary)` |
| `--color-text-secondary` | `var(--text-secondary)` |
| `--color-text-tertiary` | `var(--text-tertiary)` |
| `--color-text-disabled` | `var(--text-disabled)` |
| `--color-border-default` | `var(--border-default)` |
| `--color-border-strong` | `var(--border-strong)` |
| `--color-border-subtle` | `var(--border-subtle)` |

## Hardcoded hex / rgba in components

Pulled by grep across `components/**` and `app/**`.

| Location | Value | Used for |
|---|---|---|
| `components/admin/admin-overview-chart.tsx:76,91,92,152,171` | `#0ea5a4` | Memory series stroke + gradient stops + legend dot + tooltip dot (teal complement to brand blue) |
| `components/workspace/workspace-metrics-chart.tsx:69` | `#0ea5a4` | Memory chart panel stroke (same teal) |
| `components/workspace/usage-circle.tsx:11` | `#DC2626` | Filled arc colour when value ≥ 85% (matches `--status-error`) |
| `components/workspace/usage-circle.tsx:12` | `#D97706` | Filled arc colour when 60% ≤ value < 85% (matches `--status-pending`) |
| `components/admin/bulk-action-bar.tsx:155` | `#ffffff` | Confirm button text on the bulk delete confirmation dialog (paired with `var(--status-error)` background) |
| `components/workspace/delete-workspace-dialog.tsx:85` | `#ffffff` | Delete confirmation button text (same pattern as above) |

## Globals.css inline literals outside the themed scopes

| Location | Value | Used for |
|---|---|---|
| `app/globals.css:56` | `#ffffff` | `--color-destructive-foreground` |
| `app/globals.css:96` | `#14b8a6` | `--color-chart-2` (teal — note this is the original teal token; the components use a refined `#0ea5a4` for the actually-painted strokes) |
