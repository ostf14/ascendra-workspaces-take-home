# Design notes overlay

The overlay turns the product into a walkable case study. A toggle in the meta-bar (`Design notes`, Lucide `Lightbulb`) reveals numbered pins anchored to specific UI elements. Clicking a pin opens a popover with a short excerpt and a link to the supporting decision record on GitHub.

## Why this exists

A portfolio piece explains its own reasoning twice: once through the artifact, once through the write-up. In a static submission those two paths never meet — a reviewer reads the case study on a landing page, then loads the deploy, and the connection between "the waste card comes first" and "here's why" happens inside the reviewer's head.

The overlay closes that loop in place. The reviewer looks at the waste card, clicks pin #2, sees the sentence that names what they're looking at, follows the link to the decision record if they want the full argument. Same content as the README's `Key decisions` section, but anchored where each decision lives.

The overlay is not required to understand the product — the pins are dark until the toggle is on. Off is the default. A reviewer who just wants to click through the product never has to know the annotations exist.

## Role gating

Only shown to users whose role can access every route the pins anchor to. In this repo's data model that means `role === "admin"` — the meta-bar itself only renders for admins, and the toggle lives on the meta-bar.

The rejected alternative was showing all pins to everyone, with a "switch persona to reach this note" hint on unreachable ones. That would surface an experience the single-role user can't actually complete — a broken pin is worse than no pin. Cleaner to hide the toggle entirely from engineers.

## Anchor mechanism

Each element in the product tree that the overlay annotates carries a `data-note="<id>"` attribute. Example:

```tsx
<section aria-label="Fleet waste" data-note="waste-card" ...>
```

The overlay component (`components/layout/design-notes-overlay.tsx`) walks the catalog on every animation frame while the toggle is on, calls `document.querySelector('[data-note="<id>"]')` for each entry, and renders a pin at the anchor's top-right corner. Anchors that don't exist on the current route simply don't render — a note's number stays stable across routes, matching how a book's footnote numbering works.

Positions update via a `requestAnimationFrame` loop that runs only while the overlay is on. Ten `getBoundingClientRect` reads per frame is cheap; the payoff is that scroll, resize, route change, dialog open, and panel-expansion all keep the pins aligned without any explicit observer setup.

## Catalog format

Notes live in `lib/design-notes/catalog.ts` as an ordered array:

```ts
export const DESIGN_NOTES: DesignNote[] = [
  { id: "persona-switcher", title: "...", excerpt: "...", decisionFile: "decisions/01-role-based-navigation.md" },
  ...
];
```

- **`id`** matches the `data-note` attribute on the anchor.
- **`title`** is the note's headline — one line, shown as a heading in the popover.
- **`excerpt`** is 1-3 sentences: what this element is, why it's shaped this way. The full argument goes in the decision record, not here.
- **`decisionFile`** is a repo-relative path. The popover renders a link that opens the file on GitHub via the `decisionUrl` helper.

The array order = the pin number. Note #4 is always #4, on every route where it appears. Reorder-and-lose-numbering is a real risk; if a reviewer references "pin #4" in an email, that reference should still resolve two months from now.

## Adding a note

1. Append a new entry to `DESIGN_NOTES` in `lib/design-notes/catalog.ts` — do not insert in the middle, do not reorder. The next unused number is assigned by array position.
2. Add `data-note="<id>"` to the anchor element in the product. Pick the element the reviewer's eye lands on when they read the excerpt — the card that carries the story, not its parent wrapper or a child detail.
3. Write the excerpt at the level of the artifact: "The card used to be X. Rebuilt as Y because Z." Not the decision itself.
4. Point `decisionFile` at the closest supporting decision record.

## Removing or editing

Editing the `excerpt` or `title` is fine — no numbering side-effects. Removing an entry shifts every subsequent number by one and is the same risk as reordering. If a note stops applying (the anchor is retired), prefer emptying the excerpt with a placeholder ("This surface was replaced — see …") over deletion so the numbering stays stable.

## State

- Toggle state (`enabled: boolean`) lives in `lib/design-notes/context.tsx` via a small provider mounted in `app/providers.tsx`.
- Persisted to `localStorage` at `ascendra:design-notes:on`. Survives reloads and route changes.
- Active pin (popover open) lives in the overlay component's state — only one popover open at a time, closes on `Escape` (radix default) or on route change (the anchor may no longer exist on the next page).

## Not covered

- **Positioning collisions.** Two anchors close enough that their pins overlap will overlap. In this catalog the closest neighbours are ~200px apart, so no collision handling is needed. If it becomes an issue, radix's collision-aware `Popover` content already picks a side; the pins themselves would need a nudge on overlap.
- **Dark mode.** The pin (`--accent`) and popover chrome inherit from the tokens, but a full dark pass hasn't been audited.
- **Keyboard-only navigation across pins.** Pins are focusable buttons and the popovers open on activation. A "next pin / previous pin" keyboard flow would be a nice extension but is not implemented.
