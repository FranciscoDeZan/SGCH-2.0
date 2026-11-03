# Plan de Implementación — Fase 2.A (Backend Core: Operaciones, Cuotas, Cobros y Cálculo Fiscal)

## Metadata
- **Proyecto:** SGCH 2.0
- **Fase:** 2.A (backend core)
- **Fecha:** 2026-11-03
- **Autor:** Francisco De Zan (con Antigravity Pro High + auditoría)
- **Modelo base de ejecución:** Flash High (excepto Task 6: Pro High)
- **Total tasks:** 10 (Task 0 a Task 9)
- **Duración estimada:** 5-7 sesiones de trabajo (10 tasks ejecutables)
- **Estado:** APROBADO (2026-11-03)

## Objetivo de Fase 2.A
Implementar el backend core de Iteración 2: corrección de coordenadas de `Cliente` a `BigDecimal` (R-058), migración Flyway `V2` (ampliación de `clientes` y creación de `operaciones`, `cuotas_operacion` y `cobros` — R-063, R-076), entidades JPA (`Operacion`, `CuotaOperacion`, `Cobro`) y enums de dominio, DTOs de entrada/salida con validaciones Jakarta (AGENTS.md regla 2), motor de cálculo fiscal completo en 3 capas (`CalculadoraFinancieraService`: Capa 1 valorización económica, Capa 2 liquidación fiscal, Capa 3 saldos derivados por contraparte según circuito — Anexo II v1.1), servicios y endpoints REST `/api/v1/operaciones` y `/api/v1/cobros` con manejo de errores RFC 7807/9457 (`ProblemDetail`, R-008, AGENTS.md regla 1), y exposición de `/api/v1/clientes` en paralelo a `/api/clientes` legacy (R-062).

## Criterios de éxito de Fase 2.A
- 10 tasks completadas en orden con commits atómicos bajo Conventional Commits (R-038).
- Backend compila sin errores ni warnings; la totalidad de la suite de tests (21 existentes + ~65-75 nuevos entre repositorios, calculadora, servicios y controladores) pasa en verde.
- Endpoints `/api/v1/operaciones` y `/api/v1/cobros` funcionan end-to-end y respetan el contrato de `ProblemDetail` (RFC 7807/9457, R-008).
- Los repositorios JPA (`ClienteRepository`, `OperacionRepository`, `CuotaOperacionRepository`, `CobroRepository`) validan el esquema Flyway `V1` + `V2` contra MySQL 8 real mediante Testcontainers 2.0.5 (R-003, R-006, R-007, R-064).
- `/api/v1/clientes` responde en paralelo a `/api/clientes` sin alterar el comportamiento consumido por el frontend actual (R-062).
- Cálculo fiscal: Capas 1, 2 y 3 cubiertas al 100% por tests unitarios puros (sin Spring context ni Testcontainers — R-064), incluyendo los Ejemplos 1 (§6.1) y 2 (§6.2) del Anexo II v1.1 como casos de regresión al centavo.
- 0 hacks: sin `@Disabled`, sin tests eliminados o debilitados para pasar (R-025), sin mocks que oculten fallos de integración, sin vocabulario prohibido en código ni base de datos (R-066), sin emojis.
- `Cliente.java` utiliza `BigDecimal` en `latitud` y `longitud` (R-058).

## Dependencias entre tasks (DAG)
- `Task 0` → (independiente; puede ejecutarse en primer lugar sobre el árbol actual)
- `Task 1` → (independiente a nivel SQL; habilita el esquema para las entidades de Task 2 y Task 3)
- `Task 1` → `Task 2` → `Task 3` → `Task 4`
- `Task 4` → `Task 5` → `Task 6` → `Task 7.1` → `Task 7.2` → `Task 8` → `Task 9`

## Convenciones del plan
- **Estructura por task:** ID, título, modelo asignado, dependencias, objetivo, archivos a crear/modificar, casos de test a escribir, criterios de aceptación, comandos de verificación, mensaje de commit sugerido y riesgos específicos.
- **TDD estricto (R-026):** en toda task con lógica o persistencia, el agente implementer escribe primero los tests (estado RED), verifica que fallen por la razón esperada, implementa el código mínimo para pasarlos (estado GREEN), refactoriza manteniendo verde y ejecuta el commit.
- **Two-reviewer pattern (R-036):** al terminar la implementación de cada task, se despacha primero `spec-reviewer` (cumplimiento de especificación v3.2 / Anexo II / Rulings) y luego `code-reviewer` (calidad, arquitectura, cobertura y ausencia de deuda).
- **Checkpoint humano entre tasks (R-037):** ninguna task arranca sin la aprobación explícita del usuario tras el reporte de cierre de la task previa.
- **Descripciones sin código embebido:** los tests se especifican por caso y comportamiento esperado; las entidades, migraciones y servicios se especifican por contrato, tipos exactos y reglas de negocio.
- **Referencias normativas explícitas:** cada requerimiento cita su fuente en `v3.2`, `Anexo II v1.1`, `DECISIONES-NEGOCIO.md` (`D-01..D-14`, `DA-01..DA-05`) y `RULINGS.md` (`R-001..R-082`).
- **Aritmética monetaria y de peso:** toda operación con `BigDecimal` usa escala explícita (`scale = 2` para montos y kilogramos, `RoundingMode.HALF_UP`) y comparación por valor (`compareTo` / `isEqualByComparingTo` en AssertJ), nunca `equals` de `BigDecimal` si difiere la escala.

## TABLA RESUMEN

| # | Task | Modelo | Deps | Tests | Commit |
|---|---|---|---|---|---|
| **0** | Fix `Cliente.java` (`Double` → `BigDecimal` en coordenadas, R-058) | Flash High | ninguna | 21 existentes actualizados y en verde (+ verificación de precisión `BigDecimal`) | `fix(model): use BigDecimal for latitude and longitude per R-058` |
| **1** | Migración `V2__create_operaciones_y_cobros.sql` | Flash High | ninguna | Validación de aplicación Flyway `V1` + `V2` en `ClienteRepositoryTest` (3 tests verdes) | `feat(db): add V2 migration for operaciones, cuotas_operacion, cobros and cliente fiscal fields` |
| **2** | Entidad `Operacion` + enums de dominio + `OperacionRepository` | Flash High | Task 1 | 6-8 tests de repositorio con Testcontainers MySQL 8 (`OperacionRepositoryTest`) | `feat(model): add Operacion entity, domain enums, cliente fiscal fields and repository` |
| **3** | Entidades `CuotaOperacion` + `Cobro` + enums + repositorios | Flash High | Task 2 | 6-8 tests de repositorio con Testcontainers MySQL 8 (`CuotaOperacionRepositoryTest`, `CobroRepositoryTest`) | `feat(model): add CuotaOperacion and Cobro entities, MedioPago enum and repositories` |
| **4** | DTOs request/response + mappers + validaciones Jakarta | Flash High | Task 3 | 10-12 tests unitarios de validación Jakarta (`Validator`) y mapeo (`OperacionDtoValidationTest`, `OperacionMapperTest`) | `feat(dto): add request/response DTOs, mappers and Jakarta validations for operaciones and cobros` |
| **5** | `CalculadoraFinancieraService` Capa 1 + Capa 2 + tests unitarios | Flash High | Task 4 | 20-25 tests unitarios puros (`CalculadoraFinancieraServiceCapas1y2Test`) incl. regresión Anexo II §6.1 | `feat(calc): implement Capa 1 (valuation) and Capa 2 (tax) with unit tests` |
| **6** | `CalculadoraFinancieraService` Capa 3 + tests unitarios | **Pro High** | Task 5 | 10-12 tests unitarios puros (`CalculadoraFinancieraServiceCapa3Test`) incl. regresión Anexo II §6.1 y §6.2 | `feat(calc): implement Capa 3 (counterparty balances) with circuit-specific logic` |
| **7.1** | `OperacionService` + `CobroService` + tests unitarios | Flash High | Task 6 | 8-12 tests unitarios puros (`OperacionServiceTest`, `CobroServiceTest`) | `feat(service): add OperacionService and CobroService with cuota generation and cobro imputation logic` |
| **7.2** | `OperacionController` + `CobroController` + `GlobalExceptionHandler` + tests | Flash High | Task 7.1 | 6-8 tests `@WebMvcTest` (`OperacionControllerTest`, `CobroControllerTest`) | `feat(api): expose /api/v1/operaciones and /api/v1/cobros with ProblemDetail handling` |
| **8** | Migración `ClienteController` a `/api/v1` en paralelo + smoke | Flash High | Task 7.2 | 21 existentes + 3 nuevos en `ClienteControllerTest` para `/api/v1/clientes` | `feat(api): expose /api/v1/clientes in parallel to legacy /api/clientes per R-062` |
| **9** | Cierre documental de Fase 2.A | Flash High | Task 8 | Ninguno (documental; verificación suite completa 100% verde) | `docs(report): close Fase 2.A with tests, endpoints, calculation validation and rulings` |

---

## DETALLE DE CADA TASK

