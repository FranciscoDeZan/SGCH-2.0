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

---

## Historial de Cambios

| Fecha | Autor / Agente | Tipo de Cambio | Descripción |
|---|---|---|---|
| 2026-09-14 | Antigravity + Usuario | Creación inicial | Consolidación canónica de R-001..R-016 y NA-001..NA-003 a partir de `progress.md` y auditoría externa. |
| 2026-09-14 | Antigravity + Usuario | Actualización | Incorporación de R-017 y actualización de R-012 tras verificación de Docker Desktop y 21/21 tests pasando. |
| 2026-09-15 | Antigravity + Usuario | Actualización | Incorporación de R-018..R-051 y NA-004..NA-006, actualización de NA-003 tras finalización de Fase B (Frontend UI Clientes). |