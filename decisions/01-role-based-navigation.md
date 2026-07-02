# 01 — Role-based navigation

**Decision:** No role switcher, no login-time prompt. The user's role determines which sections of the app are visible in the primary nav.

## Context

The brief specifies that developer and admin experiences "shouldn't be the same screens". This raises an IA question: how does the user land in the right half of the product?

The data model already includes `User.role: "engineer" | "admin"`. The decision is how to translate that role into navigation.

## Options considered

**A. Ask at login.** Two separate entry points, or a "Continue as developer / admin" prompt after sign-in.

**B. Persistent role switcher** in the top bar (similar to Coder's "Administration" dropdown).

**C. Role-derived navigation.** The server returns the user's role on sign-in; the client renders the nav accordingly. No switcher, no prompt.

## Choice: C

The two halves of the product are not "modes of operation" — they're different sections with different permissions, like `/billing` and `/projects` in any B2B SaaS. Treating them as a mode toggle implies they're interchangeable, which they aren't.

A switcher also adds chrome to every screen for a question almost no one asks more than once per session. Asking at login pushes a setup decision onto the user that the system already knows the answer to.

## Rationale

- **Engineers** see only `Workspaces` (their own VMs). The admin section does not exist in their UI.
- **Admins** see `Workspaces` (their own VMs, because admins also code) plus an `Admin` section for fleet management.
- An admin moves between their own machines and the fleet view the same way anyone moves between two top-level sections of a site — by clicking the nav.

This keeps the IA flat, removes a redundant control, and respects the reality that the admin/developer split is about scope of responsibility, not about which app you're using right now.

## Implementation notes

- Routes split into two groups: `/workspaces/*` (developer surface) and `/admin/*` (fleet, templates, policies, users).
- Top nav renders a persona segmented control (visible only for users with multiple roles) that reads as a major mode switch, not tab navigation. Persists last-visited URL per mode for continuity — an admin scrolling `/admin/utilization` who flips to My workspaces and back returns to `/admin/utilization`, not `/admin`.
- The switcher swapped in for the earlier design of two persistent `Link` elements. The links read as peer sections of one site; the segmented control reads as "which audience am I right now" — closer to the reality that admins and developers are different mental modes over one platform, even when the same person carries both hats.
- Direct navigation to `/admin/*` by an engineer is caught in the `(admin)` group layout and redirected to `/workspaces`. This diverges from the original "should return 403" note — reviewers and demo users landing on the wrong URL benefit from a soft handoff to a working surface more than a hard wall, and the guard sits at the layout level so every admin route inherits it without duplication.
- No role state is stored client-side beyond what the auth response provides. The switcher's per-mode last-path memory lives in `localStorage` (`ascendra:last-path:developer` / `ascendra:last-path:admin`), separate from role.

## What this rules out

- A "switch to admin view" button anywhere in the product.
- Any prompt, modal, or onboarding step asking the user to choose a role.
- Showing admin nav items to engineers in a disabled state.
