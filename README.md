# Directorio vecinal

Directorio de proveedores de servicios recomendados y calificados por vecinos
verificados del fraccionamiento. Ver [PLAN.md](./PLAN.md) para el alcance
completo del MVP y las decisiones de producto.

**Stack:** Next.js (App Router) + TypeScript + Tailwind · Supabase (Postgres,
Auth con magic link, Storage) · Vercel · n8n en VPS para automatizaciones.

## Arranque local

### 1. Crear el proyecto de Supabase

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. Abre el **SQL Editor** y ejecuta el contenido completo de
   [`supabase/migrations/0001_initial.sql`](./supabase/migrations/0001_initial.sql)
   (crea tablas, políticas RLS, bucket de fotos y categorías semilla).
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
3. Agrega `https://tu-dominio.com/auth/callback` a las Redirect URLs de
   Supabase.

## Pendientes conocidos (post-esqueleto)

- Compresión de imágenes en el cliente antes de subir.
- Reseñas con fotos (la tabla `fotos_resena` ya existe; falta UI).
- Botón de reportar reseña/proveedor (tabla `reportes` lista; falta UI).
- Alta de eventos desde `/admin` (hoy se insertan por SQL).
- Workflows n8n: aviso de registro nuevo, keep-alive de Supabase, respaldo.
- PWA (manifest + íconos) para "instalar" en el celular.
