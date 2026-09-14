# Rulings y Decisiones Técnicas del Proyecto SGCH 2.0

## Metadata
- **Proyecto:** SGCH 2.0
- **Rama:** feat/migracion-spring-boot-4
- **Fecha de consolidación:** 2026-09-14 13:45 -03:00
- **Última revisión:** 2026-09-14
- **Próxima revisión:** Antes de cerrar Iteración 1 / Inicio de Iteración 2

---

## Cómo usar este archivo

Este repositorio mantiene una separación explícita de responsabilidades en su documentación técnica:

- **`RULINGS.md` (este archivo):** Fuente canónica única de verdad para decisiones técnicas vinculantes (Architecture Decision Records operativos). Cualquier duda sobre una decisión arquitectónica o regla técnica debe resolverse contra este documento.
- **`progress.md`:** Registro cronológico inmutable (append-only) de la sesión de trabajo y la ejecución técnica de tareas. No se reescribe ni se reordena.
- **`REPORT.md`:** Informe ejecutivo y reporte de auditoría técnica del estado de la migración para consulta rápida de terceros, enlazando a este archivo canónico.

---

## Tabla de Mapeo de Rulings

| ID Canónico | Fuente | Numeración vieja | Resumen / Tema | Estado |
|---|---|---|---|---|
| **R-001** | Auditor | — | Migrar backend de Spring Boot 3.5.9 a 4.1.1 (EOL OSS) | Aplicado |
| **R-002** | progress.md | Ruling 2 | Starters modulares en producción (no classic) | Aplicado |
| **R-003** | progress.md | Ruling 1 | Reemplazar `@MockBean` por `@MockitoBean` | Aplicado |
| **R-004** | progress.md | Ruling 3 (p. 1) | Migrar ObjectMapper a Jackson 3 en tests | Aplicado |
| **R-005** | progress.md | Ruling 3 (p. 2) | Test slices modulares (webmvc-test, data-jpa-test) | Aplicado |
| **R-006** | Auditor | — | Testcontainers 2.0.5 con BOM + `@ServiceConnection` | Aplicado |
| **R-007** | Auditor | — | Eliminar fallback a H2 en tests de repositorio (fallo duro) | Aplicado |
| **R-008** | Auditor | — | Eliminar aserción `$.type` en ProblemDetail (RFC 9457) | Aplicado |
| **R-009** | progress.md | Ruling 4 | TC 2.x `MySQLContainer` paquete `org.testcontainers.mysql` sin `<>` | Aplicado |
| **R-010** | progress.md | Ruling 5 (p. 1) | Usuario de BD dedicado `sgch`; root fuera del repo | Aplicado |
| **R-011** | progress.md | Ruling 5 (p. 2) | Defaults de datasource en `application.yml` con `${VAR:default}` | Aplicado |
| **R-012** | Auditor | — | Entorno dev Opción D (híbrida): MySQL nativo + Docker para tests | Aplicado |
| **R-013** | Auditor | — | `REPORT.md` como artifact de auditoría ejecutiva | Aplicado |
| **R-014** | Auditor | — | Incluir `.superpowers/sdd/` en el repositorio git | Aplicado |
| **R-015** | Auditor | — | Consolidar rulings en `RULINGS.md` canónico | Aplicado |
| **R-016** | Auditor | — | Usar skills de Superpowers para consolidación documental | Aplicado |
| **R-017** | progress.md / Test | Ruling 6 | Cierre de Step 2: 21/21 tests pasando, Docker operativo | Aplicado |

---

## Rulings del Proyecto

### R-001: Migración a Spring Boot 4.1.1
- **Qué:** Migrar el backend de Spring Boot 3.5.9 a 4.1.1.
- **Por qué:** Boot 3.x alcanzó EOL de OSS en junio 2026. No se despliega con versiones sin soporte de seguridad.
- **Estado:** Aplicado (POM actualizado).
- **Ref:** Auditor externo (chat)

### R-002: Starters modulares en producción
- **Qué:** 'spring-boot-starter-classic' en Boot 4 es solo el starter base + autoconfiguración clásica. NO reemplaza a web/data-jpa/validation. En Fase 1 usamos starters modulares de producción desde el principio. La Fase 4 se simplifica a migrar solo los test slices.
- **Por qué:** 'spring-boot-starter-classic' es únicamente 'spring-boot-starter' + 'spring-boot-autoconfigure-classic' (proveyendo configuración clásica de logging, YAML y autoconfiguración base). No incluye Tomcat, Spring MVC, Spring Data JPA, Hibernate ni Jakarta Validation. Al eliminar 'spring-boot-starter-web', 'spring-boot-starter-data-jpa' y 'spring-boot-starter-validation', el proyecto pierde todos los símbolos (@RestController, @Entity, @Transactional, @NotBlank, etc.) y falla la compilación de producción.
- **Estado:** Aplicado.
- **Ref:** progress.md (Ruling 2)

