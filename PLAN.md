# Directorio vecinal — Plan del MVP

> Directorio de proveedores de servicios recomendados y calificados por vecinos
> verificados del fraccionamiento. Resuelve: "¿alguien conoce un buen plomero?"
> preguntado cada semana en el grupo de WhatsApp, con respuestas que se pierden.

**Estado:** definición · **Última actualización:** 2026-06-11

---

## 1. Objetivo y métrica de éxito

Validar en 30 días post-lanzamiento si la comunidad lo adopta:

| Métrica | Meta a 30 días |
|---|---|
| Vecinos registrados y aprobados | 30 |
| Reseñas orgánicas (no sembradas) | 15 |
| Clicks de contacto WhatsApp | 50 |

Si se cumple → fase 2 (administración del parque + segundo fraccionamiento).
Si no → se aprende y se cierra. Inversión acotada: ~3 fines de semana.

## 2. Alcance del MVP

### Dentro
- **Directorio de proveedores**: ficha con nombre, categoría, descripción,
  fotos de trabajos, zonas donde trabaja, botón "Contactar por WhatsApp".
- **Reseñas**: 1–5 estrellas + comentario + fotos opcionales + fecha aproximada
  del servicio. Solo vecinos aprobados.
- **Alta crowdsourced**: cualquier vecino aprobado puede dar de alta proveedores.
  El proveedor no necesita cuenta.
- **Registro de vecinos**: nombre, privada/calle, teléfono → estado `pendiente`
  → aprobación manual del admin.
- **Eventos del parque**: lista simple curada por el admin (gancho de tráfico).
- **Reportes**: botón para reportar reseña/proveedor; el admin oculta.
- **Búsqueda y filtro por categoría.**
- **Tracking de clicks WhatsApp** vía redirect `/ir/{proveedorId}` (métrica de
  monetización futura).

### Fuera (no negociable en v1)
- Pagos, cobros, comisiones, planes destacados.
- Portal de autogestión para proveedores.
- Reserva de cancha / módulos para la administración (fase 2).
- Chat interno, push notifications, app nativa.
- Carpooling.

## 3. Stack

| Capa | Tecnología | Costo |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | — |
| UI | Tailwind CSS + shadcn/ui | — |
| BaaS | Supabase: Postgres + Auth (magic link) + Storage | $0 |
| Hosting | Vercel (Hobby) | $0 |
| Automatización | n8n en VPS propio (avisos, keep-alive, respaldos) | ~$5 USD/mes (ya planeado) |
| Dominio | .com/.mx | ~$300 MXN/año |

Reglas de arquitectura:
- El navegador **nunca** toca la BD: client components → server actions.
- Todo acceso a datos vive en `lib/data/`, organizado por módulo de dominio
  (`providers.ts`, `reviews.ts`, `profiles.ts`...). Validaciones e invariantes
  centralizadas en Zod + RLS. DDD táctico completo (agregados, entidades con
  comportamiento, eventos de dominio): NO en el MVP.
- Idiomas: todo lo interno (código, tablas, columnas, funciones) en inglés;
  textos de UI, URLs públicas y datos (categorías) en español.
- `lib/supabase/server.ts` (con sesión, backend) vs `client.ts` (solo login).
- Auth = JWT gestionado por Supabase; autorización = políticas RLS en Postgres
  (segundo candado: vecino no aprobado no puede escribir, ni saltándose la UI).
- Fotos: comprimir en el cliente (~250 KB) antes de subir a Storage.
- Multi-tenant desde el día 1 (tabla `fraccionamientos`, todo cuelga de ahí).

## 4. Modelo de datos

```
neighborhoods    (id, name, slug)
profiles         (id→auth, neighborhood_id, name, phone, street, status: pending|approved|blocked, is_admin)
categories       (id, name, icon)
providers        (id, neighborhood_id, name, description, whatsapp, areas, created_by, status: active|hidden)
provider_categories (provider_id, category_id)   -- M2M: un proveedor ofrece varios servicios
provider_photos  (id, provider_id, url, uploaded_by)
reviews          (id, provider_id, user_id, author_name, rating, comment, service_date, status: visible|hidden)
review_photos    (id, review_id, url)
reports          (id, type: review|provider, target_id, user_id, reason, resolved)
events           (id, neighborhood_id, title, starts_at, location, image_url, description)
whatsapp_clicks  (id, provider_id, user_id?, created_at)
```

## 5. Pantallas

1. **Home / directorio** — buscador, chips de categoría, tarjetas de proveedor
   (foto, estrellas, # reseñas). Pública (SEO).
2. **Ficha de proveedor** — chips con todas sus categorías, galería, reseñas,
   botón WhatsApp. Pública. (El filtro del directorio lo incluye si ofrece
   al menos una de las categorías seleccionadas.)
3. **Alta de proveedor** — formulario con fotos. Solo aprobados.
4. **Nueva reseña** — estrellas, comentario, fotos. Solo aprobados.
5. **Registro / login** — magic link + datos de perfil.
6. **Admin** — cola de aprobación de vecinos, reportes, eventos.
7. **Eventos** — lista simple. Pública.

## 6. Workflows n8n (VPS)

- Aviso al admin (WhatsApp/Telegram) por registro nuevo o reporte.
- Keep-alive: query a Supabase cada 3 días (evita pausa del free tier).
- Respaldo: `pg_dump` diario guardado en el VPS.
- (Post-MVP) digest semanal al grupo, recordatorio de reseña post-click,
  reporte mensual de clicks por proveedor.

## 7. Plan de lanzamiento

1. **Antes de programar**: minar el historial del grupo de WhatsApp →
   30–50 proveedores semilla con quién los recomendó (Excel).
2. Construir MVP (~3 fines de semana) y precargar semilla.
3. Lanzar en el grupo como favor a la comunidad, no como producto:
   "junté todos los recomendados que se han compartido aquí".
4. Medir métricas de la sección 1.

## 8. Monetización (futura, NO en MVP)

Orden: (1) proveedores destacados/verificados con suscripción mensual —
argumento de venta: "te mandamos N contactos el mes pasado" (tabla
`whatsapp_clicks`); (2) módulo B2B para administración (reservas, avisos,
cuotas); (3) replicar en fraccionamientos vecinos.
Al monetizar: migrar de Vercel Hobby (no comercial) a Vercel Pro o al VPS
con Coolify/Dokploy.

## 9. Decisiones pendientes (llenar antes del esqueleto)

- [ ] Nombre del producto y dominio
- [ ] Fraccionamiento piloto y nombre exacto (slug inicial)
- [ ] Categorías iniciales (~10; propuesta: plomería, electricidad, clima,
      jardinería, fumigación, albañilería, pintura, comida/repostería,
      costura, limpieza)
- [ ] ¿Quién más será admin además de Edgar?
- [ ] Proveedor del VPS y dominio para n8n
