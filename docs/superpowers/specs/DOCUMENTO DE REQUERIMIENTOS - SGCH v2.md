# DOCUMENTO DE REQUERIMIENTOS - SGCH v2
**Sistema de Gestión para Consignatarios de Haciendas**

**Versión:** 3.0 (unificada, canónica)
**Fecha:** 2026-09-15
**Autor:** Francisco De Zan (con auditoría técnica asistida)
**Estado:** CANÓNICA. Reemplaza a:
- `DOCUMENTO DE REQUERIMIENTOS - SGCH v2.md` (deprecado, numeración RF01-RF19)
- `DOCUMENTO DE REQUERIMIENTOS - SGCH v2 (Revisado y Consolidado).md` (deprecado, numeración RF01-RF20)

Cualquier referencia a "RF-XX" en prompts, código, tests o rulings se resuelve contra **este** documento.

---

## 1. INTRODUCCIÓN Y OBJETIVO

### 1.1. Propósito
Este documento define los requisitos funcionales y no funcionales para la versión 2 del Sistema de Gestión para Consignatarios de Haciendas (SGCH). Es la **única fuente de verdad** para el equipo de desarrollo, los usuarios finales (operadores: padre y hermanos del autor) y cualquier otro stakeholder. Su objetivo es asegurar que el producto final satisfaga las necesidades reales del negocio.

### 1.2. Alcance del Sistema
El SGCH v2 es una aplicación de gestión comercial integral diseñada para centralizar y automatizar los procesos operativos de una consignataria de haciendas del NEA argentino. El sistema abarcará:

- Gestión completa de clientes (compradores y vendedores).
- Registro detallado de operaciones de compra y venta.
- Seguimiento comercial con historial de interacciones y alertas inteligentes.
- Inteligencia de negocio básica para conectar ofertas y demandas (matchmaking).
- Dashboards, reportes y visualizaciones para la toma de decisiones.

### 1.3. Objetivos del Negocio
- **Centralización:** Eliminar la dependencia de planillas Excel y notas en papel, unificando la información en una base de datos única.
- **Automatización del Seguimiento:** Reducir la pérdida de oportunidades comerciales mediante alertas y recordatorios automáticos.
- **Inteligencia Comercial:** Proveer herramientas para que los operadores identifiquen y conecten compradores y vendedores potenciales de forma proactiva.
- **Eficiencia Operativa:** Disminuir el tiempo dedicado a tareas de coordinación manual y telefónica.

### 1.4. Ancla del Proyecto
Este sistema **no es un ejercicio académico**. Maneja plata real de una familia real, con más de 20 años de trayectoria y más de 200 clientes activos. Cada decisión técnica se evalúa contra un objetivo único: **que funcione, que sea simple, y que resuelva un problema real** para operadores con baja alfabetización digital.

---

## 2. DESCRIPCIÓN GENERAL

### 2.1. Perspectiva del Producto
El SGCH v2 evoluciona de un prototipo académico (v1) a una herramienta de uso diario. Se implementa como **aplicación web responsiva** (PC + móvil), con arquitectura que permita su escalabilidad futura.

### 2.2. Supuestos y Dependencias
- **Supuestos:**
  - Los operadores tendrán acceso a internet estable.
  - La base de clientes inicial (≈200 registros) será saneada manualmente antes de la carga masiva.
- **Dependencias:**
  - La UI se basa en el modelo mental de una planilla de cálculo (tablas, filtros, ordenamiento). **Esto es un requisito, no una sugerencia.**
  - El sistema no depende de APIs externas de precios en esta fase (los precios de referencia se cargan manualmente — ver RF16).
  - El sistema no emite facturas ni DT-e; eso se gestiona externamente con ARCA/SIXA (ver RN01).

### 2.3. Actores del Sistema
- **Operador (Usuario Principal):** Gestiona clientes, registra operaciones, consulta resúmenes y recibe alertas. Uso intensivo diario. Baja alfabetización digital.
- **Administrador (Dueño/Encargado):** Accede a todos los reportes y dashboards para decisiones estratégicas. Puede realizar las mismas tareas que un operador.
- **Sistema (Proceso Automático):** Ejecuta tareas programadas: generación de alertas de inactividad, resumen diario de contactos, detección de "no vendido".

