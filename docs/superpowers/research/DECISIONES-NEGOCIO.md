# Decisiones de Negocio — SGCH 2.0

**Fecha de consolidación:** 2026-11-03
**Fuente:** Entrevistas con los operadores (Santi, Juan, Papá) del
2026-09-15, 2026-10-28, 2026-10-29 y 2026-11-03, cruzadas con el
Documento de Requerimientos v3.2 y el Anexo II v1.1.
**Estado:** CANÓNICO. Este documento resume las decisiones de negocio
que sustentan la Iteración 2. Para el detalle técnico, ver
`docs/superpowers/specs/DOCUMENTO DE REQUERIMIENTOS - SGCH v2.md` (v3.2)
y `docs/superpowers/specs/ANEXO-II-Modelo-Calculo-Fiscal.md` (v1.1).
**Material fuente no sanitizado:** `docs/superpowers/research/raw/`
(gitignored, contiene citas literales, nombres reales y audios).

## 1. Cómo usar este documento

Tres niveles de fuente de verdad en SGCH 2.0 (`R-082`):
1. **Especificaciones técnicas:** v3.2 + Anexo II v1.1 (tracked, sin sanitizar
   nombres de dominio).
2. **Decisiones de negocio (este documento):** sanitizado, tracked, sin
   datos sensibles de clientes (`R-066`).
3. **Material crudo de investigación:** `research/raw/` (gitignored per `R-065`,
   backup encriptado externo per `R-067`, contiene citas y audios originales).

Cualquier contradicción se resuelve: primero contra v3.2 (técnico),
luego contra Anexo II (cálculo), luego contra este documento (negocio),
luego contra `raw/` (histórico).

## 2. Modelo del negocio

### 2.1. Naturaleza de la firma
Los operadores son **comisionistas ganaderos**, no una consignataria formal.
Operan con tres circuitos (`D-07`, `R-070`):

- **DIRECTO:** el productor (ej. Cliente A, criador) factura la hacienda
  directamente al comprador (ej. Cliente B, feedlot o frigorífico X) y la
  firma solo factura su comisión de intermediación (bilateral, comprador y/o
  vendedor, típicamente en el rango de 1-5% por punta).
- **CONSIGNATARIA_EXTERNA:** la operación se canaliza a través de una
  consignataria externa asociada (que emite la liquidación pecuaria al
  productor y gestiona la cobranza al comprador). La firma solo factura su
  parte neta de la comisión a la consignataria externa (`D-08`, `R-071`).
- **PROPIA:** la firma o un vehículo societario/fideicomiso familiar figura
  como una de las dos puntas (compra o venta para sí, p. ej. hacienda en
  capitalización o invernada propia), registrándose como un `Cliente` normal
  con comisión 0% en su propia punta (`DA-04`).

### 2.2. Estructura de cada operación y cartera compartida (`D-06`, `DA-04`)
Toda operación comercial vincula tres roles: vendedor, intermediario (la firma)
y comprador. En negocios propios (`PROPIA`) la firma ocupa dos de los tres
roles, manteniendo la integridad referencial (`comprador_id` y `vendedor_id`
no nulos en `operaciones`, `DA-04`).

Los tres operadores (Papá, Santi y Juan) trabajan sobre una **cartera única y
compartida** sin exclusividad de clientes (`D-06`). El registro ágil por voz de
ofrecimientos, búsquedas y disponibilidad futura de hacienda a 10-20 días evita
perder oportunidades comerciales cuando un operador tiene la oferta de un
Cliente A (criador) y otro operador tiene el pedido de un Cliente B (comprador).

## 3. Reglas determinadas (D-01 a D-14)

### 3.1. Forma de pago, cuotas y liquidación (D-01, D-02, D-10, D-13)
- **Inexistencia de seña (`D-01`):** en el mercado de hacienda no existe la
  figura de seña o adelanto parcial previo a la carga. Toda operación se pacta
  al 100% al contado antes de descargar la tropa (cuando no existe antecedente
  crediticio suficiente) o financiada en plazos de hasta 180 días.
