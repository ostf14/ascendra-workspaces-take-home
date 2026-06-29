# 02 — Multiple connect methods

**Decision:** The connect affordance exposes three methods (browser IDE, desktop IDE, SSH) rather than a single "Open" button.

## Context

A workspace is a remote VM. There are three established ways a developer reaches it:

- **Browser IDE** — a code-server process runs on the VM and renders VS Code as a web page.
- **Desktop IDE** — the developer's native VS Code on their laptop connects to the VM over SSH via the Remote-SSH extension. The UI runs locally; everything else runs on the VM.
- **Raw SSH** — terminal-only, for power users or admin debugging.

The brief asks for "a clear way to open the developer environment in the browser (e.g. an 'Open in IDE' button that links to a vscode-server URL — can be a non-functional stub)". That's the floor. The category convention is broader.

## Options considered

**A. Single "Open" button** targeting browser IDE only. Matches the brief literally.

**B. Single "Open" button with auto-detection** — try desktop IDE first, fall back to browser.

**C. Explicit choice** — surface all three methods at the same level of visibility.

## Choice: C

Developers have strong, stable preferences here. Some refuse to leave their configured desktop IDE; some prefer the browser to keep their laptop clean; some live in the terminal. A single button forces a default the product has no basis to pick. Auto-detection silently chooses for the user, which is worse — invisible until it surprises them.

A persistent panel of three options costs nothing after the first use, because the developer picks once and sticks with it.

## Implementation notes

The connection panel sits on the workspace detail page as a row of three actions:

- **VS Code Desktop** → anchor with `vscode://vscode-remote/ssh-remote+...` href; the OS's URL handler launches local VS Code with the remote target preconfigured.
- **Open in browser** → anchor to `https://{workspace-id}.ascendra.app`; opens in a new tab.
- **Copy SSH command** → button copying `ssh user@{workspace-id}.ascendra.app` to clipboard.

All three are stubs for this exercise — the targets don't resolve to anything real, but the affordances behave correctly (URL scheme triggers, new tab opens, clipboard populates).

The panel is enabled only when status is `running`. In other states it stays visible but inert, with a one-line hint explaining the workspace must be started first.

## What this rules out

- Auto-detecting the user's local environment to pick a default.
- Hiding any method behind an "advanced" toggle — the three sit at the same level.
- Embedding the browser IDE inside the dashboard. We link out; we don't host it.