---

## 3. REQUERIMIENTOS FUNCIONALES (RF)

### 3.1. Módulo 1: Gestión de Clientes

| **ID** | **Requerimiento** | **Descripción y Criterios de Aceptación** |
| :--- | :--- | :--- |
| **RF01** | **Alta, Baja y Modificación de Clientes** | CRUD completo de clientes (compradores y vendedores).<br>**Obligatorios:** Nombre/Razón Social, Teléfono, Ubicación (dirección).<br>**Opcionales:** Email, Calificación (A/B/C), Tipo de Hacienda, Formas de Pago Preferidas, Observaciones.<br>**Criterio:** El cliente se almacena y es buscable inmediatamente. Se valida que el teléfono no esté duplicado. |
| **RF02** | **Georreferenciación de Campos** | Integración de mapa interactivo (Google Maps u OpenStreetMap).<br>**Funcionalidad:** El operador marca la ubicación exacta del campo al alta/edición. La ficha muestra un mapa con la ubicación. Vista agregada: mapa con todos los clientes georreferenciados.<br>**Criterio:** Se almacenan latitud y longitud. El mapa es visible y la ubicación es precisa. |
| **RF03** | **Historial Completo del Cliente** | La ficha del cliente es un **hub de información** con secciones/pestañas:<br>- **Operaciones:** Listado de compras y ventas, con filtros por fecha, categoría y monto.<br>- **Llamadas/Seguimiento:** Historial completo de interacciones.<br>- **Estado Financiero:** Resumen de montos a cobrar y a pagar, con alertas de vencimiento.<br>**Criterio:** Toda la información del cliente es accesible desde una única pantalla. |
| **RF04** | **Clasificación de Cliente por Estado** | El sistema diferencia y muestra claramente:<br>- **Activo:** Con operaciones recientes.<br>- **Inactivo:** Sin operaciones en los últimos 180 días (RN03).<br>- **No Vendido:** No ha **comprado** en un período configurable (ej. 6 meses), pero puede haber vendido.<br>**Criterio:** El estado se muestra en la ficha del cliente y se puede usar como filtro. |

### 3.2. Módulo 2: Gestión de Operaciones

| **ID** | **Requerimiento** | **Descripción y Criterios de Aceptación** |
| :--- | :--- | :--- |
| **RF05** | **Registro Detallado de Operaciones** | Registro de operaciones de compra y venta con los campos del Anexo I (Modelo de Datos). Incluye:<br>- **Datos Generales:** Fecha de carga, Comprador, Vendedor, Categoría (faena/invernada/reproducción), Subcategoría.<br>- **Datos Económicos:** Kilogramos, Precio por kg, Tipo de Precio (más IVA / final), Porcentaje Facturado, Comisión, Forma de Pago, Plazo.<br>- **Detalle de la Carga:** Raza, Color, Puntuación, Destino, Cantidad de Machos/Hembras, Terneros, Observaciones.<br>**Criterio:** La operación se registra, se vincula a los clientes y actualiza sus historiales. RN02 (carga diferida) aplica. |
| **RF06** | **Cálculo Automático de IVA y Precios** | **Funcionalidad clave.** Si el tipo de precio es "más IVA", el sistema solicita el **porcentaje facturado** (ej. 60%) y calcula:<br>- Subtotal = kg × precio/kg<br>- IVA = subtotal × 21% × (porcentaje facturado / 100)<br>- Precio Final = subtotal + IVA<br>Si el precio es "final", muestra el desglose (subtotal + IVA) para transparencia.<br>**Criterio:** El sistema muestra siempre el desglose completo del precio. |
| **RF07** | **Copiar Operación (Campo a Campo)** | Al registrar una nueva operación, el operador puede seleccionar una operación anterior y **copiar automáticamente todos sus datos** (clientes, categoría, raza, etc.) en el nuevo formulario, para luego solo modificar lo necesario. Botón explícito "Copiar de operación".<br>**Criterio:** El formulario se autocompleta con los datos de la operación seleccionada. |
| **RF08** | **Desagregar Operaciones por Cliente** | En la ficha del cliente, todas sus operaciones se listan con columnas: fecha, tipo (compra/venta), categoría, kg, precio, monto total, estado de liquidación. Filtros por fecha, categoría, rango de monto. Paginada, ordenable y exportable.<br>**Criterio:** El operador puede ver y analizar rápidamente el historial de operaciones de un cliente. |
| **RF09** | **Gestión de Estados de Liquidación y Cobranzas** | El sistema permite registrar **pagos parciales** de una operación. Al hacerlo, actualiza automáticamente:<br>- Saldo Pendiente.<br>- Estado de Liquidación (Pendiente / Parcialmente pagado / Liquidado — RN06).<br>**Criterio:** Se genera una alerta cuando un pago está próximo a vencer o vencido. El estado financiero es visible en el dashboard y en la ficha del cliente. |

