package com.sgch.dto;

import com.sgch.model.FechaBasePlazo;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CuotaOperacionRequest {

    @Min(value = 1, message = "El numero de cuota debe ser al menos 1")
    private Integer numeroCuota;

    private FechaBasePlazo fechaBasePlazo;

    @Min(value = 0, message = "Los dias de plazo del comprador no pueden ser negativos")
    private Integer diasPlazoComprador;

    @Min(value = 0, message = "Los dias de descalce del vendedor no pueden ser negativos")
    private Integer diasDescalceVendedor = 0;

    private LocalDate fechaVencimientoComprador;

    private LocalDate fechaVencimientoVendedor;

    @DecimalMin(value = "0.01", inclusive = true, message = "El monto de la cuota debe ser mayor a 0")
    private BigDecimal montoCuota;
}