### Task 0 — Fix Cliente.java (Double → BigDecimal en coordenadas, R-058)
- **Modelo:** Flash High
- **Deps:** ninguna
- **Objetivo:** Alinear `Cliente.java` con `R-058` y `R-056` cambiando los campos `latitud` y `longitud` de `Double` a `java.math.BigDecimal`, manteniendo la definición de columnas `DECIMAL(10,8)` y `DECIMAL(11,8)` ya existente en `V1__Create_clientes_table.sql`.
- **Archivos a modificar:**
  - `backend/src/main/java/com/sgch/model/Cliente.java` (cambiar tipo de `latitud` y `longitud` de `Double` a `BigDecimal`, agregar `precision = 10, scale = 8` en `latitud` y `precision = 11, scale = 8` en `longitud` junto con el import `java.math.BigDecimal`).
  - `backend/src/test/java/com/sgch/service/ClienteServiceTest.java` (actualizar líneas 110-111 y 123-124 en `testUpdateSuccess` para pasar `new BigDecimal("-32.95")` y `new BigDecimal("-60.65")` y verificar con `isEqualByComparingTo`).
  - `backend/src/test/java/com/sgch/controller/ClienteControllerTest.java` (verificar que la serialización/deserialización JSON con `tools.jackson.databind.ObjectMapper` de Jackson 3 mantenga números JSON en coordenadas).
  - Nota sobre DTOs y Service: en el estado actual del repo (`HEAD aa9a9a1`) aún no existen `ClienteRequest.java` ni `ClienteResponse.java`, y `ClienteService.java` copia `target.setLatitud(source.getLatitud())` y `target.setLongitud(source.getLongitud())` sin mencionar el tipo `Double`, por lo que `ClienteService.java` compila sin cambios al cambiar el tipo en `Cliente.java`.
- **Migración DB:** NINGUNA. `V1__Create_clientes_table.sql` ya declaró `latitud DECIMAL(10,8)` y `longitud DECIMAL(11,8)`.
- **Tests a escribir / actualizar:**
  - En `ClienteServiceTest`: actualizar `testUpdateSuccess` para usar `BigDecimal` en `latitud` y `longitud`.
  - En `ClienteRepositoryTest`: asegurar que al persistir un `Cliente` con `latitud` (`-31.63332940`) y `longitud` (`-60.70000080`) como `BigDecimal`, MySQL 8 y Hibernate 7 conservan las 8 posiciones decimales exactas.
  - En `ClienteControllerTest`: verificar que el payload JSON de `POST /api/clientes` con `latitud` y `longitud` numéricos se serializa como número JSON (no string) y enlaza sin error a `BigDecimal`.
- **Criterios de aceptación:**
  - `Cliente.latitud` y `Cliente.longitud` son de tipo `java.math.BigDecimal`.
  - Jackson 3 (`tools.jackson.databind.ObjectMapper`, R-005) serializa `BigDecimal` como número JSON y no como string.
  - Los 21 tests existentes pasan en verde con `mvnw -f backend/pom.xml clean test`.
  - 0 warnings de compilación.
- **Comandos de verificación:**
  - `.\backend\mvnw.cmd -f backend/pom.xml clean test`
  - `Select-String -Path "backend/src/main/java/com/sgch/model/Cliente.java" -Pattern "Double latitud|Double longitud"` → 0 matches.
- **Commit sugerido:** `fix(model): use BigDecimal for latitude and longitude per R-058`
- **Riesgos:** En Hibernate 7 (Spring Boot 4.1.1), si se usa `@Column(precision = 10, scale = 8)` junto con `columnDefinition = "DECIMAL(10,8)"`, verificar que `ddl-auto: validate` contra MySQL 8 en `ClienteRepositoryTest` no rechace la metadata de columna. Mantener la anotación compatible con el validador de esquema de Hibernate 7.

---

### Task 1 — Migración V2__create_operaciones_y_cobros.sql
- **Modelo:** Flash High
- **Deps:** ninguna (ejecutada después del checkpoint de Task 0)
- **Objetivo:** Crear la migración Flyway única de la Iteración 2 (`V2__create_operaciones_y_cobros.sql`, R-063 ampliado por R-076) que extienda la tabla `clientes` y cree las tablas `operaciones`, `cuotas_operacion` y `cobros` cumpliendo `v3.2 §6.1, §6.2, §6.4, §6.5` y los rulings `R-056`, `R-057`, `R-060`, `R-063`, `R-066`, `R-069` a `R-080`.
- **Archivos a crear:**
  - `backend/src/main/resources/db/migration/V2__create_operaciones_y_cobros.sql`
- **Especificación detallada del esquema SQL (sin lógica de cálculo):**
  1. **`ALTER TABLE clientes`** (`v3.2 §6.1`, `DA-04`, `D-14`, `R-075`):
     - `ADD COLUMN cuit VARCHAR(11) NULL`
     - `ADD COLUMN condicion_fiscal VARCHAR(30) NOT NULL DEFAULT 'RESPONSABLE_INSCRIPTO'`
  2. **`CREATE TABLE operaciones`** (`v3.2 §6.2`, `R-056`, `R-057`, `R-066`, `R-069..R-080`):
     - `id VARCHAR(36) PRIMARY KEY`
     - `fecha_carga DATETIME NOT NULL`
     - `fecha_operacion DATETIME NOT NULL`
     - `modalidad_circuito VARCHAR(30) NOT NULL` (`DIRECTO`, `CONSIGNATARIA_EXTERNA`, `PROPIA` — `D-07`, `R-070`)
     - `consignataria_externa VARCHAR(255) NULL`
     - `comprador_id VARCHAR(36) NOT NULL` (`FK → clientes(id)`)
     - `vendedor_id VARCHAR(36) NOT NULL` (`FK → clientes(id)`)
     - `categoria VARCHAR(30) NOT NULL` (`FAENA`, `INVERNADA`, `REPRODUCCION`)
     - `subcategoria VARCHAR(100) NULL`
     - `kg_neto DECIMAL(12,2) NOT NULL` (`D-11`, `R-056`)
     - `kg_origen_bruto DECIMAL(12,2) NULL`
     - `porcentaje_desbaste DECIMAL(5,2) NULL` (rango `-8.00` a `+15.00` — `R-078`)
     - `kg_llegada_referencia DECIMAL(12,2) NULL` (`D-11`)
     - `precio_kg_facturado DECIMAL(15,2) NOT NULL` (`D-11`, `R-069`)
     - `monto_extra_cobrado_comprador DECIMAL(15,2) NULL` (`D-11`, `R-069`)
     - `modalidad_precio VARCHAR(20) NOT NULL` (`NETO`, `FINAL` — `Anexo II §2`)
     - `precio_es_final BOOLEAN NOT NULL DEFAULT FALSE` (`v3.2 §6.2`, `D-09`, `R-072`)
     - `comision_porcentaje_vendedor DECIMAL(5,2) NOT NULL DEFAULT 0.00` (`D-08`, `R-071`)
     - `comision_porcentaje_comprador DECIMAL(5,2) NOT NULL DEFAULT 0.00`
     - `comision_total_cobrada_referencia DECIMAL(5,2) NULL` (`D-08`, `R-071`)
     - `condicion_fiscal_vendedor VARCHAR(30) NOT NULL` (snapshot al momento de la operación — `D-14`, `R-075`)
     - `porcentaje_documentado_ganado DECIMAL(5,2) NOT NULL DEFAULT 100.00` (`R-066`)
     - `porcentaje_documentado_comision_vendedor DECIMAL(5,2) NOT NULL DEFAULT 100.00` (`R-066`)
     - `porcentaje_documentado_comision_comprador DECIMAL(5,2) NOT NULL DEFAULT 100.00` (`R-066`)
     - `iva_ganado_monto_override DECIMAL(15,2) NULL` (`R-079`)
     - `iva_comision_vendedor_override DECIMAL(15,2) NULL` (`R-079`)
     - `iva_comision_comprador_override DECIMAL(15,2) NULL` (`R-079`)
     - `con_garantia BOOLEAN NOT NULL DEFAULT TRUE` (`D-03`)
     - `retenciones_externas_monto DECIMAL(15,2) NULL` (`R-080`)
     - `condicion_entrega VARCHAR(30) NULL` (`A_RETIRAR_CAMPO`, `PUESTO_EN_PLANTA` — `DA-02`)
     - `flete_cargo_de VARCHAR(20) NULL` (`COMPRADOR`, `VENDEDOR`, `NINGUNO` — `DA-02`)
     - `flete_monto DECIMAL(15,2) NULL` (`D-12`, `RN09`)
     - `estado_liquidacion VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE'` (`PENDIENTE`, `PARCIALMENTE_PAGADO`, `LIQUIDADO` — `RN05`)
     - `forma_pago VARCHAR(100) NOT NULL`
     - `plazo VARCHAR(100) NULL`
     - `raza VARCHAR(50) NULL` (`BRANGUS`, `COLORADO`, `NEGRO`, `BRAFORD`, `DEFINIDO`, `VARIOS`)
     - `color VARCHAR(100) NULL`
     - `puntuacion VARCHAR(50) NULL`
     - `destino VARCHAR(255) NULL`
     - `cantidad_machos INT NULL`
     - `cantidad_hembras INT NULL`
     - `terneros BOOLEAN NULL`
     - `observaciones TEXT NULL`
     - **Foreign Keys:** `fk_operaciones_comprador` (`comprador_id → clientes(id)`), `fk_operaciones_vendedor` (`vendedor_id → clientes(id)`).
     - **Índices:** `idx_operaciones_comprador` (`comprador_id`), `idx_operaciones_vendedor` (`vendedor_id`), `idx_operaciones_fecha_operacion` (`fecha_operacion`), `idx_operaciones_estado_liquidacion` (`estado_liquidacion`), `idx_operaciones_circuito` (`modalidad_circuito`).
  3. **`CREATE TABLE cuotas_operacion`** (`v3.2 §6.4`, `D-10`, `R-073`, `R-076`):
     - `id VARCHAR(36) PRIMARY KEY`
     - `operacion_id VARCHAR(36) NOT NULL`
     - `numero_cuota INT NOT NULL`
     - `fecha_base_plazo VARCHAR(20) NOT NULL` (`CARGA`, `REMATE`)
     - `dias_plazo_comprador INT NOT NULL`
     - `dias_descalce_vendedor INT NOT NULL DEFAULT 0`
     - `fecha_vencimiento_comprador DATE NOT NULL` (`R-076`)
     - `fecha_vencimiento_vendedor DATE NOT NULL` (`R-076`)
     - `monto_cuota DECIMAL(15,2) NOT NULL` (`R-056`, `R-073`)
     - `estado_cobro VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'` (`PENDIENTE`, `PARCIAL`, `COBRADO`)
     - `estado_pago VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'` (`PENDIENTE`, `PARCIAL`, `PAGADO`)
     - **Foreign Key:** `fk_cuotas_operacion` (`operacion_id → operaciones(id) ON DELETE CASCADE`).
     - **Constraint / Índices:** `uk_cuota_operacion_numero` (`UNIQUE (operacion_id, numero_cuota)`), `idx_cuotas_venc_comprador` (`fecha_vencimiento_comprador`), `idx_cuotas_venc_vendedor` (`fecha_vencimiento_vendedor`).
  4. **`CREATE TABLE cobros`** (`v3.2 §6.5`, `D-02`, `R-057`, `R-060`):
     - `id VARCHAR(36) PRIMARY KEY`
     - `operacion_id VARCHAR(36) NOT NULL`
     - `cuota_id VARCHAR(36) NULL`
     - `cliente_id VARCHAR(36) NOT NULL`
     - `tipo_movimiento VARCHAR(30) NOT NULL` (`COBRO_COMPRADOR`, `PAGO_VENDEDOR`, `COBRO_COMISION`, `RETENCION_SALDO`, `DEVOLUCION_SALDO`)
     - `fecha_movimiento DATE NOT NULL`
     - `monto DECIMAL(15,2) NOT NULL` (`R-056`)
     - `medio_pago VARCHAR(30) NOT NULL` (`ECHEQ`, `TRANSFERENCIA`, `CHEQUE_FISICO`, `EFECTIVO`, `CANJE_ESPECIE` — `D-02`)
     - `documentado BOOLEAN NOT NULL DEFAULT TRUE`
     - `observaciones TEXT NULL`
     - **Foreign Keys:** `fk_cobros_operacion` (`operacion_id → operaciones(id)`), `fk_cobros_cuota` (`cuota_id → cuotas_operacion(id)`), `fk_cobros_cliente` (`cliente_id → clientes(id)`).
     - **Índices:** `idx_cobros_operacion` (`operacion_id`), `idx_cobros_cuota` (`cuota_id`), `idx_cobros_cliente` (`cliente_id`), `idx_cobros_fecha` (`fecha_movimiento`).
