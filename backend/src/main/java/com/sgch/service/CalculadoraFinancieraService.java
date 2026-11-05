package com.sgch.service;

import com.sgch.dto.CalculoResultado;
import com.sgch.model.CondicionFiscal;
import com.sgch.model.ModalidadCircuito;
import com.sgch.model.ModalidadPrecio;
import com.sgch.model.Operacion;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Motor de cálculo financiero y fiscal en 3 capas para operaciones de consignación y compraventa de hacienda.
 * Implementa las reglas del Anexo II (§2 Capa 1, §3 Capa 2, §4 Capa 3).
 */
@Service
public class CalculadoraFinancieraService {

    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;

    private static final BigDecimal ALICUOTA_IVA_GANADO = new BigDecimal("0.105");
    private static final BigDecimal ALICUOTA_IVA_COMISION = new BigDecimal("0.21");
    private static final BigDecimal FACTOR_DESGLOSE_FINAL = new BigDecimal("1.105");
    private static final BigDecimal CIEN = new BigDecimal("100");
    private static final BigDecimal ZERO_MONEY = BigDecimal.ZERO.setScale(SCALE, ROUNDING_MODE);
    private static final BigDecimal DEFAULT_DOCUMENTADO = new BigDecimal("100.00");

    // =========================================================================
    // CAPA 1: Valorización económica (Anexo II §2)
    // =========================================================================

    /**
     * Calcula el subtotal económico del ganado (kgNeto * precioKgFacturado) redondeado a 2 decimales (Capa 1).
     *
     * @param op operación a calcular
     * @return monto subtotal del ganado, o 0.00 si op o sus campos son nulos
     */
    public BigDecimal calcularSubtotalGanado(Operacion op) {
        if (op == null || op.getKgNeto() == null || op.getPrecioKgFacturado() == null) {
            return ZERO_MONEY;
        }
        return op.getKgNeto()
                .multiply(op.getPrecioKgFacturado())
                .setScale(SCALE, ROUNDING_MODE);
    }

    /**
     * Calcula la comisión pactada con el vendedor sobre el subtotal ganado (Capa 1).
     *
     * @param op operación a calcular
     * @return monto de comisión del vendedor redondeado a 2 decimales
     */
    public BigDecimal calcularComisionVendedor(Operacion op) {
        if (op == null) {
            return ZERO_MONEY;
        }
        BigDecimal subtotal = calcularSubtotalGanado(op);
        BigDecimal porcentaje = op.getComisionPorcentajeVendedor() != null
                ? op.getComisionPorcentajeVendedor()
                : BigDecimal.ZERO;

        // En modalidad NETO y en modalidad FINAL (R-072), la comisión se calcula sobre subtotal ganado
        return calcularPorcentajeSobreMonto(subtotal, porcentaje);
    }

    /**
     * Calcula la comisión pactada con el comprador sobre el subtotal ganado (Capa 1).
     *
     * @param op operación a calcular
     * @return monto de comisión del comprador redondeado a 2 decimales
     */
    public BigDecimal calcularComisionComprador(Operacion op) {
        if (op == null) {
            return ZERO_MONEY;
        }
        BigDecimal subtotal = calcularSubtotalGanado(op);
        BigDecimal porcentaje = op.getComisionPorcentajeComprador() != null
                ? op.getComisionPorcentajeComprador()
                : BigDecimal.ZERO;

        // En modalidad NETO y en modalidad FINAL (R-072), la comisión se calcula sobre subtotal ganado
        return calcularPorcentajeSobreMonto(subtotal, porcentaje);
    }

    // =========================================================================
    // CAPA 2: Liquidación fiscal (Anexo II §3)
    // =========================================================================

