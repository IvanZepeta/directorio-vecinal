-- Neighborhood directory: initial schema
-- Run in the Supabase SQL Editor (or with `supabase db push`).

create extension if not exists "pgcrypto";

-- ===========================================================================
-- Tables
-- ===========================================================================

create table neighborhoods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  neighborhood_id uuid not null references neighborhoods(id),
  name text not null,
  phone text not null,
  street text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'blocked')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text
);

create table providers (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid not null references neighborhoods(id),
  name text not null,
  description text,
  whatsapp text not null,
  areas text,
  status text not null default 'active'
    check (status in ('active', 'hidden')),
  created_by uuid not null default auth.uid() references profiles(id),
  created_at timestamptz not null default now()
);

create table provider_categories (
  provider_id uuid not null references providers(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (provider_id, category_id)
);

create table provider_photos (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  url text not null,
  uploaded_by uuid not null default auth.uid() references profiles(id),
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  user_id uuid not null default auth.uid() references profiles(id),
  author_name text,
  rating int not null check (rating between 1 and 5),
  comment text,
  service_date date,
  status text not null default 'visible'
    check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);

create table review_photos (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  url text not null
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('review', 'provider')),
  target_id uuid not null,
  user_id uuid not null default auth.uid() references profiles(id),
  reason text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid not null references neighborhoods(id),
  title text not null,
  starts_at timestamptz not null,
  location text,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table whatsapp_clicks (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  user_id uuid,
  created_at timestamptz not null default now()
);

create index idx_providers_neighborhood on providers(neighborhood_id);
create index idx_provider_categories_category on provider_categories(category_id);
create index idx_reviews_provider on reviews(provider_id);
create index idx_clicks_provider on whatsapp_clicks(provider_id, created_at);

-- ===========================================================================
-- Helper functions (security definer: they bypass RLS to avoid recursion)
-- ===========================================================================

create or replace function public.is_approved_neighbor()
returns boolean language sql stable security definer set search_path = public as
$$ select exists (
     select 1 from profiles
     where id = auth.uid() and status = 'approved'
   ); $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as
$$ select exists (
     select 1 from profiles
     where id = auth.uid() and status = 'approved' and is_admin
   ); $$;

-- Nobody approves themselves or grants themselves admin
create or replace function public.protect_profile_columns()
returns trigger language plpgsql security definer set search_path = public as
$$
begin
  -- auth.uid() null = SQL editor or service role: allowed (admin bootstrap)
  if auth.uid() is not null and not is_admin() and (
    new.status is distinct from old.status
    or new.is_admin is distinct from old.is_admin
  ) then
    raise exception 'Only an administrator can change status or permissions';
  end if;
  return new;
end;
$$;

create trigger trg_protect_profile
  before update on profiles
  for each row execute function protect_profile_columns();

-- Freeze the author name on the review (avoids exposing the profiles table)
create or replace function public.set_review_author()
returns trigger language plpgsql security definer set search_path = public as
$$
begin
  new.author_name := (select name from profiles where id = new.user_id);
  return new;
end;
$$;

create trigger trg_review_author
  before insert on reviews
  for each row execute function set_review_author();

-- Assign the provider's neighborhood: the registering neighbor's one,
-- or the first one (for seeds from the SQL editor)
create or replace function public.set_provider_neighborhood()
returns trigger language plpgsql security definer set search_path = public as
$$
begin
  if new.neighborhood_id is null then
    new.neighborhood_id := coalesce(
      (select neighborhood_id from profiles where id = auth.uid()),
      (select id from neighborhoods order by created_at limit 1)
    );
  end if;
  return new;
end;
$$;

create trigger trg_provider_neighborhood
  before insert on providers
  for each row execute function set_provider_neighborhood();

-- ===========================================================================
-- Row Level Security
-- ===========================================================================

alter table neighborhoods enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table providers enable row level security;
alter table provider_categories enable row level security;
alter table provider_photos enable row level security;
alter table reviews enable row level security;
alter table review_photos enable row level security;
alter table reports enable row level security;
alter table events enable row level security;
alter table whatsapp_clicks enable row level security;

create policy neighborhoods_select on neighborhoods
  for select using (true);

create policy profiles_select on profiles
  for select using (id = auth.uid() or is_admin());
create policy profiles_insert on profiles
  for insert with check (
    id = auth.uid() and status = 'pending' and is_admin = false
  );
create policy profiles_update on profiles
  for update using (id = auth.uid() or is_admin());

create policy categories_select on categories
  for select using (true);
create policy categories_admin on categories
  for all using (is_admin()) with check (is_admin());

create policy providers_select on providers
  for select using (status = 'active' or is_admin());
create policy providers_insert on providers
  for insert with check (is_approved_neighbor() and created_by = auth.uid());
create policy providers_update on providers
  for update using (is_admin());

create policy provider_categories_select on provider_categories
  for select using (true);
create policy provider_categories_insert on provider_categories
  for insert with check (is_approved_neighbor());
create policy provider_categories_delete on provider_categories
  for delete using (is_admin());

create policy provider_photos_select on provider_photos
  for select using (true);
create policy provider_photos_insert on provider_photos
  for insert with check (is_approved_neighbor() and uploaded_by = auth.uid());
create policy provider_photos_delete on provider_photos
  for delete using (is_admin());

create policy reviews_select on reviews
  for select using (
    status = 'visible' or user_id = auth.uid() or is_admin()
  );
create policy reviews_insert on reviews
  for insert with check (is_approved_neighbor() and user_id = auth.uid());
create policy reviews_update on reviews
  for update using (is_admin());

create policy review_photos_select on review_photos
  for select using (true);
create policy review_photos_insert on review_photos
  for insert with check (is_approved_neighbor());

create policy reports_insert on reports
  for insert with check (is_approved_neighbor() and user_id = auth.uid());
create policy reports_select on reports
  for select using (is_admin());
create policy reports_update on reports
  for update using (is_admin());

create policy events_select on events
  for select using (true);
create policy events_admin on events
  for all using (is_admin()) with check (is_admin());

create policy whatsapp_clicks_insert on whatsapp_clicks
  for insert with check (true);
create policy whatsapp_clicks_select on whatsapp_clicks
  for select using (is_admin());

-- ===========================================================================
-- Storage: public photos bucket
-- ===========================================================================

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy photos_read on storage.objects
  for select using (bucket_id = 'photos');
create policy photos_upload on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and is_approved_neighbor());

-- ===========================================================================
-- Seed (data stays in Spanish: it is user-facing content)
-- ===========================================================================

insert into neighborhoods (name, slug)
values ('Sector Francés', 'sector-frances');

insert into categories (name, icon) values
  ('Plomería', 'droplet'),
  ('Electricidad', 'bolt'),
  ('Clima y minisplit', 'snowflake'),
  ('Jardinería', 'plant'),
  ('Fumigación', 'bug'),
  ('Albañilería', 'wall'),
  ('Pintura', 'brush'),
  ('Comida y repostería', 'cake'),
  ('Costura', 'needle'),
  ('Limpieza', 'wash');

-- After signing up in the app, make yourself admin with:
-- update profiles set status = 'approved', is_admin = true
-- where id = (select id from auth.users where email = 'you@email.com');
