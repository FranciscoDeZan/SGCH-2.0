# Auditoría completa — `C:\Users\frans\Desktop\SGCH 2.0`

**Fecha:** 2026-10-30 15:44 · **Modo:** solo lectura (no se commiteó, pusheó, modificó, borró, movió ni renombró nada) · **HEAD:** `69bd52f`

> [!IMPORTANT]
> **Correcciones a la auditoría anterior:**
> 1. Dije que `main` tenía tracking contra `origin/main`. **Es falso:** `main` **no tiene upstream configurado** (no existe `branch.main.remote` en `.git/config`; `git status` y `git branch -vv` no muestran tracking). Los hashes coinciden, pero solo porque se pushea explícitamente con `git push origin main`.
> 2. Dije que `.superpowers/sdd/` estaba sano. Hay **un archivo con encoding roto**: `migracion-boot4/progress.md` no es UTF-8 válido (ver §E).
>
> Los caracteres raros (`Ã³`, `�`) que se vieron en la auditoría anterior al leer `.md` venían de la consola PowerShell 5, no de los archivos. Salvo el `progress.md` mencionado, todos los archivos trackeados son UTF-8 válido.

---

## A. Mapa general

| Ruta | Tipo | Archivos | Tamaño | En git | Nota |
|---|---|---:|---:|---|---|
| `.git/` | metadata git | 548 | 1,97 MB | — | 515 objetos sueltos, 0 packs, `fsck` limpio |
| `.superpowers/` | docs SDD | 5 | 0,06 MB | ✅ los 5 | |
| `backend/` | código Java | 42 | 0,21 MB | 18 | 24 son `target/` (ignorado) |
| `docs/` | specs y planes | 4 | 0,06 MB | ✅ los 4 | |
| `frontend/` | código React | 5.873 | 123,58 MB | 35 | 5.834 son `node_modules/` (123,15 MB), 4 son `dist/` |
| `miscellanoeus/` | material de soporte | 25 | 3,14 MB | ❌ ninguno | ignorada en bloque por `.gitignore` |
| raíz (archivos sueltos) | config/docs | 6 | 0,43 MB | 5 | `maven-debug.log` ignorado |
| **Total** | | **~6.503** | **~129,5 MB** | **67** | 95% del peso es `node_modules` |

**Estado de cada archivo físico (excluyendo `.git`, `node_modules`, `target`, `dist`):** 93 archivos = **67 trackeados** + **26 ignorados** + **0 untracked** + **0 trackeados que falten en disco**.

**Carpetas vacías:** `frontend/src/assets/` (git no la versiona por estar vacía; resto del scaffold de Vite).

---

## B. Estado git

| Ítem | Valor |
|---|---|
| Remote | `origin` → `https://github.com/FranciscoDeZan/SGCH-2.0.git` (fetch/push) |
| HEAD local / `origin/main` | `69bd52f` — 2026-09-15 17:55 — `docs(requirements): add Anexo II fiscal model, bump reqs to v3.1` (idénticos) |
| Adelante / atrás | `0 / 0` |
| Rama actual | `main` — ⚠️ **sin upstream** |
| Ramas locales | `main`, `feat/migracion-spring-boot-4` (`dba61e3`, upstream `origin/feat/migracion-spring-boot-4`, **ya mergeada** en `main`) |
| Ramas remotas | `origin/main`, `origin/HEAD → origin/main`, `origin/feat/migracion-spring-boot-4` |
| Stash | 0 |
| Working tree | limpio (0 modificados, 0 staged, 0 untracked) |
| Hooks activos | ninguno (solo `.sample`) |
| `.gitattributes` | **no existe** |
| Integridad | `git fsck` sin errores ni objetos huérfanos reportados |
| Reflog | lineal; único `--amend` registrado es el del Toast (`50d5540`), sin duplicados en la historia |

**Último commit que tocó cada área:**

