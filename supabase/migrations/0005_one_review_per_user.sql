-- Una reseña por vecino por proveedor (si cambia de opinión, edita la suya).

-- 1) Limpia duplicados de pruebas: conserva la reseña más reciente de cada
--    par (proveedor, vecino) y borra las anteriores. Si no hay duplicados,
--    no borra nada.
delete from reviews r
using reviews r2
where r.provider_id = r2.provider_id
  and r.user_id = r2.user_id
  and r.created_at < r2.created_at;

-- 2) Candado a nivel base: impide más de una reseña por vecino-proveedor.
alter table reviews
  add constraint reviews_one_per_user unique (provider_id, user_id);
