-- Ownership rules:
-- - A neighbor can edit and delete their own review.
-- - The neighbor who registered a provider can edit it (not delete it).

-- Reviews: owner can edit (only while visible) and delete
create policy reviews_update_own on reviews
  for update
  using (user_id = auth.uid() and status = 'visible')
  with check (user_id = auth.uid() and status = 'visible');

create policy reviews_delete_own on reviews
  for delete using (user_id = auth.uid() or is_admin());

-- Providers: creator can edit. No delete policy on purpose.
create policy providers_update_own on providers
  for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- Provider categories: the creator can manage them (needed to edit services)
drop policy provider_categories_delete on provider_categories;
create policy provider_categories_delete on provider_categories
  for delete using (
    is_admin() or exists (
      select 1 from providers p
      where p.id = provider_id and p.created_by = auth.uid()
    )
  );