### 3.3. Módulo 3: Seguimiento y Llamadas

| **ID** | **Requerimiento** | **Descripción y Criterios de Aceptación** |
| :--- | :--- | :--- |
| **RF10** | **Registro de Interacciones (Llamadas, Reuniones, WhatsApp)** | Registro de cada interacción con un cliente:<br>- Fecha y Hora.<br>- Cliente.<br>- Tipo de Evento (Llamada Entrante, Saliente, Reunión, Mensaje).<br>- Intención (Compra, Venta, Cotización, Seguimiento, Otra).<br>- Características de la Tropa charlada (raza, kg, cantidad).<br>- Detalle/Observaciones.<br>**Criterio:** El registro queda asociado al cliente y es visible en su historial. Filtrable por tipo de evento, fecha e intención. |
| **RF11** | **Resumen Diario de Contactos ("A quién llamar")** | Generación automática, **antes de las 8:00 AM**, de un listado priorizado de clientes a contactar en el día. Criterios:<br>- Alertas de inactividad (>180 días — RN03).<br>- Recordatorios de ciclos de venta configurados.<br>- Seguimientos pendientes (ej. "confirmar oferta").<br>**Criterio:** El operador ve este resumen como primer elemento al ingresar. Cada ítem incluye cliente, motivo, teléfono y sugerencia de oferta. |
| **RF12** | **Frecuencia de Llamadas y Última Conversación** | En la ficha del cliente, mostrar de forma prominente:<br>- Fecha de la última llamada.<br>- Resumen de la última conversación.<br>- Indicador de frecuencia (ej. "último contacto hace 45 días").<br>**Criterio:** El operador sabe en segundos cuándo fue el último contacto y qué se habló, sin buscar en el historial. |

### 3.4. Módulo 4: Inteligencia Comercial (Matchmaking)

| **ID** | **Requerimiento** | **Descripción y Criterios de Aceptación** |
| :--- | :--- | :--- |
| **RF13** | **Sugerencia de Compradores para una Tropa** | Al registrar una operación de venta (o una tropa disponible), el sistema analiza el historial de compras de todos los clientes y **sugiere automáticamente** posibles compradores. Criterios de match:<br>- Categorías y razas similares.<br>- Rangos de peso (kg).<br>- Preferencias registradas (ej. destino).<br>**Criterio:** Se muestra lista de compradores con **porcentaje de coincidencia** (ej. "85%"). Agiliza la venta. |
| **RF14** | **Sugerencia de Ofertas para un Comprador** | Al consultar la ficha de un cliente comprador, mostrar sección de **"Ofertas Sugeridas"** con tropas disponibles (operaciones de venta activas) que coincidan con su historial y preferencias. Incluye detalles: categoría, kg, precio, ubicación.<br>**Criterio:** El operador puede ofrecer proactivamente sin buscar manualmente entre todas las operaciones. |
| **RF15** | **Motor de Búsqueda Avanzada** | Búsqueda de clientes y operaciones combinando múltiples filtros:<br>- **Ubicación:** Zona, provincia, distancia desde un punto.<br>- **Tipo de Hacienda:** Raza, categoría, rango de kg.<br>- **Historial:** Fechas de compra, montos, frecuencia.<br>- **Calificación del Cliente.**<br>**Criterio:** Resultados en <3 segundos. Exportables. |

