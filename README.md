# Directorio vecinal

Directorio de proveedores de servicios recomendados y calificados por vecinos
verificados del fraccionamiento. Ver [PLAN.md](./PLAN.md) para el alcance
completo del MVP y las decisiones de producto.

**Stack:** Next.js (App Router) + TypeScript + Tailwind · Supabase (Postgres,
Auth con magic link, Storage) · Vercel · n8n en VPS para automatizaciones.

## Estado (ago 2026): listo para lanzar

El MVP está completo y en producción. **No queda nada técnico bloqueante.**

- **Deploy**: Vercel (repo GitHub `IvanZepeta/directorio-vecinal`, push a `main` = deploy). El sitio se sirve en la **URL de Vercel** (`directorio-vecinal.vercel.app`); no hay dominio propio apuntando a la app.
- **Correo**: magic link vía **Resend** (subdominio verificado `send.edgarhernandez.tech`, SPF/DKIM/DMARC en verde) como Custom SMTP en Supabase. Template en español ("Magic Link"). Rate limits subidos. Llega a bandeja, no spam. El dominio `edgarhernandez.tech` (Hostinger) existe **solo** para esto: Resend exige un dominio verificado para enviar. Su DNS apunta al hosting de Hostinger, no a Vercel, así que el apex no sirve el sitio — y no hace falta que lo sirva.
- **Lanzamiento en modo curado (opción A)**: directorio de solo lectura sembrado por el admin; los vecinos consultan y contactan por WhatsApp (el click se registra sin login). Las reseñas/registros abiertos vienen después, cuando haya tracción.

