# Rulings y Decisiones Técnicas del Proyecto SGCH 2.0

## Metadata
- **Proyecto:** SGCH 2.0
- **Rama:** feat/migracion-spring-boot-4
- **Fecha de consolidación:** 2026-09-14 13:45 -03:00
- **Última revisión:** 2026-09-15
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
| **R-018** | Auditor | — | Estrategia de push + merge Step 2 | Aplicado |
| **R-019** | Fase B | — | Decisiones de Fase B (UI Clientes) | Aplicado |
| **R-020** | Auditor | — | Política de modelos Gemini | Aplicado |
| **R-021** | Fase B | — | Navegación por estado (no React Router) | Aplicado |
| **R-022** | Fase B | — | Scope policy Fase B | Aplicado |
| **R-023** | Fase B | — | Estrategia de rechazo de plan | Aplicado |
| **R-024** | Fase B | — | Verificación empírica de tipos | Aplicado |
| **R-025** | Auditor | — | Callback pattern para desacoplar componentes | Aplicado |
| **R-026** | Fase B | — | TDD estricto por cada componente | Aplicado |
| **R-027** | Fase B | — | Manejo de código heredado de Iteración 1 | Aplicado |
| **R-028** | Fase B | — | No coexisten código viejo y nuevo | Aplicado |
| **R-029** | Fase B | — | Política de minors del code-reviewer | Aplicado |
| **R-030** | Fase B | — | tel: sin prependear +54 | Aplicado |
| **R-031** | Fase B | — | Verificar endpoint PUT antes de implementar UPDATE | Aplicado |
| **R-032** | Fase B | — | Guard contra doble-submit (crítico) | Aplicado |
| **R-033** | Fase B | — | No tocar código en vía de extinción | Aplicado |
| **R-034** | Fase B | — | Vite config desde vitest/config | Aplicado |
| **R-035** | Fase B | — | ApiError estructurada para RFC 7807 | Aplicado |
| **R-036** | Fase B | — | Two-reviewer pattern obligatorio | Aplicado |
| **R-037** | Fase B | — | Checkpoints humanos entre tasks | Aplicado |
| **R-038** | Fase B | — | Commits atómicos con delete + create | Aplicado |
| **R-039** | Fase B | — | Micrófono: toggle y cleanup | Aplicado |
| **R-040** | Fase B | — | "No Atendió" preserva texto dictado | Aplicado |
| **R-041** | Fase B | — | Elevar fetch de clientes a ClientesPage | Aplicado |
| **R-042** | Fase B | — | Emojis prohibidos en UI | Aplicado |
| **R-043** | Fase B | — | Detener micrófono en executeAction | Aplicado |
| **R-044** | Fase B | — | Estado de error explícito en MobileCopilot | Aplicado |
| **R-045** | Antigravity | — | Cleanup de subagentes en Antigravity | Aplicado |
| **R-046** | Fase B | — | Refactor de fallback nulo compartido en ClientesPage | Aplicado |
| **R-047** | Fase B | — | Toast component con auto-dismiss 3s | Aplicado |
| **R-048** | Fase B | — | Callback pattern conectado al Toast real | Aplicado |
| **R-049** | Fase B | — | Cierre de Fase B | Aplicado |
| **R-050** | Fase B | — | Política de re-verificación de quotas | Documentado |
| **R-051** | Fase B | — | Deuda técnica post-MVP (registro acumulado) | Documentado |
| **R-052** | Cierre Fase B | — | Cierre de Fase B formal | Aplicado |
| **R-053** | Cierre Fase B | — | Estrategia de push + merge para Fase B | Aplicado |
| **R-054** | Fix 9543c08 | — | Cleanup de TODOs en MVP | Aplicado |
| **R-055** | Decisión de cierre | — | Conservación vs borrado de ramas feature | Aplicado |
| **R-056** | Chat 15/09 | — | BigDecimal para dinero y kg | Aprobado |
| **R-057** | Chat 15/09 | — | PK String UUID para Operacion y Cobro (extiende R-024) | Aprobado |
| **R-058** | Chat 31/10 | — | BigDecimal para coordenadas (no Double) | Parcial |
| **R-059** | Chat 15/09 | — | UI de Operaciones en Iteración 2 | Aprobado |
| **R-060** | Chat 15/09 | — | Cobro en tabla separada | Aprobado |
| **R-061** | Chat 15/09 + 31/10 | — | Frontend Opción C /api/v1 (ejecutable en I2) | Aprobado |
| **R-062** | Chat 15/09 | — | Backend /api/v1 en paralelo a legacy | Aprobado |
| **R-063** | Chat 15/09 | — | Migración V2 única para operaciones y cobros | Aprobado |
| **R-064** | Chat 15/09 | — | Testcontainers solo en repos; cálculo unitario puro | Aprobado |
| **R-065** | Chat 31/10 | — | Split research tracked vs raw gitignored | Aplicado |
| **R-066** | Chat 31/10 | — | Sanitización de DECISIONES-NEGOCIO.md | Aprobado |
| **R-067** | Chat 31/10 | — | Backup externo encriptado de raw/ | Aprobado |
| **R-068** | Chat 31/10 | — | Corrección de reportes del brain antes de cerrar | Aplicado |
| **R-069** | Entrevista 03/11 | — | Spread comercial no modelado como precio bilateral | Aprobado |
| **R-070** | Entrevista 03/11 | — | Saldos en DIRECTO son derivados, no persistidos | Aprobado |
| **R-071** | Entrevista 03/11 | — | Comisión en CONSIGNATARIA_EXTERNA es neta de la firma | Aprobado |
| **R-072** | Entrevista 03/11 | — | Comisión sobre monto bruto en PRECIO_FINAL | Aprobado |
| **R-073** | Entrevista 03/11 | — | Distribución de cuotas bifurcada por circuito | Aprobado |
| **R-074** | Entrevista 03/11 | — | No se modela cuenta corriente | Aprobado |
| **R-075** | Entrevista 03/11 | — | Exento y CF aplican IVA 0% en venta | Aprobado |
| **R-076** | Chat 03/11 | — | cuotas_operacion amplía R-063 a 3 tablas; 2 fechas por cuota | Aprobado |
| **R-077** | Chat 03/11 | — | Se elimina RN02 (carga diferida 2h) | Aplicado |
| **R-078** | Chat 03/11 | — | porcentaje_desbaste DECIMAL(5,2), rango −8.00 a +15.00 | Aprobado |
| **R-079** | Chat 03/11 | — | 3 overrides de IVA (ganado + comisión vendedor + comisión comprador) | Aprobado |
| **R-080** | Chat 03/11 | — | retenciones_externas_monto nullable, visible solo en CONSIGNATARIA_EXTERNA | Aprobado |
| **R-081** | Chat 03/11 | — | Login diferido mientras corra en localhost; adelantar en Fase 2.B si se cargan datos reales en entorno accesible | Aprobado |
| **R-082** | Consolidación 03/11 | — | Las 3 fuentes de verdad de Iteración 2 | Aplicado |
| **R-083** | Fase 2.A | — | Semántica de monto_cuota en CIRCUITO DIRECTO | Aplicado |
| **R-084** | Fase 2.A | — | Task 7 subdividida en 7.1 y 7.2 | Aplicado |
| **R-085** | Fase 2.A | — | BigDecimal coordenadas + entityManager.clear() en tests | Aplicado |
| **R-086** | Fase 2.A | — | Autonomía del agente en 2 ejes | Aplicado |
| **R-087** | Fase 2.A | — | Prompts de ejecución sin superpower | Aplicado |
| **R-088** | Fase 2.A | — | Auditoría intermedia entre Tasks 5 y 6 | Aplicado |
| **R-089** | Fase 2.A | — | Push a origin/main al cierre de cada bloque verificado | Aplicado |

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

