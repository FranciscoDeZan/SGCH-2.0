package com.sgch.dto;

import com.sgch.model.CalificacionCliente;
import com.sgch.model.CondicionFiscal;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ClienteResponse(
        String id,
        String nombreRazonSocial,
        String cuit,
        CondicionFiscal condicionFiscal,
        String telefono,
        String email,
        String direccion,
        BigDecimal latitud,
        BigDecimal longitud,
        CalificacionCliente calificacion,
        String tipoHacienda,
        String formasPagoPreferidas,
        String observaciones,
        LocalDateTime fechaUltimaOperacion,
        LocalDateTime fechaUltimoContacto
) {
}
