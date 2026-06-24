# usuarios-apps-column - Work Plan

## TL;DR (For humans)

**What you'll get:** La columna "Apps" en la tabla de `/usuarios` mostrará las 4 apps (Seller, Buyer, Shipping, Payments) en lugar de solo Seller. Si una app no responde, se muestra un banner de "Vista parcial".

**Why this approach:** Aprovechamos los endpoints de listado de órdenes (Buyer) y pagos (Payments) para inferir qué usuarios pertenecen a cada app, usando `buyer_id` que corresponde al ID de Clerk. Es un cambio puramente en el backend de consolidación sin tocar las apps downstream.

**What it will NOT do:** No agrega nuevos endpoints a las apps, no modifica la lógica de mutaciones, no cambia el layout ni otros paneles.

**Effort:** Short (3 archivos)
**Risk:** Low - cambios acotados, degradación graceful via `settle()`

**Decisions to sanity-check:** Asumimos que `buyer_id` en Buyer/Payments = Clerk user ID (diseño del sistema). Si no es así, los pills no aparecerán para esos usuarios.

Your next move: `$start-work` para ejecutar el plan.

---

> TL;DR (machine): Short | Low | Extend ConsolidatedUser, add buyer+payments fetch, update AppPills UI

## Scope
### Must have
- Columna Apps muestra las 4 apps: Seller, Buyer, Shipping, Payments
- Si una app no responde (degrada), se agrega a `degraded[]` y aparece banner
- Matching de users por `buyer_id` = Clerk user ID
- Los pills usan el mismo estilo que los existentes (`Pill tone="sage" size="sm"`)

### Must NOT have (guardrails, anti-slop, scope boundaries)
- NO modificar endpoints de apps downstream
- NO modificar Server Actions
- NO tocar caches de otras entidades
- NO cambiar estilos de pills
- NO modificar layout mobile

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: none (UI + data flow changes without unit tests in this project)
- Evidence: .omo/evidence/task-1-usuarios-apps-column.md

## Execution strategy
### Parallel execution waves
Wave 1: 2 archivos independientes (type + data logic, UI)

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Extend data layer | — | — | 2 |
| 2. Update AppPills UI | — | — | 1 |

## Todos

- [ ] 1. Extender ConsolidatedUser y lógica de consolidación con Buyer + Payments
  What to do / Must NOT do:
  - En `lib/services/users.ts`:
    a) Extender `ConsolidatedUser`: agregar `buyer?: { user_id: string }` y `payments?: { user_id: string }`
    b) Agregar fetch paralelo de `buyer.listOrdenes({ page_size: 100 })` y `payments.listOrdenesDePago({ page_size: 100 })` al `Promise.all` existente (junto a sellerRes y driverRes)
    c) Extraer `buyer_id` de cada orden/pago y armar `Set<string>` para matching
    d) Agregar "Buyer" y/o "Payments" a `degraded[]` si no responden
    e) En el `map` de Clerk users, agregar `buyer: buyerByClerkId.has(u.id) ? { user_id: u.id } : undefined` y análogo para payments
  - NO modificar la lógica de seller/shipping existente
  - NO cambiar tipos de servicios externos
  - Mantener el patrón `settle()` para degradación graceful
  References:
  - `lib/services/users.ts:1-71` — archivo completo, especialmente tipo `ConsolidatedUser` (línea 10-13) y `listConsolidatedUsers` (línea 22-70)
  - `lib/services/buyer.ts:34-40` — `listOrdenes(params)` retorna `Paginated<BuyerOrden>` con `buyer_id: string`
  - `lib/services/payments.ts:45-51` — `listOrdenesDePago(params)` retorna `Paginated<OrdenDePago>` con `buyer_id: string`
  - `lib/services/types.ts:40-47` — `Paginated<T>` tipo paginado
  Acceptance criteria (agent-executable):
  - `npx tsc --noEmit` exit 0
  - `grep "buyer?" lib/services/users.ts` debe mostrar el nuevo campo en ConsolidatedUser
  - `grep "payments?" lib/services/users.ts` debe mostrar el nuevo campo en ConsolidatedUser
  - `grep "buyer.listOrdenes" lib/services/users.ts` debe mostrar la llamada fetch
  - `grep "payments.listOrdenesDePago" lib/services/users.ts` debe mostrar la llamada fetch
  QA scenarios:
  - happy: ambos endpoints responden, los pills aparecen correctamente
  - failure: Buyer degrada (JWT), Payments funciona — solo muestra Payments en pills + banner "Vista parcial: Buyer"
  Commit: N

- [ ] 2. Actualizar AppPills en la página de usuarios para mostrar Buyer y Payments
  What to do / Must NOT do:
  - En `app/(panel)/usuarios/page.tsx`:
    a) En la función `AppPills` (línea ~139-153), agregar después de `if (user.shipping) apps.push("Shipping");`:
       - `if (user.buyer) apps.push("Buyer");`
       - `if (user.payments) apps.push("Payments");`
  - NO modificar ningún otro aspecto de la página
  - NO cambiar estilos de los pills existentes
  - NO modificar StatePills, el header, el skeleton, el pager, etc.
  References:
  - `app/(panel)/usuarios/page.tsx:139-153` — función `AppPills` actual
  - `lib/services/users.ts` — tipos actualizados en todo 1
  Acceptance criteria (agent-executable):
  - `npx tsc --noEmit` exit 0
  - `grep "user.buyer" app/(panel)/usuarios/page.tsx` debe mostrar el nuevo if
  - `grep "user.payments" app/(panel)/usuarios/page.tsx` debe mostrar el nuevo if
  QA scenarios: happy - usuarios con órdenes/pagos muestran pills Buyer/Payments; failure - sin datos, no se muestran pills (comportamiento natural)
  Commit: N

## Final verification wave
- [ ] F1. Plan compliance audit — cambios coinciden con lo planeado
- [ ] F2. Code quality review — typecheck 0 errors, sin side effects
- [ ] F3. Scope fidelity — solo los 2 archivos modificados

## Commit strategy
Sin commits automáticos.

## Success criteria
- Columna Apps muestra Seller + Buyer + Shipping + Payments según disponibilidad de datos
- Si Buyer o Payments no responden, aparecen en el banner de degradación
- `tsc --noEmit`: 0 errores
- No se modificaron archivos fuera del scope