- **Tests a ejecutar:**
  - Ejecutar `ClienteRepositoryTest` (que levanta MySQL 8 con Testcontainers e importa `FlywayAutoConfiguration` con `ddl-auto: validate` — R-006, R-007) para comprobar que Flyway ejecuta `V1` y `V2` sin errores de sintaxis ni de claves foráneas en MySQL 8.
- **Criterios de aceptación:**
  - El archivo `V2__create_operaciones_y_cobros.sql` contiene únicamente DDL (sin lógica de cálculo ni triggers).
  - Ninguna columna de saldos derivados de Capa 3 se persiste en `operaciones` (`R-070`).
  - Nomenclatura estrictamente neutra (`porcentaje_documentado_*`, `monto_extra_cobrado_comprador`, `documentado` — `R-066`).
  - Flyway aplica `V1` y `V2` limpiamente sobre MySQL 8 en Testcontainers.
- **Comandos de verificación:**
  - `.\backend\mvnw.cmd -f backend/pom.xml test -Dtest=ClienteRepositoryTest`
  - `Select-String -Path "backend/src/main/resources/db/migration/V2__create_operaciones_y_cobros.sql" -Pattern "negro|blanco|informal|porcentaje_facturado"` → 0 matches.
- **Commit sugerido:** `feat(db): add V2 migration for operaciones, cuotas_operacion, cobros and cliente fiscal fields`
- **Riesgos:** Si alguna columna en `V2` se define con tipo incompatible con el mapeo por defecto de Hibernate 7 (`ddl-auto: validate`), fallará en Task 2/3. Usar tipos SQL estándar de MySQL 8 (`VARCHAR`, `DECIMAL(p,s)`, `INT`, `BOOLEAN`, `DATE`, `DATETIME`, `TEXT`).

---

### Task 2 — Entidad Operacion + enums + repositorio
- **Modelo:** Flash High
- **Deps:** Task 1
- **Objetivo:** Implementar la entidad JPA `Operacion`, los enums de dominio asociados, los campos fiscales nuevos en `Cliente` (`cuit` y `condicionFiscal` con enum `CondicionFiscal`), y el repositorio `OperacionRepository` validado con Testcontainers + MySQL 8 (R-064).
- **Archivos a crear / modificar:**
  - Crear enums en `backend/src/main/java/com/sgch/model/`:
    - `CondicionFiscal.java` (`RESPONSABLE_INSCRIPTO`, `MONOTRIBUTISTA`, `EXENTO`, `CONSUMIDOR_FINAL` — `D-14`, `R-075`)
    - `ModalidadCircuito.java` (`DIRECTO`, `CONSIGNATARIA_EXTERNA`, `PROPIA` — `D-07`, `R-070`)
    - `CategoriaOperacion.java` (`FAENA`, `INVERNADA`, `REPRODUCCION` — `v3.2 §6.2`)
    - `ModalidadPrecio.java` (`NETO`, `FINAL` — `Anexo II §2`, `D-09`, `R-072`)
    - `CondicionEntrega.java` (`A_RETIRAR_CAMPO`, `PUESTO_EN_PLANTA` — `DA-02`)
    - `FleteCargoDe.java` (`COMPRADOR`, `VENDEDOR`, `NINGUNO` — `DA-02`, `D-12`)
    - `EstadoLiquidacion.java` (`PENDIENTE`, `PARCIALMENTE_PAGADO`, `LIQUIDADO` — `RN05`)
    - `Raza.java` (`BRANGUS`, `COLORADO`, `NEGRO`, `BRAFORD`, `DEFINIDO`, `VARIOS` — `v3.2 §6.2`)
  - Modificar `backend/src/main/java/com/sgch/model/Cliente.java`:
    - Agregar `cuit` (`String`, `@Pattern(regexp = "^\\d{11}$")` opcional cuando presente, `@Column(name = "cuit", length = 11)` — `v3.2 §6.1`, `DA-04`).
    - Agregar `condicionFiscal` (`CondicionFiscal`, `@Enumerated(EnumType.STRING)`, `@Column(name = "condicion_fiscal", nullable = false, length = 30)`, valor por defecto `CondicionFiscal.RESPONSABLE_INSCRIPTO` — `D-14`, `R-075`).
  - Modificar `backend/src/main/java/com/sgch/service/ClienteService.java`:
    - En `update(String id, Cliente source)`, copiar también `cuit` y `condicionFiscal` (si `source.getCondicionFiscal() != null`).
  - Crear `backend/src/main/java/com/sgch/model/Operacion.java`:
    - PK `id` (`String`, `@Id @GeneratedValue(strategy = GenerationType.UUID)` — `R-057`, `R-024`).
    - `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` sobre `id` (`R-023`).
    - Relaciones `@ManyToOne(fetch = FetchType.LAZY, optional = false)` hacia `Cliente` para `comprador` (`@JoinColumn(name = "comprador_id", nullable = false)`) y `vendedor` (`@JoinColumn(name = "vendedor_id", nullable = false)`).
    - Todos los campos económicos y de peso como `BigDecimal` con `precision` y `scale` exactos idénticos a `V2` (`R-056`, `R-078`).
    - Todos los enums anotados con `@Enumerated(EnumType.STRING)`.
    - Defaults inicializados en la entidad: `precioEsFinal = false`, `comisionPorcentajeVendedor = BigDecimal.ZERO`, `comisionPorcentajeComprador = BigDecimal.ZERO`, `porcentajeDocumentadoGanado = new BigDecimal("100.00")`, `porcentajeDocumentadoComisionVendedor = new BigDecimal("100.00")`, `porcentajeDocumentadoComisionComprador = new BigDecimal("100.00")`, `conGarantia = true`, `estadoLiquidacion = EstadoLiquidacion.PENDIENTE`.
  - Crear `backend/src/main/java/com/sgch/repository/OperacionRepository.java`:
    - Extiende `JpaRepository<Operacion, String>` y `JpaSpecificationExecutor<Operacion>` (para soportar filtros combinados en Task 7: circuito, cliente comprador/vendedor, estado de liquidación y rango de fechas).
    - Métodos derivados: `findByCompradorIdOrVendedorIdOrderByFechaOperacionDesc(String compradorId, String vendedorId)`, `findByModalidadCircuito(ModalidadCircuito circuito)`, `findByEstadoLiquidacion(EstadoLiquidacion estado)`.
  - Crear `backend/src/test/java/com/sgch/repository/OperacionRepositoryTest.java`:
    - Anotado con `@DataJpaTest`, `@Testcontainers`, `@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)` e `@Import(FlywayAutoConfiguration.class)` (R-006, R-007, R-064).
