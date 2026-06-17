# Plan de ejecución — Etapa 3 · Control Plane (NUEVO · `proyecto-c-control-plane-gema-market`)

> **Orden de ejecución:** 5 de 6. Se ejecuta **después** de los planes 01–04 (Seller, Shipping, Buyer,
> Payments), porque consume los endpoints `/admin/*` que esos agregan.
> **Disputas: fuera de alcance** (la función "resolver disputas" del enunciado no se implementa).
> **Marca:** "UniHousing — Control Plane". **Persistencia:** **sin DB** (agregador puro).
> **Auth:** humano con rol Clerk `superadmin`; backend llama a las 4 apps con API-key.

## Objetivo

Panel de **superadministración global**: vista consolidada de las entidades de las 4 apps + acciones de
gestión cross-app desde un único lugar. **No reemplaza** los paneles admin individuales; los complementa con
una vista de mayor nivel.

## Stack y principios

- **Next.js (App Router) + TypeScript estricto + Tailwind v4** (sintaxis `@theme`) + **Clerk** (solo login
  del operador). **Sin Prisma / sin base de datos.** Sin Recharts (esto es CRUD/listados; los gráficos van
  en Analytics).
- **Toda lectura/mutación a las 4 apps es server-side** (Server Components + Server Actions) usando la
  **API-key** — nunca desde el browser (la key no se expone al cliente).
- **Resiliencia:** las llamadas se hacen con `Promise.allSettled`; si una app downstream falla, su panel se
  muestra como "no disponible" sin romper el resto.

## Estructura del repo

```
proyecto-c-control-plane-gema-market/
├─ app/
│  ├─ layout.tsx                 # ClerkProvider + fonts (Inter/JetBrains Mono) + shell admin
│  ├─ globals.css                # @theme con los design tokens (copiar de Buyer)
│  ├─ page.tsx                   # /  → overview
│  ├─ usuarios/page.tsx
│  ├─ productos/page.tsx
│  ├─ ordenes/page.tsx
│  ├─ ordenes/[order_id]/page.tsx
│  ├─ pagos/page.tsx
│  ├─ envios/page.tsx
│  ├─ categorias/page.tsx
│  ├─ unauthorized/page.tsx
│  ├─ sign-in/[[...sign-in]]/page.tsx
│  ├─ error.tsx  ├─ not-found.tsx  ├─ loading.tsx
│  └─ actions/                   # Server Actions (mutaciones)
│     ├─ productos.ts  ├─ sellers.ts  ├─ envios.ts  ├─ drivers.ts
│     ├─ ordenes.ts    ├─ usuarios.ts ├─ categorias.ts
├─ lib/
│  ├─ env.ts                     # validación de env (zod)
│  ├─ api-key.ts                 # hashApiKey + headers
│  ├─ http.ts                    # fetch wrapper (timeout, errores, allSettled helpers)
│  ├─ clerk.ts                   # Clerk Backend API (ban global)
│  └─ services/                  # un módulo por app downstream
│     ├─ seller.ts  ├─ buyer.ts  ├─ shipping.ts  ├─ payments.ts
│     └─ users.ts                # consolida usuarios de las 4 apps + Clerk
├─ components/
│  ├─ shell/  (SideNav, TopBar, BottomNav, AppHealthCard)
│  └─ ui/     (Button, Card, Badge/Pill, Table, Pagination, Tabs, Skeleton, Icon, ConfirmDialog, EmptyState, ErrorState)
├─ middleware.ts                 # Clerk: exige rol superadmin
├─ .env.example
└─ README.md
```

## Design system (consistencia visual con las 4 apps)

- **Copiar tal cual** los tokens: paleta earth-tone (`bark…forest`, `paper/cream/bone`, `ink*`, `line*`,
  `success/warn/danger`), `r1–r4`, `sh-1..3`, breakpoint `lgx 1100px`. Fuente: tomar el bloque `@theme` de
  `proyecto-c-buyer-gema-market/app/globals.css`. Referencia de componentes:
  `interno/frontend/shared/components.jsx` (reimplementar en TSX: Button con variantes
  `primary/secondary/ghost/danger/soft`, Card `bg-paper border-line rounded-r3`, Pill, Table, Icon SVG 1.5px).
- **Tipografía:** Inter + JetBrains Mono (`next/font`), features `ss01`,`cv11`, headings `font-weight 600`
  tracking negativo.