- **Medios de pago aceptados (`D-02`, `R-060`):** se registran mediante el enum
  `MedioPago` en la entidad `Cobro`:
  - `ECHEQ` (cheque electrónico, medio predominante en el circuito formal).
  - `TRANSFERENCIA` (transferencia bancaria / CBU).
  - `CHEQUE_FISICO` (cheque en papel tradicional).
  - `EFECTIVO` (cancelación en billete físico).
  - `CANJE_ESPECIE` (entrega de bienes, insumos o rodados en parte de pago).
- **Distribución de cuotas según circuito (`D-10`, `R-073`, `R-076`):**
  - En circuito `DIRECTO`: las N cuotas se pre-llenan en partes iguales
    (`total / N`, p. ej. tercios iguales a 30/60/90 días).
  - En circuito `CONSIGNATARIA_EXTERNA`: la cuota 1 absorbe el IVA total, los
    gastos y una porción del capital (`(capital / N) + IVA + gastos`), mientras
    que las cuotas 2..N contienen `capital / N`. Además, cada cuota aplica un
    descalce estándar de `+7 días` entre el vencimiento de cobro al comprador
    (`30/60/90` días) y la fecha exigible de pago al vendedor (`37/67/97` días).
  - En ambos circuitos, el importe de cada cuota (`monto_cuota`) es editable
    por el operador antes de confirmar o al conciliar contra la liquidación
    externa.
- **Liquidación operación por operación (`D-13`, `R-074`):** dado que la firma
  actúa como comisionista y no como casa consignataria, no compensa saldos de
  compra y venta de un mismo cliente entre distintas operaciones. Cada cobro se
  imputa a una operación y cuota específica. Cuando un cliente opera de ambos
  lados a través de una consignataria externa asociada, la compensación de
  cuenta corriente ocurre en el sistema contable de dicha consignataria externa.

### 3.2. Kilos, desbaste y precio (D-11, R-069, R-078)
- **Base única de kilaje (`D-11`, `R-069`):** todo el cálculo económico, fiscal
  y de comisiones se realiza sobre un único campo obligatorio `kg_neto`
  (`DECIMAL(12,2) NOT NULL`).
- **Desbaste y kilaje de respaldo (`R-078`):** el desbaste comercial varía
  habitualmente entre `-1%` y `-8%` (merma por desbaste en origen o traslado),
  pudiendo resultar positivo (ej. `+1%`) cuando la hacienda ya sufrió merma por
  arreo o traslado previo antes de subir a una balanza conocida. El sistema
  provee `kg_origen_bruto` (opcional) y `porcentaje_desbaste` (`DECIMAL(5,2)`,
  rango `-8.00` a `+15.00`, opcional) como ayuda en UI para autocompletar
  `kg_neto`.
- **Kilaje de llegada (`D-11`):** el campo `kg_llegada_referencia` (opcional,
  informativo) permite dejar asentado el kilaje recibido en destino por el
  comprador cuando difiere del kilaje neto facturado en origen, sin alterar la
  base tributaria.
- **Precio único facturado y ganancia por diferencia (`D-11`, `R-069`):** en la
  documentación fiscal entre vendedor y comprador existe un único
  `precio_kg_facturado` (`NOT NULL`), que constituye la base del IVA ganado y
  de las comisiones porcentuales. Cuando la negociación comercial genera una
  diferencia a favor de la firma (spread de precio en el rango de 1-3% o
  diferencia de kilos), dicha diferencia NO se modela como doble precio
  facturado, sino que se registra en el campo opcional e informativo
  `monto_extra_cobrado_comprador`.

### 3.3. Régimen fiscal y formalidad documentada (D-09, D-14, DA-01, R-066, R-072, R-075, R-079, R-081)
- **Alícuotas legales vigentes:**
  - IVA ganado (venta de hacienda bovina viva): `10.5%` sobre el monto neto
    facturado.
  - IVA comisión (servicio de intermediación): `21%` bilateral (aplicable tanto
    a la comisión del vendedor como a la del comprador).
