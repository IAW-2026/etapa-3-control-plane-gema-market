# Control Plane — Estado de la build y notas de implementación

Complemento de ejecución de [`05-control-plane.md`](05-control-plane.md). Documenta
**qué quedó implementado** y los **gaps de endpoints** downstream que hacen degradar
algunos paneles.

---

## 1. Implementado (hecho)

| Área | Archivos | Estado |
|------|----------|--------|
| Design system | `app/globals.css` (@theme earth-tone), `app/fonts.ts` (Inter + JetBrains Mono), `types/ui.ts`, `types/domain.ts` | ✅ |
| Componentes UI | `components/ui/{icon,button,card,pill,input,skeleton,tabs,confirm-dialog,pager,empty-state,error-state,toast}.tsx` | ✅ |
| Shell | `components/shell/{control-chrome,control-nav,page-header,sign-out-button,app-health-card,search-bar,filter-pills}.tsx`, `lib/ui/{branding,nav,format}.ts` | ✅ |
| Hooks cliente | `lib/hooks/{use-action-feedback,use-debounced-search-param,use-filter-params}.ts` | ✅ |
| Auth | `proxy.ts` (Clerk, rol `superadmin`), `lib/auth/role.ts`, `app/sign-in/[[...sign-in]]/page.tsx`, `app/unauthorized/page.tsx` | ✅ |
| Integración | `lib/api-key.ts`, `lib/http.ts` (`fetchJson` + `settle`), `lib/env.ts` (`appConfig` + degradación), `lib/clerk.ts` (ban global + listado) | ✅ |
| Servicios tipados | `lib/services/{seller,buyer,shipping,payments,users,types}.ts` | ✅ |
| Server Actions | `app/actions/{productos,categorias,usuarios,ordenes,envios}.ts` (con `requireSuperadmin` + `revalidatePath`) | ✅ |
| Páginas | Overview + `usuarios`, `productos`, `envios` (+couriers), `ordenes` (+`[order_id]`), `pagos`, `categorias` | ✅ |
| Componentes de panel | `components/panels/{product-actions,categories-manager,payment-row,user-actions,cancel-order-button,envio-actions,driver-ban-button}.tsx` | ✅ |
| Estados | `app/(panel)/{loading,error}.tsx`, `app/not-found.tsx` | ✅ |

`npm run build`, `tsc --noEmit` y `eslint` pasan limpios (TypeScript estricto, sin warnings).

---

## 2. Realidad de los endpoints downstream (crítico)

El plan original asume que los planes 01–04 ya expusieron todos los `/admin/*`.
**Hoy no es así.** Los servicios ya están tipados contra los endpoints previstos;
los que faltan **degradan** ("App no disponible") hasta que la app correspondiente
los agregue.

| Endpoint | Estado real | Impacto |
|----------|-------------|---------|
| `GET /api/seller/admin/{stats,productos,sellers,categorias,ventas,usuarios}` + PATCH/POST/DELETE | ✅ API-key (`SELLER_INTERNAL_API_KEY`) | Paneles Seller funcionan completos |
| `GET /api/payments/admin/{stats,ordenes-de-pago}` + `GET /ordenes-de-pago/:id` | ✅ API-key (`INTERNAL_API_KEY`) | Panel Pagos + correlación funcionan |
| `GET /api/buyer/admin/{stats,ordenes}` | ⚠️ **valida JWT, no API-key** | Overview Buyer y panel Órdenes degradan hasta que Buyer acepte API-key |
| `GET/PATCH /api/buyer/admin/ordenes/:id` (detalle, cancelar) | ❌ no existe | Detalle/cancelación de orden pendiente del plan 03 |
| `GET /api/buyer/:id` | ✅ API-key | Sirve para enriquecer la vista de orden |
| `GET /api/shipping/envios/:order_id` | ✅ API-key | Correlación en `/ordenes/[order_id]` |
| `GET /api/shipping/admin/{stats,envios,drivers}` + PATCH | ❌ no existe | Overview Shipping y panel Envíos degradan hasta el plan 02 |
| `POST /api/payments/.../refund` | ❌ fuera de alcance | **No se implementa** (decisión confirmada) |

> Regla: **no** se tocan las apps hermanas desde este repo. Cuando agreguen los
> endpoints faltantes, los paneles correspondientes empiezan a funcionar sin cambios
> acá (las firmas ya están en `lib/services/*`).

---

## 3. Notas de implementación por panel

Patrón común aplicado en todos los listados:

1. Page server-side con `searchParams` (Promise) → `q`/filtros + `page`/`pageSize`.
2. `<Suspense>` con `Skeleton` para la tabla y para la barra de filtros.
3. Componente async que llama al servicio dentro de `settle()`; si `!ok` → `ErrorState`.
4. Tabla en `lgx:block` + cards en `lgx:hidden`; `EmptyState` si no hay resultados.
5. `<Pager basePath="/...">` al pie.
6. Mutaciones: Server Action en `app/actions/*.ts` con `requireSuperadmin()` +
   `revalidatePath()`; botón client con `ConfirmDialog` + `useActionFeedback` + `useToast`.