- **Layout admin:** SideNav fija en `lgx+` (logo "UniHousing — Control Plane", acento `forest`/`olive`) +
  BottomNav en mobile. Patrón de `proyecto-c-seller-gema-market/components/layout/admin-chrome.tsx` /
  `proyecto-c-shipping-gema-market/app/admin/layout.tsx`.
- **Identidad:** wordmark "UniHousing", chip "Control Plane", acento `forest`. Logo SVG casa (reusar el de
  los apps).

## Variables de entorno (`.env.example`)

```
# URLs de producción de cada app (Vercel)
SELLER_API_URL=https://proyecto-c-seller-gema-market.vercel.app
BUYER_API_URL=https://proyecto-c-buyer-gema-market.vercel.app
SHIPPING_API_URL=https://proyecto-c-shipping-gema-market.vercel.app
PAYMENTS_API_URL=https://payments-unihousing.vercel.app
# Claves internas (se envía SHA-256 hex-UPPER en x-api-key-hash)
INTERNAL_API_KEY=...                 # compartida por Buyer, Shipping, Payments
SELLER_INTERNAL_API_KEY=...          # Seller usa su propia key (o, si se unificó, = INTERNAL_API_KEY)
# Clerk (login del operador + Backend API para ban global)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```
> **Nota de keys:** Buyer/Shipping/Payments validan `INTERNAL_API_KEY`; **Seller** valida
> `SELLER_INTERNAL_API_KEY`. El cliente de Seller usa esa key; los otros tres usan `INTERNAL_API_KEY`.

## Capa de integración

**`lib/api-key.ts`:**
```ts
import { createHash } from "node:crypto";
export const hashApiKey = (k: string) =>
  createHash("sha256").update(k).digest("hex").toUpperCase();
export const apiKeyHeader = (k: string) => ({ "x-api-key-hash": hashApiKey(k) });
```
**`lib/http.ts`:** `fetchJson(url, { key, init })` → agrega `x-api-key-hash`, `cache: "no-store"`
(Control Plane lee fresh), timeout (AbortController), y lanza error tipado con status. Helper
`settle(promises)` que envuelve `Promise.allSettled` y devuelve `{ data?, error? }` por fuente.
**`lib/services/seller.ts`** (ejemplo): funciones tipadas que mapean 1:1 a los endpoints del plan 01:
`listProductos(params)`, `getProducto(id)`, `patchProducto(id, body)`, `listVentas(params)`, `getStats()`,
`listSellers(params)`, `patchSeller(id, {suspended})`, categorías CRUD, `listUsuarios(params)`.
Análogo en `buyer.ts` / `shipping.ts` / `payments.ts`.
**`lib/clerk.ts`:** `banUserGlobal(clerkUserId)` / `unbanUserGlobal(clerkUserId)` usando
`@clerk/backend` (`clerkClient.users.banUser/unbanUser`) con `CLERK_SECRET_KEY`.

## Auth (`middleware.ts`)

`clerkMiddleware`: público solo `/sign-in`. Para el resto: sin `userId` → `/sign-in`; con sesión pero
`sessionClaims?.metadata?.role !== "superadmin"` (o `publicMetadata.role`) → redirect `/unauthorized`.
Defensa en profundidad: en cada Server Action revalidar el rol antes de mutar.
> Requiere crear el rol **`superadmin`** en Clerk y asignarlo a la cuenta del equipo (script o dashboard).

---

## Páginas (qué muestran y qué endpoints consumen)

### `/` — Overview
- 4 `AppHealthCard` (una por app) con su `stats` y un indicador OK/—no disponible.
- Llamadas en paralelo (`allSettled`): `seller.getStats()`, `buyer.getStats()`, `shipping.getStats()`,
  `payments.getStats()` → `GET /api/{app}/admin/stats`.
- KPIs rápidos: productos activos, órdenes por estado (mini), envíos en tránsito, pagos aprobados.
- Accesos directos a cada sección.

### `/usuarios` — usuarios consolidados + activar/desactivar
- Fuente primaria: **Clerk Backend API** (lista global) cruzada con `GET /api/{app}/admin/usuarios` para
  mostrar presencia/estado por app (`suspended` en Seller, `banned` en Shipping).
