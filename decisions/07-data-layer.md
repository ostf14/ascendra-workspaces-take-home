# 07 — Data layer

**Decision:** All data flows through a typed API client (`lib/api/`) consumed via TanStack Query hooks (`lib/hooks/`). Mock backend lives in `mocks/` and is intercepted by MSW. Query keys follow a strict convention. Polling intervals are tuned per resource. Lifecycle mutations use optimistic updates with rollback on error.

## Context

Brief explicitly calls out: *"Don't hardcode data inside components. Build a real data layer."* This is part of the evaluation. The data layer is also what determines whether the loading / error / empty / transitional states feel real — those states are listed in design requirements.

The layer needs to handle:

- Reading typed responses from a mock backend
- Polling state for in-flight transitions (workspace `starting`, `stopping`)
- Mutating state (lifecycle actions, template CRUD, admin provisioning)
- Optimistic UI on mutations (lifecycle actions especially)
- Reasonable refetch / invalidation behaviour around mutations

## Project structure

```
lib/
├── domain/
│   ├── schemas.ts          ← Zod schemas (source of truth)
│   └── types.ts            ← re-exports z.infer<> types
├── api/
│   ├── client.ts           ← thin fetch wrapper with Zod parse
│   ├── workspaces.ts       ← workspace endpoints
│   ├── templates.ts        ← template endpoints
│   └── fleet.ts            ← admin fleet endpoints
└── hooks/
    ├── use-workspaces.ts   ← list + detail queries
    ├── use-workspace-lifecycle.ts ← start / stop / restart mutations
    ├── use-templates.ts
    └── use-fleet.ts        ← admin overview + inventory + utilization

mocks/
├── handlers.ts             ← MSW request handlers
├── data.ts                 ← seed data + generators
├── browser.ts              ← MSW worker setup
└── delay.ts                ← simulated latency helper
```

Components never import from `lib/api/` directly — only via hooks. This keeps the abstraction clean and makes it trivial to swap mock for real API later.

## Query key convention

Hierarchical, predictable, supports targeted invalidation.

| Key | Returns |
|---|---|
| `['workspaces']` | Developer's own workspaces list |
| `['workspaces', id]` | One workspace |
| `['workspaces', id, 'metrics', range]` | Time-series for one workspace |
| `['admin', 'overview']` | Hero metrics, waste card data |
| `['admin', 'fleet']` | Fleet inventory |
| `['admin', 'fleet', 'utilization', range]` | Aggregate utilization series |
| `['admin', 'templates']` | All templates |
| `['admin', 'templates', id]` | One template |
| `['admin', 'users']` | User list (for owner picker in admin provision flow) |

Invalidating `['workspaces']` after a mutation refetches the list; invalidating `['workspaces', id]` refetches the detail. Hierarchical keys mean `queryClient.invalidateQueries({ queryKey: ['admin'] })` clears the whole admin surface in one call.

## Polling strategy

Per-resource polling intervals — set as default `refetchInterval` per hook. Adjusted to match how fast the underlying data really changes.

| Resource | Interval | Reason |
|---|---|---|
| Workspaces list | 10s | Status changes are the main signal — moderately fresh |
| Workspace detail (stable status) | 5s | User is actively looking; metrics tick |
| Workspace detail (transitional status) | 2s | Get to `running` / `stopped` quickly after lifecycle action |
| Admin overview | 30s | Aggregates change slowly |
| Fleet inventory | 15s | Scanning context; not critical to be live |
| Utilization analytics | No polling | Range-scoped historical data; refetch on range change only |
| Templates list / detail | No polling | Rarely change; refetch on mutation |
| Users list | No polling | Rarely change |

Polling pauses when the tab is backgrounded (TanStack Query default behaviour). On focus return, all queries refetch once.

## Optimistic updates

Every lifecycle mutation updates the UI before the server responds. Pattern via `useMutation`'s `onMutate` / `onError` / `onSettled`.

- **Start / Stop / Restart**: status flips to transitional (`starting` / `stopping`) immediately. Previous status preserved for rollback. On error, revert + show toast. On success, polling switches to 2s interval until terminal status reached.
- **Delete workspace**: row disappears from list immediately. Rollback restores it on error.
- **Create workspace**: new workspace appears at top of list with status `starting`. ID returned by server replaces the optimistic ID. On error, remove.
- **Template create / edit**: optimistic write of new fields; rollback on error.

All optimistic patterns wrap the same helper: `useOptimistic<T>` style util that captures the snapshot, applies the update, and gives a `rollback()` for the error path.

## Mock backend

MSW handlers in `mocks/handlers.ts` cover every endpoint the hooks call. Latency is simulated via a `delay()` helper (`100–400ms` random) to keep loading states visible. Lifecycle transitions are simulated with a `setTimeout`: `starting → running` after 8–15 seconds. This produces the long-startup scenario from `screens/developer.md` without a real backend.

Mutation handlers update an in-memory store kept in `mocks/data.ts`. Polling queries pick up the new state. This makes the mock feel coherent — actions taken in one tab visible in another after the next poll.

MSW is initialised in a client-only provider (`app/providers/msw-provider.tsx`) before the first render. Production build registers the worker the same way; the mock is shipped with the deploy.

## Validation at the boundary

The API client (`lib/api/client.ts`) is a thin `fetch` wrapper that always parses responses through a Zod schema. If the mock drifts from the schema, validation fails loudly during development rather than producing weird UI bugs.

```ts
// Sketch
async function get<T>(url: string, schema: ZodSchema<T>): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new ApiError(res.status);
  return schema.parse(await res.json());
}
```

Same pattern for `post`, `patch`, `delete`.

## Error handling

- **Global QueryClient config**: `retry: 1` (one retry on transient failures), `throwOnError` for queries that hit route-level error boundaries.
- **Per-route error boundary**: each App Router segment has its own `error.tsx` that shows a recoverable error state with retry.
- **Mutation errors**: surface via toast (`sonner` library or similar lightweight option). Rollback is automatic via optimistic update pattern above.
- **Empty states**: handled by hooks returning `data: []` — components check length and render empty state per `screens/*.md` spec.

## What this rules out

- Fetching data inside components (`useEffect` + `useState` + `fetch`). All data goes through hooks.
- Inventing endpoint conventions on the fly. Any new endpoint extends the structure in `lib/api/` and gets a matching MSW handler.
- Skipping Zod parse "because it's just a mock". Validation catches drift before it produces bugs.
- Polling on resources that don't need it (analytics, templates).
- WebSockets / SSE. Polling is sufficient for this exercise; real-time is in `notes/future-considerations.md`.
