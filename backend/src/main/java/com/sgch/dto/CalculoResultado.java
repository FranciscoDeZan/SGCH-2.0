package com.sgch.dto;

import java.math.BigDecimal;

public record CalculoResultado(
        BigDecimal subtotalGanado,
        BigDecimal comisionVendedorMonto,
        BigDecimal comisionCompradorMonto,
        BigDecimal ivaGanado,
        BigDecimal ivaComisionVendedorMonto,
        BigDecimal ivaComisionCompradorMonto,
        BigDecimal montoExtraCobradoComprador,
        BigDecimal saldoHaciendaEntrePartes,
        BigDecimal saldoComisionFirma,
        BigDecimal totalACobrarComprador,
        BigDecimal totalAPagarVendedor
) {}