### R-018: Estrategia de push + merge Step 2
- **Qué:** Commit consolidado de migración + docs se pushea a rama feature primero, luego merge fast-forward a main. Sin force, sin rebase.
- **Por qué:** Push primero = backup remoto. Fast-forward limpio. Sin force = no romper historia.
- **Estado:** Aplicado (commit 87346f8 + dba61e3 en main).
- **Ref:** Auditor externo (chat).

### R-019: Decisiones de Fase B (UI Clientes)
- **Qué:** (a) Desktop Master-Detail "Radar Dividido". (b) Mobile Copilot con dictado por voz real (Web Speech API). (c) Alto contraste, letras grandes, botones masivos. (d) Terminología: "Dar de alta" y "Registrar operación".
- **Por qué:** Usuarios con baja alfabetización digital. Vienen de Excel. La inteligencia de mercado (quién tiene / quién busca) es el corazón del negocio.
- **Estado:** Aplicado.
- **Ref:** Fase B brainstorm.

### R-020: Política de modelos Gemini
- **Qué:** Gemini 3.1 Pro (high) para pensar. Gemini 3.8 Flash (high) para ejecutar.
- **Por qué:** Pro modela mejor problemas nuevos. Flash es 3x más barato y excelente para TDD.
- **Estado:** Aplicado.
- **Ref:** Auditor externo (chat).

### R-021: Navegación por estado (no React Router)
- **Qué:** ClientesPage maneja useState<Vista>. Sin React Router.
- **Por qué:** MVP de 4 vistas, YAGNI. Una dependencia menos.
- **Estado:** Aplicado.
- **Ref:** Fase B planning.

### R-022: Scope policy Fase B
- **Qué:** Fase B incluye lista, detalle, alta, edición, mobile. NO incluye Operaciones ni IVA (Iteración 2) ni CRM (Iteración 3).
- **Por qué:** Evitar scope creep.
- **Estado:** Aplicado.
- **Ref:** Fase B planning.

### R-023: Estrategia de rechazo de plan
- **Qué:** Rechazo con investigaciones obligatorias + lista de problemas con severidad + estructura fija + reglas explícitas.
- **Por qué:** Rechazo sin correcciones específicas genera ruido.
- **Estado:** Aplicado (3 rounds para Fase B).
- **Ref:** Fase B planning.

### R-024: Verificación empírica de tipos
- **Qué:** El campo `id` del entity Cliente es String (UUID) por @GeneratedValue(strategy = GenerationType.UUID). TypeScript usa id?: string.
- **Por qué:** Plan inicial decía "UUID from backend" sin verificar. Política: verificar contra código fuente antes de asumir.
- **Estado:** Aplicado.
- **Ref:** Fase B planning.

### R-025: Callback pattern para desacoplar componentes
- **Qué:** Componentes que necesitan feedback reciben callback onActionSuccess: (msg: string) => void. El Toast real se conecta después.
- **Por qué:** Resuelve dependencia de orden (Task 6 consume Toast que Task 8 crea).
- **Estado:** Aplicado.
- **Ref:** Auditor externo (chat).

### R-026: TDD estricto por cada componente
- **Qué:** Test primero. RED → GREEN → refactor → commit. Un commit atómico por task.
- **Por qué:** Regla operativa no negociable.
- **Estado:** Aplicado en Tasks 1-8 de Fase B.
- **Ref:** Fase B ejecución.

### R-027: Manejo de código heredado de Iteración 1
- **Qué:** Al reemplazar App.tsx, ClienteTable.tsx, ClienteModal.tsx, clienteService.ts: reemplazo completo, no adaptación.
- **Por qué:** El código de Iteración 1 tiene patrones inconsistentes (axios, métricas hardcoded, modales). Adaptar propaga deuda.
- **Estado:** Aplicado (App.tsx 202→10 líneas).
- **Ref:** Fase B ejecución.

### R-028: No coexisten código viejo y nuevo
- **Qué:** Cuando dos archivos hacen lo mismo con tecnología distinta, el reemplazo va en el mismo commit: crear nuevo + eliminar viejo.
- **Por qué:** "Coexistencia pacífica" genera deuda inmediata.
- **Estado:** Aplicado.
- **Ref:** Fase B ejecución.

### R-029: Política de minors del code-reviewer
- **Qué:** Aprobar minors que alinean con UX. Rechazar cosméticos sin valor. Diferir a post-MVP.
- **Por qué:** Evitar scope creep. MVP primero.
- **Estado:** Aplicado en Tasks 1-8.
- **Ref:** Fase B ejecución.

### R-030: tel: sin prependear +54
- **Qué:** En ClienteDetail, teléfono es link tel: con limpieza de caracteres no numéricos. NO se prepende +54.
- **Por qué:** El campo telefono puede traer o no código país. Prependear duplicaría.
- **Estado:** Aplicado.
- **Ref:** Task 4.5 minors.

### R-031: Verificar endpoint PUT antes de implementar UPDATE
- **Qué:** Leer el controller del backend para confirmar full object vs DTO parcial antes de implementar cualquier UPDATE en frontend.
- **Por qué:** Asumir la forma del payload rompe en runtime.
- **Estado:** Aplicado (Task 6).
- **Ref:** Fase B ejecución.

### R-032: Guard contra doble-submit (crítico)
- **Qué:** En ClienteForm: if (isSubmitting) return; + disabled en todos los botones + texto "Guardando..." durante submit.
- **Por qué:** Usuarios de baja alfabetización tocan múltiples veces. Sin guard se crean clientes duplicados.
- **Estado:** Aplicado.
- **Ref:** Task 5 fix.

### R-033: No tocar código en vía de extinción
- **Qué:** Cuando un archivo va a ser eliminado en task posterior, NO invertir esfuerzo en arreglarlo.
- **Por qué:** Esfuerzo desperdiciado. Se reescribe desde cero.
- **Estado:** Aplicado.
- **Ref:** Task 2 fix.

### R-034: Vite config desde vitest/config
- **Qué:** vite.config.ts importa defineConfig desde vitest/config, no desde vite.
- **Por qué:** defineConfig de vite no reconoce `test`, rompiendo tsc -b.
- **Estado:** Aplicado (commit f83cbba).
- **Ref:** Task 1 fix.

### R-035: ApiError estructurada para RFC 7807
- **Qué:** Clase ApiError extends Error con status, statusText, data. Se lanza en apiFetch cuando !response.ok.
- **Por qué:** Migrar de axios a fetch pierde axios.isAxiosError. ApiError restaura la capacidad de extraer data.detail / data.errores.
- **Estado:** Aplicado (commit 4545449).
- **Ref:** Task 2 fix.

### R-036: Two-reviewer pattern obligatorio
- **Qué:** Cada task pasa por spec-reviewer + code-reviewer. Fix-loop si alguno falla.
- **Por qué:** Previene bugs que el implementer no ve.
- **Estado:** Aplicado en Tasks 1-8.
- **Ref:** Fase B ejecución.

