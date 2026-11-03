# DOCUMENTO DE REQUERIMIENTOS - SGCH v2
**Sistema de Gestión para Consignatarios de Haciendas**

**Versión:** 3.2 (unificada, canónica)
**Fecha:** 2026-11-03
**Autor:** Francisco De Zan (con auditoría técnica asistida)
**Estado:** CANÓNICA. Reemplaza a:
- `DOCUMENTO DE REQUERIMIENTOS - SGCH v2.md` (deprecado, numeración RF01-RF19)
- `DOCUMENTO DE REQUERIMIENTOS - SGCH v2 (Revisado y Consolidado).md` (deprecado, numeración RF01-RF20)
Actualizada por entrevista con Papá del 2026-11-03. Ver `docs/superpowers/research/raw/DECISIONES-NEGOCIO-DRAFT.md` para trazabilidad completa de D-07 a D-14.
**Anexos:**
- `ANEXO-II-Modelo-Calculo-Fiscal.md` (Modelo de Cálculo Fiscal y Comisiones)

Cualquier referencia a "RF-XX" en prompts, código, tests o rulings se resuelve contra **este** documento.

---

## 1. INTRODUCCIÓN Y OBJETIVO

### 1.1. Propósito
Este documento define los requisitos funcionales y no funcionales para la versión 2 del Sistema de Gestión para Consignatarios de Haciendas (SGCH). Es la **única fuente de verdad** para el equipo de desarrollo, los usuarios finales (operadores: padre y hermanos del autor) y cualquier otro stakeholder. Su objetivo es asegurar que el producto final satisfaga las necesidades reales del negocio.

### 1.2. Alcance del Sistema
El SGCH v2 es una aplicación de gestión comercial integral diseñada para centralizar y automatizar los procesos operativos de operadores/comisionistas ganaderos del NEA argentino con tres circuitos: `DIRECTO`, `CONSIGNATARIA_EXTERNA` y `PROPIA` (D-07, R-070, R-071). El sistema abarcará:

- Gestión completa de clientes (compradores y vendedores).
- Registro detallado de operaciones de compra y venta.
- No emite Cuenta de Venta y Líquido Producto (esa la emite la consignataria externa asociada o el vendedor factura directo). SGCH emite ficha interna de resumen de operación.
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
  - Los circuitos operativos `DIRECTO`, `CONSIGNATARIA_EXTERNA` y `PROPIA` son parte del modelo. El operador selecciona el circuito al dar de alta cada operación (D-07).
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
| **RF01** | **Alta, Baja y Modificación de Clientes** | CRUD completo de clientes (compradores y vendedores).<br>**Obligatorios:** Nombre/Razón Social, Teléfono, Ubicación (dirección), CUIT (opcional, validado a 11 dígitos si presente), Condición Fiscal: Select (RI / Monotributo / Exento / Consumidor Final; Default: RI — D-14, R-075).<br>**Opcionales:** Email, Calificación (A/B/C), Tipo de Hacienda, Formas de Pago Preferidas, Observaciones.<br>**Criterio:** El cliente se almacena y es buscable inmediatamente. Se valida que el teléfono no esté duplicado. |
| **RF02** | **Georreferenciación de Campos** | Integración de mapa interactivo (Google Maps u OpenStreetMap).<br>**Funcionalidad:** El operador marca la ubicación exacta del campo al alta/edición. La ficha muestra un mapa con la ubicación. Vista agregada: mapa con todos los clientes georreferenciados.<br>**Criterio:** Se almacenan latitud y longitud. El mapa es visible y la ubicación es precisa. |
| **RF03** | **Historial Completo del Cliente** | La ficha del cliente es un **hub de información** con secciones/pestañas:<br>- **Operaciones:** Listado de compras y ventas, con filtros por fecha, categoría y monto.<br>- **Llamadas/Seguimiento:** Historial completo de interacciones.<br>- **Estado Financiero:** Resumen de montos a cobrar y a pagar, con alertas de vencimiento.<br>**Criterio:** Toda la información del cliente es accesible desde una única pantalla. |
| **RF04** | **Clasificación de Cliente por Estado** | El sistema diferencia y muestra claramente:<br>- **Activo:** Con operaciones recientes.<br>- **Inactivo:** Sin operaciones en los últimos 180 días (umbral de inactividad).<br>- **No Vendido:** No ha **comprado** en un período configurable (ej. 6 meses), pero puede haber vendido.<br>**Criterio:** El estado se muestra en la ficha del cliente y se puede usar como filtro. |

