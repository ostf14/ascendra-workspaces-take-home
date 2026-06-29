# 04 — Workspace state and persistence

**Decision:** The workspace UI makes persistence guarantees explicit at every lifecycle action. Stop preserves state. Restart preserves state. Recreate resets system state but keeps home directory. Delete destroys everything. Each action surfaces this disclosure at the point of interaction.

## Context

A workspace is a remote VM. Lifecycle actions have different consequences for what survives:

- **Stop** — VM shut down. Disk, files, settings preserved.
- **Restart** — VM rebooted. Disk preserved; in-memory state and unsaved work in running processes lost.
- **Recreate** — VM destroyed, new one provisioned from the same template. Home directory persists (assumed for this exercise); installed packages and system tweaks gone.
- **Delete** — workspace and all its data gone.

In community discussions of Coder and Codespaces, persistence ambiguity surfaces as a top source of anxiety. Codespaces' strong session restoration (open files, unsaved changes, current branch all return on next open) is cited as a major advantage. Coder's default ephemerality (VM destroyed on stop unless explicitly configured otherwise) is cited as friction that engineering teams have to engineer around.

The platform's persistence model is an implicit contract. The platforms that make it explicit win on trust.

## Options considered

**A. Show buttons, let the user learn through experience.** Status quo for most infra tools.

**B. Single help page documenting what each action does.** Sounds responsible. No one reads it at the moment they need it.

**C. Inline, contextual disclosure.** Each lifecycle action surfaces its persistence behaviour at the point of click — short hint near the button, expanded confirmation modal for destructive actions.

## Choice: C

A leaves anxiety in place and erodes trust the first time a user is surprised. B sounds responsible but is read only by the most cautious users, who least need the reassurance. C front-loads the information when it matters and lets confident users skip past it.

## Rationale

- Persistence is the contract between user and platform. Making it explicit is cheap and builds trust.
- Destructive actions feel intentional rather than scary when their consequences are visible upfront.
- Most competitors leave persistence implicit and lose user confidence on first surprise — making it explicit is a cheap differentiator.

## Implementation notes

Each lifecycle action has a one-line hint, visible on hover or beneath the button on the detail page:

- **Stop** → "Files and settings preserved. Resume from where you left off."
- **Restart** → "Files preserved. Running processes will stop."
- **Recreate** → "Home directory preserved. Installed packages and system changes will be reset."
- **Delete** → "All data for this workspace will be deleted." Confirmation modal with typed-name verification.

On the list card, the hint surfaces in a tooltip rather than always visible (space constraint).

Visual hierarchy: Delete is treated differently from Stop / Restart / Recreate — different color, separated in the menu, never adjacent to safe actions.

## What this rules out

- Showing Delete in the same visual register as Stop.
- Burying persistence rules in a settings page or docs.
- Surprise behaviour — any action whose effect on user data is not communicated before the action.

## Open questions

- **Recreate semantics.** The exercise's data shape doesn't include a `persistentVolume` field. This decision assumes home directory survives recreate (matches Codespaces behaviour, which the category increasingly considers table stakes). README will note this assumption.
- **Auto-stop disclosure.** When idle timeout policy stops a workspace, the user should learn this happened. Out of scope for this exercise (would need notification surface), but worth a line in the user's workspace detail on next visit: "Auto-stopped 14h ago due to inactivity. Files preserved."