### 3.5. Módulo 5: Dashboards y Reportes

| **ID** | **Requerimiento** | **Descripción y Criterios de Aceptación** |
| :--- | :--- | :--- |
| **RF16** | **Dashboard de Indicadores Clave (KPIs)** | Panel visual interactivo con:<br>- **Gráfico de Barras:** Operaciones del mes (cantidad y monto total).<br>- **Gráfico Circular:** Clientes activos vs. inactivos.<br>- **Tarjeta de Comisiones:** Total generado en el mes.<br>- **Panel de Alertas:** Inactividad, pagos vencidos, seguimientos pendientes.<br>- **Precios de Referencia:** Carga manual por categoría (referencia operativa interna, no precios de mercado en vivo).<br>**Criterio:** Los gráficos se actualizan en tiempo real con los datos de la base. Al hacer clic en un gráfico, se accede al detalle. |
| **RF17** | **Reportes Exportables** | Exportación a **Excel y PDF**:<br>- Listado de clientes (con todos sus campos).<br>- Historial de operaciones de un cliente.<br>- Resumen mensual de comisiones.<br>- Reporte de clientes inactivos ("Clientes No Vendidos").<br>- Reporte de cobranzas y saldos pendientes.<br>**Criterio:** Los archivos exportados incluyen el logo de la consignataria y los datos formateados profesionalmente. |

### 3.6. Módulo 6: Alertas y Notificaciones

| **ID** | **Requerimiento** | **Descripción y Criterios de Aceptación** |
| :--- | :--- | :--- |
| **RF18** | **Alertas Automáticas de Inactividad** | Proceso diario que detecta clientes sin operaciones en los últimos 180 días (RN03) y genera alerta con sugerencia de oferta basada en el historial del cliente.<br>**Criterio:** La alerta es visible en el dashboard y en el resumen diario. |
| **RF19** | **Alertas de Cobranzas y Vencimientos** | Generación de alertas cuando:<br>- Un plazo de pago está próximo a vencer (ej. 7 días antes).<br>- Un pago está vencido.<br>- Un cliente tiene saldo pendiente acumulado superior a un umbral configurable.<br>**Criterio:** Las alertas son visibles en el dashboard y en la ficha del cliente. |
| **RF20** | **Alertas de Clientes "No Vendido"** | Identificación de clientes que, aun estando activos, no han **comprado** en un período configurable (ej. 6 meses), y generación de alerta específica "Cliente no vendido".<br>**Criterio:** La alerta se diferencia de la de inactividad y permite seguimiento específico para fomentar la compra. |

---

## 4. REQUERIMIENTOS NO FUNCIONALES (RNF)

### 4.1. Usabilidad (RNF01)
- **Objetivo:** El 90% de las funciones principales (registrar cliente, operación, consultar resumen, buscar, ver dashboard) deben ejecutarse en **≤3 clics** desde la pantalla de inicio.
- **Interfaz:** **Diseño similar a una planilla de cálculo** (tablas, filtros, ordenamiento). Requisito crítico para adopción por operadores con baja alfabetización digital.
- **Acompañamiento gráfico:** Iconos claros (SVG inline, no emojis), flujos guiados, mínimo texto. Prioridad a interfaces gráficas sobre texto.
- **Validación:** Prueba de usabilidad con los 3 operadores representativos. Se medirá el número de clics para completar 10 tareas típicas. Meta: 9/10 tareas cumplen el criterio de clics.

### 4.2. Rendimiento (RNF02)
- **Objetivo:** Tiempo de respuesta <3 segundos para búsquedas y generación de resúmenes con hasta **500 clientes y 5.000 operaciones**. Percentil 95 <3 segundos.
- **Validación:** Pruebas de carga simulando 10 usuarios concurrentes.

### 4.3. Seguridad y Privacidad (RNF03)
- **Objetivo:** Cumplir con la **Ley 25.326 de Protección de Datos Personales**.
- **Restricciones:** **No almacenar datos financieros sensibles** (CBU, cuentas bancarias, claves). El sistema no emite facturas ni DT-e, pero puede almacenar el número de comprobante externo como referencia.
- **Validación:** Auditoría del modelo de datos para confirmar ausencia de campos sensibles. Políticas de acceso documentadas.

