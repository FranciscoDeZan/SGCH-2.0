package com.sgch.dto;

import com.sgch.model.MedioPago;
import com.sgch.model.TipoMovimientoCobro;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CobroResponse(
        String id,
        String operacionId,
        String cuotaId,
        Integer cuotaNumero,
        String clienteId,
        String clienteNombre,
        TipoMovimientoCobro tipoMovimiento,
        LocalDate fechaMovimiento,
        BigDecimal monto,
        MedioPago medioPago,
        Boolean documentado,
        String observaciones
) {}