    /**
     * Calcula la liquidación fiscal de IVA sobre el ganado (10.5% o desglose 1.105 en FINAL)
     * según la condición fiscal del vendedor y porcentaje documentado (Capa 2).
     *
     * @param op operación a calcular
     * @return monto de IVA ganado (o valor de override si estuviera configurado)
     */
    public BigDecimal calcularIvaGanado(Operacion op) {
        if (op == null) {
            return ZERO_MONEY;
        }

        // Override manual (R-079)
        if (op.getIvaGanadoMontoOverride() != null) {
            return op.getIvaGanadoMontoOverride().setScale(SCALE, ROUNDING_MODE);
        }

        CondicionFiscal condicion = op.getCondicionFiscalVendedor() != null
                ? op.getCondicionFiscalVendedor()
                : CondicionFiscal.RESPONSABLE_INSCRIPTO;

        // Caso A (Monotributista) y Caso D (Exento o Consumidor Final, R-075) -> IVA ganado = 0
        if (condicion == CondicionFiscal.MONOTRIBUTISTA
                || condicion == CondicionFiscal.EXENTO
                || condicion == CondicionFiscal.CONSUMIDOR_FINAL) {
            return ZERO_MONEY;
        }

        // Caso B y Caso C: Vendedor Responsable Inscripto
        BigDecimal subtotal = calcularSubtotalGanado(op);
        BigDecimal docGanado = op.getPorcentajeDocumentadoGanado() != null
                ? op.getPorcentajeDocumentadoGanado()
                : DEFAULT_DOCUMENTADO;

        boolean esFinal = op.getModalidadPrecio() == ModalidadPrecio.FINAL
                || Boolean.TRUE.equals(op.getPrecioEsFinal());

        if (esFinal) {
            // Caso C: Desglose / 1.105 con escala explícita para evitar expansión infinita
            BigDecimal subtotalNeto = subtotal.divide(FACTOR_DESGLOSE_FINAL, SCALE, ROUNDING_MODE);
            BigDecimal ivaTeorico = subtotal.subtract(subtotalNeto);
            return calcularPorcentajeSobreMonto(ivaTeorico, docGanado);
        } else {
            // Caso B: 10.5% sobre subtotal neto
            BigDecimal ivaTeorico = subtotal.multiply(ALICUOTA_IVA_GANADO);
            return calcularPorcentajeSobreMonto(ivaTeorico, docGanado);
        }
    }

    /**
     * Calcula el IVA sobre la comisión del vendedor (21%) según el porcentaje documentado (Capa 2).
     *
     * @param op operación a calcular
     * @return monto de IVA comisión vendedor (o valor de override si estuviera configurado)
     */
    public BigDecimal calcularIvaComisionVendedor(Operacion op) {
        if (op == null) {
            return ZERO_MONEY;
        }

        // Override manual (R-079)
        if (op.getIvaComisionVendedorOverride() != null) {
            return op.getIvaComisionVendedorOverride().setScale(SCALE, ROUNDING_MODE);
        }

        BigDecimal comision = calcularComisionVendedor(op);
        BigDecimal docComision = op.getPorcentajeDocumentadoComisionVendedor() != null
                ? op.getPorcentajeDocumentadoComisionVendedor()
                : DEFAULT_DOCUMENTADO;

        BigDecimal ivaTeorico = comision.multiply(ALICUOTA_IVA_COMISION);
        return calcularPorcentajeSobreMonto(ivaTeorico, docComision);
    }

    /**
     * Calcula el IVA sobre la comisión del comprador (21%) según el porcentaje documentado (Capa 2).
     *
     * @param op operación a calcular
     * @return monto de IVA comisión comprador (o valor de override si estuviera configurado)
     */
    public BigDecimal calcularIvaComisionComprador(Operacion op) {
        if (op == null) {
            return ZERO_MONEY;
        }

        // Override manual (R-079)
        if (op.getIvaComisionCompradorOverride() != null) {
            return op.getIvaComisionCompradorOverride().setScale(SCALE, ROUNDING_MODE);
        }

        BigDecimal comision = calcularComisionComprador(op);
        BigDecimal docComision = op.getPorcentajeDocumentadoComisionComprador() != null
                ? op.getPorcentajeDocumentadoComisionComprador()
                : DEFAULT_DOCUMENTADO;

        BigDecimal ivaTeorico = comision.multiply(ALICUOTA_IVA_COMISION);
        return calcularPorcentajeSobreMonto(ivaTeorico, docComision);
    }

    // =========================================================================
    // CAPA 3: Saldos por contraparte e integrador (Anexo II §4, R-069, R-070, R-071)
    // =========================================================================