| Área | Commit | Fecha |
|---|---|---|
| `backend/src`, `backend/pom.xml` | `87346f8` upgrade a Spring Boot 4.1.1 | 2026-09-14 |
| `frontend/src` | `9543c08` remove unreachable fallback | 2026-09-15 |
| `frontend/package.json` | `9a5d1fb` add ClienteForm (desinstala axios) | 2026-09-14 |
| `docs/` | `69bd52f` Anexo II + v3.1 | 2026-09-15 |
| `.superpowers/` | `ac5d091` R-052..R-055 | 2026-09-15 |
| `README.md`, `AGENTS.md`, `docker-compose.yml`, `.env.example`, `.gitignore` | `1c0b2d3` initial release | 2026-09-14 — **sin cambios desde el primer commit** |

---

## C. Inventario archivo por archivo

### C.1 Raíz

| Archivo | Git | Tamaño | Contenido / estado |
|---|---|---:|---|
| `.env.example` | ✅ | 3 líneas | `DB_HOST=localhost`, `DB_USER=root`, `DB_PASSWORD=root` — ⚠️ no coincide con los defaults de `application.yml` (ver §G) |
| `.gitignore` | ✅ | 8 reglas | `backend/target/`, `frontend/node_modules/`, `frontend/dist/`, `.idea/`, `.vscode/`, `*.log`, `.env`, `miscellanoeus/` |
| `AGENTS.md` | ✅ | 2,8 KB | Reglas "Lazy Senior Dev" + 2 reglas del proyecto (ProblemDetail RFC 7807; DTOs desde Iteración 2) |
| `README.md` | ✅ | 7 líneas | Desactualizado: no menciona Spring Boot 4, Testcontainers/Docker para tests, `mvnw`, `npm test`, ni MySQL nativo (R-012 Opción D) |
| `docker-compose.yml` | ✅ | 0,4 KB | MySQL 8.0, solo usuario `root/root`, DB `sgch_db`, healthcheck |
| `maven-debug.log` | 🚫 ignorado | 425 KB | Log de debug de Maven del 14/09 02:23 (Maven 3.9.16, JDK 17.0.19). Residuo |

### C.2 `backend/` (18 trackeados)

| Grupo | Archivos |
|---|---|
| Build | `pom.xml` (Boot **4.1.1**, Java **17**, Testcontainers BOM **2.0.5**; starters webmvc, data-jpa, validation, flyway + flyway-mysql, mysql-connector-j, lombok; test: starter-test, webmvc-test, data-jpa-test, spring-boot-testcontainers, testcontainers-junit-jupiter, testcontainers-mysql), `mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties` (wrapper 3.3.4 → Maven 3.9.16) |
| Main (9 clases, 370 líneas) | `SgchApplication`, `config/WebConfig`, `controller/ClienteController` (77), `exception/GlobalExceptionHandler` (64), `exception/ResourceNotFoundException`, `model/Cliente` (64), `model/CalificacionCliente`, `repository/ClienteRepository`, `service/ClienteService` (93) |
| Recursos | `application.yml` (14 líneas, todo por env var con defaults dev), `db/migration/V1__Create_clientes_table.sql` (única migración) |
| Tests (21 `@Test`) | `ClienteControllerTest` (9), `ClienteRepositoryTest` (3, Testcontainers), `ClienteServiceTest` (9) |
| `target/` 🚫 | 24 archivos: 9 `.class` main (14/09 12:37), 3 `.class` test (14/09 23:00), surefire: **9 + 3 + 9 = 21 tests, 0 fallos, 0 errores, 0 skipped** |

### C.3 `frontend/` (35 trackeados)

| Grupo | Archivos |
|---|---|
| Config | `package.json`, `package-lock.json` (114 KB), `vite.config.ts` (proxy `/api → :8080`, vitest jsdom), `tsconfig.json` / `.app.json` / `.node.json`, `tailwind.config.js`, `postcss.config.js`, `.oxlintrc.json`, `.gitignore` (template Vite), `index.html`, `README.md` (**boilerplate del template de Vite**, no describe el proyecto) |
| `public/` | `favicon.svg` |
| `src/` (22 archivos) | ver tabla abajo |
| `dist/` 🚫 | 4 archivos (15/09 00:34), coherente con el último commit de frontend |
| `node_modules/` 🚫 | 5.834 archivos, 123 MB (instalado 14/09 22:53) |
| Vacía | `src/assets/` |

**Stack declarado:** React 18.3, TypeScript ~6.0, Vite 8.3, Vitest 5, Tailwind 3.4, Testing Library 16, jsdom 30, oxlint 1.81. Sin axios (desinstalado en Task 5).

