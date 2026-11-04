---
trigger: glob
globs: "frontend/**/*.{ts,tsx}"
description: "Reglas de frontend React 18 + Vite + TypeScript + Tailwind + Vitest"
---

# Reglas de Frontend React + TypeScript (SGCH 2.0)

1. **Centralización HTTP en `client.ts` (rumbo a `/api/v1`):**
   - Todas las llamadas HTTP al backend deben pasar por `apiFetch` en `frontend/src/api/client.ts` y manejar errores con `ApiError` estructurada (RFC 7807 `data.detail` / `data.errores`). La migración de prefijo a `/api/v1` se ejecuta en un único punto dentro de `client.ts` (Opción C).
   - **Criterio de detección:** Violación si `Select-String -Path "frontend/src/**/*.{ts,tsx}" -Pattern "\baxios\b|\bfetch\("` arroja coincidencias fuera de `frontend/src/api/client.ts` y `client.test.ts`.
   - **Referencia:** `R-035`, `R-061`.

2. **Tipos TypeScript espejo exacto de los DTOs Java:**
   - Las interfaces en `frontend/src/types/*.ts` deben reflejar fielmente los campos y tipos serializados de `com.sgch.dto.*Response` y `com.sgch.dto.*Request` (incluyendo `id?: string` UUID). Si cambia un DTO en Java, actualizar el tipo TS correspondiente en el mismo cambio.
   - **Criterio de detección:** Comparar las propiedades de `frontend/src/types/*.ts` contra las componentes de `backend/src/main/java/com/sgch/dto/*Response.java` y verificar `npx --prefix frontend tsc -b --noEmit`.
   - **Referencia:** `R-024`, `R-031`.

3. **Íconos SVG inline, cero emojis en UI:**
   - Nunca incluir emojis en JSX, textos de botones, banners ni mensajes de `Toast` de nuevos componentes. Todo ícono visual debe ser un `<svg>` inline con `stroke="currentColor"` y `aria-hidden="true"`.
   - **Criterio de detección:** Inspeccionar los archivos `.tsx` modificados para confirmar ausencia de caracteres emoji Unicode y presencia de `<svg>` inline.
   - **Referencia:** `R-042`.

4. **Tests Vitest obligatorios por componente (TDD estricto):**
   - Cada componente o página en `frontend/src/components/` o `frontend/src/pages/` debe tener su archivo `.test.tsx` coubicado, escrito bajo ciclo TDD (`RED → GREEN → refactor`) antes del código productivo.
   - **Criterio de detección:** Verificar que por cada `<Nombre>.tsx` exista `<Nombre>.test.tsx` y que `npm --prefix frontend run test -- --run` pase al 100% sin warnings.
   - **Referencia:** `R-026`, `R-034`.
