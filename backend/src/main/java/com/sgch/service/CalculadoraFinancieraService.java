package com.sgch.service;

import com.sgch.model.CondicionFiscal;
import com.sgch.model.ModalidadPrecio;
import com.sgch.model.Operacion;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

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

    public BigDecimal calcularSubtotalGanado(Operacion op) {
        if (op == null || op.getKgNeto() == null || op.getPrecioKgFacturado() == null) {
            return ZERO_MONEY;
        }
        return op.getKgNeto()
                .multiply(op.getPrecioKgFacturado())
                .setScale(SCALE, ROUNDING_MODE);
    }

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
    // Helpers privados de cálculo
    // =========================================================================

    private BigDecimal calcularPorcentajeSobreMonto(BigDecimal base, BigDecimal porcentaje) {
        if (base == null || porcentaje == null || base.compareTo(BigDecimal.ZERO) == 0 || porcentaje.compareTo(BigDecimal.ZERO) == 0) {
            return ZERO_MONEY;
        }
        return base.multiply(porcentaje).divide(CIEN, SCALE, ROUNDING_MODE);
    }
}
