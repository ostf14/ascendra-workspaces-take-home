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
- Top nav renders conditionally based on `currentUser.role`. Engineers see one entry; admins see two.
- Direct navigation to `/admin/*` by an engineer returns 403 — not a redirect, because the route shouldn't appear to exist for them.
- No role state is stored client-side beyond what the auth response provides. No "current view" toggle.

## What this rules out

- A "switch to admin view" button anywhere in the product.
- Any prompt, modal, or onboarding step asking the user to choose a role.
- Showing admin nav items to engineers in a disabled state.
