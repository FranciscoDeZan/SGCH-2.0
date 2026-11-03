# ANEXO II — Modelo de Cálculo Fiscal y Comisiones
**SGCH v2 — Documento de Requerimientos, Anexo II**

**Versión:** 1.1
**Fecha:** 2026-11-03
**Fuente:** Respuesta consolidada de operadores (Santiago, Juan y Papá De Zan), validada por auditoría técnica.
Actualizado con D-07 a D-14 (entrevista Papá 2026-11-03). Ver `docs/superpowers/research/raw/DECISIONES-NEGOCIO-DRAFT.md` para trazabilidad.

## 1. Principio arquitectónico

El cálculo se estructura en 3 capas desacopladas:

1. **Valorización económica** (siempre se computa):
   matemática pura del negocio.
2. **Liquidación fiscal** (computa con flags; default
   no-op): IVA, monotributo, formalidad.
3. **Saldos por contraparte** (siempre se computa):
   cuánto se le paga al vendedor y cuánto se le cobra
   al comprador.

**Regla de oro:** el flujo principal de carga NO debe
trabarse con variables fiscales. La parte fiscal es
configuración secundaria, no input obligatorio del
operador.

## 2. Capa 1 — Valorización económica

Variables de entrada:
- `kg_neto` (kilogramos netos, único — B1, R-056)
- `precio_kg_facturado` (único, base de todo el cálculo — D-11, R-069)
- `comision_porcentaje_vendedor` (0-100, input del operador)
- `comision_porcentaje_comprador` (0-100, input del operador)
- `modalidad_precio` (`NETO` / `FINAL`)

Fórmulas:
- `subtotal_ganado = kg_neto × precio_kg_facturado`
- Si `modalidad_precio = FINAL`:
  - `comision_vendedor_monto = subtotal_ganado × (comision_porcentaje_vendedor / 100)` [sobre el bruto, per D-09, R-072]
  - `comision_comprador_monto = subtotal_ganado × (comision_porcentaje_comprador / 100)` [sobre el bruto, per D-09, R-072]
- Si `modalidad_precio = NETO`:
  - `comision_vendedor_monto = subtotal_ganado × (comision_porcentaje_vendedor / 100)` [idéntico, porque `subtotal_ganado` ya es el neto]
  - `comision_comprador_monto = subtotal_ganado × (comision_porcentaje_comprador / 100)`

Nota sobre diferencia comercial (spread): El spread (precio comprador ≠ precio vendedor, o kg comprador ≠ kg vendedor) NO se modela como precio bilateral. Existe un único `precio_kg_facturado`. La diferencia se registra en `monto_extra_cobrado_comprador` como dato informativo, no participa del cálculo fiscal (D-11, R-069).

## 3. Capa 2 — Liquidación fiscal

Alícuotas:
- IVA ganado (hacienda bovina viva): 10.5%
  (Ley de IVA, art. 28, inc. a, punto 1)
- IVA comisión (servicio de intermediación): 21%

### 3.1. IVA ganado

Cuatro casos según condición fiscal del vendedor
y modalidad de precio:

Caso A — Vendedor Monotributista:
- `iva_ganado = 0`

Caso B — Vendedor Responsable Inscripto, precio neto:
- `iva_ganado = subtotal_ganado × 0.105 × (porcentaje_documentado_ganado / 100)`

Caso C — Vendedor Responsable Inscripto, precio final:
- `subtotal_neto = subtotal_ganado / 1.105`
- `iva_ganado = (subtotal_ganado − subtotal_neto) × (porcentaje_documentado_ganado / 100)`

Caso D — Vendedor Exento o Consumidor Final:
- `iva_ganado = 0` (tratados como Monotributista, per D-14, R-075).

En Caso C, `precio_kg_facturado` ingresado por el operador ya incluye IVA y se desglosa hacia atrás para el cálculo del impuesto. Si el operador ingresa `iva_ganado_override`, ese importe pisa el cálculo automático (R-079).

### 3.2. IVA comisión

La comisión es bilateral. Cada punta devenga su propio
IVA 21% según el porcentaje documentado:

- `iva_comision_vendedor_monto = comision_vendedor_monto × 0.21 × (porcentaje_documentado_comision_vendedor / 100)`
- `iva_comision_comprador_monto = comision_comprador_monto × 0.21 × (porcentaje_documentado_comision_comprador / 100)`

