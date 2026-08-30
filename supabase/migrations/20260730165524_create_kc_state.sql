create table if not exists public.kc_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.kc_state enable row level security;

create policy "own row select" on public.kc_state
  for select using (auth.uid() = user_id);
create policy "own row insert" on public.kc_state
  for insert with check (auth.uid() = user_id);
create policy "own row update" on public.kc_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own row delete" on public.kc_state
  for delete using (auth.uid() = user_id);
;
