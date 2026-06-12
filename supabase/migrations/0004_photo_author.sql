-- Show who uploaded each photo (name only, same pattern as reviews)

alter table provider_photos add column author_name text;

create or replace function public.set_photo_author()
returns trigger language plpgsql security definer set search_path = public as
$$
begin
  new.author_name := (select name from profiles where id = new.uploaded_by);
  return new;
end;
$$;

create trigger trg_photo_author
  before insert on provider_photos
  for each row execute function set_photo_author();

-- Backfill existing photos
update provider_photos
set author_name = (select name from profiles where id = uploaded_by)
where author_name is null;
