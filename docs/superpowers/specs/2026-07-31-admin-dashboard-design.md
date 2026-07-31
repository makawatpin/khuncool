# Admin Dashboard — Design

## Purpose
An internal `/admin` dashboard for the site owner to see back-office stats: user growth, tool usage, content inventory, and quick links to system health — without adding a full roles/permissions system to the product.

## Access Control
- Route: `/admin` (metadata: `noindex, nofollow`; not linked from any nav).
- Auth: user must already be signed in via existing Supabase auth (email/password or Google).
- Authorization: server-side check compares `user.email` against a comma-separated `ADMIN_EMAILS` env var. No match → redirect to `/`.
- Data access: aggregate queries that need to see across all users (not just `auth.uid()`) run server-side using the Supabase **service role key** (server-only env var, never sent to the client).

## New Schema
One new table, `tool_events`, to support the "tool usage" tab (no event tracking exists today):

```sql
create table public.tool_events (
  id         bigint generated always as identity primary key,
  tool       text not null,               -- 'wheel' | 'attendance' | 'homeroom' | ...
  event      text not null default 'use',
  user_id    uuid references auth.users(id) on delete set null, -- null = guest
  created_at timestamptz not null default now()
);
alter table public.tool_events enable row level security;
create policy "anyone can log" on public.tool_events
  for insert with check (true);
-- No select policy: reads only via service role (server-side), never client-side.
```

Each tool page fires a single fire-and-forget insert on real usage (not just page load where avoidable — e.g. on spin/start action). Failure to insert must never block the tool's UI.

## Data Sources (no other new tables)
- **Users/growth**: `auth.users` (`created_at`, `last_sign_in_at`) via service role.
- **Content**: enumerated from the filesystem (`app/blog/*`) server-side at request time — a list, not analytics (no view counts exist).
- **System/health**: no data is proxied in. The tab is just outbound links to the Supabase project dashboard and Vercel deployments (opened in a new tab).

## Layout
Tabs across the top (not a persistent sidebar) — chosen for simplicity and better small-screen behavior: **ภาพรวม | ผู้ใช้ | เครื่องมือ | เนื้อหา | ระบบ**.

## Tab Contents

| Tab | Contents |
|---|---|
| Overview (ภาพรวม) | Stat cards: total users, active in last 7 days, signups today/this week, top tool by usage. Line chart: new signups over last 30 days. |
| Users (ผู้ใช้) | Searchable/sortable table: email, name/school (from `user_metadata`), signed up date, last sign-in. More granular growth chart (daily/weekly). |
| Tools (เครื่องมือ) | Bar chart of usage count per tool, from `tool_events` grouped by `tool`. Guest vs. signed-in breakdown. Selectable range: 7/30/90 days. |
| Content (เนื้อหา) | List of blog posts from the filesystem with publish dates. Explicitly labeled as a list, not stats — no view-count data exists. |
| System (ระบบ) | Outbound links only: Supabase dashboard, Vercel deployments. |

## Error Handling
Each card/section fetches independently; a failed query renders "โหลดไม่สำเร็จ" in that card only, without breaking the rest of the page.

## Testing
No test suite exists elsewhere in this project. Verification is manual via browser preview:
- Sign in with an allowlisted email → dashboard loads, all tabs render.
- Sign in with a non-allowlisted email → redirected away from `/admin`.
- Simulate a failed data fetch (e.g. temporarily bad query) → confirm only that card shows the error state.

## Out of Scope
- No new roles/permissions table (allowlist via env var is deliberately the simplest option for a single-admin site).
- No embedded server/log monitoring (link out instead).
- No historical view-count analytics for blog content.
