# Reporte de Migración — Spring Boot 3.5.9 → 4.1.1

## Metadata
- **Fecha de generación:** 2026-09-14 13:05 -03:00
- **Última actualización:** 2026-09-15
- **Rama:** `feat/migracion-spring-boot-4`
- **Commits incluidos (hash corto):** Base `f8bd36e`, consolidado `87346f8` (`chore(migration): upgrade to Spring Boot 4.1.1 with modular starters`).
- **Estado:** Completado (Fase B UI también completada).

## Resumen ejecutivo (máx 10 líneas)
Se realizó la migración del backend de SGCH 2.0 desde Spring Boot 3.5.9 a Spring Boot 4.1.1 con arquitectura modular, Jackson 3 y Testcontainers BOM 2.0.5.
El código compila sin errores ni warnings (`clean test-compile` OK).
Se eliminó la dependencia de H2 adoptando fallo duro exclusivo con Testcontainers en repositorios.
Los tests de servicio (9/9), controlador (9/9) y repositorio de integración con Testcontainers MySQL 8.0 (3/3) pasan exitosamente (21/21 tests pasando).
El servidor arranca limpiamente en Tomcat (puerto 8080 en 3.6s), Flyway ejecuta la migración V1 sobre MySQL 8.0 nativo y el endpoint `GET /api/clientes` responde HTTP 200 con `[]`.
Docker Desktop se encuentra operativo en Windows 11 ejecutando los contenedores de integración.

## Contexto inicial
Spring Boot 3.x alcanzó su fin de soporte de código abierto (OSS EOL) en junio de 2026.
Para garantizar soporte de seguridad activo y alineación con las tecnologías vigentes, el equipo resolvió migrar el proyecto a Spring Boot 4.1.1 antes de avanzar a producción.
Un intento previo de migración directa falló debido al acoplamiento de múltiples cambios concurrentes (Jackson 3, paquetes de test slices, `@MockBean` y Testcontainers).
En esta intervención se abordó el diagnóstico sistemático de compatibilidad de APIs en Spring Framework 7 / Boot 4 y la eliminación de deuda técnica oculta (fallback silencioso a base de datos en memoria H2).

## Cambios realizados

