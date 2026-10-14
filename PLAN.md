# Directorio vecinal — Plan del MVP

> Directorio de proveedores de servicios recomendados y calificados por vecinos
> verificados del fraccionamiento. Resuelve: "¿alguien conoce un buen plomero?"
> preguntado cada semana en el grupo de WhatsApp, con respuestas que se pierden.

**Estado:** MVP completo, en producción, listo para lanzar (modo curado opción A).
Siguiente alcance acordado: **Fase 1.5 — Valle Condesa (sección 10)**, aún sin construir. · **Última actualización:** 2026-09-17

> Estado operativo y decisiones al día en [README.md](./README.md) (secciones
> "Estado" y "Decisiones de producto"). Este PLAN conserva el alcance y
> razonamiento original del MVP.

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
  La `anon key` es pública, así que la frontera real es la BD: RLS + privilegios
  de columna (migración 0006 oculta nombre/ids de autor a `anon`). Ver la sección
  "Seguridad" del README.
- Fotos: comprimir en el cliente (~250 KB) antes de subir a Storage.
- Multi-tenant desde el día 1 (tabla `fraccionamientos`, todo cuelga de ahí).
  Los ajustes pendientes para dar de alta un 2º fraccionamiento se rastrean fuera
  del repo (`SECURITY-TODO.local.md`).

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

---

## 10. Fase 1.5 — Valle Condesa: servicios + catálogo (2026-09-17)

> **Por qué ahora:** el grupo de ventas de todo Valle Condesa (todos los
> sectores) tiene vecinos que ofrecen servicios *y* productos, cada uno con su
> página de Facebook, su Instagram o su catálogo en Canva. Todo eso se pierde en
> el scroll del grupo — el mismo problema que ya resolvimos para "¿alguien conoce
> un plomero?", pero un nivel más arriba.

### 10.1 Decisiones tomadas

| Decisión | Elegido |
|---|---|
| Alcance | Servicios **y** productos/comida, como ficha de catálogo |
| Transacción | **Fuera.** Sin precios, carrito, pedidos, inventario ni pagos |
| Cobertura | Un solo directorio de Valle Condesa; el **sector es un filtro**, no un tenant |
| Altas | **Sembrado por el admin, avisando al proveedor antes de publicar** |
| Quién entra | **Sin cambio: solo vecinos verificados** de los sectores de Valle Condesa, aprobados a mano por el admin |
| Distintivo | **Sí**: chip "Vecino de Valle Condesa" en fichas verificadas por el admin. Sin distintivo negativo |

**El límite que no se cruza:** la ficha describe y enlaza; la venta ocurre
afuera (WhatsApp, Instagram, Canva). En el momento en que la app procese un
precio o un pedido deja de ser directorio y pasa a ser marketplace — otro
producto, otra responsabilidad, otro esfuerzo.

### 10.2 Lo que NO hay que tocar (verificado en el código, ago–sep 2026)

- **Las lecturas no están acotadas por fraccionamiento.** `providers_select` es
  `status = 'active' or is_admin()` y ninguna query de `lib/data/` filtra por
  `neighborhood_id`. Ampliar la cobertura **no exige multi-tenant ni tocar RLS**:
  hoy `neighborhood_id` solo marca origen y ownership.
- Por lo mismo, los pendientes de "2º fraccionamiento" (admin acotado por
  `neighborhood_id`) **no bloquean** esta fase: sigue habiendo un solo admin y un
  solo directorio. Bloquearían el día que otro sector quiera su propio admin.
- **`neighborhoods` sigue siendo la unidad de verificación del vecino**, no del
  proveedor: es lo que el vecino elige al registrarse y lo que el admin corrobora
  al aprobarlo. Lo único que cambia es que deja de haber una sola fila
  (`Sector Francés`) y se siembra **una por sector de Valle Condesa**. Eso es
  dato, no código: el `select` de `/registro` ya se alimenta de la tabla.
- El modelo de proveedor (`name`, `description`, categorías M2M, fotos, reseñas)
  ya describe igual a un plomero que a quien vende pasteles. "Comida y
  repostería" ya está en las categorías semilla de `0001`.