**Seguridad:** auditoría previa al lanzamiento hecha (ago 2026) y correcciones aplicadas — privacidad del autor forzada en la BD (migración 0006, privilegios de columna para `anon`), subida de fotos restringida (tipo/tamaño/carpeta) y cabeceras de seguridad (CSP, HSTS, etc.). Detalle en la sección [Seguridad](#seguridad).

**Lo que falta es operativo, no código:**
1. Sembrar 30-50 proveedores del grupo de WhatsApp (como admin) + reseñar los que dieron servicio.
2. Redactar y mandar el mensaje de lanzamiento al grupo.
3. **Antes de que entren vecinos** (ya no opcional): keep-alive de Supabase (evita que el proyecto se pause por inactividad) y respaldo `pg_dump` diario, ambos en el VPS con n8n. En cuanto haya reseñas reales es data que no querés perder.

## Arranque local

### 1. Crear el proyecto de Supabase

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. Abre el **SQL Editor** y ejecuta **en orden** todas las migraciones de
   [`supabase/migrations/`](./supabase/migrations) (`0001_initial.sql` →
   `0006_privacy_and_uploads.sql`). La 0001 crea tablas, RLS, bucket de fotos
   y categorías; las siguientes agregan ownership, borrado/autor de fotos, el
   límite de una reseña por vecino y, la 0006, la privacidad del autor sin
   sesión (privilegios de columna) más los límites de tipo/tamaño del bucket.
3. En **Authentication → URL Configuration**, agrega
   `http://localhost:3000/auth/callback` a las Redirect URLs.

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y llena con los valores de
**Settings → API** de tu proyecto:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Correr

```bash
pnpm install
pnpm dev
```

Abre http://localhost:3000. Si falta configurar Supabase, la página misma
te muestra los pasos.

### 4. Hacerte administrador

Regístrate en la app (login con tu correo + completar registro) y luego, en
el SQL Editor de Supabase:

```sql
update profiles set status = 'approved', is_admin = true
where id = (select id from auth.users where email = 'tu@correo.com');
```

A partir de ahí apruebas al resto de los vecinos desde `/admin`.

## Estructura

```
app/                  páginas, server actions y route handlers (el "backend")
  ir/[id]/route.ts    registra el click y redirige a WhatsApp (métrica clave)
components/           componentes de UI
lib/config.ts         helpers de configuración
lib/supabase/         conexiones (server con sesión, client solo para login)
lib/data/             capa de acceso a datos — TODA query vive aquí
lib/validations.ts    esquemas Zod (primera defensa; RLS es la segunda)
supabase/migrations/  SQL del esquema + políticas RLS
```

Reglas del proyecto:

- El navegador **nunca** consulta la BD: componentes client → server actions.
- Toda query pasa por `lib/data/`. Nada de Supabase suelto en páginas.
- Idiomas: código, tablas y columnas en **inglés**; textos de UI, URLs
  (`/proveedor`, `/alta`) y datos (nombres de categorías) en **español**.
- Lo que no está en el PLAN.md no se construye (todavía).

## Deploy

1. Sube el repo a GitHub y conéctalo en [vercel.com](https://vercel.com).
2. Configura las dos variables de entorno en Vercel.
3. Agrega `https://<tu-app>.vercel.app/auth/callback` a las Redirect URLs de
   Supabase. La lista blanca valida el host completo: autorizar `localhost` no
   autoriza la URL de Vercel, y si algún día se apunta un dominio propio a la
   app hay que agregar también su `/auth/callback` o el magic link falla ahí.

## Seguridad

Modelo: la `anon key` es **pública** (viaja al navegador), así que la frontera real
es la base de datos, no el código de Next.js — cualquiera puede pegarle a la REST
API de Supabase directo. Todo se enforce en Postgres:

- **RLS** en las 11 tablas (políticas en las migraciones). Un vecino no aprobado no
  escribe ni saltándose la UI.
- **Privilegios de columna** (migración 0006): sin sesión, `anon` NO puede leer
  `author_name`/`user_id` de reseñas ni `author_name`/`uploaded_by` de fotos; solo
  ve `author_initials` precalculadas. La capa de datos pide las columnas de autor
  únicamente cuando hay sesión.
- **Subida de fotos**: el bucket `photos` acepta solo `webp/jpeg/png` ≤ 2 MB bajo
  `providers/` (límites del bucket + policy en 0006); validación server-side extra
  en `uploadProviderPhoto`.
- **Cabeceras** (`next.config.ts`): CSP acotada al proyecto de Supabase, HSTS,
  X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

Verificación rápida (como `anon`, con la anon key): `select=author_name` sobre
`reviews` debe devolver `42501 permission denied`; `select=author_initials` debe
funcionar.

El endurecimiento pendiente se rastrea fuera del repo (ver
`SECURITY-TODO.local.md`, ignorado por git).

## Pendientes conocidos (diferidos a propósito — construir cuando haya señal de uso)

- **Reportar reseña/proveedor**: la tabla `reports` existe; falta UI. Se construye cuando un vecino reporte algo (hoy la moderación la hace el admin desde Supabase).
- **Bloquear vecinos ya aprobados** desde `/admin`: hoy solo se puede bloquear al aprobar (botón Rechazar). Para bloquear a un aprobado se usa Supabase (`update profiles set status='blocked'`). Reutilizaría `setProfileStatus`.
- **Alta de eventos desde `/admin`** (hoy se insertan por SQL).
- **Reseñas con fotos** (la tabla `review_photos` ya existe; falta UI).
- **Workflows n8n**: keep-alive de Supabase y respaldo `pg_dump` (prioritarios — ver "Estado"); aviso de registro nuevo/reporte al admin; digest semanal.
- **PWA** (manifest + íconos + service worker): se empezó y se revirtió; retomar si se quiere "instalar en inicio". El script que generaba los íconos se fue con el revert — hay que rehacerlo (`scripts/` y `public/` están vacíos).
- **Página de perfil / eliminar usuario**: descartados por YAGNI (ver decisiones abajo).
- **Endurecimiento de seguridad**: rastreado fuera del repo (ver la sección [Seguridad](#seguridad)).

## Decisiones de producto tomadas

- **Una reseña por vecino por proveedor** (constraint `reviews_one_per_user`); si cambia de opinión, edita la suya.
- **Ownership**: autor edita/borra su reseña y sus fotos; el creador edita el proveedor pero NO lo borra (es contenido comunitario); el admin modera (ocultar vía `status`).
- **Fotos**: solo estáticas, comprimidas a WebP en cliente (~250 KB), máx 4 por vecino y 12 por proveedor.
- **Privacidad**: nombre del autor en reseñas = iniciales sin sesión / nombre+apellido con sesión; en fotos oculto sin sesión. Teléfono del proveedor es público (dato de negocio); teléfono del vecino solo lo ve el admin.
- **Eliminar usuario**: nunca desde la app (requeriría service_role); se inhabilita (`blocked`) o se borra desde el Dashboard de Supabase.