- **Tests a escribir (`OperacionRepositoryTest`):**
  1. Persistir una `Operacion` completa en circuito `DIRECTO` vinculada a dos `Cliente` (comprador y vendedor) y verificar que se asigna UUID y se recuperan los 43 campos con sus escalas de `BigDecimal` intactas.
  2. Verificar persistencia de `porcentajeDesbaste` negativo (`-4.50`) y positivo (`+1.50`) dentro del rango `DECIMAL(5,2)` (`R-078`).
  3. Verificar persistencia de `Operacion` en circuito `CONSIGNATARIA_EXTERNA` con `consignatariaExterna`, `comisionTotalCobradaReferencia` y `retencionesExternasMonto` (`R-071`, `R-080`).
  4. Verificar persistencia de los 3 campos de override de IVA (`ivaGanadoMontoOverride`, `ivaComisionVendedorOverride`, `ivaComisionCompradorOverride` — `R-079`) y los 3 porcentajes documentados (`R-066`).
  5. Verificar búsqueda de operaciones por cliente (tanto cuando actúa como comprador como cuando actúa como vendedor) ordenada por fecha descendente (`RF08`).
  6. Verificar que `comprador` o `vendedor` nulos lanzan `DataIntegrityViolationException`.
  7. Verificar en `ClienteRepositoryTest` que `cuit` (11 dígitos) y `condicionFiscal` (`EXENTO`, `MONOTRIBUTISTA`, `CONSUMIDOR_FINAL`) se persisten y tienen default `RESPONSABLE_INSCRIPTO`.
- **Criterios de aceptación:**
  - `Operacion.java` mapea 1:1 todas las columnas de la tabla `operaciones` de `V2` y pasa la validación `ddl-auto: validate` de Hibernate 7.
  - Ningún campo monetario o de peso utiliza `Double` o `Float` (`R-056`).
  - Todos los tests de `OperacionRepositoryTest` y `ClienteRepositoryTest` pasan en verde contra MySQL 8 en Testcontainers.
- **Comandos de verificación:**
  - `.\backend\mvnw.cmd -f backend/pom.xml test -Dtest=ClienteRepositoryTest,OperacionRepositoryTest,ClienteServiceTest,ClienteControllerTest`
- **Commit sugerido:** `feat(model): add Operacion entity, domain enums, cliente fiscal fields and repository`
- **Riesgos:** No usar `@Data` en `Operacion` (`R-023`); usar `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor` y `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` igual que en `Cliente.java` para evitar carga prematura de proxies LAZY (`comprador`, `vendedor`) en `equals`/`hashCode`/`toString`.

---

### Task 3 — Entidades CuotaOperacion + Cobro + enum MedioPago + repos
- **Modelo:** Flash High
- **Deps:** Task 2
- **Objetivo:** Implementar las entidades JPA `CuotaOperacion` (`v3.2 §6.4`, `R-076`) y `Cobro` (`v3.2 §6.5`, `R-060`), sus enums (`MedioPago`, `FechaBasePlazo`, `EstadoCuotaCobro`, `EstadoCuotaPago`, `TipoMovimientoCobro`) y sus repositorios JPA con tests de integración sobre Testcontainers MySQL 8 (R-064).
- **Archivos a crear:**
  - Crear enums en `backend/src/main/java/com/sgch/model/`:
    - `FechaBasePlazo.java` (`CARGA`, `REMATE` — `v3.2 §6.4`)
    - `EstadoCuotaCobro.java` (`PENDIENTE`, `PARCIAL`, `COBRADO` — `v3.2 §6.4`)
    - `EstadoCuotaPago.java` (`PENDIENTE`, `PARCIAL`, `PAGADO` — `v3.2 §6.4`)
    - `MedioPago.java` (`ECHEQ`, `TRANSFERENCIA`, `CHEQUE_FISICO`, `EFECTIVO`, `CANJE_ESPECIE` — `D-02`, `v3.2 §6.5`)
    - `TipoMovimientoCobro.java` (`COBRO_COMPRADOR`, `PAGO_VENDEDOR`, `COBRO_COMISION`, `RETENCION_SALDO`, `DEVOLUCION_SALDO` — `v3.2 §6.5`)
  - Crear `backend/src/main/java/com/sgch/model/CuotaOperacion.java`:
    - PK `id` (`String`, `@Id @GeneratedValue(strategy = GenerationType.UUID)` — `R-057`, `R-076`).
    - `@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "operacion_id", nullable = false)` hacia `Operacion`.
    - Campos: `numeroCuota` (`Integer`), `fechaBasePlazo` (`FechaBasePlazo`), `diasPlazoComprador` (`Integer`), `diasDescalceVendedor` (`Integer`, default `0`), `fechaVencimientoComprador` (`LocalDate`), `fechaVencimientoVendedor` (`LocalDate`), `montoCuota` (`BigDecimal`, `DECIMAL(15,2)`), `estadoCobro` (`EstadoCuotaCobro`, default `PENDIENTE`), `estadoPago` (`EstadoCuotaPago`, default `PENDIENTE`).
  - Crear `backend/src/main/java/com/sgch/model/Cobro.java`:
    - PK `id` (`String`, `@Id @GeneratedValue(strategy = GenerationType.UUID)` — `R-057`, `R-060`).
    - `@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "operacion_id", nullable = false)` hacia `Operacion`.
    - `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "cuota_id")` hacia `CuotaOperacion` (nullable para pagos al contado — `v3.2 §6.5`).
    - `@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "cliente_id", nullable = false)` hacia `Cliente`.
    - Campos: `tipoMovimiento` (`TipoMovimientoCobro`), `fechaMovimiento` (`LocalDate`), `monto` (`BigDecimal`, `DECIMAL(15,2)`), `medioPago` (`MedioPago`), `documentado` (`Boolean`, default `true`), `observaciones` (`String`, `@Column(columnDefinition = "TEXT")`).
  - Crear `backend/src/main/java/com/sgch/repository/CuotaOperacionRepository.java`:
    - `List<CuotaOperacion> findByOperacionIdOrderByNumeroCuotaAsc(String operacionId)`
    - `void deleteByOperacionId(String operacionId)`
  - Crear `backend/src/main/java/com/sgch/repository/CobroRepository.java`:
    - `List<Cobro> findByOperacionIdOrderByFechaMovimientoAsc(String operacionId)`
    - `List<Cobro> findByCuotaIdOrderByFechaMovimientoAsc(String cuotaId)`
  - Crear tests:
    - `backend/src/test/java/com/sgch/repository/CuotaOperacionRepositoryTest.java`
    - `backend/src/test/java/com/sgch/repository/CobroRepositoryTest.java`
- **Tests a escribir:**
  1. `CuotaOperacionRepositoryTest`: guardar 3 cuotas para una operación en `CONSIGNATARIA_EXTERNA` con `diasPlazoComprador` `30, 60, 90`, `diasDescalceVendedor = 7`, y verificar que las dos fechas (`fechaVencimientoComprador` y `fechaVencimientoVendedor` a `37, 67, 97` días — `R-076`) y `montoCuota` se recuperan ordenadas por `numeroCuota`.
  2. `CuotaOperacionRepositoryTest`: verificar que la restricción única `(operacion_id, numero_cuota)` rechaza dos cuotas con el mismo número para la misma operación.
  3. `CobroRepositoryTest`: guardar un `Cobro` vinculado a una `Operacion` y a una `CuotaOperacion` específica con cada uno de los 5 valores de `MedioPago` (`D-02`) y verificar su recuperación por `operacionId` y por `cuotaId`.
  4. `CobroRepositoryTest`: guardar un `Cobro` al contado con `cuota = null` (`v3.2 §6.5`) y verificar que persiste sin error.
  5. `CobroRepositoryTest`: verificar que `documentado` (`true`/`false`) y `tipoMovimiento` se almacenan y recuperan correctamente.
- **Criterios de aceptación:**
  - `CuotaOperacion` y `Cobro` validan contra el esquema `V2` en MySQL 8 con `ddl-auto: validate`.
  - Se soportan tanto cobros imputados a una cuota (`cuota != null`) como cobros de contado (`cuota == null`).
  - 6-8 tests nuevos verdes en `CuotaOperacionRepositoryTest` y `CobroRepositoryTest`.
- **Comandos de verificación:**
  - `.\backend\mvnw.cmd -f backend/pom.xml test -Dtest=CuotaOperacionRepositoryTest,CobroRepositoryTest`
- **Commit sugerido:** `feat(model): add CuotaOperacion and Cobro entities, MedioPago enum and repositories`
- **Riesgos:** Asegurar que en `Cobro` la relación `@ManyToOne` a `CuotaOperacion` tenga `optional = true` (default) mientras que `operacion` y `cliente` tengan `optional = false`, evitando errores de inserción en pagos al contado.

---

