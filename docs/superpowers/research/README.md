# Research — Material de investigación de SGCH 2.0

Este directorio separa material técnico **versionado** del material crudo de negocio
que contiene datos sensibles (nombres de clientes, márgenes, menciones a evasión,
audios de entrevistas). Git solo debe ver la capa sanitizada.

## Estructura

- `2026-10-30-auditoria-carpeta.md` — Auditoría técnica del working tree (tracked, sin datos sensibles).
- `DECISIONES-NEGOCIO.md` — Resumen accionable de decisiones (futuro, sanitizado, sin citas literales).
- `raw/` — **GITIGNORED**. Material crudo. No se sube a GitHub (ver R-065, R-066, R-067).

## Contenido de `raw/` (no en git)

- `audios-y-transcripciones/` — Entrevista completa, relevamiento WhatsApp, auditoría técnica con citas, audios `.ogg`.
- `VISION.md` — Visión original de producto (07/07).
- `SGCH Resumido.docx` — Resumen de negocio en Word (08/09).
- `clientes.jpeg`, `operaciones agregados.jpeg` — Capturas de la planilla actual con datos de clientes.

## Backup

`raw/` **no tiene backup en git**. El respaldo se hace con archivo encriptado externo
(7-Zip AES-256 → OneDrive/Drive privado) mensual o al cierre de cada iteración.
Último backup: 31/10/2026
## Acceso por agentes de IA

Antigravity y otros agentes leen `raw/` directamente del filesystem. No hay nada
que configurar: los archivos existen en disco, simplemente no viajan por git.

## Ver R-065, R-066, R-067