**Supuesto que esta fase sí invalida:** `getProviders` trae todos los activos y
filtra **en memoria**, calibrado a propósito "a escala de decenas de
proveedores" (CLAUDE.md). Valle Condesa completo más vendedores de producto
mueve eso a cientos. Sigue siendo viable en JS, pero es una decisión a revisar
— no redescubrirla desde cero la próxima vez que el listado se sienta lento.

### 10.3 Alcance a construir

1. **Links del proveedor** — tabla `provider_links (provider_id, kind, url)`;
   `kind` acotado a un allowlist de hosts (facebook, instagram, tiktok, canva,
   maps, sitio propio). Se renderizan como **link-out** (`target="_blank"`,
   `rel="noopener noreferrer nofollow"`), nunca como embed.
   - **Trampa (CSP, verificado en `next.config.ts`):** `img-src` es
     `'self' data: blob: <origen de Supabase>` y **no hay directiva `frame-src`**,
     así que los iframes caen al `default-src 'self'`. Resultado: una imagen de
     Facebook/Instagram, un embed de Canva o un oEmbed por `connect-src`
     **fallan en silencio**. Además el origen de Supabase se resuelve **en build
     time**, no en runtime. La miniatura de una ficha siempre es una foto propia
     subida a Storage.
2. **Contacto flexible** — `providers.whatsapp` es hoy `not null` + regex de 10
   dígitos, pero hay vendedores cuya única presencia es una página. Relajar la
   columna y cambiar la invariante a **"al menos un canal de contacto"**
   (WhatsApp *o* un link), validada en Zod **y** con un check en la BD.
   `app/ir/[id]/route.ts` hoy lee ese único campo para armar el `wa.me`: con la
   columna nullable necesita una rama para el proveedor sin WhatsApp (redirigir
   a su ficha, no a un `wa.me/52null`).
3. **Métrica por canal** — `whatsapp_clicks` y `/ir/[id]` asumen que WhatsApp es
   *el* canal; si el contacto se va por Instagram no se cuenta nada, y esa tabla
   es justo el argumento de venta de la sección 8. Generalizar a
   `provider_clicks (provider_id, channel, ...)` conservando los datos actuales.
4. **Sector como filtro** — ojo, aquí hay **dos sectores distintos** y conviene
   no confundirlos: el del *vecino* (`profiles.neighborhood_id`, lo que se
   verifica al aprobarlo) y el del *proveedor* (dónde está o a quién sirve, lo
   que el directorio filtra). El segundo va como chip en el directorio y como
   **columna propia en `providers`**, no como fila de `neighborhoods`. El motivo
   es concreto: el trigger `set_provider_neighborhood()` de `0001` estampa
   `coalesce(neighborhood_id del perfil que inserta, el primer neighborhood)`.
   Como las altas las siembra el admin (10.1), *todo* proveedor quedaría
   etiquetado con el sector **del admin**, no con el suyo — en silencio. Con una
   columna propia, capturada en el formulario de alta, el trigger deja de
   estorbar. El sector nunca se vuelve frontera de lectura.
5. **Categorías de producto** — ampliar la semilla (comida preparada, repostería,
   abarrotes, ropa, belleza, mascotas, eventos…). Categoría nueva = dato, no
   código.
6. **Consentimiento operativo** — como las altas son sembradas, el admin necesita
   registrar a quién ya avisó: columna `owner_notified_at` en `providers`
   (visible solo para admin) y no publicar hasta que esté llena. **Hoy ese
   candado no existe**: `providers.status` tiene `default 'active'` y ni `/alta`
   ni `/admin` fijan el estado al insertar (la moderación se hace a mano en
   Supabase, ver README). Hay que decidir entre cambiar el default a `'hidden'`
   — lo que obliga a un paso de publicación en `/admin` — o aceptar
   explícitamente que el gate es manual por SQL. Es el control que evita el
   riesgo de 10.4.

