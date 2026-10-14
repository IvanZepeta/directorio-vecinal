-- Categorías nuevas + links del proveedor (Facebook, Instagram, etc.).
-- Detalle y trampas en PLAN.md §10.3.1.
--
-- Se corre a mano en el SQL Editor, así que todo es re-ejecutable: pegarlo dos
-- veces no truena ni duplica.

-- ===========================================================================
-- 1) Categorías
-- ===========================================================================

-- Una categoría es dato, no código: la app solo lee `categories` y la columna
-- `icon` no se usa en la UI. `name` es unique, de ahí el `on conflict`.
insert into categories (name, icon) values
  -- Inflables, brincolines, mesas y sillas, animación, renta de quintas
  ('Eventos y fiestas', 'balloon'),
  -- Carga y traslado: mudanzas pequeñas, material de construcción, mercancía
  ('Fletes y mudanzas', 'truck')
on conflict (name) do nothing;

-- ===========================================================================
-- 2) Links del proveedor
-- ===========================================================================

-- El link se pinta como <a href> en la ficha. Si la BD aceptara cualquier
-- texto, alguien con la anon key y una sesión podría guardar `javascript:...`
-- saltándose Zod. Por eso el esquema (https) y el host por tipo se validan
-- aquí, no solo en la server action.
create or replace function public.is_valid_provider_link(kind text, url text)
returns boolean language sql immutable as $$
  select char_length(url) <= 500
    and url !~ '\s'
    and case kind
      when 'facebook'  then url ~* '^https://([a-z0-9-]+\.)*(facebook\.com|fb\.com|fb\.me)([/?#]|$)'
      when 'instagram' then url ~* '^https://([a-z0-9-]+\.)*instagram\.com([/?#]|$)'
      when 'tiktok'    then url ~* '^https://([a-z0-9-]+\.)*tiktok\.com([/?#]|$)'
      -- canva.com (diseños compartidos) y *.canva.site (sitios publicados)
      when 'canva'     then url ~* '^https://([a-z0-9-]+\.)*(canva\.com|canva\.site)([/?#]|$)'
      when 'maps'      then url ~* '^https://(maps\.app\.goo\.gl/|goo\.gl/maps|maps\.google\.com(\.[a-z]{2})?([/?#]|$)|(www\.)?google\.com(\.[a-z]{2})?/maps)'
      -- Sitio propio: cualquier host, pero solo https
      when 'website'   then url ~* '^https://[a-z0-9-]+(\.[a-z0-9-]+)+([:/?#]|$)'
      else false
    end;
$$;

-- Sin columna de autor a propósito: la propiedad sale de providers.created_by,
-- y así no hay un uuid de vecino más que esconderle a `anon` (ver 0006).
create table if not exists provider_links (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  kind text not null
    check (kind in ('facebook', 'instagram', 'tiktok', 'canva', 'maps', 'website')),
  url text not null,
  created_at timestamptz not null default now(),
  constraint provider_links_url_valid check (is_valid_provider_link(kind, url)),
  -- Un link por tipo: es lo que pide la UI y de paso topa en 6 los links por
  -- proveedor desde la BD, sin trigger.
  constraint provider_links_one_per_kind unique (provider_id, kind)
);

alter table provider_links enable row level security;

-- Visible si el proveedor es visible: el exists hereda la RLS de `providers`,
-- así los links de un proveedor oculto no se filtran por la REST API.
drop policy if exists provider_links_select on provider_links;
create policy provider_links_select on provider_links
  for select using (
    exists (select 1 from providers p where p.id = provider_id)
  );

-- Escribir: solo quien registró al proveedor o el admin. Más estricto que
-- provider_categories_insert (cualquier vecino aprobado): un link manda al
-- vecino fuera del sitio, no se le deja a cualquiera ponerlo en ficha ajena.
drop policy if exists provider_links_insert on provider_links;
create policy provider_links_insert on provider_links
  for insert with check (
    is_admin() or (
      is_approved_neighbor() and exists (
        select 1 from providers p
        where p.id = provider_id and p.created_by = auth.uid()
      )
    )
  );

-- Update y delete con la misma regla. Un vecino bloqueado deja de poder
-- tocar los links aunque haya registrado la ficha.
drop policy if exists provider_links_update on provider_links;
create policy provider_links_update on provider_links
  for update
  using (
    is_admin() or (
      is_approved_neighbor() and exists (
        select 1 from providers p
        where p.id = provider_id and p.created_by = auth.uid()
      )
    )
  )
  with check (
    is_admin() or (
      is_approved_neighbor() and exists (
        select 1 from providers p
        where p.id = provider_id and p.created_by = auth.uid()
      )
    )
  );

drop policy if exists provider_links_delete on provider_links;
create policy provider_links_delete on provider_links
  for delete using (
    is_admin() or (
      is_approved_neighbor() and exists (
        select 1 from providers p
        where p.id = provider_id and p.created_by = auth.uid()
      )
    )
  );

-- PostgREST cachea el esquema: sin esto, la API puede tardar en ver la tabla
-- nueva y la ficha (que la embebe) fallaría justo después de aplicar.
notify pgrst, 'reload schema';