- **Condición fiscal del vendedor (`D-14`, `R-075`):** el cliente posee el
  atributo `condicion_fiscal` (con snapshot en `Operacion` para preservar la
  historia ante cambios de categoría ante el fisco):
  - `RESPONSABLE_INSCRIPTO`: genera IVA ganado del `10.5%` (adicionado en
    modalidad `NETO` o desglosado en modalidad `FINAL`).
  - `MONOTRIBUTISTA`, `EXENTO` y `CONSUMIDOR_FINAL`: cuando actúan como
    vendedores, la operación lleva IVA ganado `0%` (`iva_ganado = 0`). Las
    comisiones de la firma mantienen su alícuota del `21%` según el porcentaje
    documentado correspondiente.
- **Comisión en modalidad Precio Final (`D-09`, `R-072`):** cuando las partes
  pactan `modalidad_precio = FINAL` (IVA incluido en el precio por kilo), la
  comisión porcentual se calcula directamente sobre el monto bruto
  (`kg_neto × precio_kg_facturado`), reflejando el uso y costumbre comercial de
  la firma, mientras que el desglose contable separa internamente el neto
  gravado (`subtotal_ganado / 1.105`) para el cálculo del IVA ganado.
- **Formalidad por concepto y nomenclatura contable neutra (`DA-01`, `R-066`):**
  el operador configura tres porcentajes autónomos (`0` a `100`, por defecto
  `100`): `porcentaje_documentado_ganado`,
  `porcentaje_documentado_comision_vendedor` y
  `porcentaje_documentado_comision_comprador`. Esto permite reflejar operaciones
  parcialmente documentadas (p. ej. proporciones 70/30 o 50/50 entre porción
  documentada y porción sin comprobante) empleando exclusivamente terminología
  contable neutra en base de datos, código y pantallas.
- **Overrides manuales de IVA (`R-079`):** para casos donde la liquidación de
  terceros presenta diferencias de redondeo o ajustes puntuales, la operación
  incluye tres campos opcionales (`iva_ganado_monto_override`,
  `iva_comision_vendedor_override`, `iva_comision_comprador_override`) que
  pisan el cálculo automático de Capa 2 cuando están presentes.
- **Alcance de autenticación (`DA-01`, `R-081`):** mientras el sistema se
  ejecute en `localhost` en la máquina del desarrollador, el login permanece
  diferido; si en la Fase 2.B los operadores cargan datos reales en una máquina
  compartida o servidor accesible en red, se adelanta un esquema de
  autenticación básica antes de volcar información productiva.

### 3.4. Garantía moral y riesgo crediticio (D-03)
- En el circuito `DIRECTO`, la firma no asume responsabilidad jurídica formal
  por la solvencia del comprador (dado que la factura vincula directamente al
  productor con el comprador). Sin embargo, por política comercial, la firma
  responde con **garantía moral** y fondos propios ante el vendedor frente a un
  incumplimiento del comprador, salvo que antes de cerrar el negocio se haya
  advertido y pactado expresamente que la venta se realiza **"sin garantía"**
  (`D-03`).
- El campo booleano `con_garantia` (por defecto `true`) registra esta condición
  en `Operacion` y habilita una insignia visual en la vista de cobranzas.

### 3.5. Flete, tasas de traslado, retenciones y gastos (D-04, D-05, D-12, DA-02, DA-03, DA-05, R-080)
- **Exclusión de tasas de traslado y motor de retenciones (`D-04`, `DA-03`):**
  el Documento de Tránsito electrónico (DT-e) y la guía provincial los gestiona
  y abona directamente el productor ante los organismos correspondientes antes
  de cargar la tropa. En circuito `DIRECTO` no intervienen retenciones
  impositivas. Cuando la operación cursa por `CONSIGNATARIA_EXTERNA`, las
  retenciones nacionales (Ganancias) o provinciales (IIBB por extraña
  jurisdicción) las calcula y descuenta la consignataria externa en su propia
  liquidación. SGCH no calcula alícuotas de retenciones y solo ofrece el campo
  opcional e informativo `retenciones_externas_monto` (`DA-03`, `R-080`),
  visible únicamente cuando `modalidad_circuito = CONSIGNATARIA_EXTERNA`.