7. **Distintivo de vecino** — dos columnas nuevas en `providers`, con trabajos
   distintos a propósito:
   - `owner_profile_id uuid null references profiles(id)` — el vecino **dueño** de
     la ficha, cuando tiene cuenta. Habilita que edite lo suyo sin ser admin
     (política RLS análoga a `providers_update_own`, que hoy solo mira
     `created_by`). **No** enciende el distintivo.
     **Condición obligatoria:** esa política nueva no puede conformarse con que
     el FK coincida — tiene que exigir además `is_approved_neighbor()`. Si no, un
     perfil `pending` o `blocked` editaría una ficha pública y se saltaría la
     compuerta de aprobación que RLS aplica en todo lo demás.
   - `neighbor_verified_at timestamptz null` + `neighbor_verified_by` — la
     constancia del admin de que esa persona vive en un sector de Valle Condesa.
     **Esto sí enciende el distintivo.**

   Van separadas porque si el distintivo dependiera de tener cuenta estaría vacío
   el día del lanzamiento: las altas las siembra el admin (10.1) y casi nadie
   tendrá cuenta aún. Al revés también falla: un vecino sin cuenta sería "dueño"
   de una ficha que no puede editar.

   Reglas de presentación, no negociables:
   - El chip dice **"Vecino de Valle Condesa" y nada más**: sin sector, ni
     público ni con sesión. Si el chip nombrara el sector estaría publicando
     *dónde vive* una persona en una página indexable — justo lo que la migración
     `0006` evita con el autor de las reseñas. El único sector que la ficha
     muestra es el del **proveedor** (10.3.4, columna de `providers`), que es un
     dato de negocio, no un domicilio.
   - **Dónde vive la privacidad de esto:** el chip se enciende con
     `providers.neighbor_verified_at`, que `anon` sí puede leer (`providers_select`
     es `status = 'active' or is_admin()`), así que **no hace falta revocar nada**.
     El cuidado está del lado del render: el componente de servidor **no debe
     unir el perfil del dueño al payload RSC sin sesión** — `profiles_select` ya
     es `id = auth.uid() or is_admin()`, o sea `anon` no lee ningún perfil, y esa
     propiedad se conserva no pidiendo el join. Mismo patrón que
     `app/proveedor/[id]/page.tsx` con las reseñas.
   - **No existe el distintivo negativo** ni un "no verificado". Lo que no trae
     chip, no trae chip y ya.
   - **No ordena ni filtra por default.** El listado sigue rankándose por
     calificación y reseñas. Un filtro "solo vecinos" es opcional y posterior.
   - El texto dice lo que de verdad se verificó (*vive en Valle Condesa*), nunca
     una cualidad (*confiable*, *recomendado*). El aval de calidad lo dan las
     estrellas; confundirlos convierte una constancia de domicilio en una
     garantía que nadie dio.

   **Riesgo a vigilar:** todo lo que no trae chip se lee como "no verificado". El
   plomero de toda la vida no es vecino y no debería quedar con un demérito que
   nadie decidió darle. Las reglas de arriba existen por eso.

8. **Pantalla de admin — sin esto el plan no se ejecuta.** Hoy la moderación de
   proveedores se hace a mano en el SQL Editor (README, "Pendientes conocidos").
   Esta fase agrega cuatro acciones que se repiten **por cada ficha**: marcar que
   ya se avisó al proveedor, marcar la constancia de vecino, ligar el perfil del
   dueño y publicar/ocultar. A escala de Valle Condesa eso deja de ser viable por
   SQL. Mínimo indispensable en `/admin`:
   - lista de proveedores con su estado (`status`, `owner_notified_at`,
     `neighbor_verified_at`) y filtro por "sin avisar" / "sin publicar";
   - editar la ficha completa, links incluidos;
   - los cuatro toggles de arriba, cada uno una server action con el patrón fijo
     del proyecto (`getCurrentProfile()` → `is_admin` → Zod → `lib/data/`).

   De paso cubre el pendiente ya conocido de "bloquear vecinos ya aprobados" y el
   alta de eventos, que hoy también viven en SQL — pero eso es extra, no
   requisito de esta fase.
9. **Aviso de privacidad actualizado.** `/privacidad` se escribió para nombre +
   WhatsApp de proveedores. Esta fase publica además (a) sus redes y catálogos
   enlazados y (b) un distintivo que afirma que la persona **vive en Valle
   Condesa**. Ambos son datos nuevos sobre gente que no llenó ningún formulario,
   así que van declarados explícitamente, junto con cómo pedir que se retire una
   ficha. No es trámite: es la contraparte del modo sembrado.

### 10.4 Riesgos que no son técnicos