### 4.4. Compatibilidad (RNF04)
- **Objetivo:** Últimas dos versiones de **Google Chrome, Mozilla Firefox y Microsoft Edge**, en **escritorio y dispositivos móviles (responsive)**.
- **Validación:** Pruebas manuales de renderizado en los tres navegadores y en dos resoluciones móviles específicas: **390×844** y **768×1024**.

### 4.5. Mantenibilidad (RNF05)
- **Objetivo:** Código versionado en **GitHub**, estructurado en capas (Controller → Service → Repository), documentado con **JavaDoc** en las clases principales.
- **Criterio cuantitativo:** **80% de los métodos públicos de la capa de servicio** deben tener JavaDoc.
- **Validación:** Inspección del repositorio.

### 4.6. Escalabilidad (RNF06)
- **Objetivo:** La arquitectura debe permitir agregar futuros módulos (autenticación de usuarios, integración con APIs de precios, notificaciones push) sin reescribir la lógica de negocio.
- **Validación:** Revisión del diseño para verificar desacoplamiento de capas y uso de interfaces donde aporte valor.

### 4.7. Disponibilidad (RNF07)
- **Objetivo:** Durante las sesiones de validación, el sistema debe estar operativo el **100% del tiempo planificado**, sin fallos que requieran reinicio manual.
- **Validación:** Registro manual de incidentes durante las sesiones de validación.

---

## 5. REGLAS DE NEGOCIO (RN)

| **ID** | **Regla** | **Descripción** |
| :--- | :--- | :--- |
| **RN01** | **Documentación Legal Externa** | El SGCH no genera DT-e ni facturas; eso se maneja con ARCA/SIXA. El sistema solo almacena el número de comprobante como referencia. |
| **RN02** | **Carga en Diferido** | La carga de una operación puede realizarse hasta **2 horas** después del momento real de la transacción. Si supera ese límite, el sistema exige justificación en el campo de observaciones. |
| **RN03** | **Umbral de Inactividad** | Un cliente se considera **inactivo** si no registra operaciones en los últimos **180 días**. |
| **RN04** | **Cálculo de Comisiones** | Las comisiones se calculan como porcentaje del monto total de la operación. El sistema registra quién paga la comisión (comprador o vendedor). |
| **RN05** | **Precio e IVA** | El operador debe indicar si el precio por kg es **"más IVA"** o **"final"**. Si es "más IVA", debe especificar el porcentaje facturado para que el sistema calcule el IVA proporcional. |
| **RN06** | **Estados de Liquidación** | Los estados posibles son: *Pendiente*, *Parcialmente pagado*, *Liquidado*. El sistema actualiza automáticamente el estado al registrar pagos. |

---

## 6. MODELO DE DATOS (Resumen de Campos por Entidad)

### 6.1. Entidad: Cliente

| **Campo** | **Tipo** | **Obligatorio** | **Notas** |
| :--- | :--- | :--- | :--- |
| Nombre/Razón Social | Texto | Sí | |
| Teléfono | Texto | Sí | Único. |
| Email | Texto | No | |
| Ubicación (dirección) | Texto | Sí | |
| Coordenadas (lat/lng) | Número | Condicional | Obligatorio si se usa el mapa. |
| Calificación | Select (A/B/C) | No | |
| Tipo de Hacienda | Texto | No | Ej. "Novillos", "Vaquillonas". |
| Formas de Pago Preferidas | Texto | No | |
| Observaciones | Texto largo | No | |

### 6.2. Entidad: Operación

