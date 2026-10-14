# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Directorio de proveedores para un fraccionamiento. Next.js 16 (App Router) +
Supabase. El alcance del MVP y las decisiones de producto viven en
[PLAN.md](./PLAN.md); el estado de lanzamiento y seguridad, en
[README.md](./README.md).

## Comandos

```bash
pnpm dev      # http://localhost:3000
pnpm build
pnpm lint     # eslint (flat config, eslint-config-next)
```

No hay suite de pruebas. El ciclo de verificación es `pnpm lint` + `pnpm build`
(tsc corre dentro del build), más la comprobación de la invariante más frágil
del proyecto: como `anon`, con la anon key, `select=author_name` sobre `reviews`
debe devolver `42501 permission denied` y `select=author_initials` debe
funcionar (comando en el README, sección Seguridad).

No hay Supabase CLI local. Las migraciones se aplican **a
mano y en orden** pegándolas en el SQL Editor del proyecto de Supabase
(`supabase/migrations/0001…` → `0006…`); no hay `supabase db push`. Al agregar
una migración, numérala siguiendo la serie y asume que alguien la va a correr
manualmente en producción.

Sin `.env.local` válido la app no truena: `isSupabaseConfigured()` hace que cada
página renderice `<SetupNotice />` con los pasos. Si ves esa pantalla, faltan
las variables, no está roto el código.

## Arquitectura

### La frontera de seguridad es Postgres, no Next.js

La `anon key` es pública y viaja al navegador, así que cualquiera puede pegarle
a la REST API de Supabase saltándose por completo el código de la app. **Toda
regla que importe se enforce en la BD** (RLS + privilegios de columna, en las
migraciones). Zod en las server actions es UX y primera defensa, nunca la
única. Al agregar una capacidad, la pregunta obligada es "¿qué pasa si alguien
la llama con curl y la anon key?".

Consecuencia concreta y no obvia — **privacidad por privilegios de columna**
(migración 0006): el rol `anon` tiene *revocado* el `select` sobre
`reviews.author_name`, `reviews.user_id`, `provider_photos.author_name` y
`provider_photos.uploaded_by`. Sin sesión solo existe `author_initials`
que congela el trigger `set_review_author` al insertar (más el backfill de la
propia 0006). Por eso `getProvider(id, includePrivate)` construye el
`select` en dos variantes: **si se piden columnas de autor sin sesión la query
falla con `42501`**, no devuelve null. Cualquier query nueva sobre esas tablas
tiene que respetar ese par público/privado.

El enmascarado se hace en el **servidor** antes de pasar datos a componentes
cliente (ver `app/proveedor/[id]/page.tsx`): el nombre completo y los ids no
deben viajar en el payload RSC si no hay sesión. No mandes el objeto crudo y
enmascares en el cliente.

### Flujo de datos

```
componente cliente → server action (app/**/actions.ts) → lib/data/* → Supabase
```

- El navegador **nunca** consulta la BD. `lib/supabase/client.ts` existe solo
  para el magic link.
- **Toda query vive en `lib/data/`.** Nada de `createServerSupabase()` suelto en
  páginas o componentes. Las únicas excepciones son las que no leen datos de
  dominio: `app/actions.ts` (signOut), `app/auth/callback/route.ts` y
  `app/ir/[id]/route.ts` (lee un solo campo para redirigir).
- Las server actions siguen un patrón fijo: `getCurrentProfile()` → verificar
  `profile.status === "approved"` → `safeParse` con el esquema de
  `lib/validations.ts` → llamar a `lib/data/` → `revalidatePath` o `redirect`.
  Devuelven un `FormState` (`{ error?, fieldErrors?, success? }`) que el
  componente consume con `useActionState`. Nunca lanzan al cliente: atrapan y
  devuelven mensaje en español.
- Ownership (autor edita lo suyo, admin modera) lo garantiza RLS; las actions de
  update/delete no revalidan dueño en JS a propósito — está comentado en el
  código.
- Las páginas son `export const dynamic = "force-dynamic"` porque todo depende
  de la sesión.

### Piezas con truco

- **`proxy.ts`** en la raíz es el middleware: Next 16 busca este nombre, no
  `middleware.ts` (`PROXY_FILENAME = 'proxy'` en `next/dist/lib/constants`).
  Solo refresca la sesión de Supabase; **no hace autorización**. No agregues
  guards de ruta ahí esperando que protejan datos.
- **`app/ir/[id]/route.ts`** registra el click y redirige a WhatsApp. Es la
  métrica clave del producto. Filtra User-Agents de bots — limpieza de métrica,
  no control de seguridad — y lleva `X-Robots-Tag: noindex` desde
  `next.config.ts` (el resto del sitio sí se indexa, a propósito).
- **Búsqueda en memoria**: `getProviders` trae todos los activos y filtra en JS
  (normalizando acentos y dígitos de teléfono). Es deliberado a escala de
  decenas de proveedores; permite buscar en categorías y descripción a la vez.
- **Fotos**: se comprimen a WebP en el cliente (`lib/compress-image.ts`) pero se
  **re-validan tipo y tamaño en el servidor** (`uploadProviderPhoto`), porque la
  action se puede llamar directo. Los topes (`MAX_PROVIDER_PHOTOS = 12`,
  `MAX_PHOTOS_PER_USER = 4`) se aplican en la action; `bodySizeLimit: "3mb"` en
  `next.config.ts` está calibrado para 4 fotos por subida.
- **CSP** en `next.config.ts` se acota al origen de Supabase leído de
  `NEXT_PUBLIC_SUPABASE_URL` **en build time**. Cambiar de proyecto de Supabase
  exige rebuild, no solo cambiar la env var en runtime.
- **Teléfonos**: se guardan como 10 dígitos limpios (`cleanPhone` en el
  `preprocess` de Zod); el `52` de lada se antepone solo al armar el `wa.me`.

## Convenciones

- Código, tablas y columnas en **inglés**; textos de UI, rutas (`/proveedor`,
  `/alta`) y datos (nombres de categorías) en **español**. Los comentarios del
  repo están en español y explican el *porqué*, no el *qué* — mantén ese tono.
- Tailwind v4 (sin `tailwind.config`), utilidades inline. Acento `emerald-600`,
  neutro `zinc`, dark mode con `dark:` en cada clase.
- Lo que no está en `PLAN.md` no se construye todavía. La lista de pendientes
  diferidos a propósito está al final del README — no los implementes sin que se
  pidan.
- `SECURITY-TODO.local.md` y `.env.local` están fuera de git; no los commitees
  ni cites su contenido en resúmenes (aplica la regla dura de credenciales del
  `CLAUDE.md` de `Personal/`).
