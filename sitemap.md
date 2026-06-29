# Sitemap

Two distinct surfaces under one shell. Role determines which is visible (see decision 01). All routes use Next.js App Router conventions; `[id]` is a dynamic segment.

## Entry & auth

| Route | Purpose |
|-------|---------|
| `/login` | Sign in |
| `/` | Role-gated redirect: `engineer` → `/workspaces`, `admin` → `/admin` |
| `/403` | Returned when an engineer hits any `/admin/*` route (not a redirect — the route shouldn't appear to exist) |
| `/404` | Unknown route |

## Developer surface — `/workspaces/*`

Visible to all signed-in users. Admins see this section in their nav alongside Admin; engineers see only this.

| Route | Purpose |
|-------|---------|
| `/workspaces` | Workspaces list (home for engineers) |
| `/workspaces/new` | Create flow: template picker → name → confirm |
| `/workspaces/[id]` | Workspace detail: connect, metrics, lifecycle, metadata |

## Admin surface — `/admin/*`

Only for `role: "admin"`.

### Overview
| Route | Purpose |
|-------|---------|
| `/admin` | Fleet overview (home for admins): waste card, metrics strip, utilization chart |

### Workspaces (fleet inventory)
| Route | Purpose |
|-------|---------|
| `/admin/workspaces` | VM inventory — sortable table, filters, bulk actions |
| `/admin/workspaces/new` | Admin provisioning flow (with owner picker) |
| `/admin/workspaces/[id]` | Admin VM detail — extends developer detail with owner info, full logs, admin actions |

### Utilization
| Route | Purpose |
|-------|---------|
| `/admin/utilization` | Aggregate trends + distribution chart |

### Templates
| Route | Purpose |
|-------|---------|
| `/admin/templates` | Templates list with usage stats |
| `/admin/templates/new` | Create template |
| `/admin/templates/[id]` | Edit template |

## Top nav

Top nav surfaces vary by role:

- **Engineer** sees one entry: `Workspaces`.
- **Admin** sees two entries: `Workspaces` (their own machines, the developer surface) and `Admin` (the fleet section).

There is no role switcher and no role prompt at login (see decision 01).

## Out of scope but reserved

Routes deliberately not built in this exercise. Listed here so that the IA reads as intentional rather than incomplete. See `notes/future-considerations.md` for context.

| Route | Purpose |
|-------|---------|
| `/settings` | User settings |
| `/admin/policies` | Policy CRUD (max VMs, idle timeout, allowed templates) |
| `/admin/users` | Users / teams management |
| `/admin/audit` | Audit log (chronological record of all workspace lifecycle events) |

## Route group structure in code

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── 403/page.tsx
│   └── 404/page.tsx
├── (developer)/
│   └── workspaces/
│       ├── page.tsx              → /workspaces
│       ├── new/page.tsx          → /workspaces/new
│       └── [id]/page.tsx         → /workspaces/[id]
└── (admin)/
    └── admin/
        ├── page.tsx              → /admin
        ├── workspaces/
        │   ├── page.tsx          → /admin/workspaces
        │   ├── new/page.tsx      → /admin/workspaces/new
        │   └── [id]/page.tsx     → /admin/workspaces/[id]
        ├── utilization/page.tsx  → /admin/utilization
        └── templates/
            ├── page.tsx          → /admin/templates
            ├── new/page.tsx      → /admin/templates/new
            └── [id]/page.tsx     → /admin/templates/[id]
```

Route groups `(developer)` and `(admin)` don't affect URLs — they organise files and allow each surface to have its own layout (different nav, different page chrome).