    /**
     * Calcula el saldo total de hacienda entre comprador y vendedor (subtotal + IVA ganado) en DIRECTO/PROPIA,
     * o 0.00 en CONSIGNATARIA_EXTERNA (Capa 3).
     *
     * @param op operación a calcular
     * @return saldo de hacienda entre partes
     */
    public BigDecimal calcularSaldoHaciendaEntrePartes(Operacion op) {
        if (op == null || op.getModalidadCircuito() == null) {
            return ZERO_MONEY;
        }
        return calcularSaldoHaciendaEntrePartesDesdeCapas(
                op.getModalidadCircuito(),
                calcularSubtotalGanado(op),
                calcularIvaGanado(op)
        );
    }

    /**
     * Calcula el saldo neto de comisión a percibir por la firma intermediaria (Capa 3).
     *
     * @param op operación a calcular
     * @return saldo total de comisión firma
     */
    public BigDecimal calcularSaldoComisionFirma(Operacion op) {
        if (op == null || op.getModalidadCircuito() == null) {
            return ZERO_MONEY;
        }
        if (op.getModalidadCircuito() == ModalidadCircuito.CONSIGNATARIA_EXTERNA) {
            return calcularSaldoComisionFirmaDesdeCapas(
                op.getModalidadCircuito(),
                calcularComisionVendedor(op),
                calcularIvaComisionVendedor(op),
                ZERO_MONEY,
                ZERO_MONEY,
                ZERO_MONEY
            );
        }
        return calcularSaldoComisionFirmaDesdeCapas(
                op.getModalidadCircuito(),
                calcularComisionVendedor(op),
                calcularIvaComisionVendedor(op),
                calcularComisionComprador(op),
                calcularIvaComisionComprador(op),
                obtenerMontoExtraONullComoCero(op)
        );
    }

    /**
     * Calcula el saldo directo que la firma debe percibir del comprador (comisión comprador + IVA + extra)
     * en circuitos DIRECTO/PROPIA, o 0.00 en CONSIGNATARIA_EXTERNA (Capa 3).
     *
     * @param op operación a calcular
     * @return total a cobrar al comprador por la firma
     */
    public BigDecimal calcularTotalACobrarComprador(Operacion op) {
        if (op == null || op.getModalidadCircuito() == null) {
            return ZERO_MONEY;
        }
        return calcularTotalACobrarCompradorDesdeCapas(
                op.getModalidadCircuito(),
                calcularComisionComprador(op),
                calcularIvaComisionComprador(op),
                obtenerMontoExtraONullComoCero(op)
        );
    }

    /**
     * Retorna el saldo a pagar al vendedor por la firma (0.00 en el modelo actual) (Capa 3).
     *
     * @param op operación a calcular
     * @return siempre 0.00
     */
    public BigDecimal calcularTotalAPagarVendedor(Operacion op) {
        return ZERO_MONEY;
    }

    /**
     * Ejecuta el pipeline completo de cálculo financiero en 3 capas y consolida todos los saldos en un record inmutable.
     *
     * @param op operación de hacienda a liquidar
     * @return resultado consolidado de las 3 capas de liquidación
     */
    public CalculoResultado calcular(Operacion op) {
        if (op == null) {
            return new CalculoResultado(
                    ZERO_MONEY,
                    ZERO_MONEY,
                    ZERO_MONEY,
                    ZERO_MONEY,
                    ZERO_MONEY,
                    ZERO_MONEY,
                    null,
                    ZERO_MONEY,
                    ZERO_MONEY,
                    ZERO_MONEY,
                    ZERO_MONEY
            );
        }

        // Capa 1
        BigDecimal subtotalGanado = calcularSubtotalGanado(op);
        BigDecimal comisionVendedorMonto = calcularComisionVendedor(op);
        BigDecimal comisionCompradorMonto = calcularComisionComprador(op);

        // Capa 2
        BigDecimal ivaGanado = calcularIvaGanado(op);
        BigDecimal ivaComisionVendedorMonto = calcularIvaComisionVendedor(op);
        BigDecimal ivaComisionCompradorMonto = calcularIvaComisionComprador(op);

        // Monto extra informativo (preserva null en el record, usa 0.00 en sumas — R-069)
        BigDecimal montoExtraRecord = op.getMontoExtraCobradoComprador() != null
                ? op.getMontoExtraCobradoComprador().setScale(SCALE, ROUNDING_MODE)
                : null;
        BigDecimal montoExtraSuma = montoExtraRecord != null ? montoExtraRecord : ZERO_MONEY;

        // Capa 3 reutilizando valores ya calculados de Capa 1 y Capa 2 (fleteMonto y retencionesExternasMonto no participan — D-12, R-080)
        ModalidadCircuito circuito = op.getModalidadCircuito();
        BigDecimal saldoHaciendaEntrePartes = calcularSaldoHaciendaEntrePartesDesdeCapas(
                circuito,
                subtotalGanado,
                ivaGanado
        );
        BigDecimal saldoComisionFirma = calcularSaldoComisionFirmaDesdeCapas(
                circuito,
                comisionVendedorMonto,
                ivaComisionVendedorMonto,
                comisionCompradorMonto,
                ivaComisionCompradorMonto,
                montoExtraSuma
        );
        BigDecimal totalACobrarComprador = calcularTotalACobrarCompradorDesdeCapas(
                circuito,
                comisionCompradorMonto,
                ivaComisionCompradorMonto,
                montoExtraSuma
        );
        BigDecimal totalAPagarVendedor = calcularTotalAPagarVendedor(op);

        return new CalculoResultado(
                subtotalGanado,
                comisionVendedorMonto,
                comisionCompradorMonto,
                ivaGanado,
                ivaComisionVendedorMonto,
                ivaComisionCompradorMonto,
                montoExtraRecord,
                saldoHaciendaEntrePartes,
                saldoComisionFirma,
                totalACobrarComprador,
                totalAPagarVendedor
        );
    }