### 3.2. Módulo 2: Gestión de Operaciones

| **ID** | **Requerimiento** | **Descripción y Criterios de Aceptación** |
| :--- | :--- | :--- |
| **RF05** | **Registro Detallado de Operaciones** | Registro de operaciones de compra y venta con los campos del Modelo de Datos (§6.2). Incluye:<br>- **Datos Generales:** Fecha de carga, Fecha operación, Modalidad de circuito: Select (`DIRECTO` / `CONSIGNATARIA_EXTERNA` / `PROPIA`, obligatorio), Consignataria externa: Texto (opcional, requerido si modalidad es `CONSIGNATARIA_EXTERNA`), Comprador, Vendedor, Categoría (faena/invernada/reproducción), Subcategoría, Con garantía: Booleano (default `true`).<br>- **Datos Económicos:** Kilogramos netos: Número (obligatorio, base del cálculo), Kilogramos brutos origen: Número (opcional, respaldo), Porcentaje desbaste: Número decimal (−8.00 a +15.00, opcional — R-078), Kilogramos llegada referencia: Número (opcional, informativo), Precio por kg facturado: Número (obligatorio, base de IVA y comisión — R-069), Monto extra cobrado al comprador (`monto_extra_cobrado_comprador`): Número (opcional, informativo, absorbido por spread de precio y/o kg — D-11, R-069), Tipo de Precio (más IVA / final — D-09, R-072), Porcentaje documentado ganado: Número (0-100, default 100 — R-066), Porcentaje documentado comisión vendedor: Número (0-100, default 100), Porcentaje documentado comisión comprador: Número (0-100, default 100), IVA ganado override: Número (opcional, pisa cálculo automático — R-079), IVA comisión vendedor override: Número (opcional — R-079), IVA comisión comprador override: Número (opcional — R-079), Comisión (% vendedor / % comprador), Comisión total cobrada referencia: Número (opcional, informativo, solo si modalidad es `CONSIGNATARIA_EXTERNA` — D-08, R-071), Retenciones externas monto: Número (opcional, solo visible en `CONSIGNATARIA_EXTERNA`, informativo — R-080), Condición de entrega: Select (`A_RETIRAR_CAMPO` / `PUESTO_EN_PLANTA`), Flete cargo de: Select (`COMPRADOR` / `VENDEDOR` / `NINGUNO`), Flete monto: Número (opcional, informativo — D-12), Forma de Pago, Plazo.<br>- **Detalle de la Carga:** Raza, Color, Puntuación, Destino, Cantidad de Machos/Hembras, Terneros, Observaciones.<br>**Criterio:** La operación se registra, se vincula a los clientes y actualiza sus historiales. Se permite cargar operaciones con cualquier fecha pasada o del día sin justificación obligatoria (regla de carga diferida de 2h eliminada en v3.2 — R-077). |
| **RF06** | **Cálculo Automático de IVA y Comisiones** | El sistema calcula automáticamente el desglose financiero de cada operación en 3 capas: valorización económica, liquidación fiscal, saldos por contraparte. El cálculo contempla IVA ganado (10.5%), IVA comisión (21% bilateral), condición fiscal del vendedor (Monotributo, Exento y Consumidor Final con 0% vs Responsable Inscripto con 10.5% — D-14, R-075), y modalidad de precio (neto + IVA vs precio final — D-09, R-072). **El detalle completo de fórmulas, casos de borde y ejemplos está en Anexo II — Modelo de Cálculo Fiscal y Comisiones (docs/superpowers/specs/ANEXO-II-Modelo-Calculo-Fiscal.md).**<br>**Criterio:** El sistema muestra siempre el desglose completo del precio por concepto (subtotal ganado, IVA ganado, comisión vendedor, comisión comprador, IVA comisiones, `monto_extra_cobrado_comprador` cuando esté presente, totales por contraparte según circuito — R-070). |
| **RF07** | **Copiar Operación (Campo a Campo)** | Al registrar una nueva operación, el operador puede seleccionar una operación anterior y **copiar automáticamente todos sus datos** (clientes, categoría, raza, etc.) en el nuevo formulario, para luego solo modificar lo necesario. Botón explícito "Copiar de operación".<br>**Criterio:** El formulario se autocompleta con los datos de la operación seleccionada. |
| **RF08** | **Desagregar Operaciones por Cliente** | En la ficha del cliente, todas sus operaciones se listan con columnas: fecha, tipo (compra/venta), categoría, kg, precio, monto total, estado de liquidación. Filtros por fecha, categoría, rango de monto. Paginada, ordenable y exportable.<br>**Criterio:** El operador puede ver y analizar rápidamente el historial de operaciones de un cliente. |
| **RF09** | **Gestión de Estados de Liquidación y Cobranzas** | El sistema permite registrar **pagos parciales** de una operación (`Cobro`, §6.5) y gestionar su cronograma mediante `CuotaOperacion` (§6.4). El sistema genera automáticamente N cuotas (contado o plazos 30/60/90 hasta 180 días) desde la fecha base (Fecha de Carga o Fecha de Remate). En circuito `CONSIGNATARIA_EXTERNA`, aplica descalce de 7 días a cada cuota del vendedor (comprador 30/60/90 → vendedor 37/67/97 — R-076). Al registrar cobros/pagos, actualiza automáticamente:<br>- Saldo Pendiente (operación por operación, sin cuenta corriente consolidada — D-13, R-074).<br>- Estado de Liquidación (Pendiente / Parcialmente pagado / Liquidado — RN05).<br>**Criterio:** El importe de cada cuota es editable por el operador. Por defecto en `DIRECTO` son iguales (`total/N`); en `CONSIGNATARIA_EXTERNA` la cuota 1 incluye `IVA + gastos + (capital/N)` (D-10, RN08, R-073). Se genera una alerta cuando un pago está próximo a vencer o vencido. El estado financiero es visible en el dashboard y en la ficha del cliente. |

