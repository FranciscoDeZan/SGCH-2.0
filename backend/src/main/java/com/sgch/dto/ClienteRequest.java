package com.sgch.dto;

import com.sgch.model.CalificacionCliente;
import com.sgch.model.CondicionFiscal;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClienteRequest {

    /**
     * Identificador UUID opcional. Se acepta para tolerar payloads completos
     * enviados por el frontend en operaciones PUT, pero se ignora al persistir
     * ya que la identidad la determina la variable de ruta del endpoint.
     */
    private String id;

    @NotBlank(message = "Nombre/Razón Social es obligatorio")
    @Size(max = 255, message = "El nombre o razón social no puede superar 255 caracteres")
    private String nombreRazonSocial;

    @Pattern(regexp = "^\\d{11}$", message = "El CUIT debe tener 11 dígitos")
    private String cuit;

    private CondicionFiscal condicionFiscal;

    @NotBlank(message = "Teléfono es obligatorio")
    @Size(max = 50, message = "El teléfono no puede superar 50 caracteres")
    private String telefono;

    @Email(message = "El formato de email no es válido")
    @Size(max = 255, message = "El email no puede superar 255 caracteres")
    private String email;

    @NotBlank(message = "Dirección es obligatoria")
    @Size(max = 255, message = "La dirección no puede superar 255 caracteres")
    private String direccion;

    private BigDecimal latitud;

    private BigDecimal longitud;

    private CalificacionCliente calificacion;

    private String tipoHacienda;

    private String formasPagoPreferidas;

    private String observaciones;

    private LocalDateTime fechaUltimaOperacion;

    private LocalDateTime fechaUltimoContacto;
}
