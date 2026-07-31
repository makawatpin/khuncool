# Admin dashboard — one-time setup

## 1) Database
`tool_events` table already applied via Supabase MCP migration `create_tool_events`
(insert-only from clients; reads happen only through the service-role key in
`/api/admin/*` route handlers).

## 2) Environment variables
Add to `.env.local` (and to Vercel project env vars):

```
SUPABASE_SERVICE_ROLE_KEY=<service role key, from Supabase project settings → API>
ADMIN_EMAILS=you@example.com,someoneelse@example.com
```

`SUPABASE_SERVICE_ROLE_KEY` must never be prefixed with `NEXT_PUBLIC_` — it is
read only in server-side route handlers (`app/api/admin/**/route.ts`) and must
never reach the browser bundle.