### R-037: Checkpoints humanos entre tasks
- **Qué:** Después de cada task, agente reporta git log + tests + build + reviewers. Espera OK explícito.
- **Por qué:** Regla operativa no negociable.
- **Estado:** Aplicado en 20+ checkpoints.
- **Ref:** Fase B ejecución.

### R-038: Commits atómicos con delete + create
- **Qué:** 1 commit por task. Reemplazos (delete + create) en el mismo commit. Conventional Commits.
- **Por qué:** Historia limpia. Revertible.
- **Estado:** Aplicado.
- **Ref:** Fase B ejecución.

### R-039: Micrófono: toggle y cleanup
- **Qué:** recognition guardado en useRef. Toggle: si isRecording → stop(), si no → start(). Cleanup en unmount: nullificar callbacks + abort().
- **Por qué:** Previene InvalidStateError, micrófono huérfano (privacidad), batería.
- **Estado:** Aplicado (commit 77f597a).
- **Ref:** Task 6 fix.

### R-040: "No Atendió" preserva texto dictado
- **Qué:** Si el usuario dictó texto y toca "No Atendió", se anexa: [No atendió] {fecha} - {texto}.
- **Por qué:** Preferimos sobre-guardar que perder información. El usuario puede editar después.
- **Estado:** Aplicado (commit 77f597a).
- **Ref:** Task 6 fix.

### R-041: Elevar fetch de clientes a ClientesPage
- **Qué:** Un solo owner del estado clientes (ClientesPage). ClienteList y MobileCopilot reciben clientes como prop.
- **Por qué:** Ambos están montados simultáneamente (CSS oculta), generando doble request.
- **Estado:** Aplicado (commit 77f597a).
- **Ref:** Task 6 fix.

### R-042: Emojis prohibidos en UI
- **Qué:** Todo ícono es SVG inline con stroke="currentColor".
- **Por qué:** Emojis se ven distintos entre plataformas. No son SVG (viola Global Constraints).
- **Estado:** Aplicado.
- **Ref:** Task 6 fix.

### R-043: Detener micrófono en executeAction
- **Qué:** Antes de disparar el PUT, si isRecording, detener recognition y setIsRecording(false).
- **Por qué:** El PUT deselecciona el cliente, pero recognition sigue activo en background.
- **Estado:** Aplicado (commit 77f597a).
- **Ref:** Task 6.5 fix.

### R-044: Estado de error explícito en MobileCopilot
- **Qué:** La prop error NO se descarta. Cuando falla el fetch, mostrar banner con "Reintentar" (no empty state).
- **Por qué:** "No hay clientes" cuando la red falla es engañoso.
- **Estado:** Aplicado (commit 77f597a).
- **Ref:** Task 6.5 fix.

### R-045: Cleanup de subagentes en Antigravity
- **Qué:** La plataforma mantiene 20 subagentes máximos en buffer. Al superar, manage_subagents(kill) sobre los idle.
- **Por qué:** Sin efecto en repo ni pérdida de trabajo.
- **Estado:** Aplicado.
- **Ref:** Explicación del agente.

### R-046: Refactor de fallback nulo compartido en ClientesPage
- **Qué:** Extraer el fallback defensivo (vista detalle/edición sin cliente) a subcomponente interno EmptyFallback con role="status".
- **Por qué:** DRY + accesibilidad.
- **Estado:** Aplicado (commit 794ab98).
- **Ref:** Task 7 minor.

### R-047: Toast component con auto-dismiss 3s
- **Qué:** role="status", aria-live="polite", setTimeout 3000ms con cleanup, botón close con SVG inline. Timer con useRef para no resetear en re-render.
- **Por qué:** Feedback visual crítico para usuarios de baja alfabetización.
- **Estado:** Aplicado (commit 50d5540).
- **Ref:** Task 8.

### R-048: Callback pattern conectado al Toast real
- **Qué:** onActionSuccess de MobileCopilot se conecta a setToastMessage en ClientesPage. Cierra el patrón de R-025.
- **Por qué:** Resuelve dependencia circular sin refactor.
- **Estado:** Aplicado (commit 50d5540).
- **Ref:** Task 8.

### R-049: Cierre de Fase B
- **Qué:** Fase B (UI Clientes) completa. 9 tasks. 75 tests. 0 warnings. 0 referencias a axios. 0 código legacy de Iteración 1.
- **Por qué:** Hito funcional del proyecto. UI operable end-to-end contra backend.
- **Estado:** Aplicado.
- **Ref:** Fase B ejecución.

### R-050: Política de re-verificación de quotas
- **Qué:** Antigravity tiene límites de API que resetean en minutos. Si se alcanza durante una task, esperar reset antes de reintentar.
- **Por qué:** Evitar reintentos en loop que empeoran la situación.
- **Estado:** Documentado (ocurrió en Task 8).
- **Ref:** Task 8 ejecución.

### R-051: Deuda técnica post-MVP (registro acumulado)
- **Qué:** Diferidos a post-MVP: aria-label exhaustivo, mapeo de errores Web Speech API, spinner de recarga en background, aria-invalid, maxLength, mailto:, normalización de teléfonos.
- **Por qué:** MVP primero. Pulido después.
- **Estado:** Documentado en progress.md de Fase B.
- **Ref:** Tasks 1-8.

### R-052: Cierre de Fase B formal
- **Qué:** Fase B cerrada. 19 commits en feat/ui-clientes mergeados a main vía fast-forward. 3,727 insertions / 989 deletions en 28 archivos. 75 tests pasando. 51 rulings consolidados. REPORT.md actualizado.
- **Por qué:** Hito funcional del proyecto. UI operable end-to-end contra backend.
- **Estado:** Aplicado.
- **Ref:** Cierre Fase B.

### R-053: Estrategia de push + merge para Fase B
- **Qué:** Push rama feature → verificación de hashes → merge fast-forward a main → push main. Sin force. Rama feature borrada después del merge.
- **Por qué:** Mismo patrón que Step 2. Backup remoto antes de merge. Historia lineal.
- **Estado:** Aplicado.
- **Ref:** Cierre Fase B.

### R-054: Cleanup de TODOs en MVP
- **Qué:** No dejar TODOs activos. Si el fallback es defensivo legítimo, documentarlo con comentario correcto. Si es código muerto, eliminar. Decisión por compilación de TypeScript, no a ojo.
- **Estado:** Aplicado.
- **Ref:** Fix 9543c08.

### R-055: Conservación vs borrado de ramas feature
- **Qué:** Después de fast-forward merge a main, borrar la rama feature (local y remoto). Los commits ya están en main. Conservar la rama es ruido. Excepción: si el merge fue merge commit (no fast-forward) y querés conservar el contexto del PR, mantener hasta que pase el review.
- **Estado:** Aplicado.
- **Ref:** Decisión de cierre.

### R-056: BigDecimal para dinero y kg
- **Qué:** Los montos (precios, comisiones, impuestos) y los kilogramos se modelan con `BigDecimal` en el backend. No se usa `double`/`Double` para aritmética monetaria.
- **Por qué:** Evitar discrepancias de redondeo en aritmética de punto flotante.
- **Cita textual del transcript:** "empleando `BigDecimal` para toda métrica de dinero y kilos" (transcript_full.jsonl:2024)
- **Estado:** Aprobado. Forward-looking (no hay campos monetarios hoy).
- **Ref:** transcript_full.jsonl:2024, 2027