| Módulo | Componente (líneas) | Test (casos) |
|---|---|---|
| raíz | `App.tsx` (10), `main.tsx` (10), `index.css` (3), `setupTests.ts` (1) | `App.test.tsx` (1) |
| `api/` | `client.ts` (76) | `client.test.ts` (14) |
| `components/clientes/` | `ClienteDetail` (150), `ClienteForm` (456), `ClienteList` (95), `MobileCopilot` (340) | 8 · 16 · 5 · 14 |
| `components/layout/` | `AppLayout` (14) | 1 |
| `components/ui/` | `Toast` (51) | 4 |
| `pages/` | `ClientesPage` (139) | 12 |
| `types/` | `cliente.ts` (17) | — |

**Conteo estático:** 75 casos frontend + 21 backend = **96**, coincide con lo declarado. No hay `.skip`, `.only`, `@Disabled`, `FIXME` ni `console.log`. (No ejecuté los tests porque escriben en `target/`.)

### C.4 `docs/superpowers/` (4 trackeados)

| Archivo | Estado |
|---|---|
| `specs/DOCUMENTO DE REQUERIMIENTOS - SGCH v2.md` | **Canónico v3.1** (27 KB) |
| `specs/ANEXO-II-Modelo-Calculo-Fiscal.md` | Vigente, con 2 `[TODO]` (Cuenta Vendedor / Cuenta Comprador) y §6 pendiente |
| `specs/2026-09-13-sgch-v2-design.md` | **Obsoleto** (Spring Boot 3, IVA viejo); la auditoría externa del 30/10 lo marca como fuente de la Contradicción 3 |
| `plans/2026-09-13-iteracion-1-fundamentos.md` | Plan de Iteración 1, cerrado. **No hay plan de Iteración 2** |

### C.5 `.superpowers/sdd/` (5 trackeados, todos coinciden con disco)

| Archivo | Modificado | Estado |
|---|---|---|
| `frontend-ui-clientes/progress.md` | 15/09 00:33 | Ledger Fase B, Tasks 1–8 completas + 3 deudas post-MVP registradas |
| `migracion-boot4/progress.md` | 14/09 15:04 | ⚠️ **No es UTF-8 válido** (18 líneas con bytes inválidos) + **EOL mezclados** (9 CRLF / 54 LF) |
| `migracion-boot4/REPORT.md` | 15/09 00:33 | Vigente (Step 2 + Fase B) |
| `migracion-boot4/REPORT-20260914-1345.md` | 14/09 15:04 | Snapshot viejo; difiere del vigente en +62/−19 líneas; único archivo con **BOM UTF-8** |
| `migracion-boot4/RULINGS.md` | 15/09 00:40 | Termina en **R-055** + NA-001..NA-006 |

### C.6 `miscellanoeus/` (25 archivos, **ninguno en git**)

| Fecha | Archivo | Tamaño | Naturaleza |
|---|---|---:|---|
| 07/07 | `VISION.md` | 5,6 KB | Visión de producto original |
| 18/07 | `clientes.jpeg`, `operaciones agregados.jpeg` | 69 + 136 KB | Capturas de la planilla actual |
| 08/09 | `SGCH Resumido.docx` | 593 KB | Resumen en Word |
| 13/09 | `DOCUMENTO DE REQUERIMIENTOS - SGCH v2 (Revisado y Consolidado)  deprecated.md` | 22 KB | Requerimientos deprecados (doble espacio en el nombre) |
| 13/09 | `prompt-guia-antigravity-skills.md`, `informe-sgch-v2-stack-y-herramientas.md`, `respuesta Deepseek.md` | 8–18 KB | Prompts y respuestas de LLM |
| 13/09 | `Api key .txt` | 43 B | 🔐 **Clave de API de Context7 en texto plano** |
| 14/09 | `revision-iteracion-1-sgch-v2.md` | 6,6 KB | Revisión de Iteración 1 |
| 15/09 | `prompt Auditoria final llm.md` | 17,7 KB | Prompt de auditoría |
| 15/09 | `DOCUMENTO DE REQUERIMIENTOS - SGCH v2.pdf` | 1,2 MB | PDF de requerimientos (versión sin determinar) |
| 29/10 | `audios y transcripciones/` → 10 audios `.ogg` (5 del 15/09, 5 del **28/10**) | 1 MB | Respuestas de operadores (Santi, Juan) |
| 29/10 | `transcripci_n_completa_de_entrevista_agropecuaria.md` | 55 KB / 619 líneas | Entrevista completa, consultas D01–D19 |
| 29/10 | `relevamiento_whatsapp_reglas_impositivas_y_operativas.md` | 13 KB / 178 líneas | Bloque 1 (15/09: IVA, comisión, operaciones mixtas) + **Bloque 2 (28/10: P1–P4 → facturación de comisión, retenciones Ganancias/IIBB, flete, descalce de pagos)** |
| **30/10 15:14** | `auditoria_tecnica_y_documento_de_requisitos_trazable_sgch_2_0.md` | 122 KB / 582 líneas | Auditoría externa de hoy: 8 entidades inferidas (`Liquidacion`, `CuotaOperacion`, `Cobro`/`Pago`, `CuentaCorriente`, `Gasto`, `Interaccion`…), **10 contradicciones** contra v3.1/Anexo II, bloqueantes de Iteración 2 |