### 3.3. Módulo 3: Seguimiento y Llamadas

| **ID** | **Requerimiento** | **Descripción y Criterios de Aceptación** |
| :--- | :--- | :--- |
| **RF10** | **Registro de Interacciones (Llamadas, Reuniones, WhatsApp)** | Registro de cada interacción con un cliente:<br>- Fecha y Hora.<br>- Cliente.<br>- Tipo de Evento (Llamada Entrante, Saliente, Reunión, Mensaje).<br>- Intención (Compra, Venta, Cotización, Seguimiento, Otra).<br>- Características de la Tropa charlada (raza, kg, cantidad).<br>- Detalle/Observaciones.<br>**Criterio:** El registro queda asociado al cliente y es visible en su historial. Filtrable por tipo de evento, fecha e intención. |
| **RF11** | **Resumen Diario de Contactos ("A quién llamar")** | Generación automática, **antes de las 8:00 AM**, de un listado priorizado de clientes a contactar en el día. Criterios:<br>- Alertas de inactividad (>180 días).<br>- Recordatorios de ciclos de venta configurados.<br>- Seguimientos pendientes (ej. "confirmar oferta").<br>**Criterio:** El operador ve este resumen como primer elemento al ingresar. Cada ítem incluye cliente, motivo, teléfono y sugerencia de oferta. |
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
| **RF17** | **Reportes Exportables** | Exportación a **Excel y PDF**:<br>- Listado de clientes (con todos sus campos).<br>- Historial de operaciones de un cliente.<br>- Resumen mensual de comisiones.<br>- Reporte de clientes inactivos ("Clientes No Vendidos").<br>- Reporte de cobranzas y saldos pendientes.<br>**Criterio:** Los archivos exportados incluyen el logo de la firma y los datos formateados profesionalmente. En el detalle de operación individual se prioriza la ficha interna con copiado rápido de resumen (D-07). |

### 3.6. Módulo 6: Alertas y Notificaciones

