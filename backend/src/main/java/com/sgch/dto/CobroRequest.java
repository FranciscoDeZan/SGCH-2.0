package com.sgch.dto;

import com.sgch.model.MedioPago;
import com.sgch.model.TipoMovimientoCobro;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class CobroRequest {

    @NotBlank(message = "El id de operacion es obligatorio")
    private String operacionId;

    private String cuotaId;

    @NotBlank(message = "El id de cliente es obligatorio")
    private String clienteId;

    @NotNull(message = "El tipo de movimiento es obligatorio")
    private TipoMovimientoCobro tipoMovimiento;

    @NotNull(message = "La fecha de movimiento es obligatoria")
    private LocalDate fechaMovimiento;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal monto;

    @NotNull(message = "El medio de pago es obligatorio")
    private MedioPago medioPago;

    @NotNull(message = "El campo documentado es obligatorio")
    private Boolean documentado;

    private String observaciones;
}