- **Consentimiento.** El README ya advierte que el modo curado publica nombre y
  WhatsApp de gente que nunca llenó un formulario. Sigue siendo el riesgo número
  uno: son más personas, muchas que Edgar no trata a diario, y la ficha queda en
  una página **pública e indexable** — la ve cualquiera, no solo el grupo. El
  aviso previo (10.3.6) es obligatorio, no cortesía, y el aviso de privacidad ya
  publicado debe mencionar las redes enlazadas.
- **Dilución del diferenciador — descartado por decisión (2026-09-18).** La
  ventaja sobre el grupo de WhatsApp es "vecinos verificados", y **eso no
  cambia**: el grupo de ventas es de vecinos de los sectores de Valle Condesa, no
  abierto. Lo que crece es la cobertura geográfica dentro de la misma comunidad,
  no el criterio de entrada. Sigue siendo: vecino de un sector de Valle Condesa +
  aprobación manual del admin. Si algún día entra alguien de fuera, es una
  decisión de producto nueva, no una consecuencia de esta fase.
- **Consecuencia buena:** como los proveedores salen de ese mismo grupo, en su
  mayoría **son vecinos**, no desconocidos. El riesgo de consentimiento del punto
  anterior baja bastante — hay a quién preguntarle y dónde. El aviso previo
  sigue siendo obligatorio, pero deja de ser un problema de escala.
- **Los links se pudren.** Páginas de Facebook que cierran, Canvas borrados,
  cuentas de Instagram que cambian de handle. No se construye nada hoy, pero
  queda anotado para no diagnosticarlo como bug: es mantenimiento de datos, y la
  señal de que hace falta un "reportar link roto" será el primer vecino que se
  queje.
- **Respaldo.** El keep-alive de Supabase y el `pg_dump` diario (README, "Estado")
  dejan de ser opcionales: con contenido de terceros adentro, perder la BD ya no
  es solo perder trabajo propio.

### 10.5 Bitácora de decisiones

Registro único de esta fase. La tabla de 10.1 es el resumen; aquí va el porqué y
la fecha.

- **2026-09-17 — Alcance: servicios + catálogo, sin transacción.** Cubrir a los
  vecinos que venden productos y comida sin convertir el directorio en
  marketplace. Precio, pedido, inventario o pago = otro producto (10.1).
- **2026-09-17 — Altas sembradas por el admin, avisando antes de publicar.** Da
  contenido desde el día uno; el costo es el aviso uno por uno, que es
  obligatorio (10.3.6, 10.4).
- **2026-09-18 — El criterio de entrada no cambia: solo vecinos verificados.** Lo
  que crece es la cobertura geográfica dentro de la misma comunidad, no quién
  puede entrar. Esto descarta el riesgo de dilución del diferenciador (10.4).
- **2026-09-18 — La ficha de un proveedor vecino se liga a su perfil y lleva
  distintivo.** Dos mecanismos separados a propósito: propiedad
  (`owner_profile_id`) y constancia de vecindad (`neighbor_verified_at`), con las
  reglas de presentación de 10.3.7. Queda pendiente solo el detalle visual del
  chip.

### 10.6 Orden de entrega

Pensado para poder parar en cualquier etapa con algo útil en producción.

| Etapa | Qué | Por qué en ese orden |
|---|---|---|
| **0** | Keep-alive de Supabase + `pg_dump` diario en el VPS | Ya era el único bloqueante del lanzamiento (README). Con contenido de terceros adentro, perder la BD deja de ser problema propio |
| **A** | Migración `0007` (todas las columnas y políticas) + siembra de sectores y categorías de producto + pantalla de admin (10.3.8) + aviso de privacidad (10.3.9) | Es lo que te habilita a **operar**: capturar fichas nuevas y avisar a la gente. Nada de esto se ve público todavía |
| **B** | Lo que ve el vecino: links en la ficha, chip de vecino, filtro por sector, rama sin WhatsApp en `/ir/[id]` | Se publica cuando ya hay contenido cargado y avisado, no antes |
| **C** | `provider_clicks` con canal + tracking de los links | Es métrica, no funcionalidad: sirve cuando ya hay tráfico que medir |

Una sola migración `0007` para todo el esquema de la fase: se aplica a mano en el
SQL Editor (CLAUDE.md), y partirla en varias multiplica las probabilidades de
correrlas fuera de orden.