### Task 4 — DTOs request/response + mappers + validaciones
- **Modelo:** Flash High
- **Deps:** Task 3
- **Objetivo:** Implementar la capa de DTOs de entrada y salida junto con sus validaciones Jakarta Bean Validation y mappers puros, cumpliendo la regla 2 de `AGENTS.md` ("A partir de la Iteración 2, utilizar DTOs para Request y Response en los Controllers. No exponer Entidades JPA directamente").
- **Archivos a crear:**
  - En `backend/src/main/java/com/sgch/dto/`:
    - `CuotaOperacionRequest.java`: datos opcionales para crear/editar cuotas (`numeroCuota`, `fechaBasePlazo`, `diasPlazoComprador`, `diasDescalceVendedor`, `fechaVencimientoComprador`, `fechaVencimientoVendedor`, `montoCuota` editable per `D-10`, `R-073`).
    - `CuotaOperacionResponse.java`: representación de salida de cada cuota (incluye `id`, `numeroCuota`, fechas comprador y vendedor, `montoCuota`, `estadoCobro`, `estadoPago`).
    - `CalculoResultado.java`: record/DTO inmutable con el desglose completo de las 3 capas del Anexo II v1.1 (`subtotalGanado`, `comisionVendedorMonto`, `comisionCompradorMonto`, `ivaGanado`, `ivaComisionVendedorMonto`, `ivaComisionCompradorMonto`, `montoExtraCobradoComprador`, `saldoHaciendaEntrePartes`, `saldoComisionFirma`, `totalACobrarComprador`, `totalAPagarVendedor` — `RF06`, `R-070`).
    - `OperacionRequest.java`: DTO de entrada para crear/actualizar operaciones con validaciones Jakarta:
      - `fechaOperacion` (`@NotNull`)
      - `modalidadCircuito` (`@NotNull`)
      - `consignatariaExterna` (`@Size(max = 255)`)
      - `compradorId` (`@NotBlank`), `vendedorId` (`@NotBlank`)
      - `categoria` (`@NotNull`), `subcategoria` (`@Size(max = 100)`)
      - `kgNeto` (`@NotNull`, `@DecimalMin(value = "0.01", inclusive = true)`)
      - `kgOrigenBruto` (`@DecimalMin(value = "0.01", inclusive = true)` nullable)
      - `porcentajeDesbaste` (`@DecimalMin("-8.00")`, `@DecimalMax("15.00")` nullable — `R-078`)
      - `kgLlegadaReferencia` (`@DecimalMin("0.01")` nullable)
      - `precioKgFacturado` (`@NotNull`, `@DecimalMin(value = "0.01", inclusive = true)`)
      - `montoExtraCobradoComprador` (`@DecimalMin("0.00")` nullable — `D-11`, `R-069`)
      - `modalidadPrecio` (`@NotNull` — `NETO` o `FINAL`), `precioEsFinal` (`Boolean`)
      - `comisionPorcentajeVendedor`, `comisionPorcentajeComprador`, `comisionTotalCobradaReferencia` (`@DecimalMin("0.00")`, `@DecimalMax("100.00")`)
      - `porcentajeDocumentadoGanado`, `porcentajeDocumentadoComisionVendedor`, `porcentajeDocumentadoComisionComprador` (`@DecimalMin("0.00")`, `@DecimalMax("100.00")` — `R-066`)
      - `ivaGanadoMontoOverride`, `ivaComisionVendedorOverride`, `ivaComisionCompradorOverride` (`@DecimalMin("0.00")` nullable — `R-079`)
      - `conGarantia` (`Boolean`, default `true` — `D-03`)
      - `retencionesExternasMonto` (`@DecimalMin("0.00")` nullable — `R-080`)
      - `condicionEntrega`, `fleteCargoDe`, `fleteMonto` (`@DecimalMin("0.00")` nullable — `D-12`)
      - `formaPago` (`@NotBlank`, `@Size(max = 100)`), `plazo` (`@Size(max = 100)`)
      - `raza`, `color`, `puntuacion`, `destino`, `cantidadMachos` (`@Min(0)`), `cantidadHembras` (`@Min(0)`), `terneros`, `observaciones`
      - `cuotas` (`List<@Valid CuotaOperacionRequest>` opcional)
    - `OperacionResponse.java`: DTO de salida completo con todos los campos de `Operacion`, nombres/IDs de comprador y vendedor, lista de `CuotaOperacionResponse` y objeto `CalculoResultado calculo` embebido (`RF06`).
    - `CobroRequest.java`: DTO de entrada con `operacionId` (`@NotBlank`), `cuotaId` (nullable), `clienteId` (`@NotBlank`), `tipoMovimiento` (`@NotNull`), `fechaMovimiento` (`@NotNull`), `monto` (`@NotNull`, `@DecimalMin("0.01")`), `medioPago` (`@NotNull` — `D-02`), `documentado` (`@NotNull`), `observaciones`.
    - `CobroResponse.java`: DTO de salida con todos los campos del cobro registrado.
  - En `backend/src/main/java/com/sgch/mapper/`:
    - `OperacionMapper.java` y `CobroMapper.java` (componentes Spring sin dependencias externas mágicas, mapeando explícitamente entre `OperacionRequest` / `Operacion` / `OperacionResponse` y `CobroRequest` / `Cobro` / `CobroResponse`).
  - Crear tests unitarios en `backend/src/test/java/com/sgch/dto/`:
    - `OperacionDtoValidationTest.java`
    - `OperacionMapperTest.java`
- **Tests a escribir:**
  1. `OperacionDtoValidationTest`: `OperacionRequest` válido pasa `Validator.validate` con 0 violaciones.
  2. `OperacionDtoValidationTest`: `kgNeto <= 0` o nulo y `precioKgFacturado <= 0` o nulo disparan violación de constraint.
  3. `OperacionDtoValidationTest`: `porcentajeDesbaste` en `-8.00` y `+15.00` es válido; en `-8.01` o `+15.01` dispara violación (`R-078`).
  4. `OperacionDtoValidationTest`: `porcentajeDocumentadoGanado` y comisiones fuera de `0..100` (`-1` o `101`) disparan violación (`R-066`).
  5. `OperacionDtoValidationTest`: `montoExtraCobradoComprador = null` es válido; negativo (`-10.00`) dispara violación (`R-069`).
  6. `OperacionDtoValidationTest`: `CobroRequest` sin `operacionId`, sin `medioPago` o con `monto <= 0` dispara violación.
  7. `OperacionMapperTest`: mapeo de `OperacionRequest` a `Operacion` aplica defaults (`porcentajeDocumentado* = 100`, `conGarantia = true`, sincronización entre `modalidadPrecio == FINAL` y `precioEsFinal == true`, snapshot de `condicionFiscalVendedor` desde el `Cliente` vendedor) y mapeo de `Operacion` + `CalculoResultado` a `OperacionResponse` preserva todos los campos.
- **Criterios de aceptación:**
  - 10-12 tests unitarios verdes sin levantar contexto pesado ni base de datos.
  - Ninguna entidad JPA se expone en las firmas de `OperacionResponse` ni `CobroResponse` (`AGENTS.md` regla 2).
- **Comandos de verificación:**
  - `.\backend\mvnw.cmd -f backend/pom.xml test -Dtest=OperacionDtoValidationTest,OperacionMapperTest`
- **Commit sugerido:** `feat(dto): add request/response DTOs, mappers and Jakarta validations for operaciones and cobros`
- **Riesgos:** Sincronizar `modalidadPrecio` (`NETO`/`FINAL`) y `precioEsFinal` (`boolean`) en `OperacionMapper` para que si el request envía `modalidadPrecio = FINAL` (o `precioEsFinal = true`), ambos campos queden consistentes en la entidad `Operacion`.

---

### Task 5 — CalculadoraFinancieraService Capa 1 + Capa 2 + tests
- **Modelo:** Flash High
- **Deps:** Task 4
- **Objetivo:** Implementar Capa 1 (valorización económica) y Capa 2 (liquidación fiscal) del Anexo II v1.1 en `CalculadoraFinancieraService` con sus tests unitarios puros (`R-064`).
- **Archivos a crear:**
  - `backend/src/main/java/com/sgch/service/CalculadoraFinancieraService.java` (métodos de Capa 1 y Capa 2).
  - `backend/src/test/java/com/sgch/service/CalculadoraFinancieraServiceCapas1y2Test.java` (nota: ubicado en `src/test/java` para ejecución por Maven Surefire).