- **Flete informativo sin descuento en liquidación (`D-12`, `DA-02`):** el
  servicio de transporte lo factura directamente la empresa transportista al
  comprador (modalidad habitual en invernada/cría a retirar del campo) o al
  vendedor (modalidad habitual en hacienda gorda puesta en planta en
  frigorífico X). En ningún caso la firma descuenta el flete del saldo a pagar
  al vendedor. Por ello se descarta construir una calculadora tarifaria por
  kilómetro (`DA-02`) y solo se registran tres datos de trazabilidad:
  `condicion_entrega` (`A_RETIRAR_CAMPO` / `PUESTO_EN_PLANTA`), `flete_cargo_de`
  (`COMPRADOR` / `VENDEDOR` / `NINGUNO`) y `flete_monto` (opcional,
  informativo).
- **Gastos extraordinarios de operación vs. gastos de estructura (`D-05`, `DA-05`):**
  los costos sanitarios mayores (como sangrado por brucelosis o certificaciones
  veterinarias) los abona directamente el productor o comprador al profesional
  interviniente (`D-05`). Los insumos menores de operatoria (precintos,
  papelería) y los costos fijos de movilidad y estructura (combustible, peajes,
  mantenimiento de vehículos, sueldos) son absorbidos por la firma como gastos
  generales de administración, postergando el módulo `gastos_empresa` a la
  Iteración 5+ (`DA-05`) y cualquier adelanto extraordinario reembolsable
  (`gastos_operacion`) a la Iteración 3+.

### 3.6. Comisión con consignataria externa (D-08, R-071)
- Cuando una operación se liquida por intermedio de una consignataria externa
  asociada (`modalidad_circuito = CONSIGNATARIA_EXTERNA`), dicha entidad emite
  la liquidación pecuaria al cliente, retiene su porcentaje de participación y
  solicita a la firma que le facture únicamente su porcentaje neto acordado
  (típicamente en el orden del 1.5% al 2%).
- En consecuencia (`D-08`, `R-071`), el porcentaje ingresado en
  `comision_porcentaje_vendedor` dentro de SGCH representa directamente la
  **comisión neta** que cobra la firma, sin modelar fórmulas de coparticipación
  en Capa 3. Se adiciona únicamente el campo opcional e informativo
  `comision_total_cobrada_referencia` para dejar constancia del porcentaje
  total aplicado al cliente en la liquidación externa.

### 3.7. Saldos por contraparte y seguimiento sin cuenta corriente (D-07, D-13, R-070, R-074)
- Aunque en el circuito `DIRECTO` el flujo de fondos de la hacienda ocurre
  directamente entre comprador y vendedor sin pasar por cuentas bancarias de la
  firma, los operadores realizan el seguimiento activo de cada vencimiento para
  asegurar el buen fin del negocio (`D-07`).
- Cada operación calcula y expone en lectura cuatro saldos derivados (no
  persistidos en tablas — `R-070`):
  - `saldo_hacienda_entre_partes`: monto de hacienda más IVA que el comprador
    debe abonar al vendedor en `DIRECTO` (informativo; dispara alertas de
    seguimiento al operador cuando vence una cuota). En `CONSIGNATARIA_EXTERNA`
    vale `0`.
  - `saldo_comision_firma`: ingreso real de la firma (suma de comisiones de
    ambas puntas más su IVA documentado más `monto_extra_cobrado_comprador` si
    estuviera presente en `DIRECTO`, o comisión neta más IVA facturada a la
    consignataria en `CONSIGNATARIA_EXTERNA`).
  - `total_a_cobrar_comprador`: en `DIRECTO`, suma de `comision_comprador_monto`
    + `iva_comision_comprador_monto` + `monto_extra_cobrado_comprador` (si
    presente). En `CONSIGNATARIA_EXTERNA` vale `0`.
  - `total_a_pagar_vendedor`: vale `0` tanto en `DIRECTO` (paga el comprador al
    vendedor) como en `CONSIGNATARIA_EXTERNA` (paga la consignataria al
    vendedor).

## 4. Decisiones técnicas aprobadas (R-056 a R-081)

Las 5 decisiones de producto/arquitectura del autor (`DA-01` sobre nomenclatura
contable neutra y login condicional, `DA-02` sobre flete informativo sin
calculadora, `DA-03` sobre campo informativo de retenciones externas, `DA-04`
sobre cuentas propias como registros en `clientes` con `cuit` y
`condicion_fiscal`, y `DA-05` sobre postergación de gastos de estructura a
Iteración 5+) junto con las reglas `D-01` a `D-14` se cristalizan en los
siguientes rulings técnicos vinculantes para la Iteración 2:

