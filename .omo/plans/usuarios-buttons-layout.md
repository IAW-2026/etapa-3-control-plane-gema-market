# usuarios-buttons-layout - Work Plan

## TL;DR (For humans)

**What you'll get:** Los botones de acción ("Desactivar", "Suspender tienda", "Banear courier") en la tabla de usuarios de `/usuarios` se muestran uno al lado del otro horizontalmente en desktop, en lugar de apilados verticalmente. En mobile (vista de cards) siguen funcionando con wrap natural.

**Why this approach:** Es un cambio puramente CSS en 2 archivos. No toca lógica de negocio, no requiere nuevo estado, no crea componentes. La tabla usa `table-layout: auto` que expande columnas automáticamente, así que solo necesitamos quitar la restricción de ancho y cambiar `flex-wrap` por `flex-nowrap` en desktop.

**What it will NOT do:** No modifica el layout mobile (cards), no toca otros paneles (productos/envios/ordenes), no cambia lógica de negocio ni tipos.

**Effort:** Quick
**Risk:** Low - 2 cambios CSS, fácil revertir

**Decisions to sanity-check:** Los breakpoints: `lgx` = 1100px. A partir de ahí los botones se ponen en fila. Por debajo, wrapping natural.

Your next move: `$start-work` para ejecutar el plan.

---

> TL;DR (machine): Quick | Low | CSS fix: flex-nowrap on desktop + remove column width constraint

## Scope
### Must have
- Botones de acción en la tabla desktop (`/usuarios`) se muestran horizontalmente uno al lado del otro
- En mobile (cards, <1100px) los botones envuelven si no caben
- Columna de acciones sin restricción artificial de ancho

### Must NOT have (guardrails, anti-slop, scope boundaries)
- NO modificar lógica de negocio, server actions, tipos, ni hooks
- NO tocar el layout mobile de cards
- NO modificar otros paneles (productos, envios, ordenes, etc.)
- NO agregar nuevos componentes ni dependencias
- NO cambiar estilos de botones individuales (variant, size, icon)

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: none (solo CSS, sin tests unitarios que escribir)
- Evidence: .omo/evidence/task-1-usuarios-buttons-layout.md
- Verificación visual: `lsp_diagnostics` en los 2 archivos modificados + revisión de código

## Execution strategy
### Parallel execution waves
- Wave 1 (única): 2 archivos, cambios CSS independientes, un solo todo

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. CSS fix buttons layout | — | — | — |

## Todos

- [x] 1. CSS: Cambiar layout de botones a horizontal en desktop
  What to do / Must NOT do:
  - En `components/panels/user-actions.tsx` línea 86: cambiar `flex flex-wrap gap-2 justify-end` → `flex flex-wrap lgx:flex-nowrap gap-2 justify-end`
  - En `app/(panel)/usuarios/page.tsx` línea 40: cambiar `<th className="py-2.5 px-5 w-72">` → `<th className="py-2.5 px-5 min-w-72 whitespace-nowrap">` (o simplemente eliminar `w-72`)
  - NO modificar nada más en ningún archivo
  - NO cambiar la lógica de los botones ni los ConfirmDialog
  Parallelization: Wave 1 | Blocked by: — | Blocks: —
  References (executor has NO interview context - be exhaustive):
  - `components/panels/user-actions.tsx:86` — `<div className="flex flex-wrap gap-2 justify-end">`
  - `app/(panel)/usuarios/page.tsx:40` — `<th className="py-2.5 px-5 w-72">`
  - `app/globals.css:48` — `--breakpoint-lgx: 1100px`
  - Breackpoint `lgx` = 1100px. Tabla visible en `lgx:block`, cards en `lgx:hidden`.
  - La tabla usa `table-layout: auto` (default), por lo que `min-w-72` actúa como mínimo, no máximo.
  Acceptance criteria (agent-executable):
  - `lsp_diagnostics` en ambos archivos: 0 errors
  - `grep "flex-wrap" components/panels/user-actions.tsx` debe mostrar `flex flex-wrap lgx:flex-nowrap`
  - `grep "w-72" app/\(panel\)/usuarios/page.tsx` no debe mostrar resultados (o solo `min-w-72`)
  - Revisión manual: verificar que no hayan cambios no intencionales
  QA scenarios: happy path - lsp diagnostics pasan; failure path - si hay errores de sintaxis, revertir
  Commit: N (este es un cambio menor, el usuario hará commit si quiere)

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE.
- [x] F1. Plan compliance audit — verificar que los cambios coinciden con lo planeado
- [x] F2. Code quality review — revisar que no hayan efectos secundarios
- [x] F3. Real manual QA — abrir `/usuarios` y verificar botones side-by-side en desktop
- [x] F4. Scope fidelity — confirmar que no se modificaron archivos fuera de scope

## Commit strategy
Sin commits automáticos. Los cambios son menores y el usuario manejará su propio control de versiones.

## Success criteria
- En desktop (>=1100px): los botones aparecen uno al lado del otro en la misma fila
- En mobile (<1100px, cards): los botones envuelven si no caben (comportamiento existente)
- lsp_diagnostics: 0 errores en archivos modificados
- No se modificaron archivos fuera del scope definido
