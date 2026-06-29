# 06 — Tech stack

**Decision:** Next.js 15 (App Router) + React 19 + TypeScript strict, with Tailwind v4 + restyled shadcn/ui primitives, TanStack Query for server state, MSW for mock backend, Recharts for charts, Zod for validation, deployed to Vercel.

## Context

The brief invites any modern stack with rationale documented. The implicit ask is "something the reviewer can clone and run in two commands." The explicit asks: typed API client, real data layer, mock backend, TypeScript domain types.

The choice has three dimensions: framework (rendering, routing), state (server data, forms), and primitives (UI library, charts, mocks).

## Choice

| Layer | Choice | Why this over alternatives |
|---|---|---|
| Framework | Next.js 15 App Router | Single process — MSW and Vercel both work out of the box. Route groups naturally split developer / admin surfaces (see sitemap). |
| Language | TypeScript strict | Domain types are an explicit deliverable. Strict catches the bugs reviewers notice. |
| Styling | Tailwind v4 + restyled shadcn/ui | Tailwind v4 takes CSS-first config via `@theme`, maps directly to ReMargin tokens. shadcn/ui gives primitive components (Dialog, Popover, etc.) without imposing a default look — restyled per decision 05. |
| Server state | TanStack Query | Named in the brief. Industry default for React server state. Handles loading / error / empty / refetch / optimistic / invalidation we'd otherwise build by hand. |
| Mock backend | MSW (Mock Service Worker) | Intercepts real `fetch` calls — UI code doesn't know the backend is fake. Deploys with the app on Vercel; no second process. Best signal of "real data layer". |
| Validation | Zod | Runtime parse of API responses (defensive against mock drift). Single source: `z.infer<>` derives TS interfaces from schemas. |
| Charts | Recharts | Free, well-documented, fully restylable. Better fit for a minimal Linear tone than Tremor (more opinionated layout) or D3 (overkill). |
| Icons | Lucide React | Ships with shadcn. Outline-only, 1.5px stroke matches design direction (decision 05). |
| Dates | date-fns | Tree-shakeable. No moment-style globals. |
| Deploy | Vercel | One-click for Next.js, free tier sufficient, public URL for the submission. |

## Rationale

This stack is what most reviewers expect to see. The framework choice should be invisible — clone, install, run, see the work. Identity belongs in design and product decisions, not stack selection.

Three places where someone might argue:

- **Next.js vs Vite.** Vite is faster locally and what ReMargin used. Next.js wins here because of integrated routing for two distinct surfaces with shared shell, native Vercel deploy, and zero config for MSW in production.
- **TanStack Query vs SWR.** SWR is simpler and similar. TanStack Query was named in the brief — picking the alternative needs justification, and there's none worth spending words on.
- **Recharts vs Tremor.** Tremor looks better out of the box but is opinionated about layout (cards with built-in titles, padding). For a Linear-precise minimal direction, raw chart primitives + own chrome wins.

## Implementation notes

- **TypeScript strict mode on**, plus `noUncheckedIndexedAccess: true` and `noImplicitAny: true`.
- **Domain types live in `lib/domain/types.ts`**, derived from Zod schemas via `z.infer<>`.
- **No client state library** (Redux, Zustand). TanStack Query covers server state; React state covers UI state; URL covers filters, sorting, and search.
- **Forms**: `react-hook-form` if needed for template create / edit; if all forms stay under three fields, plain controlled components are enough.
- **Dates**: timestamps stored as ISO strings (matching brief's data shapes), formatted at render via date-fns.

## What this rules out

- Server-side data fetching for this exercise — everything client-side via TanStack Query for mock simplicity.
- Backend frameworks (Express, Hono, etc.) — MSW makes them unnecessary.
- CSS-in-JS (Emotion, styled-components).
- Global state libraries.