### R-003: Reemplazo de @MockBean por @MockitoBean
- **Qué:** Boot 4 eliminó @MockBean del source. La restricción original de no tocar Java en Fase 1 era inválida. Migrado a Fase 1.
- **Por qué:** 'DO NOT touch @MockBean' makes Phase 1 uncompilable because @MockBean is removed in Boot 4. The implementer tried to use maven-replacer-plugin. I rejected this and reverted. We must migrate @MockBean in Phase 1.
- **Nota:** @MockBean fue reemplazado por @MockitoBean (`org.springframework.test.context.bean.override.mockito.MockitoBean`). El detalle del incidente con maven-replacer-plugin se preserva textual en progress.md Ruling 1 y en el "Por qué" de este ruling.
- **Estado:** Aplicado.
- **Ref:** progress.md (Ruling 1)

### R-004: Migración a Jackson 3 en tests
- **Qué:** Migración Jackson 2 -> Jackson 3. ObjectMapper solo existe como Jackson 3 ('tools.jackson.databind.ObjectMapper').
- **Por qué:** 'spring-boot-starter-test-classic' NO provee clases de compatibilidad hacia atrás para Jackson 2. Conclusión: Intentar una Fase 1 donde 'corren los 21 tests sin tocar imports de Jackson ni de test slices' es inviable en Spring Boot 4.
- **Estado:** Aplicado.
- **Ref:** progress.md (Ruling 3, parte 1)

### R-005: Migración de test slices a starters modulares
- **Qué:** Migración de test slices a starters modulares (spring-boot-starter-webmvc-test, spring-boot-starter-data-jpa-test).
- **Por qué:** 'spring-boot-starter-test-classic' NO provee clases de compatibilidad hacia atrás para paquetes de Boot 3. Los tests no compilan porque Boot 4 no dejó shims ni alias para los paquetes viejos:
  - @WebMvcTest solo existe en 'org.springframework.boot.webmvc.test.autoconfigure'.
  - @DataJpaTest solo existe en 'org.springframework.boot.data.jpa.test.autoconfigure'.
  - @AutoConfigureTestDatabase solo existe en 'org.springframework.boot.jdbc.test.autoconfigure'.
  - FlywayAutoConfiguration requiere 'spring-boot-starter-flyway' y está en 'org.springframework.boot.flyway.autoconfigure'.
- **Estado:** Aplicado.
- **Ref:** progress.md (Ruling 3, parte 2)

### R-006: Testcontainers 2.0.5 con BOM y @ServiceConnection
- **Qué:** Adoptar Testcontainers 2.0.5 con BOM + @ServiceConnection.
- **Por qué:** Reemplaza el patrón viejo de @DynamicPropertySource con configuración manual. @ServiceConnection configura el datasource automáticamente desde el contenedor.
- **Estado:** Aplicado.
- **Ref:** Auditor externo (chat)

### R-007: Eliminación de fallback a H2 en tests de integración
- **Qué:** Eliminar el fallback a H2 en tests de repositorio.
- **Por qué:** H2 no es MySQL. Testear contra un motor distinto al de producción genera falsos positivos. Fallo duro es mejor que degradación silenciosa.
- **Estado:** Aplicado.
- **Ref:** Auditor externo (chat)

### R-008: Eliminación de aserción $.type en ProblemDetail
- **Qué:** Eliminar la aserción `$.type` en ProblemDetail (test del controller).
- **Por qué:** Spring Framework 7 dejó de inicializar BLANK_TYPE por defecto. RFC 9457 define `type` como opcional. El test estaba acoplado a un comportamiento que ya no existe.
- **Estado:** Aplicado.
- **Ref:** Auditor externo (chat)

### R-009: Testcontainers 2.x MySQLContainer sin genéricos
- **Qué:** Testcontainers 2.x deprecó MySQLContainer en org.testcontainers.containers y la movió a org.testcontainers.mysql. La clase nueva NO es genérica (no lleva <?>). El artifactId Maven correcto es 'testcontainers-mysql' (ya estaba correcto en pom.xml).
- **Por qué:** Cambios aplicados en ClienteRepositoryTest:
  - import: org.testcontainers.containers.MySQLContainer -> org.testcontainers.mysql.MySQLContainer
  - declaracion: static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0") -> static MySQLContainer mysql = new MySQLContainer("mysql:8.0")
  Resultado: warning de deprecated API eliminado. BUILD SUCCESS 0 warnings.
- **Estado:** Aplicado.
- **Ref:** progress.md (Ruling 4)

### R-010: Usuario dedicado sgch para MySQL local
- **Qué:** Usuario dedicado 'sgch' con permisos exclusivos sobre 'sgch_db'. La contrasena de root de MySQL NO debe ir en el repositorio ni como default.
- **Por qué:** El arranque con root falló con Access Denied (error 1045) en MySQL nativo local. Principio de menor privilegio y seguridad: no asumir contraseñas administrativas fijas ni exponer root en archivos versionados.
- **Estado:** Aplicado.
- **Ref:** progress.md (Ruling 5, parte 1)