| **ID** | **Requerimiento** | **Descripción y Criterios de Aceptación** |
| :--- | :--- | :--- |
| **RF18** | **Alertas Automáticas de Inactividad** | Proceso diario que detecta clientes sin operaciones en los últimos 180 días y genera alerta con sugerencia de oferta basada en el historial del cliente.<br>**Criterio:** La alerta es visible en el dashboard y en el resumen diario. |
| **RF19** | **Alertas de Cobranzas y Vencimientos** | Generación de alertas cuando:<br>- Un plazo de pago está próximo a vencer (ej. 7 días antes).<br>- Un pago está vencido (incluyendo el seguimiento de pago entre partes en circuito `DIRECTO` — D-07).<br>- Un cliente tiene saldo pendiente acumulado superior a un umbral configurable.<br>**Criterio:** Las alertas son visibles en el dashboard y en la ficha del cliente. |
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
- **Restricciones:** **No almacenar datos financieros sensibles** (CBU, cuentas bancarias, claves). El sistema no emite facturas ni DT-e, pero puede almacenar el número de comprobante externo como referencia. Se emplea nomenclatura contable estrictamente neutra en base de datos, código e interfaz (R-066, R-081).
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
| **RN02** | **Umbral de Inactividad** | Un cliente se considera **inactivo** si no registra operaciones en los últimos **180 días**. |
| **RN03** | **Cálculo de Comisiones** | Las comisiones se calculan como porcentaje del monto de la operación (sobre el neto en modalidad "más IVA" y sobre el total bruto en modalidad "final" — D-09, R-072). El sistema registra quién paga la comisión (comprador y/o vendedor). |
| **RN04** | **Precio e IVA** | El operador debe indicar si el precio por kg es **"más IVA"** o **"final"**. Debe especificar el porcentaje documentado para que el sistema calcule el IVA proporcional, o ingresar un monto manual de override (R-079). |
| **RN05** | **Estados de Liquidación** | Los estados posibles son: *Pendiente*, *Parcialmente pagado*, *Liquidado*. El sistema actualiza automáticamente el estado al registrar pagos. |
| **RN06** | **Ganancia por diferencia (spread)** | El spread de precio o de kilos NO se modela como precio bilateral. Existe un único `precio_kg_facturado` base del IVA y la comisión. La diferencia se registra en `monto_extra_cobrado_comprador` como dato informativo (D-11, R-069). |
| **RN07** | **Liquidación operación por operación** | No se modela cuenta corriente. La compensación entre operaciones es responsabilidad de la consignataria externa cuando interviene (D-13, R-074). |
| **RN08** | **Distribución de cuotas** | `DIRECTO`: cuotas iguales (`total/N`). `CONSIGNATARIA_EXTERNA`: cuota 1 con `IVA + gastos + (capital/N)`; resto `capital/N`. Importe editable por el operador (D-10, R-073). |
| **RN09** | **Flete informativo** | El flete se factura directo entre las partes y el transportista. NO se resta del saldo al vendedor. Solo se registra el monto y quién lo paga para trazabilidad (D-12). |
| **RN10** | **Comisión en consignataria externa** | El porcentaje cargado es el neto que le queda a la firma. No se modela participación de la consignataria externa en el cálculo (D-08, R-071). |

---

## 6. MODELO DE DATOS (Resumen de Campos por Entidad)

### 6.1. Entidad: Cliente

| **Campo** | **Tipo** | **Obligatorio** | **Notas** |
| :--- | :--- | :--- | :--- |
| Nombre/Razón Social | Texto | Sí | |
| Teléfono | Texto | Sí | Único. |
| CUIT | Texto (11 dígitos) | No | Validado si presente (DA-04, B10). |
| Email | Texto | No | |
| Ubicación (dirección) | Texto | Sí | |
| Coordenadas (lat/lng) | Número | Condicional | Obligatorio si se usa el mapa (R-058). |
| Calificación | Select (A/B/C) | No | |
| Tipo de Hacienda | Texto | No | Ej. "Novillos", "Vaquillonas". |
| Formas de Pago Preferidas | Texto | No | |
| Observaciones | Texto largo | No | |
| Condición Fiscal | Select (RI / Monotributo / Exento / Consumidor Final) | No | Default: Responsable Inscripto. Aplica alícuota de IVA ganado cuando el cliente actúa como vendedor (D-14, R-075). |

