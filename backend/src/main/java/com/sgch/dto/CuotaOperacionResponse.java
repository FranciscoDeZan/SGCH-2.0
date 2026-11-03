package com.sgch.dto;

import com.sgch.model.EstadoCuotaCobro;
import com.sgch.model.EstadoCuotaPago;
import com.sgch.model.FechaBasePlazo;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CuotaOperacionResponse(
        String id,
        Integer numeroCuota,
        FechaBasePlazo fechaBasePlazo,
        Integer diasPlazoComprador,
        Integer diasDescalceVendedor,
        LocalDate fechaVencimientoComprador,
        LocalDate fechaVencimientoVendedor,
        BigDecimal montoCuota,
        EstadoCuotaCobro estadoCobro,
        EstadoCuotaPago estadoPago
) {}