El operador controla la formalidad de cada concepto con
tres campos autónomos (0-100) de nomenclatura neutra (R-066):

- `porcentaje_documentado_ganado`
- `porcentaje_documentado_comision_vendedor`
- `porcentaje_documentado_comision_comprador`

Los tres se configuran por separado. En la práctica ocurren
operaciones mixtas: hacienda 100% documentada, comisión
sin comprobante; o combinaciones parciales (ej. 70/30 o 60/40).

Cuando `porcentaje_documentado_* = 0`, el IVA correspondiente
es 0. Cuando = 100, es el IVA pleno. Valores intermedios
calculan proporcionalmente. Si el operador ingresa `iva_comision_vendedor_override` o `iva_comision_comprador_override`, el valor manual pisa la fórmula (R-079).

## 4. Capa 3 — Saldos por contraparte (D-07, D-08, D-12, D-13)

Estructura: cada operación expone cuatro saldos derivados (no persistidos en base de datos, calculados en lectura — R-070):
- `total_a_cobrar_comprador`: lo que el comprador le debe a la firma
- `total_a_pagar_vendedor`: lo que la firma le debe al vendedor
- `saldo_hacienda_entre_partes`: informativo (en `DIRECTO`, dispara alerta de seguimiento; en `CONSIGNATARIA_EXTERNA`, no se calcula porque la consignataria lo maneja)
- `saldo_comision_firma`: lo que la firma efectivamente cobra

Fórmulas por circuito:

### CIRCUITO DIRECTO:
- `saldo_hacienda_entre_partes = subtotal_ganado + iva_ganado`
  (informativo, dispara alerta de seguimiento al operador cuando vence — D-07)
- `saldo_comision_firma = (comision_vendedor_monto + iva_comision_vendedor_monto) + (comision_comprador_monto + iva_comision_comprador_monto) + monto_extra_cobrado_comprador` (si presente)
- `total_a_cobrar_comprador = comision_comprador_monto + iva_comision_comprador_monto`
  (solo la parte de comisión comprador adeudada a la firma)
- `total_a_pagar_vendedor = 0`
  (la firma no le paga al vendedor; el comprador le paga directo)

### CIRCUITO CONSIGNATARIA_EXTERNA:
- `saldo_hacienda_entre_partes = 0` (lo maneja la consignataria externa)
- `saldo_comision_firma = subtotal_ganado × (comision_porcentaje_vendedor / 100) + iva_comision_vendedor_monto`
  [comisión neta facturada a la consignataria externa; el porcentaje cargado ES el neto de la firma, per D-08 y R-071]
- `total_a_cobrar_comprador = 0` (la consignataria externa cobra)
- `total_a_pagar_vendedor = 0` (la consignataria externa paga)

### CIRCUITO PROPIA (firma compra o vende para sí):
- Aplicar las mismas fórmulas que en `DIRECTO`, pero con `comision = 0` en la punta donde la firma es parte (DA-04, B10).

Notas operativas de Capa 3:
- No se modela cuenta corriente consolidada (D-13, R-074). Cada cobro se imputa a una operación y cuota específica.
- El flete no resta del saldo al vendedor (D-12, RN09).
- Las retenciones externas son solo informativas en `CONSIGNATARIA_EXTERNA` (`retenciones_externas_monto`, B9, R-080).

## 5. Casos de borde y consideraciones

- **Monotributista, Exento y Consumidor Final (D-14, R-075):** cuando actúan como vendedores cambian la alícuota de IVA ganado a 0%. Requiere campo `condicionFiscal` en `Cliente` + snapshot en `Operacion` (un cliente puede cambiar de condición fiscal; las operaciones históricas no deben recalcularse).
- **Precio final vs neto:** es preferencia de negociación, no fiscal. Algunos compradores siempre pactan final, otros neto + IVA.
- **Precio final con comisión sobre bruto (D-09, R-072):** cuando `modalidad_precio = FINAL`, la comisión se calcula sobre el subtotal bruto (`kg_neto × precio_kg_facturado`). Esto contradice el principio teórico de "nunca sobre subtotal + IVA", pero refleja la práctica operativa real de la firma relevada con Papá (`2026-11-03-entrevista-papa-operaciones-particulares.md:208-256`). Se documenta la tensión explícitamente.
- **Spread (D-11, R-069):** cuando existe diferencia de precio o kg entre las puntas, no se modela precio bilateral. Existe un precio facturado único (`precio_kg_facturado`). La diferencia va a `monto_extra_cobrado_comprador` como dato informativo.
- **Operaciones mixtas y discreción contable (R-066):** el sistema NO valida ni sugiere evasión. Simplemente permite registrar la realidad operativa con nomenclatura contable neutra (`porcentaje_documentado_*`). La porción sin comprobante se gestiona a nivel de tesorería/caja, no alterando alícuotas legales.
- **DT-e (Documento de Tránsito electrónico):** toda hacienda trasladada legalmente requiere DT-e abonado por el productor (D-04).