### R-011: Configuración de datasource por defecto con sobreescritura
- **Qué:** En backend/src/main/resources/application.yml se actualizaron los valores por defecto del datasource:
  - username: `${DB_USER:sgch}`
  - password: `${DB_PASSWORD:[REDACTED]}`
  Se mantiene el patron ${VAR:default} para permitir override por variables de entorno.
- **Por qué:** Permite el arranque out-of-the-box del backend en el entorno local de desarrollo contra el motor nativo sin requerir exportar variables de entorno manuales, conservando la capacidad de sobreescritura en entornos productivos.
- **Estado:** Aplicado.
- **Ref:** progress.md (Ruling 5, parte 2)

### R-012: Entorno de desarrollo híbrido (Opción D)
- **Qué:** Entorno de desarrollo Opción D (híbrida): MySQL nativo para arrancar el backend en dev + Docker Desktop para correr ClienteRepositoryTest con Testcontainers.
- **Por qué:** Dos necesidades distintas, dos herramientas distintas.
- **Estado:** Aplicado.
- **Ref:** Auditor externo (chat)

### R-013: REPORT.md como artifact de auditoría ejecutiva
- **Qué:** REPORT.md como artifact de auditoría ejecutiva del proyecto. Se regenera al cerrar cada step significativo.
- **Por qué:** Da visibilidad a terceros sin requerir leer 500 líneas de progress.md.
- **Estado:** Aplicado (v1 generada 2026-09-14; revisado 2026-09-14: índices tabulares enlazados a RULINGS.md).
- **Ref:** Auditor externo (chat)

### R-014: Versionado de documentación de auditoría en git
- **Qué:** Incluir `.superpowers/sdd/` en el repositorio git.
- **Por qué:** Es documentación de auditoría, no output de build. Los rulings son tan importantes como el código.
- **Estado:** Aplicado (decisión de usuario).
- **Ref:** Auditor externo (chat)

### R-015: Consolidación de rulings en archivo canónico
- **Qué:** Consolidar rulings en `.superpowers/sdd/migracion-boot4/RULINGS.md` con numeración canónica R-001 en adelante, separado de progress.md (log cronológico) y REPORT.md (auditoría ejecutiva).
- **Por qué:** Tres numeraciones paralelas generaban confusión y riesgo de perder decisiones. Separar por propósito escala mejor cuando el proyecto crezca.
- **Estado:** Aplicado.
- **Ref:** Auditor externo (chat)

### R-016: Uso de skills de Superpowers para consolidación documental
- **Qué:** Usar skills de Superpowers (writing-plans + executing-plans) para la consolidación de rulings.
- **Por qué:** No existe una skill específica para refactor de documentación. writing-plans fuerza estructuración antes de la acción, que es el principal riesgo (agente interpretando en vez de extrayendo).
- **Estado:** Aplicado.
- **Ref:** Auditor externo (chat)

### R-017: Cierre de Step 2 (migración a Spring Boot 4.1.1)
- **Qué:** Step 2 (migración Boot 4) cerrado. 21/21 tests pasando, BUILD SUCCESS sin warnings, Docker operativo.
- **Por qué:** Con Docker Desktop activo, ClienteRepositoryTest corre con Testcontainers y @ServiceConnection contra MySQL 8.0 en contenedor. Se verifica el 100% de la suite de pruebas del proyecto sin fallas ni warnings.
- **Estado:** Aplicado.
- **Ref:** progress.md (Ruling 6)

---

## Notas de Auditoría (Observaciones)

### NA-001
El tooling de búsqueda de texto de Antigravity falló 2 veces durante la migración, en archivos que sí contenían el término buscado. Posible bug. A vigilar.

### NA-002
El agente tiene dificultades escribiendo archivos largos en Windows con PowerShell here-strings. Solución adoptada: usar Set-Content -Encoding UTF8 o el editor nativo del agente.

### NA-003
El agente respetó 7+ checkpoints consecutivos durante la migración (repo Steps 1-2, Tareas 1-2, Step 2, Step 3, consolidación de rulings). Cambio de comportamiento positivo respecto de la Iteración 1.

---

## Historial de Cambios

| Fecha | Autor / Agente | Tipo de Cambio | Descripción |
|---|---|---|---|
| 2026-09-14 | Antigravity + Usuario | Creación inicial | Consolidación canónica de R-001..R-016 y NA-001..NA-003 a partir de `progress.md` y auditoría externa. |
| 2026-09-14 | Antigravity + Usuario | Actualización | Incorporación de R-017 y actualización de R-012 tras verificación de Docker Desktop y 21/21 tests pasando. |