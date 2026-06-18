# UniHousing — Control Plane

Panel de **superadministración global** de UniHousing. Da una vista consolidada de
las 4 apps del marketplace (Seller, Buyer, Shipping, Payments) y permite acciones
de gestión cross-app desde un solo lugar. **No reemplaza** los paneles admin de
cada app: los complementa con una vista de mayor nivel.

- **Stack:** Next.js 16 (App Router) · TypeScript estricto · Tailwind v4 (`@theme`) ·
  Clerk (solo login del operador). **Sin base de datos** — es un agregador puro.
- **Integración:** toda lectura/mutación a las 4 apps es **server-side** usando una
  API-key interna (se envía `x-api-key-hash` = SHA-256 hex-UPPER). La key nunca se
  expone al browser.
- **Resiliencia:** las llamadas se combinan con `Promise.allSettled`; si una app
  downstream falla, su panel muestra "App no disponible" sin romper el resto.
- **Caché (Next 16 Cache Components):** PPR por defecto — shell estático + datos
  cacheados con `use cache` (`cacheLife` corto + `cacheTag`) que las mutaciones
  invalidan por tag con `updateTag`. Sin rutas `force-dynamic`.

## Estado actual

App completa, funcionando end-to-end:

- Design system (tokens earth-tone, Inter + JetBrains Mono) consistente con las apps.
- Auth Clerk con rol `superadmin` (`middleware.ts` + `/unauthorized` + `/sign-in`).
- Capa de integración tipada: `lib/{api-key,http,env,clerk}.ts` y
  `lib/services/{seller,buyer,shipping,payments,users}.ts`.
- Shell admin (SideNav + BottomNav) y **todos los paneles**: Overview, Usuarios,
  Productos, Envíos (+ couriers), Órdenes (+ detalle correlacionado), Pagos, Categorías.
- Mutaciones vía Server Actions con `ConfirmDialog`, toasts y `revalidatePath`.

Cada panel **degrada** ("App no disponible") si su app downstream falla o todavía no
expone el endpoint admin. El detalle de los gaps (Buyer admin con JWT, Shipping admin
pendiente) y la lógica de cada panel está en
[`docs/05b-control-plane-build.md`](docs/05b-control-plane-build.md).

El refund (Payments) queda **fuera de alcance** por decisión de producto.

## Desarrollo

```bash
cp .env.example .env.local   # completar las variables
npm install
npm run dev                  # http://localhost:3000
```

### Variables de entorno

| Variable | Para qué |
|----------|----------|
| `SELLER_API_URL` · `BUYER_API_URL` · `SHIPPING_API_URL` · `PAYMENTS_API_URL` | URLs de las 4 apps downstream |
| `INTERNAL_API_KEY` | Key compartida por Buyer / Shipping / Payments |
| `SELLER_INTERNAL_API_KEY` | Key propia del Seller (o `= INTERNAL_API_KEY` si se unificó) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` · `CLERK_SECRET_KEY` | Login del operador + Backend API (ban global) |

Detalle completo en [`.env.example`](.env.example).

## Rol `superadmin`

La consola solo deja entrar a usuarios con rol `superadmin`. Son dos pasos:

1. **Asignar el rol** a un usuario ya registrado en Clerk:
   ```bash
   npm run set-superadmin <email>
   ```
   (Escribe `publicMetadata.role = "superadmin"` vía Clerk Backend API.)

2. **Exponer el claim en el session token** — en el dashboard de Clerk
   (**Configure → Sessions → Customize session token**):
   ```json
   { "metadata": { "role": "{{user.public_metadata.role}}" } }
   ```

El `middleware.ts` valida `sessionClaims.metadata.role`; quien no lo tenga cae en
`/unauthorized`.

## Deploy

Vercel. Cargar todas las variables de la tabla en el proyecto y desplegar.

- **App:** [_(URL del deploy)_](https://etapa-3-control-plane-gema-market.vercel.app/)
- **Operador `superadmin`:** `controlplane+clerk_test@iaw.com` · _iawuser#_