| **Campo** | **Tipo** | **Obligatorio** | **Notas** |
| :--- | :--- | :--- | :--- |
| Fecha de Carga | Fecha/Hora | Sí | |
| Comprador | FK Cliente | Sí | |
| Vendedor | FK Cliente | Sí | |
| Categoría | Select | Sí | Faena, Invernada, Reproducción. |
| Subcategoría | Texto | No | |
| Kilogramos | Número | Sí | |
| Precio por kg | Número | Sí | |
| Tipo de Precio | Select | Sí | "Más IVA" o "Final". |
| Porcentaje Facturado | Número (0-100) | Condicional | Obligatorio si el tipo es "Más IVA". |
| Comisión | Número | No | |
| Forma de Pago | Texto | Sí | |
| Plazo | Texto | No | |
| Raza | Select | No | Brangus, Colorado, Negro, Braford, Definido, Varios. |
| Color | Texto | No | |
| Puntuación | Texto | No | |
| Destino | Texto | No | |
| Cantidad de Machos | Número | No | |
| Cantidad de Hembras | Número | No | |
| Terneros | Booleano | No | |
| Observaciones | Texto largo | No | Ej. "despareja", "suele comprar colorados". |

### 6.3. Entidad: Llamada/Evento

| **Campo** | **Tipo** | **Obligatorio** | **Notas** |
| :--- | :--- | :--- | :--- |
| Fecha y Hora | Fecha/Hora | Sí | |
| Cliente | FK Cliente | Sí | |
| Tipo de Evento | Select | Sí | Llamada Entrante, Saliente, Reunión, Mensaje. |
| Intención | Select | Sí | Compra, Venta, Cotización, Seguimiento, Otra. |
| Características de la Tropa | Texto | No | |
| Detalle/Observaciones | Texto largo | Sí | |

---

## 7. CASOS DE USO PRIORITARIOS

| **ID** | **Caso de Uso** | **Actor Principal** | **RF Asociado** | **Prioridad** |
| :--- | :--- | :--- | :--- | :--- |
| CU-01 | Registrar Cliente | Operador | RF01, RF02 | Alta |
| CU-02 | Registrar Operación | Operador | RF05, RF06, RN02 | Alta |
| CU-03 | Registrar Llamada | Operador | RF10 | Alta |
| CU-04 | Consultar Resumen Diario | Operador | RF11 | Alta |
| CU-05 | Generar Alertas de Inactividad | Sistema | RF18 | Alta |
| CU-06 | Sugerir Compradores para Tropa | Sistema | RF13 | Media |
| CU-07 | Sugerir Ofertas para Comprador | Sistema | RF14 | Media |
| CU-08 | Visualizar Dashboard | Operador/Admin | RF16 | Media |
| CU-09 | Copiar Operación | Operador | RF07 | Media |
| CU-10 | Buscar Clientes/Operaciones | Operador | RF15 | Media |
| CU-11 | Gestionar Cobranzas | Operador | RF09, RF19 | Media |
| CU-12 | Exportar Reportes | Operador/Admin | RF17 | Baja |

---

## 8. CRITERIOS DE ÉXITO (KPIs)

| **KPI** | **Línea Base** | **Meta** | **Método de Medición** |
| :--- | :--- | :--- | :--- |
| Tasa de Re-contacto Oportuno | ~60% (estimado) | **≥90% mensual** | (Clientes contactados en ventana oportuna / Total clientes con ciclo activo) × 100 |
| Reducción de Clientes Inactivos no Abordados | 25 clientes/mes no contactados | **-60% (≤10 clientes/mes)** | Conteo mensual de clientes sin operación >6 meses y sin registro de contacto. |
| Tiempo Semanal de Coordinación | 20 horas | **-30% (≤14 horas)** | Registro diario de horas dedicadas a llamadas de seguimiento. |

---

## 9. ANEXOS Y PLAN DE IMPLEMENTACIÓN

### 9.1. Plan de Implementación Iterativo (Sugerido)

Dado que ya existe una base de v1, se recomienda enfoque iterativo:

1. **Iteración 1 (Fundamentos):** ✅ *Completada.* CRUD de Clientes con campos ampliados (RF01-RF04). Migración a Spring Boot 4.
2. **Iteración 2 (Core Operativo):** Ampliación del **Registro de Operaciones** (RF05-RF09) con todos los detalles de la carga, cálculo de IVA y gestión de cobranzas. Introducción de DTOs y `/api/v1/`.
3. **Iteración 3 (Seguimiento):** Implementación del **Módulo de Llamadas** (RF10-RF12) y el **Resumen Diario** (RF11).
4. **Iteración 4 (Inteligencia):** Desarrollo del **Matchmaking** (RF13-RF15) y **Alertas Automáticas** (RF18-RF20).
5. **Iteración 5 (Visualización):** **Dashboard** (RF16) y **Reportes** (RF17).
6. **Iteración 6 (Validación):** Pruebas con usuarios reales (padre y hermanos) y ajustes finales. Medición de KPIs (§8).