---

## D. Seguridad

| Chequeo | Resultado |
|---|---|
| `.env` real en disco | No existe |
| `*.key`, `*.pem`, `credentials*`, `secret*`, `token*` | Ninguno |
| Secretos trackeados en git | **Ninguno real.** Solo defaults de dev: `application.yml` (`sgch`/`sgch_dev`), `docker-compose.yml` y `.env.example` (`root`/`root`), plan de Iteración 1 (`root`), y `[REDACTED]` en REPORT/RULINGS. `progress.md` de migracion-boot4 muestra `sgch_dev` sin redactar (es solo el default de dev, pero rompe la convención de los otros docs) |
| Secretos fuera de git | 🔐 `miscellanoeus/Api key .txt` — clave real de Context7. Protegida de git solo por la regla `miscellanoeus/` |
| Archivos generados en git | Ninguno (`target/`, `node_modules/`, `dist/` → 0 trackeados) |

---

## E. Encoding y finales de línea

| Archivo | Problema |
|---|---|
| `.superpowers/sdd/migracion-boot4/progress.md` | **No es UTF-8 válido** (probablemente partes guardadas en ANSI/CP1252 por PowerShell, coherente con NA-002) + EOL mezclados. Se ve con acentos rotos en GitHub |
| `.superpowers/sdd/migracion-boot4/REPORT-20260914-1345.md` | Tiene BOM (es inofensivo, pero distinto al resto) |
| `backend/mvnw.cmd`, `maven-wrapper.properties` | CRLF (correcto para `.cmd`) |
| Resto (63 archivos) | UTF-8 sin BOM, LF |

Sin `.gitattributes` ni `core.autocrlf` local, la normalización de EOL depende de la config de cada máquina.

---

## F. Coherencia entre docs y realidad

