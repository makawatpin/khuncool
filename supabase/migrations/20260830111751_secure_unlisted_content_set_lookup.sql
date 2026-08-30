revoke select on table public.kc_content_sets from anon;

drop policy "anonymous users can read shared sets" on public.kc_content_sets;
drop policy "authenticated users can read accessible sets" on public.kc_content_sets;

create policy "authenticated users can read owned or approved sets"
  on public.kc_content_sets for select
  to authenticated
  using (
    (select auth.uid()) = owner_id
    or (visibility = 'public' and is_approved = true)
  );

drop policy "owners can update sets" on public.kc_content_sets;
create policy "owners can update sets"
  on public.kc_content_sets for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and visibility in ('private', 'unlisted')
    and is_approved = false
  );

create function public.get_kc_shared_content_set(
  shared_slug text,
  requested_template text
)
returns table (
  slug text,
  title text,
  kind text,
  items jsonb,
  default_template text,
  template_config jsonb
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
    content_set.items,
    content_set.default_template,
    content_set.template_config
  from public.kc_content_sets as content_set
  where content_set.slug = shared_slug
    and content_set.default_template = requested_template
    and (
      content_set.visibility = 'unlisted'
      or (content_set.visibility = 'public' and content_set.is_approved = true)
    )
  limit 1;
$$;

revoke all on function public.get_kc_shared_content_set(text, text) from public;
grant execute on function public.get_kc_shared_content_set(text, text)
  to anon, authenticated, service_role;