| Ruling | Tema |
|---|---|
| R-056 | BigDecimal para dinero y kg (forward-looking) |
| R-057 | PK String UUID para `Operacion` y `Cobro` (forward-looking) |
| R-058 | BigDecimal para coordenadas (deuda técnica en `Cliente.java`) |
| R-059 | UI de Operaciones en Iteración 2 |
| R-060 | `Cobro` en tabla separada |
| R-061 | Frontend Opción C `/api/v1` (ejecutable en I2) |
| R-062 | Backend `/api/v1` en paralelo a legacy |
| R-063 | Migración `V2` única (ampliada por R-076 a 3 tablas) |
| R-064 | Testcontainers solo en repositorios; cálculo con tests unitarios puros |
| R-065 | Split research tracked vs raw gitignored |
| R-066 | Sanitización de este documento |
| R-067 | Backup externo encriptado de `raw/` |
| R-068 | Corrección de reportes del brain antes de cerrar |
| R-069 | Spread comercial no modelado como precio bilateral |
| R-070 | Saldos en DIRECTO son derivados, no persistidos |
| R-071 | Comisión en CONSIGNATARIA_EXTERNA es neta de la firma |
| R-072 | Comisión sobre monto bruto en PRECIO_FINAL |
| R-073 | Distribución de cuotas bifurcada por circuito |
| R-074 | No se modela cuenta corriente |
| R-075 | Exento y CF aplican IVA 0% en venta |
| R-076 | `cuotas_operacion` amplía R-063 a 3 tablas; 2 fechas por cuota |
| R-077 | Se elimina RN02 (carga diferida 2h) |
| R-078 | `porcentaje_desbaste DECIMAL(5,2)`, rango −8.00 a +15.00 |
| R-079 | 3 overrides de IVA (ganado + comisión vendedor + comisión comprador) |
| R-080 | `retenciones_externas_monto` nullable, visible solo en CONSIGNATARIA_EXTERNA |
| R-081 | Login diferido mientras corra en localhost; adelantar en Fase 2.B |

## 5. Observaciones para iteraciones futuras (T-1 a T-4)

- **T-1:** Portal del cliente "Pagué / No Pagué" — idea válida para agilizar la
  confirmación de pagos en operaciones directas, pero requiere validación de
  adopción real por parte de los productores. Postergar a Iteración 3+.
- **T-2:** Asimetría de consignatarias externas en el tratamiento de IVA en
  cuotas (al comprador suelen exigirle el 100% del IVA en la cuota 1 a los 30
  días, mientras que al vendedor a veces le prorratean el IVA en las cuotas).
  SGCH no modela esa lógica interna de terceros, pero permite editar libremente
  `monto_cuota` para reflejar el cronograma real enviado por la consignataria.
- **T-3:** Cuando un comprador reviste la condición de Consumidor Final o
  Monotributista frente a un vendedor Responsable Inscripto en el circuito
  documentado, abona el IVA del `10.5%` incluido en el costo final sin
  posibilidad de computarlo como crédito fiscal. Impacto informativo para
  reportes futuros.
- **T-4:** Los gastos generales de estructura y oficina (precintos, papelería,
  combustible, peajes, sueldos) no se descuentan de operaciones individuales
  (`D-05`, `DA-05`). El módulo `gastos_empresa` queda planificado para la
  Iteración 5+.

## 6. Referencias

- `docs/superpowers/specs/DOCUMENTO DE REQUERIMIENTOS - SGCH v2.md` (v3.2):
  especificación técnica canónica.
- `docs/superpowers/specs/ANEXO-II-Modelo-Calculo-Fiscal.md` (v1.1):
  modelo de cálculo fiscal en 3 capas.
- `.superpowers/sdd/migracion-boot4/RULINGS.md`: decisiones técnicas vinculantes.
- `docs/superpowers/research/raw/` (gitignored): material crudo de investigación
  con citas literales y audios originales. Backup encriptado externo per R-067.