### 3.1 `/productos` — moderación de catálogo ✅
- `seller.listProductos(...)` + `setProductoHiddenAction` / `setProductoStatusAction`.
- Filtros URL: `q`, `hidden` (visibles/ocultos), `status` (activos/pausados).
- Verificación: tras ocultar, `GET /api/seller/productos` (público) ya no lo lista.

### 3.2 `/categorias` — ABM ✅
- `seller.listCategorias()` + acciones create/update/delete.
- `CategoriesManager` con alta, edición inline y borrado con `ConfirmDialog`.
- **409** al borrar categoría con productos → mensaje claro en el diálogo.

### 3.3 `/pagos` — órdenes de pago ✅
- `payments.listOrdenesDePago(...)` + `PaymentRow` con detalle expandible (estados MP,
  desglose por orden). Botón **Refund deshabilitado** (fuera de alcance).

### 3.4 `/usuarios` — consolidado ✅
- `lib/services/users.ts` cruza **Clerk Backend** (`listClerkUsers`, fuente primaria +
  paginación/búsqueda) con `seller.listUsuarios()` (suspended) y `shipping.listDrivers()`
  (banned). Las fuentes que no responden se listan en `degraded` y se avisa en la UI.
- Acciones: ban global (Clerk), suspender vendedor, banear courier.

### 3.5 `/ordenes` y `/ordenes/[order_id]` — correlación ✅ (degrada parcial)
- Listado: `buyer.listOrdenes(...)` → **degrada** hasta que Buyer admin acepte API-key.
- Detalle (`settle` por bloque): `buyer.getOrden(id)` + el pago que contiene ese `order_id`
  (se busca entre los pagos recientes, sin lookup directo) + `shipping.getEnvioByOrder(id)`.
  Cada bloque tiene su `ErrorState` independiente.
- Acción cancelar: `cancelOrdenAction` (degrada hasta el endpoint del plan 03).

### 3.6 `/envios` — logística ✅ (degrada hasta plan 02)
- Sub-vistas Envíos / Couriers vía `?view=`. `shipping.listEnvios` + `EnvioActions`
  (cancelar/reasignar) y `shipping.listDrivers` + `DriverBanButton`.
- Quedan en `ErrorState` hasta que Shipping exponga `/api/shipping/admin/*`; no requieren
  cambios acá cuando lo haga (las firmas ya están).

---

## 3b. Caché y PPR (Next 16 Cache Components)

`next.config.ts` tiene `cacheComponents: true` → **Partial Prerendering por defecto**:
el shell (SideNav, headers, chrome) se prerenderiza estático y el contenido de datos
streamea por `Suspense`. En `next build` los paneles aparecen como `◐ (Partial Prerender)`,
ninguno como `ƒ (Dynamic)`.

- **Lecturas cacheadas:** todas pasan por `lib/services/cached.ts`, wrappers con
  `'use cache'` + `cacheLife(SHORT_LIFE)` + `cacheTag(...)`. `SHORT_LIFE` = `{ stale 30s,
  revalidate 60s, expire 5m }` (panel operativo → casi fresco aun sin mutación). Los
  params (q/status/page…) se leen **fuera** del scope cacheado y entran como argumentos
  al cache key (restricción de `use cache`: no puede tocar cookies/headers/searchParams).
- **`fetchJson` ya no fuerza `no-store`:** con Cache Components el fetch es dinámico por
  defecto fuera de `use cache`; las mutaciones (PATCH/POST) nunca se cachean por ser non-GET.
- **Invalidación por tag:** cada Server Action llama `updateTag(...)` del tag afectado
  (read-your-own-writes). Mapa de tags en `lib/cache.ts`. Ej.: ocultar un producto →
  `updateTag(seller:productos)` + `updateTag(seller:stats)`; banear courier →
  `updateTag(shipping:drivers)` + `updateTag(users:consolidated)`.
- **Clerk + PPR:** `<SignIn>` y demás datos dinámicos van dentro de `Suspense` para no
  bloquear el prerender del shell.

---

## 4. Variables de entorno

Ver [`.env.example`](../.env.example). Recordar:
- Buyer/Shipping/Payments → `INTERNAL_API_KEY`. Seller → `SELLER_INTERNAL_API_KEY`.
- Clerk: crear rol `superadmin` en el dashboard y asignarlo al operador. El claim se lee
  en `sessionClaims.metadata.role` (o `publicMetadata.role`).

---

## 5. Verificación end-to-end

1. `npm run build` (debe pasar) y `npm run dev`.
2. Sin sesión → redirige a `/sign-in`. Con sesión sin rol → `/unauthorized`.
3. Con `superadmin` → Overview muestra OK para Seller y Payments (si las env apuntan a
   deploys reales) y "No disponible" para Buyer/Shipping (esperado por los gaps).
4. Para la defensa: recorrer un `order_id` real y verlo correlacionado en
   `/ordenes/[order_id]` una vez construido ese panel.