### R-057: PK String UUID para Operacion y Cobro
- **Qué:** Las entidades `Operacion` y `Cobro` usan la misma PK que `Cliente`: campo `String id` con `@GeneratedValue(strategy = GenerationType.UUID)`. Extiende R-024.
- **Por qué:** "Consistencia absoluta en el esquema, en los DTOs y en la gestión de Foreign Keys".
- **Cita textual del transcript:** "Implementar `Operacion` y `Cobro` utilizando exactamente la misma estrategia de PK que `Cliente`" (transcript_full.jsonl:2026)
- **Estado:** Aprobado. Forward-looking (entidades no creadas).
- **Ref:** transcript_full.jsonl:2025, 2026, 2027

### R-058: BigDecimal para coordenadas (no Double)
- **Qué:** Latitud y longitud se modelan con `BigDecimal` en Java, alineado con las columnas `DECIMAL(10,8)` y `DECIMAL(11,8)` existentes en la tabla `clientes`. No se usa `Double`.
- **Por qué:** Coherencia con R-056 (todo valor decimal exacto es BigDecimal) y con el tipo `DECIMAL` del SQL. La propuesta previa de mantener `Double` fue descartada por el usuario.
- **Cita textual:** "Decisión del usuario en chat 2026-10-31 (D1): 'BigDecimal en Java + DECIMAL en SQL'".
- **Estado:** Aprobado. Parcial: `Cliente.java:48,51` hoy declara `Double`. Deuda técnica a ejecutar como Task 0 de Iteración 2, antes de crear `Operacion` (consistencia entre entidades).
- **Ref:** chat 2026-10-31 (D1) · transcript_full.jsonl:2028 (propuesta original de Double, descartada)

### R-059: UI de Operaciones en Iteración 2
- **Qué:** La Iteración 2 incluye el frontend de Operaciones (form, detail, list, mobile, tests), no solo el backend.
- **Por qué:** "Entregar un 'Core Operativo' sin interfaces es inútil para los operadores y viola el propósito del proyecto y el RNF01".
- **Cita textual del transcript:** "La UI de Operaciones **debe incluirse obligatoriamente en la Iteración 2**." (transcript_full.jsonl:2026)
- **Estado:** Aprobado. Forward-looking.
- **Ref:** transcript_full.jsonl:2025, 2026, 2027, 2028 (lista de tasks)

### R-060: Cobro en tabla separada
- **Qué:** `Cobro` se modela como tabla independiente con FK a `Operacion`, no como campos embebidos ni colección JPA dentro de `Operacion`.
- **Por qué:** Cada cobro tiene estado, fecha, medio de pago y observaciones propias. Embebido impide historial completo.
- **Cita textual del transcript:** "Cobro va en una tabla separada" (transcript_full.jsonl:2025-2026)
- **Estado:** Aprobado. Forward-looking.
- **Ref:** transcript_full.jsonl:2025, 2026, 2027

### R-061: Frontend Opción C hacia /api/v1
- **Qué:** El frontend migra a `/api/v1` de una sola vez, cambiando el fallback central en `apiFetch`. No se implementan helpers versionados ni coexistencia de paths en el cliente. Ejecutable en Iteración 2 (junto con la creación de `/api/v1/operaciones`), no antes.
- **Por qué:** "Las Opciones A y B ensucian el código con lógicas transicionales innecesarias".
- **Cita textual:** "Opción C (Cambiar el helper a `/api/v1` y romper legacy de una en el frontend)" (transcript_full.jsonl:2028) + decisión del usuario 2026-10-31 (D2): adoptar en Iteración 2, no ahora.
- **Estado:** Aprobado. Forward-looking. Ejecutable en I2.
- **Ref:** transcript_full.jsonl:2027, 2028 · chat 2026-10-31 (D2) · client.ts:17-19 (punto de cambio: ~1 línea)

### R-062: Backend /api/v1 en paralelo a legacy
- **Qué:** Durante la transición, el backend expone `/api/v1` en paralelo a `/api` legacy. El controlador legacy se mantiene hasta que el frontend esté migrado; luego se remueve.
- **Por qué:** Permite migrar frontend sin downtime ni romper la compilación del backend.
- **Cita textual del transcript:** "el *backend* sí mantendrá su controlador legacy brevemente para asegurar que no se rompe la compilación antes de que el frontend esté migrado" (transcript_full.jsonl:2028)
- **Estado:** Aprobado. Forward-looking.
- **Ref:** transcript_full.jsonl:2026, 2027, 2028

### R-063: Migración V2 única para operaciones y cobros
- **Qué:** La creación de `operaciones` y `cobros` se hace en un único archivo Flyway: `V2__create_operaciones_y_cobros.sql`. No se divide en migraciones separadas por entidad.
- **Por qué:** Ambas entidades tienen FK entre sí (`Cobro.operacion_id`). Una migración única garantiza orden de creación atómico y simplifica rollbacks conceptuales.
- **Cita textual del transcript:** "un único script `V2__create_operaciones_y_cobros.sql`" (transcript_full.jsonl:2026)
- **Estado:** Aprobado. Forward-looking.
- **Ref:** transcript_full.jsonl:2026, 2027

### R-064: Testcontainers solo en repos; cálculo con tests unitarios puros
- **Qué:** Los tests de repositorio (`*RepositoryTest`) usan Testcontainers + MySQL 8. Los tests de cálculo fiscal y de lógica de negocio (`*ServiceTest`) son unitarios puros, sin Spring context ni Testcontainers.
- **Por qué:** Testcontainers es lento y costoso; solo aporta valor donde hay SQL real. El cálculo fiscal se testea puro con Mockito.
- **Cita textual del transcript:** "Testcontainers solo para los tests de repositorio y tests unitarios puros para el cálculo" (transcript_full.jsonl:2026)
- **Estado:** Aprobado. Forward-looking.
- **Ref:** transcript_full.jsonl:2026, 2027

### R-065: Split de research tracked vs raw gitignored
- **Qué:** El material crudo de investigación (entrevistas, WhatsApp, auditoría técnica con citas, audios `.ogg`, `VISION.md`, `SGCH Resumido.docx`, capturas de planilla) se mueve a `docs/superpowers/research/raw/` y se agrega a `.gitignore`. En `docs/superpowers/research/` (tracked) solo queda material sanitizado (`README.md`, `2026-10-30-auditoria-carpeta.md`, futuro `DECISIONES-NEGOCIO.md`).
- **Por qué:** Contiene nombres de clientes, márgenes reales y menciones explícitas a evasión y allanamiento. No apto para GitHub ni en repo privado. Los agentes de IA acceden vía filesystem local sin necesidad de que los archivos estén en git.
- **Cita:** Decisión del usuario 2026-10-31 (chat); ejecución en commit `f5c0e46`.
- **Estado:** Aplicado.
- **Ref:** commit f5c0e46 · `.gitignore:9` · `docs/superpowers/research/README.md`

