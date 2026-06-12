-- Photo ownership: whoever uploaded a photo can delete it (admins too).

drop policy provider_photos_delete on provider_photos;
create policy provider_photos_delete on provider_photos
  for delete using (uploaded_by = auth.uid() or is_admin());

-- Allow removing the underlying file from storage (own files or admin)
create policy photos_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'photos'
    and (owner_id = (select auth.uid())::text or public.is_admin())
  );