### 6.2. Entidad: Operación

| **Campo** | **Tipo** | **Obligatorio** | **Notas** |
| :--- | :--- | :--- | :--- |
| Fecha de Carga | Fecha/Hora | Sí | Fecha/hora de registro en el sistema. |
| Fecha operación | Fecha/Hora | Sí | Puede diferir de fecha de carga sin justificación (R-077). |
| Modalidad de circuito | Select (DIRECTO / CONSIGNATARIA_EXTERNA / PROPIA) | Sí | Define el circuito operativo y de saldos (D-07, R-070). |
| Consignataria externa | Texto | No | Requerido si modalidad = `CONSIGNATARIA_EXTERNA`. |
| Comprador | FK Cliente | Sí | |
| Vendedor | FK Cliente | Sí | |
| Categoría | Select | Sí | Faena, Invernada, Reproducción. |
| Subcategoría | Texto | No | |
| Kilogramos netos | Número | Sí | Único, base de todo el cálculo (B1, R-056). |
| Kilogramos brutos origen | Número | No | Respaldo opcional (B1). |
| Porcentaje desbaste | Número decimal (−8.00 a +15.00) | No | `DECIMAL(5,2)`, autocompleta kg netos (R-078). |
| Kilogramos llegada referencia | Número | No | Informativo si difiere en llegada (B1). |
| Precio por kg facturado | Número | Sí | Único para comprador y vendedor, base de IVA y comisión (D-11, R-069). |
| Monto extra cobrado comprador | Número | No | Informativo (absorbe spread de precio y/o kg — D-11, R-069). |
| Tipo de Precio | Select | Sí | "Más IVA" o "Final". |
| Precio es Final | Booleano | Sí | Default false (neto + IVA). Si true, comisión sobre bruto (D-09, R-072) e IVA ganado se desglosa `/1.105`. |
| Comisión % Vendedor | Número (0-100) | No | Default 0. En consignataria externa representa el neto de la firma (D-08, R-071). |
| Comisión % Comprador | Número (0-100) | No | Default 0. Si >0, se recarga al comprador. |
| Comisión total cobrada referencia | Número | No | Informativo (solo si modalidad = `CONSIGNATARIA_EXTERNA` — D-08, R-071). |
| Condición Fiscal Vendedor (snapshot) | Select | Sí | Snapshot al momento de la operación. Preserva historia contable si el cliente cambia de condición. |
| Porcentaje documentado ganado | Número (0-100) | No | Default 100. Controla formalidad del IVA ganado (R-066). |
| Porcentaje documentado comisión vendedor | Número (0-100) | No | Default 100. Controla formalidad del IVA comisión vendedor (R-066). |
| Porcentaje documentado comisión comprador | Número (0-100) | No | Default 100. Controla formalidad del IVA comisión comprador (R-066). |
| IVA ganado override | Número | No | Pisa el cálculo automático de IVA ganado (R-079). |
| IVA comisión vendedor override | Número | No | Pisa el cálculo automático de IVA comisión vendedor (R-079). |
| IVA comisión comprador override | Número | No | Pisa el cálculo automático de IVA comisión comprador (R-079). |
| Con garantía | Booleano | Sí | Default `true` (D-03). |
| Retenciones externas monto | Número | No | Informativo, visible solo en `CONSIGNATARIA_EXTERNA` (R-080). |
| Condición entrega | Select (A_RETIRAR_CAMPO / PUESTO_EN_PLANTA) | No | |
| Flete cargo de | Select (COMPRADOR / VENDEDOR / NINGUNO) | No | |
| Flete monto | Número | No | Informativo; no resta del saldo al vendedor (D-12, RN09). |
| Estado Liquidación | Select (Pendiente / Parcialmente pagado / Liquidado) | Sí | Default Pendiente. Ver RN05. |
| Forma de Pago | Texto | Sí | |
| Plazo | Texto | No | Resumen textual complementario a `CuotaOperacion`. |
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

### 6.4. Entidad: CuotaOperacion

