-- Lets a signed-in teacher list the share links they created (/sets).
--
-- A plain select cannot do this. `authenticated` is granted select only on
-- (slug, title, kind, items, visibility, default_template, template_config,
-- updated_at) — not owner_id — so the query cannot filter by owner, and the
-- read policy also exposes every *other* teacher's unlisted rows. Rather than
-- widening the column grants (which would leak owner_id on public rows), this
-- mirrors get_kc_shared_content_set: a security definer function that decides
-- for itself which rows the caller may see.
create function public.list_my_kc_content_sets()
returns table (
  slug text,
  title text,
  kind text,
  visibility text,
  default_template text,
  template_config jsonb,
  item_count integer,
  play_count bigint,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    content_set.slug,
    content_set.title,
    content_set.kind,
    content_set.visibility,
    content_set.default_template,
    content_set.template_config,
    content_set.item_count,
    content_set.play_count,
    content_set.created_at,
    content_set.updated_at
  from public.kc_content_sets as content_set
  where content_set.owner_id = (select auth.uid())
  order by content_set.updated_at desc
  limit 100;
$$;

-- Deliberately no `items`: the list view only needs counts, and keeping the
-- question text out of it means this function cannot become a bulk export.
revoke all on function public.list_my_kc_content_sets() from public, anon;
grant execute on function public.list_my_kc_content_sets() to authenticated;
revoke execute on function public.list_my_kc_content_sets() from service_role;