- **Tests unitarios puros (NO Testcontainers, R-064):**
  - **Capa 1 (`Anexo II §2`):**
    1. `subtotal_ganado = kg_neto × precio_kg_facturado` (con redondeo a 2 decimales `HALF_UP`).
    2. `comision_vendedor_monto` y `comision_comprador_monto` calculadas sobre `subtotal_ganado` cuando `modalidad_precio = NETO`.
    3. `comision_vendedor_monto` y `comision_comprador_monto` calculadas sobre el monto bruto (`kg_neto × precio_kg_facturado`) cuando `modalidad_precio = FINAL` / `precio_es_final = true` (`D-09`, `R-072`).
    4. `monto_extra_cobrado_comprador` (presente o nulo) no altera `subtotal_ganado` ni los montos de comisión de Capa 1 (`D-11`, `R-069`).
  - **Capa 2 (`Anexo II §3`):**
    5. IVA ganado `10.5%` con vendedor `RESPONSABLE_INSCRIPTO` y `modalidad_precio = NETO` (`subtotal_ganado × 0.105 × (porcentaje_documentado_ganado / 100)`).
    6. IVA ganado por desglose `/ 1.105` con vendedor `RESPONSABLE_INSCRIPTO` y `modalidad_precio = FINAL` (`neto_ganado = subtotal_ganado / 1.105`, `iva_ganado_teorico = subtotal_ganado - neto_ganado`, multiplicado por `porcentaje_documentado_ganado / 100`).
    7. IVA ganado `0%` (`0.00`) cuando `condicion_fiscal_vendedor = MONOTRIBUTISTA` (tanto en `NETO` como en `FINAL`).
    8. IVA ganado `0%` (`0.00`) cuando `condicion_fiscal_vendedor = EXENTO` (`D-14`, `R-075`).
    9. IVA ganado `0%` (`0.00`) cuando `condicion_fiscal_vendedor = CONSUMIDOR_FINAL` (`D-14`, `R-075`).
    10. IVA comisión vendedor y comprador al `21%`: `comision_monto × 0.21 × (porcentaje_documentado_comision / 100)` (independiente de que el vendedor sea Monotributista, Exento o CF).
    11. Formalidad independiente en IVA ganado e IVA comisiones con `porcentaje_documentado = 0` (resultado `0.00`), `= 50` (mitad exacta), `= 70` y `= 100` (`R-066`).
    12. Override `iva_ganado_monto_override` no nulo pisa el cálculo automático de `iva_ganado` (`R-079`).
    13. Override `iva_comision_vendedor_override` no nulo pisa el cálculo automático de `iva_comision_vendedor_monto` (`R-079`).
    14. Override `iva_comision_comprador_override` no nulo pisa el cálculo automático de `iva_comision_comprador_monto` (`R-079`).
  - **Regresión:**
    15. Anexo II §6.1 (Ejemplo 1: `30.000 kg × $5.000/kg`, RI, `NETO`, comisiones `2%` y `2%`, `100%` documentado) debe producir exactamente `subtotal_ganado = 150000000.00`, `comision_vendedor_monto = 3000000.00`, `comision_comprador_monto = 3000000.00`, `iva_ganado = 15750000.00`, `iva_comision_vendedor_monto = 630000.00`, `iva_comision_comprador_monto = 630000.00`.
- **Criterios de aceptación:**
  - 20-25 tests unitarios puros en verde.
  - Ningún método tiene lógica condicional sobre texto (`"negro"`, `"blanco"`, `"formal"`, `"informal"`). Solo sobre enums (`CondicionFiscal`, `ModalidadPrecio`) y valores numéricos (`BigDecimal`).
  - 0 warnings de compilación.
- **Comandos de verificación:**
  - `.\backend\mvnw.cmd -f backend/pom.xml test -Dtest=CalculadoraFinancieraServiceCapas1y2Test`
- **Commit sugerido:** `feat(calc): implement Capa 1 (valuation) and Capa 2 (tax) with unit tests`
- **Riesgos:** En el Caso B de Capa 2 (`RESPONSABLE_INSCRIPTO` + `FINAL`), la división `subtotal_ganado.divide(new BigDecimal("1.105"), ...)` produce decimales periódicos si no se especifica escala y modo de redondeo (`ArithmeticException: Non-terminating decimal expansion`). Usar escala intermedia suficiente o redondeo `scale = 2, RoundingMode.HALF_UP` consistente en `neto_ganado`.

---

### Task 6 — CalculadoraFinancieraService Capa 3 + tests
- **Modelo:** **Pro High**
- **Deps:** Task 5
- **Objetivo:** Implementar Capa 3 (saldos derivados por contraparte según circuito — `Anexo II §4`, `D-07`, `D-08`, `D-11`, `D-12`, `D-13`, `R-069`, `R-070`, `R-071`) integrando las 3 capas en el método público `calcular(Operacion): CalculoResultado`, cubierto por tests unitarios puros.
- **Archivos a modificar / crear:**
  - Modificar `backend/src/main/java/com/sgch/service/CalculadoraFinancieraService.java` (agregar cálculo de Capa 3 y método integrador `calcular(Operacion)` que retorna `CalculoResultado`).
  - Crear `backend/src/test/java/com/sgch/service/CalculadoraFinancieraServiceCapa3Test.java`.
- **Tests unitarios puros (`CalculadoraFinancieraServiceCapa3Test`):**
  - **CIRCUITO `DIRECTO` (`Anexo II §4`):**
    1. `saldo_hacienda_entre_partes = subtotal_ganado + iva_ganado`
    2. `saldo_comision_firma = (comision_vendedor_monto + iva_comision_vendedor_monto) + (comision_comprador_monto + iva_comision_comprador_monto) + monto_extra_cobrado_comprador` (cuando `monto_extra` está presente).
    3. `total_a_cobrar_comprador = comision_comprador_monto + iva_comision_comprador_monto + monto_extra_cobrado_comprador` (cuando `monto_extra` está presente).
    4. `total_a_pagar_vendedor = 0.00`.
  - **CIRCUITO `CONSIGNATARIA_EXTERNA` (`Anexo II §4`, `D-08`, `R-071`):**
    5. `saldo_hacienda_entre_partes = 0.00`.
    6. `saldo_comision_firma = comision_vendedor_monto + iva_comision_vendedor_monto` (donde `comision_porcentaje_vendedor` es el neto facturado a la consignataria externa).
    7. `total_a_cobrar_comprador = 0.00` y `total_a_pagar_vendedor = 0.00`.
  - **CIRCUITO `PROPIA` (`Anexo II §4`, `DA-04`):**
    8. Comisión `= 0.00` en la punta propia y saldos equivalentes a `DIRECTO` con comisión `0` en dicha punta.
  - **Regresión obligatoria al centavo (`Anexo II §6.1 y §6.2`):**
    9. **Ejemplo 1 (§6.1 — `DIRECTO` sin spread):**
       - `saldo_hacienda_entre_partes = 165750000.00`
       - `saldo_comision_firma = 7260000.00`
       - `total_a_cobrar_comprador = 3630000.00`
       - `total_a_pagar_vendedor = 0.00`
    10. **Ejemplo 2 (§6.2 — `DIRECTO` con spread `monto_extra = 6000000.00`):**
        - `saldo_hacienda_entre_partes = 165750000.00`
        - `saldo_comision_firma = 13260000.00`
        - `total_a_cobrar_comprador = 9630000.00`
        - `total_a_pagar_vendedor = 0.00`
  - **Casos de borde:**
    11. `monto_extra_cobrado_comprador = null` vs `= 0.00` producen idéntico resultado.
    12. `flete_monto` y `retenciones_externas_monto` presentes en la `Operacion` NO alteran ninguno de los 4 saldos de Capa 3 (`D-12`, `RN09`, `R-080`).
    13. Combinación de `porcentaje_documentado = 0` con overrides de IVA activos se propaga correctamente a `saldo_hacienda_entre_partes`, `saldo_comision_firma` y `total_a_cobrar_comprador`.
- **Criterios de aceptación:**
  - 10-12 tests unitarios puros en verde en `CalculadoraFinancieraServiceCapa3Test`.
  - El método `calcular(Operacion)` devuelve un `CalculoResultado` con los 4 saldos de Capa 3 + el desglose intermedio de Capas 1 y 2.
  - Coincidencia exacta al centavo con los Ejemplos 1 y 2 del Anexo II §6.
- **Comandos de verificación:**
  - `.\backend\mvnw.cmd -f backend/pom.xml test -Dtest=CalculadoraFinancieraServiceCapas1y2Test,CalculadoraFinancieraServiceCapa3Test`
- **Commit sugerido:** `feat(calc): implement Capa 3 (counterparty balances) with circuit-specific logic`
- **Riesgos:** La lógica por circuito es el punto más crítico de la Iteración 2. Cualquier discrepancia aquí se propaga a toda la API. Si los Ejemplos 1 y 2 del Anexo II §6 no coinciden al centavo (`0.00`), PARAR y reportar antes de avanzar.

---

### Task 7.1 — OperacionService + CobroService + tests unitarios
- **Modelo:** Flash High
- **Deps:** Task 6
- **Objetivo:** Implementar la lógica de negocio de operaciones y cobros, incluyendo generación/pre-llenado de cuotas (`D-10`, `R-073`, `R-076`) e imputación de cobros con actualización de `EstadoLiquidacion` (`RN05`).
- **Archivos a crear:**
  - `backend/src/main/java/com/sgch/service/OperacionService.java`:
    - `create(OperacionRequest)`: valida comprador/vendedor existen, snapshot de condición fiscal del vendedor, valida reglas condicionales (`CONSIGNATARIA_EXTERNA` requiere `consignataria_externa`; retenciones solo permitidas en `CONSIGNATARIA_EXTERNA`; `PROPIA` requiere al menos una comisión = 0), genera o persiste `CuotaOperacion` según `D-10`/`R-073`/`R-076`, calcula con `CalculadoraFinancieraService`, retorna `OperacionResponse`.
    - `findAll` con filtros, `findById`, `update`.
  - `backend/src/main/java/com/sgch/service/CobroService.java`:
    - `create(CobroRequest)`: valida existencia de `Operacion`, `Cliente`, `CuotaOperacion` (si aplica y pertenece a la operación), registra `Cobro`, actualiza estado de cuota y `estado_liquidacion` de operación.
    - `findByOperacionId`, `findById`.
  - `backend/src/test/java/com/sgch/service/OperacionServiceTest.java`:
    Tests (mockito puro, sin Spring context):
    - Creación de operación con snapshot de condición fiscal
    - Pre-llenado de cuotas en `DIRECTO` (partes iguales, descalce 0)
    - Pre-llenado de cuotas en `CONSIGNATARIA_EXTERNA` (cuota 1 con IVA + capital/N, descalce +7 al vendedor)
    - Rechazo si `CONSIGNATARIA_EXTERNA` sin nombre → `IllegalArgumentException`
    - Rechazo si `retenciones_externas_monto` en circuito no-CONSIGNATARIA
    - Rechazo si `PROPIA` con ambas comisiones > 0
    - Respuesta embebida de `CalculoResultado`
  - `backend/src/test/java/com/sgch/service/CobroServiceTest.java`:
    Tests:
    - Cobro parcial → `estado_liquidacion = PARCIALMENTE_PAGADO`
    - Cobro completo → `estado_liquidacion = LIQUIDADO`
    - Cobro a cuota inexistente → error
    - Cobro a cuota de operación distinta → error
    - `COBRO_COMISION` sin `cuota_id` no cierra `estado_liquidacion` si `saldo_hacienda_entre_partes > 0`