## 6. Ejemplo de cálculo

### 6.1. Ejemplo 1: Operación `DIRECTO` sin spread (100% documentada)

**Parámetros de entrada:**
- Circuito: `DIRECTO` (`con_garantia = true`)
- Tropa: 100 novillos, `300 kg` netos por cabeza → `kg_neto = 30.000 kg`
- Precio: `precio_kg_facturado = $5.000/kg`, `modalidad_precio = NETO`
- Condición fiscal: Vendedor y Comprador `RESPONSABLE_INSCRIPTO`
- Comisiones: `comision_porcentaje_vendedor = 2%`, `comision_porcentaje_comprador = 2%`
- Formalidad: `porcentaje_documentado_ganado = 100%`, `porcentaje_documentado_comision_vendedor = 100%`, `porcentaje_documentado_comision_comprador = 100%`
- Spread: `monto_extra_cobrado_comprador = null` (`$0`)

**Desglose paso a paso (Capas 1, 2 y 3):**

| Capa | Concepto | Fórmula aplicada | Monto (ARS) |
| :--- | :--- | :--- | ---: |
| **Capa 1** | `subtotal_ganado` | `30.000 kg × $5.000/kg` | `$150.000.000,00` |
| **Capa 1** | `comision_vendedor_monto` | `$150.000.000 × 2%` | `$3.000.000,00` |
| **Capa 1** | `comision_comprador_monto` | `$150.000.000 × 2%` | `$3.000.000,00` |
| **Capa 2** | `iva_ganado` (10.5%) | `$150.000.000 × 0,105 × 100%` | `$15.750.000,00` |
| **Capa 2** | `iva_comision_vendedor_monto` (21%) | `$3.000.000 × 0,21 × 100%` | `$630.000,00` |
| **Capa 2** | `iva_comision_comprador_monto` (21%) | `$3.000.000 × 0,21 × 100%` | `$630.000,00` |
| **Capa 3** | `saldo_hacienda_entre_partes` | `$150.000.000 + $15.750.000` (informativo, alerta al vencer) | `$165.750.000,00` |
| **Capa 3** | `saldo_comision_firma` | `$3.630.000 (vendedor) + $3.630.000 (comprador)` | `$7.260.000,00` |
| **Capa 3** | `total_a_cobrar_comprador` | `$3.000.000 + $630.000` (comisión comprador a la firma) | `$3.630.000,00` |
| **Capa 3** | `total_a_pagar_vendedor` | Pago directo entre comprador y vendedor | `$0,00` |

### 6.2. Ejemplo 2: Operación `DIRECTO` con spread (`D-11`, `R-069`)

**Parámetros adicionales:**
- Mismos `30.000 kg` netos y mismo `precio_kg_facturado = $5.000/kg` (único precio en la factura oficial entre vendedor y comprador).
- El comprador pacta un precio real de `$5.200/kg` (`$200/kg` adicionales sobre `30.000 kg`), registrándose `monto_extra_cobrado_comprador = $6.000.000,00`.

**Resultado:**
- **Capa 1 y Capa 2:** no cambian respecto del Ejemplo 1 (`subtotal_ganado = $150.000.000,00`, `iva_ganado = $15.750.000,00`, comisiones documentadas `$3.630.000,00` por punta), porque el spread no se factura por separado.
- **Capa 3:**
  - `saldo_hacienda_entre_partes = $165.750.000,00`
  - `saldo_comision_firma = $7.260.000,00 + $6.000.000,00 = $13.260.000,00`
  - `total_a_cobrar_comprador = $3.630.000,00` (documentado) + `$6.000.000,00` (`monto_extra_cobrado_comprador` informativo).
  - `total_a_pagar_vendedor = $0,00`.
