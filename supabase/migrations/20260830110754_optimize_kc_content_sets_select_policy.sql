drop policy "shared sets are readable" on public.kc_content_sets;
drop policy "owners can read private sets" on public.kc_content_sets;

create policy "anonymous users can read shared sets"
  on public.kc_content_sets for select
  to anon
  using (visibility in ('unlisted', 'public'));

create policy "authenticated users can read accessible sets"
  on public.kc_content_sets for select
  to authenticated
  using (
    visibility in ('unlisted', 'public')
    or (select auth.uid()) = owner_id
  );
