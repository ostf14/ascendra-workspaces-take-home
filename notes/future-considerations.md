# Future considerations

Items consciously left out of this exercise. Listed here to show awareness of where the category is heading and to give a teammate a clear next step.

## Prebuilds and template caching

In this exercise, every workspace cold-starts from its base template. In production, templates would support prebuilds — a CI-triggered build that pre-installs dependencies and caches the resulting image, so a new workspace starts in seconds rather than minutes. This is the single biggest lever on the slow-start problem in the category.

Surfaces as: a field on `VMTemplate` ("Enable prebuilds"), a build status per template on the admin templates view (last built, success/failure, time saved), and a background job in the backend.

## Per-PR ephemeral workspaces

Workspaces tied to a Git branch or PR, provisioned automatically when the PR opens and destroyed when it merges. A distinct class from persistent personal workspaces — different lifecycle, different ownership, different cost attribution.

Would require its own section in the UI (or a tag on inventory rows), since these workspaces shouldn't appear in the developer's main list mixed with persistent ones.

## AI agents as workspace owners

The category is moving fast toward hosting AI coding agents (Claude Code, Copilot agents) inside workspaces. Coder and several competitors launched governance features for this in 2025–2026.

Implications for the admin view: distinguish human-owned from agent-owned workspaces, potentially different policies (cost ceilings, idle thresholds, auto-stop rules), audit requirements per agent type. The `User.role` field would extend to include `agent`.

## Multi-region support

This exercise treats `region` as a static descriptive field. In a real product, workspace placement matters for latency, compliance, and cost. Admin would set allowed regions per template; fleet utilization view would break down by region; users in distant regions would see clear status indication ("Your workspace is in eu-central-1; expect ~80ms latency").

## Audit log

A first-class admin section: chronological record of who created, started, stopped, deleted, or reassigned each workspace, and when. Critical for enterprise compliance.

Skipped because the data shapes provided don't include an audit log and it's a non-trivial build, but trivial to add later given the existing event-shaped lifecycle.

## Policies and quotas as a first-class section

The brief mentions policies (max VMs per user, idle timeout, allowed templates per team). This exercise treats them as implicit constants — the idle threshold powering the waste card is hardcoded.

In production, policies become their own admin section with CRUD: create a policy, attach to a team, see violations.

## Users and teams management

The brief mentions per-user VM count and utilization. This exercise reads owner info inline on inventory rows but doesn't build a dedicated user management section. It would be the natural next addition — list of org members with their workspace count, total utilization, total cost, and direct actions (reset their workspaces, change role, suspend).

## Notification and communication surface

When an admin provisions a workspace for a developer, the developer needs to know. When a workspace is auto-stopped, the developer should learn this happened. When a workspace enters error state, the owner should be alerted.

This exercise stops at displaying the state in the UI; a real product needs email / Slack / in-product notifications. Out of scope but obvious.

## Real-time updates

Currently all data is fetched on navigation and via polling. A production deployment would use WebSocket or SSE for status transitions and metric updates. Brief lists this as optional; deferred.
