---
trigger: glob
globs: "backend/**/*.java"
description: "Reglas de backend Spring Boot 4.1.1 + Jackson 3 + JPA + BigDecimal"
---

# Reglas de Backend Java (SGCH 2.0)

1. **ProblemDetail RFC 7807/9457 obligatorio en errores HTTP:**
   - Todos los errores de API se manejan en `@RestControllerAdvice` (`GlobalExceptionHandler`) retornando `org.springframework.http.ProblemDetail`. No incluir aserción sobre `$.type` (opcional en RFC 9457 / Spring Framework 7).
   - **Criterio de detección:** Violación si un controller o exception handler retorna `Map<String, Object>`, `ResponseEntity<Map>` o strings crudos de error.
   - **Referencia:** `R-008`, `R-035`.

2. **DTOs obligatorios desde Iteración 2 (Prohibido exponer entidades JPA):**
   - Los métodos de `@RestController` reciben DTOs `*Request` (`com.sgch.dto.*Request`) y retornan `*Response` (`com.sgch.dto.*Response`), convirtiendo mediante mappers explícitos (`com.sgch.mapper.*Mapper`).
   - **Criterio de detección:** Violación si `@RequestBody`, `@ResponseBody` o el tipo de retorno de un endpoint en `com.sgch.controller` referencia una clase de `com.sgch.model`. La exposición actual en `ClienteController` es deuda registrada (`A-01`, a resolver en Task 1 del Bloque 1).
   - **Referencia:** `R-084`, `NA-012`, `NA-016`.

3. **BigDecimal exclusivo para dinero, kilogramos y coordenadas:**
   - Todo importe monetario, porcentaje, peso en kg (`scale = 2, RoundingMode.HALF_UP`) y coordenada geográfica (`DECIMAL(10,8)` / `DECIMAL(11,8)`) usa `java.math.BigDecimal`. En tests AssertJ, comparar siempre con `isEqualByComparingTo`, nunca con `isEqualTo`.
   - **Criterio de detección:** Ejecutar `Select-String -Path "backend/src/main/java/com/sgch/**/*.java" -Pattern "\b(Double|Float|double|float)\b"` (debe dar `0` matches).
   - **Referencia:** `R-056`, `R-058`, `R-085`.

4. **Contrato JSON inmutable hacia el frontend:**
   - Todo nuevo DTO o refactor de endpoint que reemplace una entidad existente debe ser 100% isomórfico al contrato JSON previo (mismos nombres de propiedades y tipos serializados bajo `tools.jackson.databind.ObjectMapper` de Jackson 3). Si un cambio altera el JSON, **PARAR y avisar** — el frontend de Fase B (`75` tests Vitest) depende de él.
   - **Criterio de detección:** Comparar el árbol `JsonNode` serializado del DTO contra el contrato esperado en tests `@WebMvcTest` y ejecutar `npm --prefix frontend run test -- --run`.
   - **Referencia:** `R-004`, `R-062`.

5. **Nomenclatura contable estrictamente neutra:**
   - Prohibido usar las palabras `"negro"`, `"blanco"`, `"informal"` o `"porcentaje_facturado"` en nombres de columnas, variables, métodos, DTOs o comentarios. Usar siempre `"porcentaje_documentado_*"` y `"documentado"`. Única excepción legítima del dominio ganadero: `Raza.NEGRO` (pelaje bovino).
   - **Criterio de detección:** Ejecutar `Select-String -Path "backend/src/**" -Pattern "negro|blanco|informal|porcentaje_facturado"` (único match permitido: `Raza.NEGRO`).
   - **Referencia:** `R-066`.