- **Criterios de aceptación:**
  - 8-12 tests verdes
  - 0 hacks
  - Semántica de `monto_cuota` coherente con Ajuste 4
- **Commit sugerido:** `feat(service): add OperacionService and CobroService with cuota generation and cobro imputation logic`

---

### Task 7.2 — OperacionController + CobroController + GlobalExceptionHandler + tests
- **Modelo:** Flash High
- **Deps:** Task 7.1
- **Objetivo:** Exponer `/api/v1/operaciones` y `/api/v1/cobros` con DTOs, `ProblemDetail` RFC 7807 (`R-008`, `AGENTS.md` regla 1), tests `@WebMvcTest`.
- **Archivos a crear/modificar:**
  - `backend/src/main/java/com/sgch/controller/OperacionController.java`:
    `POST`, `GET`, `GET/{id}`, `PUT` bajo `/api/v1/operaciones`
  - `backend/src/main/java/com/sgch/controller/CobroController.java`:
    `POST`, `GET?operacionId=`, `GET/{id}` bajo `/api/v1/cobros`
  - `backend/src/main/java/com/sgch/exception/GlobalExceptionHandler.java`:
    Agregar `@ExceptionHandler(IllegalArgumentException.class)` → `400 ProblemDetail`
  - `backend/src/test/java/com/sgch/controller/OperacionControllerTest.java`:
    `@WebMvcTest` con `tools.jackson.databind.ObjectMapper` y `@MockitoBean` (imports exactos de `ClienteControllerTest.java` — `R-004`, `R-005`).
    Tests: `POST` válido 201, `POST` inválido 400 + problem+json, `GET` inexistente 404 + ProblemDetail, `PUT` válido 200
  - `backend/src/test/java/com/sgch/controller/CobroControllerTest.java`:
    `@WebMvcTest` idem.
    Tests: `POST` válido 201, `GET` por `operacionId` 200, `GET/{id}` 404
- **Criterios de aceptación:**
  - 6-8 tests verdes
  - Todos los endpoints usan DTOs (`AGENTS.md` regla 2)
  - `ProblemDetail` RFC 7807/9457 (`R-008`)
- **Commit sugerido:** `feat(api): expose /api/v1/operaciones and /api/v1/cobros with ProblemDetail handling`

---

### Task 8 — Migración ClienteController a /api/v1 en paralelo + smoke
- **Modelo:** Flash High
- **Deps:** Task 7.2
- **Objetivo:** Cumplir `R-062`: exponer `/api/v1/clientes` en paralelo a `/api/clientes` legacy en `ClienteController`, actualizar `ClienteControllerTest` para verificar ambos paths con idéntico comportamiento, y ejecutar el smoke test global de Fase 2.A sin tocar ni un archivo del frontend.
- **Archivos a modificar:**
  - `backend/src/main/java/com/sgch/controller/ClienteController.java`:
    - Actualizar `@RequestMapping` a `@RequestMapping({"/api/clientes", "/api/v1/clientes"})` para que Spring MVC atienda ambos prefijos con exactamente los mismos métodos y validaciones.
  - `backend/src/test/java/com/sgch/controller/ClienteControllerTest.java`:
    - Mantener intactos los 9 tests existentes sobre `/api/clientes` y agregar 3 tests sobre `/api/v1/clientes` (`GET /api/v1/clientes`, `POST /api/v1/clientes` válido `201`, y `GET /api/v1/clientes/{id}` inexistente `404 ProblemDetail`).
- **Criterios de aceptación:**
  - `/api/clientes` sigue funcionando exactamente igual (no rompe el frontend actual de Iteración 1).
  - `/api/v1/clientes` funciona en paralelo con el mismo comportamiento.
  - Todos los tests de `backend/` (los 21 originales + todos los agregados en Tasks 2 a 8) pasan en verde.
  - Ningún archivo dentro de `frontend/` fue modificado.
- **Comandos de verificación:**
  - Backend levantado con `.\backend\mvnw.cmd spring-boot:run`
  - `curl -X POST http://localhost:8080/api/v1/operaciones` con payload mínimo en circuito `DIRECTO` → `201 Created`
  - `curl -X POST http://localhost:8080/api/v1/operaciones` con payload mínimo en circuito `CONSIGNATARIA_EXTERNA` → `201 Created`
  - `curl -X POST http://localhost:8080/api/v1/operaciones` con payload mínimo en circuito `PROPIA` → `201 Created`
  - `curl http://localhost:8080/api/v1/operaciones` → `200` + array con 3 operaciones, cada una con cálculo embebido
  - `curl http://localhost:8080/api/v1/operaciones/{id-inexistente}` → `404` + `ProblemDetail` (`application/problem+json`)
  - `curl -X POST http://localhost:8080/api/v1/cobros` imputado a la primera operación → `201 Created`
  - `curl "http://localhost:8080/api/v1/cobros?operacionId={primera-op-id}"` → `200` + array con 1 cobro
  - `curl http://localhost:8080/api/v1/clientes` → `200 OK`
  - `curl http://localhost:8080/api/clientes` → `200 OK` (legacy sigue)
  - `.\backend\mvnw.cmd -f backend/pom.xml clean test` → 100% verde
  - `git status --short frontend/` → vacío
- **Commit sugerido:** `feat(api): expose /api/v1/clientes in parallel to legacy /api/clientes per R-062`
- **Riesgos:** Si se reemplaza `/api/clientes` en lugar de publicar un arreglo de rutas `{"/api/clientes", "/api/v1/clientes"}`, tanto los tests existentes de `ClienteControllerTest` como el frontend de Clientes romperían antes de la Fase 2.B. Verificar que ambas rutas coexistan en `@RequestMapping`.

---

### Task 9 — Cierre documental de Fase 2.A
- **Modelo:** Flash High
- **Deps:** Task 8
- **Objetivo:** Documentar el cierre de Fase 2.A en `REPORT.md`, `progress.md` y `RULINGS.md` (si surgieron rulings nuevos durante la ejecución). Commitear.
- **Archivos a modificar:**
  - `.superpowers/sdd/migracion-boot4/REPORT.md`:
    Sección "Fase 2.A — Backend Core" con: tests verdes (desglose por suite), endpoints implementados (`/api/v1/operaciones`, `/api/v1/cobros`, `/api/v1/clientes` en paralelo), cálculo fiscal validado (Capa 1, 2, 3 con regresión al centavo de Anexo II §6.1 y §6.2), total de tests.
  - `.superpowers/sdd/migracion-boot4/progress.md`:
    Entrada append-only con fecha de cierre, hash del último commit de task, tasks completadas, tests pasando, incidentes (si hubo).
  - `.superpowers/sdd/migracion-boot4/RULINGS.md`:
    Solo si surgieron rulings nuevos durante ejecución. Candidatos:
    - `R-083`: Semántica de `monto_cuota` en `DIRECTO` (Opción A).
    - `R-084`: Subdivisión de Task 7 en 7.1 y 7.2.
    Si no surgieron, no tocar.
  - `docs/superpowers/plans/2026-11-03-iteracion-2-fase-2a-backend.md`:
    Cambiar Estado: `APROBADO` → `DONE`.
- **Tests:** ninguno (documental).
- **Verificación:**
  - `.\backend\mvnw.cmd -f backend/pom.xml clean test` → 100% verde
  - `git log --oneline -20` → todas las tasks visibles
  - `git status --short` → vacío post-commit
- **Commit sugerido:** `docs(report): close Fase 2.A with tests, endpoints, calculation validation and rulings`

---

## Checkpoints y verificación global

### Protocolo por task (R-026, R-036, R-037, R-038)
1. **Ciclo TDD:** escribir tests primero (RED) → verificar fallo → implementar código mínimo (GREEN) → refactorizar → verificar suite.
2. **Doble revisión:** ejecutar `spec-reviewer` (contra `v3.2`, `Anexo II v1.1` y `RULINGS.md`) y `code-reviewer` (calidad, tipos `BigDecimal`, ausencia de términos prohibidos `R-066`).
3. **Commit atómico:** stage únicamente de los archivos de la task, verificación con `git diff --cached --stat`, commit con el mensaje Conventional Commits especificado.
4. **Reporte y pausa obligatoria (R-037):** informar al usuario `git log -1 --stat`, conteo de tests en verde y veredicto de reviewers, y **esperar aprobación explícita** antes de iniciar la siguiente task.

### Verificación al cierre de Fase 2.A
- `.\backend\mvnw.cmd -f backend/pom.xml clean test` → 100% de tests en verde (0 failures, 0 errors, 0 skipped).
- `.\backend\mvnw.cmd -f backend/pom.xml clean test-compile` → 0 warnings de compilación.
- Escaneo de sanitización de código (`R-066`):
  `Select-String -Path "backend/src/**" -Pattern "negro|blanco|informal|porcentaje_facturado"` → 0 matches (con la única excepción legítima del valor `NEGRO` en el enum `Raza.java` para pelaje bovino Brangus/Aberdeen Angus según `v3.2 §6.2`).