| Lo que dice el proyecto | Lo que hay en el árbol | Severidad |
|---|---|---|
| R-055: borrar ramas feature después del merge fast-forward | `feat/migracion-spring-boot-4` sigue viva local y remota (ya mergeada) | Media |
| Push a `main` sincronizado | `main` sin upstream; funciona solo con push explícito | Baja |
| 9 decisiones tomadas en chats del 15/09 y 31/10 (BigDecimal dinero/kg, PK UUID para Operacion/Cobro, BigDecimal coordenadas, UI Operaciones I2, Cobro en tabla separada, frontend Opción C /api/v1, backend /api/v1 en paralelo, migración V2 única, Testcontainers solo repos) | `RULINGS.md` termina en R-055 y no las registra. Ahora documentadas como R-056..R-064. Los IDs R-061..R-077 citados en prompts del 15/09 son alucinaciones de cita | **Alta** |
| R-054: "No dejar TODOs activos" | `backend/.../ClienteService.java:68` → `// TODO(Iteración 2): Resolver copia de campos con DTOs…` (es deuda planificada, pero contradice la letra del ruling) | Baja |
| Anexo II §4: Capa 3 "pendiente de respuesta de Santiago" | Hay respuestas del **28/10** y una auditoría del **30/10** en `miscellanoeus/`, **fuera de git** y no incorporadas a v3.1/Anexo II. Las respuestas del 28/10 tratan retenciones, flete y descalce; **no traen fórmulas explícitas** para Cuenta Vendedor/Comprador, pero son insumo directo | **Alta** |
| R-012 Opción D: MySQL nativo para dev, Docker solo para Testcontainers | `README.md` indica `docker compose up -d` como primer paso | Media |
| Credenciales DB de dev | `.env.example` = `root/root`; `docker-compose.yml` crea solo `root`; `application.yml` usa por defecto `sgch/sgch_dev`. Con docker-compose y sin variables de entorno, el backend falla al conectar. Además Spring no lee `.env` solo | Media |
| Encabezado de v3.1: "Reemplaza a `DOCUMENTO DE REQUERIMIENTOS - SGCH v2.md`" | El propio archivo canónico tiene **ese mismo nombre** (auto-referencia confusa) | Baja |
| Docs obsoletos fuera de `specs/` | `2026-09-13-sgch-v2-design.md` sigue en `specs/` junto a los canónicos | Media |

---

## G. Hallazgos menores

- `frontend/index.html` tiene `lang="en"` en una app en español (afecta lectores de pantalla y el corrector del navegador).
- `tailwindcss`, `postcss` y `autoprefixer` están en `dependencies` en vez de `devDependencies` (no afecta el bundle; es cosmético).
- `package.json`: `"name": "frontend"`, `"version": "0.0.0"` (valores del template).
- `frontend/README.md` es el boilerplate de Vite.
- `frontend/src/assets/` vacía.
- La carpeta `miscellanoeus` tiene un error de tipeo (debería ser *miscellaneous*); el `.gitignore` usa la misma grafía, así que hoy funciona.
- Doble espacio en `… (Revisado y Consolidado)  deprecated.md`.
- `.git` con 515 objetos sueltos y sin packs: inofensivo, `git gc` lo compacta.
- Los artefactos de build (`target/`, `dist/`) son coherentes con el último código commiteado; nada desfasado.

---

## H. Recomendaciones (no se ejecutó ninguna)

**Prioridad alta**
1. **Decidir qué hacer con el material nuevo de negocio.** `relevamiento_whatsapp…md`, `transcripci_n_completa…md` y `auditoria_tecnica…md` son hoy la única fuente de las respuestas del 28/10 y de las 10 contradicciones, y **no tienen backup en git**. Opciones: moverlos a `docs/superpowers/research/` y trackearlos, o al menos dejar un respaldo fuera de la máquina. Los `.ogg` pueden seguir ignorados.
2. **Volcar R-056..R-064 a `RULINGS.md`** antes de escribir el plan de Iteración 2. (Hecho en commit ca2be3a.)
3. **Clave de Context7:** pasarla a una variable de entorno o a un gestor de secretos, borrar `Api key .txt` y rotarla si alguna vez estuvo fuera de esta máquina.

**Prioridad media**
4. Borrar `feat/migracion-spring-boot-4` (local + remota), según R-055.
5. `git branch --set-upstream-to=origin/main main`.
6. Unificar las credenciales de dev (`.env.example` ↔ `application.yml` ↔ `docker-compose.yml`) y actualizar `README.md` según R-012 (MySQL nativo + Docker para tests, `mvnw`, `npm test`).
7. Mover `2026-09-13-sgch-v2-design.md` y el plan de Iteración 1 a `docs/superpowers/archive/`.
8. Re-guardar `migracion-boot4/progress.md` como UTF-8 con LF.

**Prioridad baja**
9. Borrar `maven-debug.log`.
10. Borrar `REPORT-20260914-1345.md` (la historia ya queda en git).
11. Agregar un `.gitattributes` mínimo (`* text=auto eol=lf`, `*.cmd eol=crlf`).
12. `index.html` → `lang="es"`; reemplazar `frontend/README.md`; renombrar el canónico a algo como `REQUERIMIENTOS-SGCH-v3.md` para cortar la auto-referencia (esto toca links en RULINGS y prompts, así que hay que coordinarlo).
