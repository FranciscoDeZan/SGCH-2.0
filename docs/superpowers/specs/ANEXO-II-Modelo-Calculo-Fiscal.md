# ANEXO II — Modelo de Cálculo Fiscal y Comisiones
**SGCH v2 — Documento de Requerimientos, Anexo II**

**Fecha:** 2026-09-15
**Fuente:** Respuesta consolidada de operadores
(Santiago De Zan y equipo), validada por auditoría técnica.

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
- kg (kilogramos totales)
- precio_kg (precio por kilogramo, en ARS)
- comision_porcentaje_vendedor (0-100, input del operador)
- comision_porcentaje_comprador (0-100, input del operador)

Fórmulas:
- subtotal_ganado = kg × precio_kg
- comision_vendedor_monto = subtotal_ganado ×
  (comision_porcentaje_vendedor / 100)
- comision_comprador_monto = subtotal_ganado ×
  (comision_porcentaje_comprador / 100)

La comisión se calcula SIEMPRE sobre el subtotal neto
de hacienda (sin IVA). Nunca sobre subtotal + IVA.

## 3. Capa 2 — Liquidación fiscal

Alícuotas:
- IVA ganado (hacienda bovina viva): 10.5%
  (Ley de IVA, art. 28, inc. a, punto 1)
- IVA comisión (servicio de intermediación): 21%

### 3.1. IVA ganado

Tres casos según condición fiscal del vendedor
y modalidad de precio:

Caso A — Vendedor Monotributista:
- iva_ganado = 0

Caso B — Vendedor Responsable Inscripto, precio neto:
- iva_ganado = subtotal_ganado × 0.105

Caso C — Vendedor Responsable Inscripto, precio final:
- subtotal_neto = subtotal_ganado / 1.105
- iva_ganado = subtotal_ganado − subtotal_neto

En Caso C, "precio_kg" ingresado por el operador ya
incluye IVA. Se desglosa hacia atrás.

### 3.2. IVA comisión

La comisión es bilateral. Cada punta devenga su propio
IVA 21% si aplica factura:

- iva_comision_vendedor = comision_vendedor_monto × 0.21
  (si se factura al vendedor)
- iva_comision_comprador = comision_comprador_monto × 0.21
  (si se factura al comprador)

El operador controla la formalidad de cada concepto con
un campo independiente `porcentaje_facturado` (0-100):

- porcentaje_facturado_ganado
- porcentaje_facturado_comision_vendedor
- porcentaje_facturado_comision_comprador

Los tres son independientes. En la práctica ocurren
operaciones mixtas: hacienda 100% formal, comisión
informal; o combinaciones parciales.

Cuando `porcentaje_facturado = 0`, el IVA correspondiente
es 0. Cuando = 100, es el IVA pleno. Valores intermedios
calculan proporcionalmente.

## 4. Capa 3 — Saldos por contraparte

**PENDIENTE DE COMPLETAR.**

Los operadores identificaron dos cuentas:

- Cuenta Vendedor (a liquidar/pagar al productor): [TODO]
- Cuenta Comprador (a cobrar al cliente): [TODO]

Fórmulas pendientes de respuesta de Santiago De Zan.
Bloquean el diseño definitivo de la entidad `Operacion`
y del servicio de cálculo.

## 5. Casos de borde y consideraciones

- **Monotributista:** cambia la alícuota a 0%. Requiere
  campo `condicionFiscal` en Cliente + snapshot en
  Operacion (un cliente puede cambiar de condición
  fiscal; las operaciones históricas no deben recalcularse).
- **Precio final vs neto:** es preferencia de negociación,
  no fiscal. Algunos compradores siempre pactan final,
  otros neto + IVA.
- **Informalidad y evasión:** el sistema NO valida ni
  sugiere evasión. Simplemente permite registrar la
  realidad operativa. La parte no declarada se gestiona
  a nivel de tesorería/caja, no alterando alícuotas.
- **DT-e (Documento de Tránsito electrónico):** toda
  hacienda trasladada legalmente requiere DT-e. En la
  práctica, el volumen físico coincide con la liquidación
  electrónica oficial. La discrecionalidad está en la
  forma de cobro de honorarios/comisiones.

## 6. Ejemplo de cálculo

**PENDIENTE.** Se agregará cuando las fórmulas de la
Capa 3 estén disponibles, para evitar publicar un
ejemplo incompleto.