### R-066: Sanitización de `DECISIONES-NEGOCIO.md`
- **Qué:** El documento `docs/superpowers/research/DECISIONES-NEGOCIO.md` (tracked) contiene decisiones de negocio **sin** nombres reales de clientes (se reemplazan por seudónimos: `Cliente A (criador, Formosa)`), sin valores específicos de márgenes por operación (se usan rangos: "1–5%"), sin las palabras "negro", "evasión" ni "allanamiento" (se usan "porción documentada" / "porción sin comprobante"). Las citas literales y la asociación nombre→decisión quedan exclusivamente en `raw/`.
- **Por qué:** El archivo tracked es visible para cualquier colaborador o backup de GitHub. La sanitización no pierde información (los datos sensibles viven en `raw/`), solo elimina la exposición innecesaria.
- **Cita:** Decisión del usuario 2026-10-31 (chat).
- **Estado:** Aprobado. Forward-looking (el documento se crea en el próximo paso).
- **Ref:** chat 2026-10-31

### R-067: Backup externo encriptado de `raw/`
- **Qué:** `raw/` no tiene backup en git. El respaldo es un archivo encriptado externo (7-Zip AES-256 → OneDrive/Drive privado u otro cloud privado), mensual o al cierre de cada iteración. La fecha del último backup se anota en `docs/superpowers/research/README.md`, sección "Backup".
- **Por qué:** `raw/` contiene la única copia de las entrevistas reales y no debe perderse ante falla de disco. GitHub está descartado por privacidad (R-065).
- **Cita:** Decisión del usuario 2026-10-31 (chat).
- **Estado:** Aprobado. Acción del operador.
- **Ref:** chat 2026-10-31 · `docs/superpowers/research/README.md` sección "Backup"