### 9.2. Referencias y Buenas Prácticas Adicionales

- **SENASA y Trazabilidad:** Considerar integración futura con el sistema TRAZA de SENASA. Aunque el SGCH no gestione DT-e, la capacidad de asociar un número de tropa o caravana electrónica como dato complementario debe mantenerse como campo opcional.
- **Usabilidad para Baja Alfabetización Digital:** La investigación es clara: las interfaces basadas en texto son un desafío para usuarios con baja alfabetización. Se recomienda priorizar interfaces gráficas y minimizar la dependencia de texto. El diseño tipo planilla es un buen punto medio, pero debe acompañarse con **iconos claros (SVG inline) y flujos guiados**.
- **CRM Agropecuario:** Funcionalidades como el **registro de historial de conversaciones y visitas**, y la visibilidad de **compromisos pendientes** (qué se prometió, qué quedó pendiente) son clave en CRMs del sector y deben reflejarse en el Módulo de Seguimiento (RF10-RF12).

---

## 10. TRAZABILIDAD Y MAPEO HISTÓRICO

### 10.1. Mapeo RF: Este documento ↔ Docs deprecados

Si en algún chat, commit, ruling o test aparecen referencias a "RF-XX" del doc viejo, este es el mapeo:

| **Este doc (canónico)** | **Consolidado (deprecado)** | **Original (deprecado)** |
| :--- | :--- | :--- |
| RF01-RF04 | RF01-RF04 | RF01-RF03 (RF04 no existía separado) |
| RF05 | RF05 | RF04 |
| RF06 | RF06 | RF05 |
| RF07 | RF07 | RF06 |
| RF08 | RF08 | RF07 |
| RF09 | RF09 | RF08 |
| RF10 | RF10 | RF09 |
| RF11 | RF11 | RF10 |
| RF12 | RF12 | RF11 |
| RF13 | RF13 | RF12 |
| RF14 | RF14 | RF13 |
| RF15 | RF15 | RF14 |
| RF16 | RF16 | RF15 |
| RF17 | RF17 | RF16 |
| RF18 | RF18 | RF17 |
| RF19 | RF19 | RF18 |
| RF20 | RF20 | RF19 |

**Regla:** cualquier referencia futura a RF-XX se resuelve contra **este documento**. Los docs viejos quedan archivados como referencia histórica.

### 10.2. Cambios respecto al Consolidado (lo que este doc agrega)

- **RF16:** se agregó "Precios de Referencia (carga manual por categoría)" (rescatado del doc original RF15).
- **RF16:** se explicita que al hacer clic en un gráfico se accede al detalle (estaba implícito).
- **RNF04:** se especifican resoluciones mobile concretas (390×844 y 768×1024) en lugar de "dos resoluciones".
- **RNF05:** se agrega criterio cuantitativo "80% de métodos públicos con JavaDoc".
- **RNF07:** se agrega "sin fallos que requieran reinicio manual".
- **§2.2:** se explicita que los precios de referencia son carga manual (no API externa).

### 10.3. Cambios respecto al Original (lo que este doc agrega)

- **RF04:** separación explícita de "No Vendido" como estado distinto de "Inactivo".
- **§1.3, §2.2, §2.3:** secciones de Objetivos del Negocio, Supuestos y Actores (no existían).
- **§9:** Plan iterativo explícito con 6 iteraciones (no existía).
- **§9.2:** Anexo de buenas prácticas SENASA/TRAZA, usabilidad, CRM agro (no existía).
- **§10:** Sección de trazabilidad y mapeo (no existía).

---

**Fin del documento.**

**Historial de versiones:**
- v1.0 (2025-XX-XX): versión inicial del doc original.
- v2.0 (2026-XX-XX): versión "Revisada y Consolidada".
- **v3.0 (2026-09-15): versión unificada canónica. Reemplaza a las anteriores.**