- Smoke test de arranque: Flyway aplica `V1` y `V2` contra MySQL 8, y los endpoints `/api/v1/operaciones`, `/api/v1/cobros`, `/api/v1/clientes` y `/api/clientes` responden según especificación.
- `git diff main -- frontend/` → vacío (confirmación de que ningún archivo del frontend fue tocado).

---

## Riesgos y ajustes sugeridos

### 1. Riesgos técnicos reales identificados
1. **División periódica en desglose de IVA con Precio Final (`Task 5`, Anexo II §3.1 Caso B):**
   Al dividir `subtotal_ganado / 1.105` con `BigDecimal.divide(...)` en Java, el divisor `1.105` (`221/200`) tiene factor primo `13` y `17`, por lo que genera expansión decimal infinita y lanza `ArithmeticException` si no se indica `scale` y `RoundingMode`. `CalculadoraFinancieraService` debe usar `subtotalGanado.divide(new BigDecimal("1.105"), 2, RoundingMode.HALF_UP)` (o escala intermedia `6` con redondeo final a `2` decimales) de manera uniforme.
2. **Coexistencia de `modalidad_precio` y `precio_es_final` (`Task 1`, `Task 2`, `Task 4`):**
   El Documento de Requerimientos `v3.2 §6.2` lista tanto `Tipo de Precio` (`Select: "Más IVA" o "Final"`) como `Precio es Final` (`Booleano`), mientras que `Anexo II v1.1 §2` denomina al campo `modalidad_precio (NETO | FINAL)`. Para evitar desincronización, `OperacionMapper` debe asegurar que `precioEsFinal` sea siempre `modalidadPrecio == ModalidadPrecio.FINAL`.
3. **Palabra `NEGRO` en el enum `Raza` vs. chequeo automático de `R-066` (`Task 2`):**
   `v3.2 §6.2` (línea 229) define las razas bovinas: `Brangus, Colorado, Negro, Braford, Definido, Varios`. El identificador `Raza.NEGRO` refiere al pelaje del ganado (Aberdeen Angus / Brangus negro) y es legítimo del dominio ganadero, mientras que `R-066` prohíbe el término en contexto fiscal/contable. Conviene documentarlo para que ningún filtro regex ciego lo confunda con una violación de `R-066`.
4. **Contrato JSON de `ClienteController` en `Task 0` y `Task 8` (`AGENTS.md` regla 2 vs. compatibilidad con Frontend I1):**
   `ClienteController` expone hoy la entidad `Cliente` en `/api/clientes` y el frontend de Iteración 1 ya consume ese contrato (y en `Task 2` se agregan `cuit` y `condicionFiscal` con default `RESPONSABLE_INSCRIPTO`). Mantener la firma de `ClienteController` en Fase 2.A garantiza 0 roturas en los 21 tests existentes y en el frontend actual; si se desea introducir `ClienteRequest`/`ClienteResponse` en Fase 2.B junto con la migración del frontend a `/api/v1`, las propiedades JSON deberán ser 100% isomórficas.
5. **Paquete de imports en Spring Boot 4.1.1 (`Task 2`, `Task 3`, `Task 7.1`, `Task 7.2`):**
   El proyecto corre sobre Spring Boot `4.1.1` y Testcontainers `2.0.5` (`R-001` a `R-007`). Los agentes implementers deben copiar los imports exactos de `ClienteRepositoryTest.java` (`org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest`, `org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration`, `org.testcontainers.mysql.MySQLContainer`) y `ClienteControllerTest.java` (`org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest`, `tools.jackson.databind.ObjectMapper`, `@MockitoBean`).

### 2. Subdivisiones aplicadas
- **`Task 7` subdividida en `Task 7.1` y `Task 7.2`:**
  Aprobada e incorporada a la estructura canónica del plan de 10 tasks. `Task 7.1` cubre la capa transaccional y de dominio (`OperacionService` + `CobroService` + unit tests con Mockito) y `Task 7.2` cubre la capa web REST (`OperacionController` + `CobroController` + `GlobalExceptionHandler` + `@WebMvcTest`).
- **`Task 5` (`CalculadoraFinancieraService Capa 1 + Capa 2`):**
  Tiene un tamaño ideal para una sola sesión de `Flash High` (1 clase de servicio pura sin dependencias de infraestructura + 1 clase de test unitario de 20-25 casos), por lo que no requiere subdivisión.

### 3. Ambigüedades menores de negocio a tener presentes en la implementación
1. **Identificación de la punta propia en `CIRCUITO PROPIA` (`Task 6`, `Anexo II §4`, `DA-04`):**
   `Anexo II §4` establece para `PROPIA`: *"Aplicar las mismas fórmulas que en DIRECTO, pero con comision = 0 en la punta donde la firma es parte (DA-04, B10)"*. Como las cuentas propias se registran como filas normales en la tabla `clientes` (`DA-04`) sin un flag booleano `esCuentaPropia` en `clientes`, en la práctica el operador carga `0%` en la comisión de la punta propia (`comisionPorcentajeVendedor = 0` o `comisionPorcentajeComprador = 0`). Se recomienda que `OperacionService` valide que cuando `modalidadCircuito == PROPIA`, al menos una de las dos comisiones porcentuales sea `0.00`.
2. **Base monetaria y semántica del pre-llenado de cuotas (D-10, R-073, R-083):**

CIRCUITO DIRECTO:
- `monto_cuota = (subtotal_ganado + iva_ganado) / N`.
- Este monto representa el pago entre partes (comprador → vendedor). Es informativo para la firma y sirve para disparar alertas de seguimiento al operador.
- La comisión de la firma NO se incluye en `monto_cuota`. Se registra en un `Cobro` separado con `tipo_movimiento = COBRO_COMISION`, sin `cuota_id` (no tiene vencimiento pactado; se cobra cuando la firma puede).
- `estado_liquidacion` de la operación se actualiza con el agregado de `Cobro` (no con `monto_cuota`):
  - Si cobros de tipo `COBRO_COMPRADOR` cubren `saldo_hacienda_entre_partes` Y cobros de tipo `COBRO_COMISION` cubren `saldo_comision_firma` → `LIQUIDADO`
  - Si alguno de los dos está parcialmente cubierto → `PARCIALMENTE_PAGADO`
  - Si ninguno está cubierto → `PENDIENTE`
- Un `Cobro` de tipo `COBRO_COMISION` sin `cuota_id` NO cierra `estado_liquidacion` a `LIQUIDADO` si `saldo_hacienda_entre_partes > 0`.

CIRCUITO CONSIGNATARIA_EXTERNA:
- cuota 1 = `(subtotal_ganado / N) + iva_ganado`
- cuotas 2..N = `subtotal_ganado / N`
- `monto_cuota` es informativo (la consignataria externa maneja el cronograma real, `T-2`).
- La comisión de la firma (neta facturada a la consignataria) se cobra por separado con `tipo_movimiento = COBRO_COMISION`, sin `cuota_id`.
- Misma lógica de `estado_liquidacion` que DIRECTO.

CIRCUITO PROPIA:
- Idéntica a DIRECTO pero con comisión = 0 en la punta propia (`DA-04`).

---

## Fuentes

1. `docs/superpowers/specs/DOCUMENTO DE REQUERIMIENTOS - SGCH v2.md` — **Versión:** 3.2 (2026-11-03) | **Propósito:** Especificación funcional y de datos canónica del sistema (`RF01–RF19`, `RN01–RN10`, diccionario de entidades `§6.1 Cliente`, `§6.2 Operación`, `§6.4 CuotaOperacion`, `§6.5 Cobro` y plan de iteraciones `§9`).
2. `docs/superpowers/specs/ANEXO-II-Modelo-Calculo-Fiscal.md` — **Versión:** 1.1 (2026-11-03) | **Propósito:** Especificación matemática canónica del motor de cálculo financiero y fiscal en 3 capas (Capa 1 valorización económica, Capa 2 liquidación fiscal con 4 casos de condición fiscal y 3 overrides, Capa 3 saldos derivados por circuito) y casos de regresión numérica (`§6.1` y `§6.2`).
3. `docs/superpowers/research/DECISIONES-NEGOCIO.md` — **Fecha:** 2026-11-03 | **Propósito:** Síntesis pública y sanitizada (`R-066`) de las 14 reglas de negocio determinadas (`D-01` a `D-14`), las 5 decisiones de arquitectura del autor (`DA-01` a `DA-05`) y las observaciones operativas (`T-1` a `T-4`).
4. `.superpowers/sdd/migracion-boot4/RULINGS.md` — **Alcance:** `R-001` a `R-082` (2026-11-03) | **Propósito:** Registro vinculante de decisiones técnicas y arquitectónicas (Spring Boot 4.1.1, Jackson 3, Testcontainers 2.0.5, TDD estricto, two-reviewer pattern, `BigDecimal`, PK UUID `String`, migración `V2` de 3 tablas, saldos derivados y jerarquía de fuentes).
5. `AGENTS.md` — **Propósito:** Reglas operativas globales del repositorio (filosofía *Lazy Senior Dev*, uso obligatorio de `@ControllerAdvice` con `ProblemDetail` RFC 7807 y obligatoriedad de DTOs Request/Response desde la Iteración 2).