- Tabla: email, nombre, apps en las que aparece, rol, estado. Búsqueda + paginación (params URL).
- **Acciones (Server Actions, con `ConfirmDialog`):**
  - Activar/desactivar **global** → `lib/clerk.ts` (banUser/unbanUser). Afecta a todas las apps.
  - Suspender/activar **vendedor** → `PATCH /api/seller/admin/sellers/:id { suspended }`.
  - Banear/desbanear **courier** → `PATCH /api/shipping/admin/drivers/:user_id { banned }`.

### `/productos` — moderación de catálogo
- `GET /api/seller/admin/productos` (incluye `paused`/ocultos). Filtros: `q`, `status`, `category_id`,
  `seller_id`, `hidden`. Búsqueda + paginación URL.
- Acciones: ocultar/mostrar (`PATCH …/productos/:id { hidden_by_admin }`), pausar/activar (`{ status }`).
  Verificación: tras ocultar, el público `GET /api/seller/productos` ya no lo lista.

### `/ordenes` y `/ordenes/[order_id]` — vista correlacionada
- Listado: `GET /api/buyer/admin/ordenes`.
- Detalle: combina (`allSettled`) `GET /api/buyer/admin/ordenes/:order_id` +
  `GET /api/payments/ordenes-de-pago/:payment_id` + `GET /api/shipping/envios/:order_id` → muestra
  orden + pago + envío unidos por `order_id`. Acción: cancelar orden
  (`PATCH /api/buyer/admin/ordenes/:order_id { status:"cancelled" }`).
- **Sin disputas/refund** (fuera de alcance): el detalle es informativo + cancelación simple.

### `/pagos` — órdenes de pago
- `GET /api/payments/admin/ordenes-de-pago` (filtros `status`, `buyer_id`, `seller_id`, fechas).
- Detalle expandible con estados MP. Botón "Refund" **deshabilitado** salvo que se haya implementado el
  endpoint opcional del plan 04 (entonces `POST …/refund`).

### `/envios` — logística
- `GET /api/shipping/admin/envios` (filtros `status`, `logistics_id`, fechas).
- Acciones: reasignar courier / cancelar (`PATCH /api/shipping/admin/envios/:shipping_id`).
- Sub-vista couriers: `GET /api/shipping/admin/drivers` + banear (`PATCH …/drivers/:user_id`).

### `/categorias` — ABM
- `GET/POST/PATCH/DELETE /api/seller/admin/categorias[...]`. Validación de nombre; 409 al borrar con productos.

## Patrones de UI obligatorios

- Búsqueda + paginación **con params en la URL** (`?q=&page=&status=`) en todos los listados.
- Estados: `loading.tsx`/`Skeleton`, `EmptyState`, `ErrorState` ("Seller App no disponible") por panel.
- 404 (`not-found.tsx`) y error boundary (`error.tsx`).
- Mutaciones con `ConfirmDialog` + `revalidatePath` tras la acción. Toasts de éxito/error.
- Accesibilidad: labels, foco, contraste AA (la paleta ink/paper ya cumple).

## Datos de prueba

No requiere seed propio: usa los seeds ya cargados en las 4 apps. Para la defensa, recorrer un `order_id`
real y verlo correlacionado en `/ordenes/[order_id]`.

## README (breve, como exige el enunciado)

Descripción, link al deploy, credenciales del usuario `superadmin`, y nota de que opera sobre las 4 apps vía
API-key. Historial de commits progresivo (requisito de evaluación).

## Checklist de ejecución

- [ ] Scaffold Next.js + Tailwind v4 + tokens (`globals.css @theme`) + fuentes.
- [ ] `middleware.ts` (rol `superadmin`) + `/unauthorized` + `/sign-in`.
- [ ] `lib/{env,api-key,http,clerk}.ts` + `lib/services/{seller,buyer,shipping,payments,users}.ts`.
- [ ] Componentes `ui/` y `shell/` (reimplementados desde `interno/frontend/shared/components.jsx`).
- [ ] Páginas en orden: overview → usuarios → productos → envios → ordenes(+detalle) → pagos → categorias.
- [ ] Server Actions + `ConfirmDialog` + `revalidatePath`.
- [ ] Estados de error/empty/loading y "app no disponible" (`allSettled`).
- [ ] `.env.example` + deploy Vercel con todas las env vars.
- [ ] README + verificación end-to-end (ver plan raíz, sección Verificación).
