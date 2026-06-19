---
slug: usuarios-apps-column
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/usuarios-apps-column.md
approach: "Extender ConsolidatedUser con buyer/payments, agregar fetch paralelo de órdenes/pagos en users.ts, actualizar AppPills en page.tsx"
---

# Draft: usuarios-apps-column

## Findings (cited - path:lines)

1. **Apps column solo muestra Seller y Shipping**: 
   - `app/(panel)/usuarios/page.tsx:139-153` — `AppPills` solo revisa `user.seller` y `user.shipping`.
   - `lib/services/users.ts:10-13` — `ConsolidatedUser` solo tiene `seller?` y `shipping?`.

2. **Buyer no tiene endpoint admin para listar usuarios**:
   - `lib/services/buyer.ts:6-9` — `/api/buyer/admin/*` requiere JWT de Clerk, NO API-key. Degrada.
   - `lib/services/buyer.ts:42-44` — `getBuyer(buyerId)` usa `/api/buyer/:id` que sí acepta API-key, pero necesita IDs conocidos.
   - Alternativa: `buyer.listOrdenes({ page_size: 100 })` devuelve ordenes con `buyer_id` que podemos cruzar con Clerk.

3. **Payments no tiene concepto de usuarios, pero las órdenes tienen `buyer_id`**:
   - `lib/services/payments.ts:21` — `OrdenDePago.buyer_id` identifica al comprador.
   - `listOrdenesDePago({ page_size: 100 })` funciona con API-key.

4. **Shipping no se muestra probablemente por matching de IDs**:
   - `lib/services/users.ts:55-62` — `driverById.set(d.user_id, ...)` y lookup por `u.id` (Clerk). Si la API de Shipping devuelve un ID diferente al de Clerk, no matchea.
   - El endpoint `listDrivers` existe y debería funcionar (no hay nota de degradación como Buyer).

5. **Arquitectura**: Clerk es la fuente de verdad compartida por las 4 apps. Los `buyer_id` en Buyer y Payments DEBERÍAN ser Clerk user IDs.

## Decisions (with rationale)

1. **Extender `ConsolidatedUser` con `buyer?` y `payments?`**: Tipo mínimo `{ user_id: string }` porque solo necesitamos saber si el usuario aparece en esa app.

2. **Fetch paralelo de órdenes y pagos en `users.ts`**: Ya hay `Promise.all([settle(seller), settle(shipping)])`. Agregamos `settle(buyer.listOrdenes(...))` y `settle(payments.listOrdenesDePago(...))`. Si una app degrada, se agrega a `degraded[]` y se muestra banner.

3. **Matching por `buyer_id`**: Asumimos que `buyer_id` = Clerk user ID (diseño del sistema). Si no matchea, el pill simplemente no aparece para ese usuario.

4. **Mantener tags de caché existentes**: `usersConsolidated` ya cubre el scope. No necesitamos tags adicionales porque el `use cache` de `consolidatedUsers` ya cachea todo el resultado.

## Scope IN
- `lib/services/users.ts`: Tipo + lógica de consolidación
- `app/(panel)/usuarios/page.tsx`: AppPills actualizado
- (Opcional) Verificación de matching de Shipping

## Scope OUT (Must NOT have)
- NO crear nuevos endpoints en apps downstream (solo usar los existentes)
- NO modificar `app/actions/usuarios.ts` (no hay nuevas mutaciones)
- NO tocar otros paneles
- NO agregar nuevas dependencias

## Open questions
- Ninguna — el enfoque está claro.

## Approval gate
status: awaiting-approval
