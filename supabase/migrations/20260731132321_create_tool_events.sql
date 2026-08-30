create table public.tool_events (
  id         bigint generated always as identity primary key,
  tool       text not null,
  event      text not null default 'use',
  user_id    uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.tool_events enable row level security;

create policy "anyone can log tool events" on public.tool_events
  for insert with check (true);

create index tool_events_tool_created_at_idx on public.tool_events (tool, created_at);
;
