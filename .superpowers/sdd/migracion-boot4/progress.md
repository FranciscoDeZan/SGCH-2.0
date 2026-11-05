# SDD ledger ó plan: migracion-boot4
Ruling: 'DO NOT touch @MockBean' makes Phase 1 uncompilable because @MockBean is removed in Boot 4. The implementer tried to use maven-replacer-plugin. I rejected this and reverted. We must migrate @MockBean in Phase 1.
Ruling: Boot 4 eliminÛ @MockBean del source. La restricciÛn original de no tocar Java en Fase 1 era inv·lida. Migrado a Fase 1.

Context7 Verification Findings:
- @AutoConfigureMockMvc: Se moviÛ al paquete org.springframework.boot.webmvc.test.autoconfigure en el mÛdulo spring-boot-webmvc-test (Boot 4). No lo usamos directamente en tests de controlador, usamos @WebMvcTest.
- @ServiceConnection: Sigue residiendo en org.springframework.boot.testcontainers.service.connection dentro de spring-boot-testcontainers.
- @DataJpaTest y @WebMvcTest: En Boot 4 modularizado se distribuyen a travÈs de spring-boot-starter-data-jpa-test y spring-boot-starter-webmvc-test. Durante Fase 1 con spring-boot-starter-test-classic, spring-boot-test-classic-modules provee compatibilidad hacia atr·s para las anotaciones cl·sicas.
Finding: 'spring-boot-starter-classic' no reemplaza a web, data-jpa ni validation.
Causa raÌz:
- En Spring Boot 4, 'spring-boot-starter-classic' es ˙nicamente 'spring-boot-starter' + 'spring-boot-autoconfigure-classic' (proveyendo configuraciÛn cl·sica de logging, YAML y autoconfiguraciÛn base).
- No incluye Tomcat, Spring MVC, Spring Data JPA, Hibernate ni Jakarta Validation.
- Al eliminar 'spring-boot-starter-web', 'spring-boot-starter-data-jpa' y 'spring-boot-starter-validation', el proyecto pierde todos los sÌmbolos (@RestController, @Entity, @Transactional, @NotBlank, etc.) y falla la compilaciÛn de producciÛn.
- En Spring Boot 4, los starters de producciÛn son:
  * Web: 'spring-boot-starter-webmvc' (reemplazo de spring-boot-starter-web).
  * JPA: 'spring-boot-starter-data-jpa' (sigue existiendo).
  * Validation: 'spring-boot-starter-validation' (sigue existiendo).
Ruling 2: 'spring-boot-starter-classic' en Boot 4 es solo el starter base + autoconfiguraciÛn cl·sica. NO reemplaza a web/data-jpa/validation. En Fase 1 usamos starters modulares de producciÛn desde el principio. La Fase 4 se simplifica a migrar solo los test slices.

Estrategia actualizada:
- Fase 1: Boot 4.1.1 + Starters modulares de producciÛn (webmvc, data-jpa, validation) + Test Classic + @MockitoBean.
- Fase 2: MigraciÛn Jackson 2 -> Jackson 3.
- Fase 3 / 4: MigraciÛn de test slices a starters modulares (spring-boot-starter-webmvc-test, spring-boot-starter-data-jpa-test), eliminaciÛn de starter-test-classic y verificaciÛn Context7 de imports.
Ruling 3: 'spring-boot-starter-test-classic' NO provee clases de compatibilidad hacia atr·s para paquetes de Boot 3 ni Jackson 2.
Hallazgos empÌricos (inspecciÛn de JARs oficiales 4.1.1):
1. El cÛdigo de producciÛn (9 archivos Java) compila al 100% con los starters modulares (webmvc, data-jpa, validation).
2. Los tests no compilan porque Boot 4 no dejÛ shims ni alias para los paquetes viejos:
   - @WebMvcTest solo existe en 'org.springframework.boot.webmvc.test.autoconfigure'.
   - @DataJpaTest solo existe en 'org.springframework.boot.data.jpa.test.autoconfigure'.
   - @AutoConfigureTestDatabase solo existe en 'org.springframework.boot.jdbc.test.autoconfigure'.
   - FlywayAutoConfiguration requiere 'spring-boot-starter-flyway' y est· en 'org.springframework.boot.flyway.autoconfigure'.
   - ObjectMapper solo existe como Jackson 3 ('tools.jackson.databind.ObjectMapper').
3. ConclusiÛn: Intentar una Fase 1 donde 'corren los 21 tests sin tocar imports de Jackson ni de test slices' es inviable en Spring Boot 4.

