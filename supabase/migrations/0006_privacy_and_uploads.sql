-- Endurecimiento previo al lanzamiento público. Dos frentes, ambos al nivel
-- de Supabase (la anon key es pública: cualquiera puede pegarle directo a la
-- REST API saltándose el código de Next.js, así que la protección NO puede
-- vivir solo en el render).
--
-- 1) Privacidad de vecinos: sin sesión, las reseñas/fotos NO deben exponer el
--    nombre completo ni el id del autor. RLS es por fila; ocultar columnas es
--    con privilegios de columna. El rol `anon` pierde acceso a esas columnas y
--    en su lugar lee solo iniciales precalculadas.
-- 2) Subida de fotos: el bucket público solo acepta imágenes y hasta 2 MB, sin
--    importar por dónde entre la subida (server action o API directa).

-- ===========================================================================
-- 1a) Iniciales precalculadas para reseñas (lo único de autor que ve `anon`)
-- ===========================================================================

-- "Edgar Ivan Hernández" -> "E.I."  ·  nombre vacío -> "Vecino"
create or replace function public.initials_of(full_name text)
returns text language sql immutable as $$
  select coalesce(
    nullif(
      (
        select string_agg(upper(left(word, 1)), '.' order by ord) || '.'
        from (
          select word, ord
          from regexp_split_to_table(btrim(coalesce(full_name, '')), '\s+')
               with ordinality as t(word, ord)
          where word <> ''
          order by ord
          limit 2
        ) first_two
      ),
      ''
    ),
    'Vecino'
  );
$$;

alter table reviews add column if not exists author_initials text;

-- El trigger de autor ahora congela también las iniciales.
create or replace function public.set_review_author()
returns trigger language plpgsql security definer set search_path = public as
$$
begin
  new.author_name := (select name from profiles where id = new.user_id);
  new.author_initials := public.initials_of(new.author_name);
  return new;
end;
$$;

update reviews set author_initials = public.initials_of(author_name);

-- ===========================================================================
-- 1b) Privilegios de columna: `anon` no puede leer nombre ni ids de autor
-- ===========================================================================
-- Nota: quitamos el SELECT a nivel tabla y lo devolvemos acotado a columnas.
-- El rol `authenticated` (vecino con sesión) NO se toca: sigue viendo todo,
-- que es justo lo que promete el producto ("nombre+apellido con sesión").
-- Las políticas RLS pueden seguir referenciando user_id: sus expresiones se
-- evalúan internamente, no dependen de los privilegios de columna del que llama.

revoke select on reviews from anon;
grant select (
  id, provider_id, rating, comment, service_date, status, created_at,
  author_initials
) on reviews to anon;

revoke select on provider_photos from anon;
grant select (id, provider_id, url, created_at) on provider_photos to anon;

-- ===========================================================================
-- 2) Subida de fotos: solo imágenes, máx 2 MB, y solo bajo providers/
-- ===========================================================================

update storage.buckets
set allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png'],
    file_size_limit = 2097152  -- 2 MB
where id = 'photos';

drop policy photos_upload on storage.objects;
create policy photos_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'photos'
    and is_approved_neighbor()
    and (storage.foldername(name))[1] = 'providers'
  );