| **Campo** | **Tipo** | **Obligatorio** | **Notas** |
| :--- | :--- | :--- | :--- |
| Número de cuota | Número | Sí | 1 a N |
| Fecha base plazo | Select (CARGA / REMATE) | Sí | |
| Días plazo comprador | Número | Sí | Ej. 30, 60, 90 |
| Días descalce vendedor | Número | Sí | Default 0 en `DIRECTO`, 7 en `CONSIGNATARIA_EXTERNA` |
| Fecha vencimiento comprador | Fecha | Sí | Calculada = fecha base + días plazo comprador |
| Fecha vencimiento vendedor | Fecha | Sí | Calculada = fecha base + días plazo vendedor + descalce |
| Monto cuota | Número | Sí | Editable; default según RN08 |
| Estado cobro | Select (PENDIENTE / PARCIAL / COBRADO) | Sí | |
| Estado pago | Select (PENDIENTE / PARCIAL / PAGADO) | Sí | |

### 6.5. Entidad: Cobro

| **Campo** | **Tipo** | **Obligatorio** | **Notas** |
| :--- | :--- | :--- | :--- |
| Operación | FK Operación | Sí | |
| Cuota | FK CuotaOperacion | No | Nullable si pago al contado |
| Cliente | FK Cliente | Sí | |
| Tipo de movimiento | Select (COBRO_COMPRADOR / PAGO_VENDEDOR / COBRO_COMISION / RETENCION_SALDO / DEVOLUCION_SALDO) | Sí | |
| Fecha movimiento | Fecha | Sí | |
| Monto | Número | Sí | |
| Medio de pago | Select (ECHEQ / TRANSFERENCIA / CHEQUE_FISICO / EFECTIVO / CANJE_ESPECIE) | Sí | |
| Documentado | Booleano | Sí | |
| Observaciones | Texto largo | No | |

---

## 7. CASOS DE USO PRIORITARIOS

| **ID** | **Caso de Uso** | **Actor Principal** | **RF Asociado** | **Prioridad** |
| :--- | :--- | :--- | :--- | :--- |
| CU-01 | Registrar Cliente | Operador | RF01, RF02 | Alta |
| CU-02 | Registrar Operación | Operador | RF05, RF06 | Alta |
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

1. **Iteración 1 (Fundamentos):** Completada. CRUD de Clientes con campos ampliados (RF01-RF04). Migración a Spring Boot 4.
2. **Iteración 2 (Core Operativo):** Ampliación del **Registro de Operaciones** (RF05-RF09) con todos los detalles de la carga, cálculo de IVA, gestión de cobranzas, cuotas con descalce y tres circuitos operativos. Incluye UI de Operaciones (form, detail, list, mobile). Introducción de DTOs y `/api/v1/`.
   - *Nota de migración:* R-063 ampliado (R-076): `V2` crea `operaciones`, `cobros` y `cuotas_operacion`.
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

### 10.4. Cambios en v3.1 y v3.2

- **v3.1 (2026-09-15):**
  - RF06 reformulado; detalle movido a Anexo II.
  - Cliente: campo `condicionFiscal`.
  - Operación: 8 campos nuevos; 2 removidos (`Comisión`, `Porcentaje Facturado`) reemplazados por campos bilaterales/independientes.
- **v3.2 (2026-11-03):** Eliminada RN02 (traba de 2h). Renumeradas RN03-RN06 a RN02-RN05. Agregadas RN06-RN10. Agregada entidad `CuotaOperacion`. Agregada entidad `Cobro`. Actualizado modelo `Operacion` (kg único, precio facturado único, monto extra informativo, modalidad circuito, con garantía, flete informativo, retenciones externas opcionales, 3 overrides IVA). Actualizado modelo `Cliente` (`cuit`, `condición fiscal`). Nomenclatura neutra: campos de porcentaje de facturación renombrados a `porcentaje_documentado`.

---

**Fin del documento.**

**Historial de versiones:**
- v1.0 (2025-XX-XX): versión inicial del doc original.
- v2.0 (2026-XX-XX): versión "Revisada y Consolidada".
- v3.1 (2026-09-15): versión unificada canónica.
- **v3.2 (2026-11-03): versión unificada canónica actualizada post-entrevista con Papá (D-07 a D-14, R-069 a R-081). Reemplaza a las anteriores.**