    // =========================================================================
    // Helpers privados de cálculo
    // =========================================================================

    private BigDecimal calcularSaldoHaciendaEntrePartesDesdeCapas(
            ModalidadCircuito circuito,
            BigDecimal subtotalGanado,
            BigDecimal ivaGanado
    ) {
        if (circuito == null || circuito == ModalidadCircuito.CONSIGNATARIA_EXTERNA) {
            return ZERO_MONEY;
        }
        // DIRECTO y PROPIA (DA-04, R-070)
        return subtotalGanado.add(ivaGanado).setScale(SCALE, ROUNDING_MODE);
    }

    private BigDecimal calcularSaldoComisionFirmaDesdeCapas(
            ModalidadCircuito circuito,
            BigDecimal comisionVendedor,
            BigDecimal ivaComisionVendedor,
            BigDecimal comisionComprador,
            BigDecimal ivaComisionComprador,
            BigDecimal montoExtra
    ) {
        if (circuito == null) {
            return ZERO_MONEY;
        }
        if (circuito == ModalidadCircuito.CONSIGNATARIA_EXTERNA) {
            // Comisión neta facturada a la consignataria externa (D-08, R-071)
            return comisionVendedor.add(ivaComisionVendedor).setScale(SCALE, ROUNDING_MODE);
        }
        // DIRECTO y PROPIA (DA-04, R-069)
        return comisionVendedor
                .add(ivaComisionVendedor)
                .add(comisionComprador)
                .add(ivaComisionComprador)
                .add(montoExtra)
                .setScale(SCALE, ROUNDING_MODE);
    }

    private BigDecimal calcularTotalACobrarCompradorDesdeCapas(
            ModalidadCircuito circuito,
            BigDecimal comisionComprador,
            BigDecimal ivaComisionComprador,
            BigDecimal montoExtra
    ) {
        if (circuito == null || circuito == ModalidadCircuito.CONSIGNATARIA_EXTERNA) {
            return ZERO_MONEY;
        }
        // DIRECTO y PROPIA (DA-04, R-069)
        return comisionComprador
                .add(ivaComisionComprador)
                .add(montoExtra)
                .setScale(SCALE, ROUNDING_MODE);
    }

    private BigDecimal obtenerMontoExtraONullComoCero(Operacion op) {
        if (op == null || op.getMontoExtraCobradoComprador() == null) {
            return ZERO_MONEY;
        }
        return op.getMontoExtraCobradoComprador().setScale(SCALE, ROUNDING_MODE);
    }

    private BigDecimal calcularPorcentajeSobreMonto(BigDecimal base, BigDecimal porcentaje) {
        if (base == null || porcentaje == null || base.compareTo(BigDecimal.ZERO) == 0 || porcentaje.compareTo(BigDecimal.ZERO) == 0) {
            return ZERO_MONEY;
        }
        return base.multiply(porcentaje).divide(CIEN, SCALE, ROUNDING_MODE);
    }
}