### POM (backend/pom.xml)
- **Versión de parent:** Modificada de `3.5.9` a `4.1.1`.
- **Starters modulares:**
  - *Producción:*
    - Removido: `spring-boot-starter-web` (legado en Boot 3).
    - Removido: `flyway-core` como dependencia directa aislada.
    - Incorporado: `spring-boot-starter-webmvc` (starter modular oficial de Boot 4).
    - Incorporado: `spring-boot-starter-flyway` (autoconfiguración dedicada en Boot 4).
    - Mantenidos: `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, `flyway-mysql`, `mysql-connector-j`, `lombok`.
  - *Test:*
    - Removido: `com.h2database:h2` (eliminación definitiva de BD en memoria en tests).
    - Removido: `org.testcontainers:junit-jupiter` y `org.testcontainers:mysql` (coordenadas obsoletas).
    - Incorporado: `spring-boot-starter-test` (framework base con `@MockitoBean`).
    - Incorporado: `spring-boot-starter-webmvc-test` (proporciona `@WebMvcTest`).
    - Incorporado: `spring-boot-starter-data-jpa-test` (proporciona `@DataJpaTest` y `@AutoConfigureTestDatabase`).
    - Incorporado: `spring-boot-testcontainers` (proporciona `@ServiceConnection`).
- **Testcontainers BOM y dependencias:**
  - Se añadió bloque `<dependencyManagement>` importando `org.testcontainers:testcontainers-bom:2.0.5`.
  - Dependencias añadidas con nuevos artifactIds: `org.testcontainers:testcontainers-junit-jupiter` y `org.testcontainers:testcontainers-mysql`.

### Tests (backend/src/test/java/...)

#### `ClienteControllerTest.java`
- **Nombre del archivo:** `backend/src/test/java/com/sgch/controller/ClienteControllerTest.java`
- **Qué cambió:**
  - Imports actualizados: `tools.jackson.databind.ObjectMapper` (Jackson 3), `org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest`, `org.springframework.test.context.bean.override.mockito.MockitoBean`.
  - Anotación `@MockBean` reemplazada por `@MockitoBean` en `clienteService`.
  - Eliminación de la aserción `.andExpect(jsonPath("$.type").value("about:blank"))` en `testCreateClienteInvalidReturnsProblemDetail`.
- **Por qué:** `@MockBean` fue eliminada en Boot 4.0; los slices se movieron a paquetes modulares; en Spring Framework 7 / Boot 4 el ProblemDetail omite `type` cuando es nulo/default conforme a RFC 9457 y Jackson 3 no serializa nulos. (Rulings 1 y 3).

#### `ClienteRepositoryTest.java`
- **Nombre del archivo:** `backend/src/test/java/com/sgch/repository/ClienteRepositoryTest.java`
- **Qué cambió:**
  - Imports actualizados a paquetes modulares de Boot 4: `org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest`, `org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration`, `org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase`.
  - Removidos imports de H2 y Testcontainers 1.x: `DockerClientFactory`, `DynamicPropertyRegistry`, `DynamicPropertySource`, `org.testcontainers.containers.MySQLContainer`.
  - Incorporados imports oficiales de TC 2.x: `org.testcontainers.mysql.MySQLContainer`, `org.testcontainers.junit.jupiter.Container`, `org.testcontainers.junit.jupiter.Testcontainers`, `org.springframework.boot.testcontainers.service.connection.ServiceConnection`.
  - Eliminado el bloque estático de fallback a H2 y el método `@DynamicPropertySource`.
  - Declaración canónica: `@Container @ServiceConnection static MySQLContainer mysql = new MySQLContainer("mysql:8.0");` (sin tipo genérico).
- **Por qué:** Adopción de política de fallo duro sin degradación silenciosa a H2; paquetes modulares de Boot 4; Testcontainers 2.x sin parámetros genéricos en `MySQLContainer`. (Rulings 3 y 4).

#### `ClienteServiceTest.java`
- **Nombre del archivo:** `backend/src/test/java/com/sgch/service/ClienteServiceTest.java`
- **Qué cambió:** No requirió modificaciones.
- **Por qué:** Test unitario puro con `@ExtendWith(MockitoExtension.class)` sin dependencias de infraestructura ni de Spring Test.

### Config (application.yml, otros)
- **`backend/src/main/resources/application.yml`:**
  - Defaults de credenciales de conexión actualizados para no utilizar superusuario administrativo:
    - `username: ${DB_USER:sgch}`
    - `password: ${DB_PASSWORD:[REDACTED]}`
  - Conservación del patrón `${VAR:default}` para permitir sobreescritura dinámica en despliegues.
- **Otros:** No se agregaron archivos nuevos ni variables en duro.

### Archivos NO modificados que se evaluaron
- `Cliente.java`, `ClienteRepository.java`, `ClienteService.java`, `ClienteController.java`, `WebConfig.java`: Evaluados para verificar compatibilidad con Java 17 y Spring Boot 4.1.1. Compilaron sin errores ni necesidad de cambios.
- `GlobalExceptionHandler.java`: Evaluado para determinar si debía inyectarse un `type` explícito; se determinó no alterar la clase para apegarse al estándar RFC 9457.
- `spring-boot-starter-classic` / `spring-boot-starter-test-classic`: Evaluados para compatibilidad transitoria; descartados por ser insuficientes y no ofrecer compatibilidad hacia atrás en test slices (Rulings 2 y 3).

## Decisiones tomadas (rulings)

Las decisiones técnicas y de arquitectura vinculantes se gestionan de forma consolidada en el archivo canónico [`RULINGS.md`](./RULINGS.md).

A continuación se resume el índice de los 16 rulings canónicos:

| ID | Resumen / Decisión | Estado |
|---|---|---|
| [`R-001`](./RULINGS.md#r-001-migración-a-spring-boot-411) | Migrar el backend de Spring Boot 3.5.9 a 4.1.1 (EOL OSS) | Aplicado |
| [`R-002`](./RULINGS.md#r-002-starters-modulares-en-producción) | Starters modulares en producción (no classic) | Aplicado |
| [`R-003`](./RULINGS.md#r-003-reemplazo-de-mockbean-por-mockitobean) | Reemplazar `@MockBean` por `@MockitoBean` | Aplicado |
| [`R-004`](./RULINGS.md#r-004-migración-a-jackson-3-en-tests) | Migración a Jackson 3 en tests (`tools.jackson`) | Aplicado |
| [`R-005`](./RULINGS.md#r-005-migración-de-test-slices-a-starters-modulares) | Test slices modulares (`webmvc-test`, `data-jpa-test`) | Aplicado |
| [`R-006`](./RULINGS.md#r-006-testcontainers-205-con-bom-y-serviceconnection) | Testcontainers 2.0.5 con BOM y `@ServiceConnection` | Aplicado |
| [`R-007`](./RULINGS.md#r-007-eliminación-de-fallback-a-h2-en-tests-de-integración) | Eliminar fallback a H2 en tests de repositorio (fallo duro) | Aplicado |
| [`R-008`](./RULINGS.md#r-008-eliminación-de-aserción-type-en-problemdetail) | Eliminar aserción `$.type` en ProblemDetail (RFC 9457) | Aplicado |
| [`R-009`](./RULINGS.md#r-009-testcontainers-2x-mysqlcontainer-sin-genéricos) | TC 2.x `MySQLContainer` paquete `org.testcontainers.mysql` sin `<>` | Aplicado |
| [`R-010`](./RULINGS.md#r-010-usuario-dedicado-sgch-para-mysql-local) | Usuario dedicado `sgch`; root fuera del repo | Aplicado |
| [`R-011`](./RULINGS.md#r-011-configuración-de-datasource-por-defecto-con-sobreescritura) | Defaults de datasource en `application.yml` con `${VAR:default}` | Aplicado |
| [`R-012`](./RULINGS.md#r-012-entorno-de-desarrollo-híbrido-opción-d) | Entorno dev Opción D (híbrida): MySQL nativo + Docker para tests | Parcial |
| [`R-013`](./RULINGS.md#r-013-reportmd-como-artifact-de-auditoría-ejecutiva) | `REPORT.md` como artifact de auditoría ejecutiva | Aplicado |
| [`R-014`](./RULINGS.md#r-014-versionado-de-documentación-de-auditoría-en-git) | Incluir `.superpowers/sdd/` en el repositorio git | Pendiente |
| [`R-015`](./RULINGS.md#r-015-consolidación-de-rulings-en-archivo-canónico) | Consolidar rulings en `RULINGS.md` canónico | Aplicado |
| [`R-016`](./RULINGS.md#r-016-uso-de-skills-de-superpowers-para-consolidación-documental) | Usar skills de Superpowers para consolidación documental | Aplicado |

Para el detalle completo de justificaciones técnicas, causa raíz y notas de auditoría, consultar [`RULINGS.md`](./RULINGS.md).

## Problemas encontrados y resoluciones

### 1. Eliminación de `@MockBean` en Spring Boot 4
- **Síntoma:** Error de compilación reportando que el paquete `org.springframework.boot.test.mock.mockito` no existe.
- **Diagnóstico:** `@MockBean` fue eliminada en Spring Framework 7 / Boot 4.
- **Solución:** Migración a `@MockitoBean` provista por Spring Framework 7.
- **Evaluación:** Solución limpia oficial.

### 2. Ausencia de dependencias web/JPA en `spring-boot-starter-classic`
- **Síntoma:** Fallo general de compilación al reemplazar starters modulares por el starter clásico.
- **Diagnóstico:** El starter clásico de Boot 4 únicamente provee autoconfiguración base, sin Tomcat, MVC ni Hibernate.
- **Solución:** Utilización directa de starters modulares de producción (`spring-boot-starter-webmvc`, etc.).
- **Evaluación:** Solución limpia basada en la arquitectura modular de Spring Boot 4.

### 3. Falla de aserción `$.type` en ProblemDetail
- **Síntoma:** `ClienteControllerTest.testCreateClienteInvalidReturnsProblemDetail` fallando con `AssertionError: No value at JSON path "$.type"`.
- **Diagnóstico:** RFC 9457 asume `about:blank` como default implícito cuando `type` está ausente. Jackson 3 no serializa campos nulos por defecto.
- **Solución:** Eliminación de la aserción redundante de `$.type` en el test.
- **Evaluación:** Solución limpia alineada a la especificación estándar RFC 9457.

### 4. Warning de API deprecada en Testcontainers
- **Síntoma:** Warning del compilador: `uses or overrides a deprecated API` en `ClienteRepositoryTest.java`.
- **Diagnóstico:** `org.testcontainers.containers.MySQLContainer` deprecada en Testcontainers 2.0; reubicada en `org.testcontainers.mysql`.
- **Solución:** Actualización del import a `org.testcontainers.mysql.MySQLContainer` y eliminación de `<>`.
- **Evaluación:** Solución limpia; compilación con 0 warnings.

### 5. Error 1045 Access Denied en arranque local
- **Síntoma:** Fallo de conexión de Flyway/HikariCP: `Access denied for user 'root'@'localhost' (using password: YES)`.
- **Diagnóstico:** Servicio de Windows `MySQL80` (MySQL 8.0 nativo) escuchando en 3306 con credenciales administrativas distintas a `root/root`.
- **Solución:** Aprovisionamiento de usuario de base de datos `sgch` y parametrización de defaults en `application.yml`.
- **Evaluación:** Solución limpia y alineada con buenas prácticas de seguridad.

## Problemas NO resueltos (deuda técnica)
- **Parametrización de perfiles Spring:** `application.yml` cuenta con defaults locales y sobreescritura por variables de entorno, pero se recomienda estructurar perfiles formales (`application-local.yml`, `application-prod.yml`) en fases posteriores.

## Métricas
- **Tests totales pasando:** 21 / 21 tests de backend (ClienteServiceTest: 9/9, ClienteControllerTest: 9/9, ClienteRepositoryTest: 3/3).
- **Tests de frontend:** 1 / 1 pasando (Vitest smoke test).
- **Warnings de compilación:** 0 (`clean test-compile` OK).
- **Archivos modificados:** 4 archivos de código/config (`backend/pom.xml`, `application.yml`, `ClienteControllerTest.java`, `ClienteRepositoryTest.java`) y documentación en `.superpowers/`.
- **Líneas netas cambiadas en código:** +92 / -58 según `git diff HEAD~1..HEAD --shortstat`.

## Fase B — UI de Clientes

- **Tasks ejecutadas:** 9 tasks completadas (Tasks 0 a 8) bajo estricto TDD y Conventional Commits:
  - Task 0: Configuración de Vitest con jsdom y jest-dom.
  - Task 1: Componente de layout base `AppLayout`.
  - Task 2: Tipos unificados y cliente HTTP nativo `apiFetch` con clase `ApiError` para RFC 7807; eliminación de `clienteService.ts`.
  - Task 3: `ClientesPage`, `ClienteList` con 4 estados explícitos (loading, empty, error con reintento, data) y reemplazo de `App.tsx`.
  - Task 4 / 4.5: `ClienteDetail` con formateo de fechas en castellano rioplatense, link `tel:` defensivo y botón de operaciones deshabilitado; eliminación de `ClienteTable.tsx`.
  - Task 5: `ClienteForm` con validación de 13 campos, layout centrado, guard contra doble submit; eliminación de `ClienteModal.tsx` y desinstalación completa de `axios`.
  - Task 6 / 6.5: `MobileCopilot` con dictado por voz real vía Web Speech API (`es-AR`), manejo de eventos ("Ofrece", "Busca", "No Atendió" preservando notas según R-040), SVG inline, elevación de estado a `ClientesPage` y vista de error con reintento.
  - Task 7: Edición de clientes en `ClienteForm` con método PUT, pre-llenado y navegación integrada.
  - Task 8: Componente accesible `Toast` con auto-dismiss de 3000ms y unificación de notificaciones visuales en `ClientesPage`.
- **Tests pasando:** 75 / 75 tests de frontend pasando en Vitest (9 archivos de prueba), 0 fallos, 0 warnings de `act(...)`. Compilación de producción (`tsc -b && vite build`) limpia sin errores ni warnings.
- **Arquitectura:**
  - Patrón Master-Detail en escritorio ("Radar Dividido") coexistiendo responsivamente con Mobile Copilot para teléfonos de campo vía clases Tailwind (`hidden md:block` / `md:hidden`).
  - Navegación pura por estado local en `ClientesPage` (`useState<Vista>`), sin React Router ni librerías externas de UI o íconos.
  - Elevación de estado de clientes a `ClientesPage` como única fuente de verdad, desacoplando la presentación de los efectos de red.
- **Eliminación de código heredado de Iteración 1:**
  - Reemplazo completo de `App.tsx` (reducido de 202 líneas a ~15 líneas limpias) y `App.test.tsx`.
  - Eliminación física de archivos obsoletos de la iteración 1: `ClienteTable.tsx`, `ClienteModal.tsx`, `clienteService.ts`.
  - Desinstalación total de `axios`, migrando todas las llamadas HTTP a `fetch` nativo del navegador con tipado seguro y manejo de RFC 7807.
- **Deuda técnica post-MVP registrada (R-051):**
  - Accesibilidad exhaustiva: atributos `aria-invalid` y `aria-describedby` en inputs con error de `ClienteForm`.
  - Web Speech API: mapeo granular de códigos de error nativos (`not-allowed`, `no-speech`, `network`, `aborted`) a mensajes amigables para el usuario.
  - Feedback visual no bloqueante: indicador sutil o spinner en segundo plano en `ClienteList` durante revalidaciones para no reemplazar la lista existente.
  - Validaciones adicionales en formulario: límites `maxLength`, enlaces `mailto:` y sanitización/normalización de formato telefónico.

## Próximos pasos sugeridos
1. Proceder al desarrollo de la interfaz de usuario completa para Clientes en el frontend (formulario, tabla, validaciones).
2. Avanzar a la Iteración 2 del proyecto (diseño de DTOs, versionado de API bajo `/api/v1/`, modelo tributario y gestión de cobranzas).

## Anexos

### Comandos clave ejecutados
```powershell
# Compilación limpia y verificación de warnings
.\backend\mvnw.cmd -f backend/pom.xml clean test-compile

# Ejecución de tests de controlador
.\backend\mvnw.cmd -f backend/pom.xml test -Dtest=ClienteControllerTest

# Ejecución de tests de servicio
.\backend\mvnw.cmd -f backend/pom.xml test -Dtest=ClienteServiceTest

# Diagnóstico de servicios y puertos
Test-NetConnection -ComputerName localhost -Port 3306
Get-Service | Where-Object { $_.Name -like "*mysql*" }
Get-NetTCPConnection -LocalPort 3306 -State Listen

# Ejecución del servidor backend
.\backend\mvnw.cmd -f backend/pom.xml spring-boot:run

# Smoke test HTTP
curl.exe -i http://localhost:8080/api/clientes

# Tests del frontend
npm --prefix frontend test
```

### Referencias oficiales
- Spring Boot 4.0 Migration Guide: `https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide`
- Testcontainers 2.0 Release & Migration Notes: `https://testcontainers.com/modules/mysql/`
- RFC 9457 — Problem Details for HTTP APIs: `https://www.rfc-editor.org/rfc/rfc9457`