Ruling 4: Testcontainers 2.x depreco MySQLContainer en org.testcontainers.containers y la movio a org.testcontainers.mysql.
La clase nueva NO es generica (no lleva <?>). El artifactId Maven correcto es 'testcontainers-mysql' (ya estaba correcto en pom.xml).
Cambios aplicados en ClienteRepositoryTest:
- import: org.testcontainers.containers.MySQLContainer -> org.testcontainers.mysql.MySQLContainer
- declaracion: static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0") -> static MySQLContainer mysql = new MySQLContainer("mysql:8.0")
Resultado: warning de deprecated API eliminado. BUILD SUCCESS 0 warnings.

Ruling 5: Usuario dedicado 'sgch' con permisos exclusivos sobre 'sgch_db'. La contrasena de root de MySQL NO debe ir en el repositorio ni como default.
Cambios aplicados:
- En backend/src/main/resources/application.yml se actualizaron los valores por defecto del datasource:
  * username: ${DB_USER:sgch}
  * password: ${DB_PASSWORD:sgch_dev}
- Se mantiene el patron ${VAR:default} para permitir override por variables de entorno.
Verificacion:
- Backend inicio con exito (Tomcat en puerto 8080 en 3.6s).
- Flyway aplico exitosamente la migracion V1__Create_clientes_table.sql (version 1).
- Smoke test HTTP GET /api/clientes devolvio HTTP 200 con cuerpo [].

[2026-09-14 14:55 -03:00]
Ruling 6: Docker Desktop operativo. ClienteRepositoryTest corre con Testcontainers y @ServiceConnection contra MySQL 8.0 en contenedor. 21/21 tests pasando. Step 2 (migracion a Boot 4.1.1) cerrado.

## 2026-11-03 ‚Äî Cierre Fase 2.A (Backend Core)

- Tasks 0-8 completadas y verificadas con TDD + two-reviewer + checkpoints.
- 140/140 tests verdes. Smoke E2E 9/9.
- Commit final: d3fdf73.
- C√°lculo fiscal Capas 1+2+3 validado al centavo contra Anexo II ¬ß6.1 y ¬ß6.2.
- 3 circuitos implementados y testeados (DIRECTO, CONSIGNATARIA_EXTERNA, PROPIA).
- Endpoints REST /api/v1/operaciones y /api/v1/cobros funcionales end-to-end.
- Migraci√≥n /api/v1/clientes en paralelo a legacy (R-062).
- Auditor√≠a intermedia Tasks 0-5 ejecutada: 0 cr√≠ticos, 0 importantes, 8 menores (van a Task 9 deuda t√©cnica).
- Pr√≥ximo: Fase 2.B (frontend de Operaciones).

## 2026-11-04 ‚Äî Cierre Bloque 1 (Saneamiento Pre-Fase 2.B)

- Tasks 1-4 del plan 2026-11-04-bloque-1-saneamiento completadas + micro-fix.
- 157/157 tests backend verdes. 75/75 tests frontend verdes.
- 10 deudas A-01 a A-10 resueltas.
- Contrato JSON de /api/clientes y /api/v1/clientes verificado isom√≥rfico.
- N+1 eliminado: 103 queries ‚Üí 1 query en findAll de 100 operaciones.
- Commit final: 486c7ee (pusheado a origin/main).
- 5 commits: c8724ee (Task 1), dd0ca56 (Task 2), 81b6052 (Task 3), ccac5f4 (Task 4), 486c7ee (micro-fix de robustez).
- Pr√≥ximo: auditor√≠a final del Bloque 1 + Fase 2.B (frontend Operaciones).

## 2026-11-05 - Cierre Fase 2.B (Frontend Operaciones) + Cierre Iteraci√≥n 2

- Tasks 1-8 del plan 2026-11-05-iteracion-2-fase-2b-frontend completadas y verificadas con TDD + two-reviewer + checkpoints.
- 157/157 tests backend verdes (sin tocar backend/).
- 137/137 tests frontend verdes en Vitest (17 test suites).
- 0 errores y 0 warnings en tsc -b --noEmit y npm run build.
- Duplicaci√≥n isom√≥rfica de Capas 1, 2 y 3 del Anexo II en calculadoraFinanciera.ts con 7 tests can√≥nicos.
- OperacionesPage, OperacionList (4 estados), OperacionForm (preview en vivo y RFC 7807), OperacionDetail y CobrosPanel integrados.
- Dictado de voz con Web Speech API en OperacionesMobileCopilot y navegaci√≥n cross-page completa desde ClienteDetail a Operaciones.
- 5 tests E2E de ciclo de vida completo en OperacionesFlow.test.tsx verificando liquidaci√≥n, rec√°lculo, dictado m√≥vil, cross-page y accesibilidad sin emojis (R-042).
- Cierre exitoso de Iteraci√≥n 2.