### R-068: Corrección de reportes del brain antes de cerrar
- **Qué:** Los reportes generados por Antigravity en `C:\Users\frans\.gemini\antigravity\brain\` se copian a `docs/superpowers/research/` antes de considerarse cerrados. Los `.jsonl` del brain nunca se copian al repo (contienen prefijo de API key de Context7 y toda la sesión). Una corrección reportada como "hecha" en un commit pasado debe verificarse contra el archivo del repo, no contra el reporte.
- **Por qué:** En commit `ca2be3a` se reportó como corregida la línea 209 del audit report y no se aplicó; el bug se detectó recién al auditar el commit siguiente. La verificación contra el archivo del repo, no contra el reporte, evita repetir el problema.
- **Cita:** Detectado en commit `ca2be3a`; corregido en `f5c0e46`.
- **Estado:** Aplicado.
- **Ref:** commits ca2be3a y f5c0e46

### R-069: Spread comercial no modelado como precio bilateral
- **Qué:** La ganancia por diferencia (de precio o de kilos) NO se modela como precio bilateral ni doble kilaje de cálculo. En `Operacion` existe un único `kg_neto` (`NOT NULL`) y un único `precio_kg_facturado` (`NOT NULL`, base del IVA y la comisión), más `monto_extra_cobrado_comprador` (`NULL`, informativo) y `kg_llegada_referencia` (`NULL`, informativo).
- **Por qué:** Cuando existe diferencia entre puntas, la factura oficial entre vendedor y comprador lleva un único precio y el resto no se factura por separado. Desdoblar precios oficiales complicaría la Capa 1 y Capa 2 con un escenario que fiscalmente no ocurre.
- **Cita textual:** "Si vos hacés eso, es porque vendiste un 20% en negro... Y ese $3.500 va a ser igual para el vendedor y para el comprador" (`2026-11-03-entrevista-papa-operaciones-particulares.md:418-426`).
- **Estado:** Aprobado. Documentado en Requerimientos v3.2 (RN06) y Anexo II v1.1 (§2).
- **Ref:** `DECISIONES-NEGOCIO-DRAFT.md` (`D-11`, `B1`, `B2`) · `2026-11-03-entrevista-papa-operaciones-particulares.md:406-440`

### R-070: Saldos en DIRECTO son derivados, no persistidos
- **Qué:** Cada operación expone en lectura cuatro saldos derivados (no persistidos en columnas SQL): `total_a_cobrar_comprador`, `total_a_pagar_vendedor`, `saldo_hacienda_entre_partes` y `saldo_comision_firma`. En circuito `DIRECTO`, `saldo_hacienda_entre_partes = subtotal_ganado + iva_ganado` es informativo y dispara alerta de seguimiento al operador al vencer, mientras que `saldo_comision_firma` refleja lo que efectivamente cobra la firma.
- **Por qué:** En negocio directo el dinero de la hacienda va del comprador al vendedor sin pasar por la firma, pero el operador necesita seguir su vencimiento para garantizar que la operación se pague en tiempo y forma sin mezclar esa cifra con la caja propia.
- **Cita textual:** "Y tenés que... tenés que llevarlo. Porque vos por más que cobres solo comisión, estás en el medio de la operación... Entonces necesitás estar tranquilo que la operación sale bien, que se paga en tiempo y forma" (`2026-11-03-entrevista-papa-operaciones-particulares.md:20-24`).
- **Estado:** Aprobado. Documentado en Anexo II v1.1 (§4).
- **Ref:** `DECISIONES-NEGOCIO-DRAFT.md` (`D-07`, `B3`) · `2026-11-03-entrevista-papa-operaciones-particulares.md:20-60`

### R-071: Comisión en CONSIGNATARIA_EXTERNA es neta de la firma
- **Qué:** En operaciones con `modalidad_circuito = CONSIGNATARIA_EXTERNA`, el porcentaje de comisión cargado en el sistema representa directamente la comisión neta que le queda a la firma (habitualmente 2% facturado a la consignataria externa). No se modela en el cálculo la parte retenida por la consignataria externa; solo se habilita el campo informativo opcional `comision_total_cobrada_referencia`.
- **Por qué:** La consignataria externa emite la liquidación al productor y luego envía a la firma un resumen indicando cuánto debe facturarle por su participación.
- **Cita textual:** "Él hace la liquidación y él después te manda un resumen de cuenta y te dice: «Facturame tanto de comisión», que normalmente es el 2% porque es el arreglo que tenemos" (`2026-11-03-entrevista-papa-operaciones-particulares.md:98,114`).
- **Estado:** Aprobado. Documentado en Requerimientos v3.2 (RN10) y Anexo II v1.1 (§4).
- **Ref:** `DECISIONES-NEGOCIO-DRAFT.md` (`D-08`, `B3`) · `2026-11-03-entrevista-papa-operaciones-particulares.md:90-182`

### R-072: Comisión sobre monto bruto en PRECIO_FINAL
- **Qué:** Cuando `modalidad_precio = FINAL`, la comisión porcentual se calcula directamente sobre `subtotal_ganado = kg_neto × precio_kg_facturado` (monto bruto con IVA incluido), sin dividir previamente por `1,105`. Cuando `modalidad_precio = NETO`, se calcula sobre el neto.
- **Por qué:** Refleja la práctica comercial real de los operadores al cerrar ventas a precio final en el campo, evitando discrepancias entre lo pactado de palabra y lo liquidado por el sistema.
- **Cita textual:** "Hacelo sobre el total... En el caso del final hacelo sobre el total nomás y chau... Lo que correspondería es una cosa, lo que se hace es otra" (`2026-11-03-entrevista-papa-operaciones-particulares.md:224,256`).
- **Estado:** Aprobado. Documentado en Requerimientos v3.2 (RN03) y Anexo II v1.1 (§2, §5).
- **Ref:** `DECISIONES-NEGOCIO-DRAFT.md` (`D-09`) · `2026-11-03-entrevista-papa-operaciones-particulares.md:204-268`

### R-073: Distribución de cuotas bifurcada por circuito
- **Qué:** Al generar las `N` cuotas de una operación en `CuotaOperacion`, el importe sugerido por defecto se bifurca según el circuito: en `DIRECTO`, cuotas iguales (`total / N`); en `CONSIGNATARIA_EXTERNA`, `cuota 1 = (capital / N) + IVA + gastos` y las cuotas restantes `capital / N`. En ambos casos `monto_cuota` es editable por el operador.
- **Por qué:** En operaciones directas los cheques se dividen en partes iguales, mientras que las consignatarias externas exigen el IVA y los gastos en el primer vencimiento a los 30 días.
- **Cita textual:** "$33\%$, $33\%$ y $33\%$. Salvo que se pacte distinto... Ahora, si ese negocio pasa por una consignataria, lo más seguro que le cobren a los 30 días IVA y gastos más la primera cuota" (`2026-11-03-entrevista-papa-operaciones-particulares.md:322-346`).
- **Estado:** Aprobado. Documentado en Requerimientos v3.2 (RF09, RN08).
- **Ref:** `DECISIONES-NEGOCIO-DRAFT.md` (`D-10`, `B4`) · `2026-11-03-entrevista-papa-operaciones-particulares.md:322-386`

### R-074: No se modela cuenta corriente
- **Qué:** No se crea tabla `cuenta_corriente` ni compensación automática de saldos entre distintas operaciones de un mismo cliente. Todo `Cobro` se imputa a una `Operacion` (y opcionalmente a una `CuotaOperacion`).
- **Por qué:** Como comisionistas directos no cruzan pagos entre distintos compradores y vendedores; cuando operan por consignataria externa, la compensación la realiza la consignataria en su propio analítico.
- **Cita textual:** "Por lo general, no. Porque como no sos consignataria, entonces... es más difícil... Pedro le tiene que pagar a él y él paga al otro. No podés compensar" (`2026-11-03-entrevista-papa-operaciones-particulares.md:514-526`).
- **Estado:** Aprobado. Documentado en Requerimientos v3.2 (RN07) y Anexo II v1.1 (§4).
- **Ref:** `DECISIONES-NEGOCIO-DRAFT.md` (`D-13`) · `2026-11-03-entrevista-papa-operaciones-particulares.md:514-536`

### R-075: Exento y CF aplican IVA 0% en venta
- **Qué:** Se mantiene el enum `CondicionFiscal` con 4 valores (`RESPONSABLE_INSCRIPTO`, `MONOTRIBUTISTA`, `EXENTO`, `CONSUMIDOR_FINAL`). Cuando el vendedor es `MONOTRIBUTISTA`, `EXENTO` o `CONSUMIDOR_FINAL`, `iva_ganado = 0` (Caso D del Anexo II). Cuando actúa como comprador, no altera la fórmula porque el IVA ganado depende del vendedor.
- **Por qué:** Los exentos de IVA representan menos del 1% de los casos y el consumidor final rural corresponde legalmente a un monotributista que al vender no discrimina IVA.
- **Cita textual:** "el exento de IVA es poco y nada... no llega ni al 1%... consumidor final si querés llamarle, pero es monotributista... Si vende no le pagás el IVA y chau" (`2026-11-03-entrevista-papa-operaciones-particulares.md:542-590`).
- **Estado:** Aprobado. Documentado en Requerimientos v3.2 (§6.1) y Anexo II v1.1 (§3.1 Caso D).
- **Ref:** `DECISIONES-NEGOCIO-DRAFT.md` (`D-14`, `B10`) · `2026-11-03-entrevista-papa-operaciones-particulares.md:542-606`

### R-076: cuotas_operacion amplía R-063 a 3 tablas; 2 fechas por cuota
- **Qué:** Se amplía R-063 para que la migración `V2__create_operaciones_y_cobros.sql` cree tres tablas transaccionales: `operaciones`, `cuotas_operacion` y `cobros` (además del `ALTER TABLE clientes` para `cuit` y `condicion_fiscal`). Cada fila de `cuotas_operacion` almacena dos fechas de vencimiento calculadas desde `fecha_base_plazo` (`CARGA` / `REMATE`): `fecha_vencimiento_comprador` y `fecha_vencimiento_vendedor` (sumando `dias_descalce_vendedor`, default `0` en `DIRECTO` y `7` en `CONSIGNATARIA_EXTERNA`).
- **Por qué:** El descalce de 7 días aplica a cada cuota individualmente (`30/60/90` → `37/67/97`), lo cual no puede representarse con un único par de fechas escalares en `operaciones`.
- **Cita textual:** "El descalce de 7 días sí corresponde a todas las cuotas... el vendedor vende con 37, 67, 97 y el comprador compra con 30, 60 y 90. Y se aplica a cada cuota" (`relevamiento_whatsapp_reglas_impositivas_y_operativas.md:167-168`).
- **Estado:** Aprobado. Documentado en Requerimientos v3.2 (§6.4, §9.1).
- **Ref:** `DECISIONES-NEGOCIO-DRAFT.md` (`D-10`, `B4`) · R-063

### R-077: Se elimina RN02 (carga diferida 2h)
- **Qué:** Se elimina del Documento de Requerimientos la regla `RN02` (obligación de justificar en observaciones toda operación cargada más de 2 horas después de realizada) y se renumeran `RN03–RN06` a `RN02–RN05`. En `Operacion` coexisten `fecha_carga` y `fecha_operacion` sin restricción punitiva de horario.
- **Por qué:** Era un residuo del prototipo académico v1 incompatible con el trabajo real en ruta y balanzas, donde las operaciones se cargan horas o días después en la oficina.
- **Cita textual:** Regla de oro de Anexo II §1 ("el flujo principal de carga NO debe trabarse") y decisión `B11` aprobada por Francisco el 2026-11-03.
- **Estado:** Aplicado en Requerimientos v3.2 (RF05, §5, CU-02, §10.4).
- **Ref:** `DECISIONES-NEGOCIO-DRAFT.md` (`B11`) · `DOCUMENTO DE REQUERIMIENTOS - SGCH v2.md` (§5, §10.4)

### R-078: porcentaje_desbaste DECIMAL(5,2), rango −8.00 a +15.00
- **Qué:** El campo opcional `porcentaje_desbaste` en `operaciones` se modela como `DECIMAL(5,2)` con rango válido de `-8.00` a `+15.00`, utilizado para autocompletar `kg_neto` a partir de `kg_origen_bruto` cuando el operador lo ingresa.
- **Por qué:** Soporta tanto los descuentos habituales de merma por desbaste (`-1%` a `-8%`) como los incrementos positivos por traqueteo previo en balanzas específicas (ej. `+1%` en Quitilipi y hasta `+15%` de margen operativo).
- **Cita textual:** Desbaste en origen/destino (`transcripci_n_completa_de_entrevista_agropecuaria.md:109-145`) y decisión técnica `B1` aprobada por Francisco el 2026-11-03.
- **Estado:** Aprobado. Documentado en Requerimientos v3.2 (RF05, §6.2).
- **Ref:** `DECISIONES-NEGOCIO-DRAFT.md` (`B1`) · R-056

### R-079: 3 overrides de IVA (ganado + comisión vendedor + comisión comprador)
- **Qué:** La entidad `Operacion` incluye tres campos opcionales (`nullable`) de override manual de IVA: `iva_ganado_override`, `iva_comision_vendedor_override` e `iva_comision_comprador_override`. Cuando cualquiera de ellos está presente, su valor reemplaza el cálculo automático de la fórmula de Capa 2 para ese concepto.
- **Por qué:** Cubre la opción "Otro monto" pedida por Santi para acuerdos cerrados por un importe redondo de IVA tanto en la hacienda como en las comisiones de cada punta.
- **Cita textual:** "alguna opción abajo que diga «Otro», y ahí vos ponés el monto del IVA que querés facturar y chau" (`transcripci_n_completa_de_entrevista_agropecuaria.md:282`) y decisión `B5` aprobada por Francisco el 2026-11-03.
- **Estado:** Aprobado. Documentado en Requerimientos v3.2 (RF05, §6.2) y Anexo II v1.1 (§3.1, §3.2).
- **Ref:** `DECISIONES-NEGOCIO-DRAFT.md` (`B5`)

### R-080: retenciones_externas_monto nullable, visible solo en CONSIGNATARIA_EXTERNA
- **Qué:** Se incluye en `operaciones` el campo opcional `retenciones_externas_monto` (`BigDecimal`, nullable), visible en la interfaz únicamente cuando `modalidad_circuito = CONSIGNATARIA_EXTERNA`. Su carácter es informativo y no activa ningún motor de cálculo impositivo en SGCH.
- **Por qué:** Permite anotar como referencia el monto retenido por Ganancias o IIBB en la liquidación de la consignataria externa sin violar RN01 (`D-04`).
- **Cita textual:** Decisión técnica `B9` aprobada por Francisco el 2026-11-03.
- **Estado:** Aprobado. Documentado en Requerimientos v3.2 (RF05, §6.2) y Anexo II v1.1 (§4).
- **Ref:** `DECISIONES-NEGOCIO-DRAFT.md` (`DA-03`, `B9`)

### R-081: Login diferido mientras corra en localhost; adelantar en Fase 2.B si se cargan datos reales en entorno accesible
- **Qué:** La autenticación de usuarios se mantiene diferida mientras la aplicación se ejecute exclusivamente en `localhost` durante el desarrollo de la Iteración 2, combinada desde ahora con nomenclatura contable estrictamente neutra (`porcentaje_documentado_*`, R-066). Si en Fase 2.B los operadores comienzan a cargar datos reales en un entorno accesible, se adelantará un login con contraseña.
- **Por qué:** No frena la construcción del core transaccional en desarrollo local y establece una condición explícita de disparo antes de exponer datos reales.
- **Cita textual:** Decisión técnica `B7` aprobada por Francisco el 2026-11-03.
- **Estado:** Aprobado. Documentado en Requerimientos v3.2 (§4.3).
- **Ref:** `DECISIONES-NEGOCIO-DRAFT.md` (`DA-01`, `B6`, `B7`) · R-066

### R-082: Las 3 fuentes de verdad de Iteración 2
- **Qué:** A partir de la consolidación del 2026-11-03, SGCH 2.0 tiene tres
  fuentes de verdad con jerarquía explícita:
  1. **Especificaciones técnicas:** `docs/superpowers/specs/DOCUMENTO DE
     REQUERIMIENTOS - SGCH v2.md` (v3.2) + `ANEXO-II-Modelo-Calculo-Fiscal.md`
     (v1.1). Tracked, sin sanitización de nombres de dominio.
  2. **Decisiones de negocio:** `docs/superpowers/research/DECISIONES-NEGOCIO.md`.
     Tracked, sanitizado per R-066.
  3. **Material crudo de investigación:** `docs/superpowers/research/raw/`.
     Gitignored per R-065, backup encriptado externo per R-067.
  Cualquier contradicción se resuelve en ese orden. El DRAFT original
  (`raw/DECISIONES-NEGOCIO-DRAFT.md`) queda como referencia histórica,
  no como fuente operativa.
- **Por qué:** Tres niveles permiten auditar decisiones sin exponer datos
  de clientes en el repo tracked, y sin perder la fuente original cuando
  se necesita verificar una cita.
- **Estado:** Aplicado en commit `640fa5a` (specs) + este commit (research).
- **Ref:** R-065, R-066, R-067 · commit 640fa5a

### R-083: Semántica de monto_cuota en CIRCUITO DIRECTO
- **Qué:** En `CIRCUITO DIRECTO`, `monto_cuota` representa el pago entre partes (comprador → vendedor), informativo para la firma. La comisión de la firma se registra como `Cobro` con `tipo_movimiento = COBRO_COMISION` sin `cuota_id`. `estado_liquidacion` se actualiza con el agregado de `Cobro`, no con `monto_cuota`. Requiere cobertura de ambos saldos (`saldo_hacienda_entre_partes` + `saldo_comision_firma`) para pasar a `LIQUIDADO`.
- **Por qué:** Refleja el flujo real del negocio; el dinero de la hacienda no pasa por la firma.
- **Estado:** Aplicado (commit 0881d59, CobroService.java).
- **Ref:** DECISIONES-NEGOCIO §3.7, Anexo II §4, chat 2026-11-03 (Opción A).

### R-084: Task 7 subdividida en 7.1 y 7.2
- **Qué:** Task 7 del plan Fase 2.A se subdivide en 7.1 (Services + tests unitarios Mockito) y 7.2 (Controllers + GlobalExceptionHandler + tests @WebMvcTest). Total 11 tasks ejecutables.
- **Por qué:** Task 7 original mezclaba 2 servicios complejos + 2 controllers + 4 suites de tests. Subdividida para checkpoints humanos granulares.
- **Estado:** Aplicado (commits 0881d59 + d139d33).
- **Ref:** plan Fase 2.A, chat 2026-11-03.

### R-085: BigDecimal coordenadas + entityManager.clear() en tests
- **Qué:** `Cliente.java` usa `BigDecimal` para lat/lng con `@Column(precision, scale)` compatible con `DECIMAL(10,8)` y `(11,8)`. Tests de persistencia exacta requieren `entityManager.clear()` para forzar SELECT real y evitar falsos positivos del caché L1.
- **Por qué:** Cierra deuda de R-058; garantiza precisión exacta contra MySQL 8.
- **Estado:** Aplicado (commit 03b8137).
- **Ref:** R-058, chat 2026-11-03.

### R-086: Autonomía del agente en 2 ejes
- **Qué:** Scope = cero libertad (plan aprobado es fuente de verdad, cambios requieren OK). Implementación = libertad delegada con revisión post-hoc por spec-reviewer + code-reviewer. Validado en Tasks 3-8: el agente eligió @ParameterizedTest con @EnumSource, helpers privados, fallbacks defensivos, sin scope creep.
- **Por qué:** Reduce tokens de prompts, permite criterio del agente, mantiene red de seguridad en checkpoints.
- **Estado:** Aplicado en Tasks 3-8. Control máximo se mantiene en Tasks 1 (schema SQL), 5 y 6 (fórmulas fiscales).
- **Ref:** chat 2026-11-03.

### R-087: Prompts de ejecución sin superpower
- **Qué:** Los prompts de ejecución de tasks no invocan `superpowers:executing-plans`. La disciplina (TDD, two-reviewer, checkpoints, commits atómicos) viene de RULINGS.md + AGENTS.md, no de una tool. `executing-plans` solo se evaluará si en algún momento se ejecutan 3+ tasks sin checkpoint intermedio (confianza ganada, no dada).
- **Por qué:** Superpower agrega overhead innecesario. La disciplina ya es explícita.
- **Estado:** Aplicado en Tasks 0-8.
- **Ref:** chat 2026-11-03.

### R-088: Auditoría intermedia entre Tasks 5 y 6
- **Qué:** Fase 2.A incluye auditoría intermedia de conformidad entre Tasks 5 (Capa 1+2) y Task 6 (Capa 3, integrador crítico). 7 dimensiones: conformidad con plan, consistencia cross-task, drift, gaps, rulings mal citados, riesgos para Task 6, calidad de tests. Modelo: Pro High, read-only.
- **Por qué:** Task 6 es el integrador crítico; no se construye sobre base no auditada cross-task.
- **Estado:** Aplicado (2026-11-03, reporte ejecutado por Antigravity).
- **Ref:** chat 2026-11-03.

### R-089: Push a origin/main al cierre de cada bloque verificado
- **Qué:** El push a `origin/main` se hace al cierre de cada bloque de tasks verificadas (Tasks 0-5 en este caso) y antes de auditorías o fases críticas. Razón: 7+ commits verificados en local sin backup remoto es riesgo.
- **Por qué:** Push primero, auditoría después. Minimiza el caos si hay findings que requieran revert.
- **Estado:** Aplicado (Tasks 0-5 pusheadas en 0edaf98). Tasks 6-8 pendientes de push al cierre de Fase 2.A.
- **Ref:** chat 2026-11-03.

---

## Notas de Auditoría (Observaciones)

### NA-001
El tooling de búsqueda de texto de Antigravity falló 2 veces durante la migración, en archivos que sí contenían el término buscado. Posible bug. A vigilar.

### NA-002
El agente tiene dificultades escribiendo archivos largos en Windows con PowerShell here-strings. Solución adoptada: usar Set-Content -Encoding UTF8 o el editor nativo del agente.

### NA-003
El agente respetó 20+ checkpoints consecutivos durante Step 2 y Fase B. Cambio de comportamiento consolidado respecto de Iteración 1.

### NA-004
Antigravity reportó errores de "stream interrupted" durante la consolidación de rulings y Task 8. Recuperables con retry. Monitorear si se repite.

### NA-005
El subagent-driven-development con Gemini 3.8 Flash genera ~30 subagentes por sesión. Costoso en créditos pero efectivo. Considerar parallelización en sesiones futuras.

### NA-006
"Killed N subagents" en Antigravity = cleanup normal de la plataforma al superar 20 subagentes en buffer. Sin efecto en repo ni pérdida de trabajo.

### NA-007
Docker Desktop en Windows (2026-11-03, Tasks 0 y 8) requirió en algunos casos el workaround: `Start-Process` detached → `wsl --shutdown` → wait 15-30s → `docker info` OK. En Tasks 2, 3, 4, 5, 6, 7, 8 arrancó al primer intento. Documentar el workaround para futuras tasks con Testcontainers.

### NA-008
Antigravity hace polling excesivo del test suite (~20 checks por task) durante ejecuciones de Maven. Consume créditos sin valor. Reducir a 2-3 polling con espera explícita o confiar en el retorno del proceso.

### NA-009
`OperacionRequest` expone `estadoLiquidacion` (Task 4). `OperacionService.create()` debe forzar `EstadoLiquidacion.PENDIENTE` ignorando el valor del request (RN05). En `update()` sí se respeta el request. Aplicado en Task 7.1 commit 0881d59. Fix cubierto por test.

### NA-010
El plan de Fase 2.A (`docs/superpowers/plans/2026-11-03-iteracion-2-fase-2a-backend.md`) tiene 2 citas imprecisas:
1. Línea 373 y 560: dice "Caso B" para el desglose `/1.105` (RI + FINAL), pero el Anexo II v1.1 §3.1 define ese caso como "Caso C". Caso B es RI + NETO.
2. Línea 580: cita "R-083" como ruling existente, pero RULINGS.md terminaba en R-082 al momento de escribir el plan. R-083 es un candidato que se formaliza en Task 9.
Ambas citas deben corregirse en una futura revisión del plan o dejarse anotadas como deuda documental.

### NA-011
Los reportes narrativos de Antigravity (§3, §11 del reporte de cada task) tienen ruido del 10-20%:
- Task 0: reportó "enum TipoOperacion (CON_RETORNO, A_TERMINO...)" — alucinación del siguiente paso.
- Task 4: reportó R-078 y R-079 con contenido incorrecto.
- Task 7.2: reportó "enum Circuito y EstadoOperacion" (los reales son ModalidadCircuito y EstadoLiquidacion); reportó "OffsetDateTime" (el código usa LocalDateTime); reportó "Task 8 = Tests de Integración Testcontainers" (Task 8 es migración /api/v1/clientes).
Regla operativa: los commits reales (verificables con `git show` y `Select-String` en archivos) son la fuente de verdad. Los reportes narrativos requieren verificación cruzada siempre.

---

## Historial de Cambios

| Fecha | Autor / Agente | Tipo de Cambio | Descripción |
|---|---|---|---|
| 2026-09-14 | Antigravity + Usuario | Creación inicial | Consolidación canónica de R-001..R-016 y NA-001..NA-003 a partir de `progress.md` y auditoría externa. |
| 2026-09-14 | Antigravity + Usuario | Actualización | Incorporación de R-017 y actualización de R-012 tras verificación de Docker Desktop y 21/21 tests pasando. |
| 2026-09-15 | Antigravity + Usuario | Actualización | Incorporación de R-018..R-051 y NA-004..NA-006, actualización de NA-003 tras finalización de Fase B (Frontend UI Clientes). |
| 2026-09-15 | Antigravity + Usuario | Actualización | Incorporación de R-052..R-055 tras borrado de rama feature y cierre formal de Fase B. |
| 2026-10-31 | Antigravity + Usuario | Actualización | Incorporación de R-056..R-064 desde decisiones del 15/09 (transcript_full.jsonl) y del 31/10 (chat). Corrección del audit report del 30/10. |
| 2026-10-31 | Antigravity + Usuario | Actualización | Incorporación de R-065..R-068 desde decisiones del 31/10. R-065 y R-068 aplicados en commit f5c0e46; R-066 y R-067 aprobados como forward-looking. |
| 2026-11-03 | Antigravity + Usuario | Actualización | Incorporación de R-069..R-081 tras entrevista con Papá del 03/11 (D-07 a D-14) y aprobación de las 12 decisiones técnicas de Tipo B (B1 a B12). Actualización de Requerimientos a v3.2 y Anexo II a v1.1. |
| 2026-11-03 | Antigravity + Usuario | Actualización | Incorporación de R-082 (las 3 fuentes de verdad de Iteración 2), publicación de `docs/superpowers/research/DECISIONES-NEGOCIO.md` sanitizado (R-066) y ajuste de `total_a_cobrar_comprador` en Anexo II §4 y RF06 (sobre base commit 640fa5a). |
| 2026-11-03 | Antigravity + Usuario | Actualización | Incorporación de R-083..R-089 y NA-007..NA-011 tras cierre de Fase 2.A (Tasks 0-8). Total 89 rulings, 11 notas de auditoría. |