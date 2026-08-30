-- KhunCool unlisted activity sharing.
create table public.kc_content_sets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  subject text,
  grade_level text,
  kind text not null default 'list',
  items jsonb not null,
  item_count integer generated always as (jsonb_array_length(items)) stored,
  visibility text not null default 'private',
  is_approved boolean not null default false,
  default_template text not null,
  template_config jsonb not null default '{}'::jsonb,
  play_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kc_content_sets_slug_format check (slug ~ '^[23456789abcdefghjkmnpqrstuvwxyz]{10}$'),
  constraint kc_content_sets_title_length check (char_length(title) between 1 and 120),
  constraint kc_content_sets_kind check (kind in ('list', 'pair')),
  constraint kc_content_sets_items_array check (jsonb_typeof(items) = 'array'),
  constraint kc_content_sets_items_count check (jsonb_array_length(items) between 0 and 200),
  constraint kc_content_sets_items_size check (octet_length(items::text) <= 65536),
  constraint kc_content_sets_visibility check (visibility in ('private', 'unlisted', 'public')),
  constraint kc_content_sets_template check (default_template in ('random-question', 'mystery-board')),
  constraint kc_content_sets_template_config_object check (jsonb_typeof(template_config) = 'object')
);

create index kc_content_sets_owner_updated_idx
  on public.kc_content_sets (owner_id, updated_at desc);
create index kc_content_sets_public_updated_idx
  on public.kc_content_sets (updated_at desc)
  where visibility = 'public' and is_approved;

alter table public.kc_content_sets enable row level security;

create function public.enforce_kc_content_set_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or (select auth.uid()) <> new.owner_id then
    raise exception 'content set owner must match the signed-in user';
  end if;
  if (select count(*) from public.kc_content_sets where owner_id = new.owner_id) >= 50 then
    raise exception 'content set quota exceeded';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_kc_content_set_quota() from public, anon, authenticated;

create trigger enforce_kc_content_set_quota
  before insert on public.kc_content_sets
  for each row execute function public.enforce_kc_content_set_quota();

revoke all on table public.kc_content_sets from anon, authenticated;
grant select (slug, title, kind, items, visibility, default_template, template_config, updated_at)
  on table public.kc_content_sets to anon, authenticated;
grant insert (owner_id, slug, title, subject, grade_level, kind, items, visibility, default_template, template_config)
  on table public.kc_content_sets to authenticated;
grant update (title, subject, grade_level, kind, items, visibility, default_template, template_config, updated_at)
  on table public.kc_content_sets to authenticated;
grant delete on table public.kc_content_sets to authenticated;

create policy "shared sets are readable"
  on public.kc_content_sets for select
  to anon, authenticated
  using (visibility in ('unlisted', 'public'));

create policy "owners can read private sets"
  on public.kc_content_sets for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "owners can create sets"
  on public.kc_content_sets for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and visibility in ('private', 'unlisted')
    and is_approved = false
  );

create policy "owners can update sets"
  on public.kc_content_sets for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id and is_approved = false);

create policy "owners can delete sets"
  on public.kc_content_sets for delete
  to authenticated
  using ((select auth.uid()) = owner_id);
