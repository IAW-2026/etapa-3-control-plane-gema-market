---
slug: usuarios-buttons-layout
status: approved
intent: clear
pending-action: write .omo/plans/usuarios-buttons-layout.md
approach: "CSS-only fix: change flex-wrap to lgx:flex-nowrap on UserActions, remove w-72 constraint on Actions <th>"
---

# Draft: usuarios-buttons-layout

## Components (topology ledger)
- `components/panels/user-actions.tsx` — Client component con botones de acción (Desactivar/Reactivar, Suspender/Reactivar tienda, Banear/Desbanear courier). Actualmente usa `flex flex-wrap gap-2 justify-end` que fuerza wrap en desktop.
- `app/(panel)/usuarios/page.tsx` — Server page con tabla inline. Columna de acciones tiene `<th className="w-72">` que restringe el ancho mínimo a 288px.
- `components/ui/button.tsx` — Botones size="sm" con h-[34px] px-3.5 text-[13px].

## Open assumptions (announced defaults)
- Ninguna: el usuario tiene claro lo que quiere.

## Findings (cited - path:lines)

1. **Problema raíz**: `user-actions.tsx` línea 86: `<div className="flex flex-wrap gap-2 justify-end">`.
   - `flex-wrap` hace que los botones se apilen verticalmente cuando el contenedor es angosto.
   - La columna de acciones tiene `w-72` (288px) en el `<th>` de la tabla (`page.tsx` línea 40).
   - Dos botones sm ("Desactivar" ~125px + "Suspender tienda" ~178px + gap 8px = ~311px) no caben en 288px -> flex-wrap los apila.

2. **Breakpoint `lgx`**: Definido en `app/globals.css` línea 48: `--breakpoint-lgx: 1100px`.
   - Tabla visible en `lgx:block` (>=1100px).
   - Cards visible en `lgx:hidden` (<1100px).

3. **Table-layout**: La tabla NO usa `table-layout: fixed`, por lo que usa `table-layout: auto` (default). Esto significa que `w-72` actúa como mínimo, no como máximo. La columna puede expandirse si el contenido lo requiere.

## Decisions (with rationale)

1. **Usar `lgx:flex-nowrap flex-wrap` en UserActions** (cambio CSS mínimo):
   - En desktop (>=1100px, tabla visible): `flex-nowrap` -> botones siempre en una línea horizontal.
   - En mobile (<1100px, cards visible): `flex-wrap` -> botones envuelven si es necesario.
   - La tabla con `table-layout: auto` expandirá la columna de acciones automáticamente para acomodar el flex-nowrap.
   - Cambio de una sola línea, sin tocar lógica, sin nuevo estado.

2. **Eliminar `w-72` del `<th>` de acciones** (cambio complementario):
   - Para que la columna pueda crecer sin restricción artificial.
   - Usar `min-w-72` o simplemente eliminar `w-72` para que el ancho sea 100% flexible.
   - Opcional: agregar `whitespace-nowrap` al `<th>` para consistencia.

## Scope IN
- `components/panels/user-actions.tsx`: cambiar clase del div wrapper.
- `app/(panel)/usuarios/page.tsx`: modificar el `<th>` de la columna de acciones.
- Verificación visual: los botones deben estar side-by-side en desktop.

## Scope OUT (Must NOT have)
- NO modificar lógica de negocio, server actions, ni tipos.
- NO crear nuevas abstracciones de tabla genérica o componente DataTable.
- NO cambiar el layout mobile (cards), solo desktop (tabla).
- NO modificar otros paneles (productos, envios, ordenes).

## Open questions
- Ninguna — el intento es claro y se resolvió con exploración.

## Approval gate
status: awaiting-approval
<!-- Presentar brief al usuario. Si aprueba, escribir .omo/plans/usuarios-buttons-layout.md con los todos completos. -->
