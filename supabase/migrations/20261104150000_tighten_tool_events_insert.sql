-- tool_events accepted anything from anyone.
--
-- The table was created with `for insert with check (true)` and no column
-- grants, which left three problems:
--
--   1. `user_id` was writable by the client. Nothing in the app ever sent
--      it, but anyone holding the (public) anon key could post events
--      attributed to another teacher's account id, quietly poisoning the
--      only usage numbers the admin dashboard has.
--   2. Because nothing ever sent it, `user_id` was in fact always null — so
--      the "signed in vs guest" split on the admin tools tab has always
--      read 100% guest. It was not a lie about the data; there was no data.
--      Filling it from the JWT fixes the hole and the gap at once.
--   3. `tool` and `event` were unbounded text, so a single insert could
--      carry megabytes, and `event` could be any string at all while the
--      dashboard only understands two values.
--
-- Not fixed here, and worth being plain about: this does NOT rate limit.
-- An anonymous insert endpoint plus a public anon key means anyone can add
-- rows as fast as they like, and RLS has no notion of a caller or an IP to
-- throttle. Closing that means moving the write behind a route that can
-- throttle it, or leaning on Supabase's own limits — a bigger change than
-- this, and a separate decision.

-- `user_id` now comes from the access token, not the request body. A column
-- default is evaluated in the inserting session, where PostgREST has set the
-- JWT claims, so an anonymous caller gets null and a signed-in one gets
-- their own id. It cannot be spoofed because the column is not grantable to
-- the client at all (see the grants below).
-- Plain `auth.uid()`, not `(select auth.uid())`: the subquery wrapper is a
-- row-level-security optimisation and Postgres rejects a subquery in a
-- DEFAULT expression outright.
alter table public.tool_events
  alter column user_id set default auth.uid();

alter table public.tool_events
  add constraint tool_events_tool_length check (char_length(tool) between 1 and 120),
  add constraint tool_events_event_known check (event in ('use', 'view'));

-- Default Supabase grants hand anon and authenticated every privilege on a
-- new table in `public`; only the absence of policies was keeping reads,
-- updates and deletes out, which is one accidental policy away from being
-- wrong. Take the privileges away and hand back exactly the two columns a
-- usage ping needs. This matches how kc_content_sets is already granted.
revoke all on table public.tool_events from anon, authenticated;
grant insert (tool, event) on table public.tool_events to anon, authenticated;

-- The admin APIs read this table with the service-role key, which bypasses
-- RLS. Stated explicitly so the next reader does not have to infer it from
-- Supabase's defaults.
grant select on table public.tool_events to service_role;

drop policy "anyone can log tool events" on public.tool_events;

-- Belt and braces next to the column grants: even if `user_id` were ever
-- granted again, a row still has to claim either nobody or the caller.
create policy "log own usage events"
  on public.tool_events for insert
  to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));
