package com.sgch.dto;

import com.sgch.model.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OperacionRequest {

    @NotNull(message = "La fecha de operacion es obligatoria")
    @PastOrPresent(message = "La fecha de operacion no puede ser futura")
    private LocalDateTime fechaOperacion;

    @NotNull(message = "La modalidad de circuito es obligatoria")
    private ModalidadCircuito modalidadCircuito;

    @Size(max = 255, message = "La consignataria externa no puede superar los 255 caracteres")
    private String consignatariaExterna;

    @NotBlank(message = "El comprador es obligatorio")
    private String compradorId;

    @NotBlank(message = "El vendedor es obligatorio")
    private String vendedorId;

    @NotNull(message = "La categoria es obligatoria")
    private CategoriaOperacion categoria;

    @Size(max = 100, message = "La subcategoria no puede superar los 100 caracteres")
    private String subcategoria;

    @NotNull(message = "El peso neto en kg es obligatorio")
    @DecimalMin(value = "0.01", message = "El peso neto debe ser mayor a 0")
    private BigDecimal kgNeto;

    @DecimalMin(value = "0.01", message = "El peso origen bruto debe ser mayor a 0")
    private BigDecimal kgOrigenBruto;

    @DecimalMin(value = "-8.00", message = "El porcentaje de desbaste no puede ser inferior a -8.00%")
    @DecimalMax(value = "15.00", message = "El porcentaje de desbaste no puede superar 15.00%")
    private BigDecimal porcentajeDesbaste;

    @DecimalMin(value = "0.01", message = "El peso llegada referencia debe ser mayor a 0")
    private BigDecimal kgLlegadaReferencia;

    @NotNull(message = "El precio por kg facturado es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio por kg debe ser mayor a 0")
    private BigDecimal precioKgFacturado;

    @DecimalMin(value = "0.00", message = "El monto extra cobrado al comprador no puede ser negativo")
    private BigDecimal montoExtraCobradoComprador;

    @NotNull(message = "La modalidad de precio es obligatoria")
    private ModalidadPrecio modalidadPrecio;

    private Boolean precioEsFinal;

    @DecimalMin(value = "0.00", message = "La comision de vendedor no puede ser negativa")
    @DecimalMax(value = "100.00", message = "La comision de vendedor no puede superar el 100%")
    private BigDecimal comisionPorcentajeVendedor;

    @DecimalMin(value = "0.00", message = "La comision de comprador no puede ser negativa")
    @DecimalMax(value = "100.00", message = "La comision de comprador no puede superar el 100%")
    private BigDecimal comisionPorcentajeComprador;

    @DecimalMin(value = "0.00", message = "La comision total cobrada de referencia no puede ser negativa")
    @DecimalMax(value = "100.00", message = "La comision total cobrada de referencia no puede superar el 100%")
    private BigDecimal comisionTotalCobradaReferencia;

    @DecimalMin(value = "0.00", message = "El porcentaje documentado de ganado no puede ser negativo")
    @DecimalMax(value = "100.00", message = "El porcentaje documentado de ganado no puede superar el 100%")
    private BigDecimal porcentajeDocumentadoGanado;

    @DecimalMin(value = "0.00", message = "El porcentaje documentado de comision vendedor no puede ser negativo")
    @DecimalMax(value = "100.00", message = "El porcentaje documentado de comision vendedor no puede superar el 100%")
    private BigDecimal porcentajeDocumentadoComisionVendedor;

    @DecimalMin(value = "0.00", message = "El porcentaje documentado de comision comprador no puede ser negativo")
    @DecimalMax(value = "100.00", message = "El porcentaje documentado de comision comprador no puede superar el 100%")
    private BigDecimal porcentajeDocumentadoComisionComprador;

    @DecimalMin(value = "0.00", message = "El override de IVA ganado no puede ser negativo")
    private BigDecimal ivaGanadoMontoOverride;

    @DecimalMin(value = "0.00", message = "El override de IVA comision vendedor no puede ser negativo")
    private BigDecimal ivaComisionVendedorOverride;

    @DecimalMin(value = "0.00", message = "El override de IVA comision comprador no puede ser negativo")
    private BigDecimal ivaComisionCompradorOverride;

    private Boolean conGarantia;

    @DecimalMin(value = "0.00", message = "Las retenciones externas no pueden ser negativas")
    private BigDecimal retencionesExternasMonto;

    private CondicionEntrega condicionEntrega;

    private FleteCargoDe fleteCargoDe;

    @DecimalMin(value = "0.00", message = "El flete no puede ser negativo")
    private BigDecimal fleteMonto;

    /**
     * Estado de liquidacion de la operacion (PENDIENTE, PARCIALMENTE_PAGADO, LIQUIDADO, ANULADA).
     *
     * <p>Semantica de contrato (A-08, NA-009, NA-016):
     * <ul>
     *   <li>En creacion (POST /api/v1/operaciones): este campo se ignora en el backend y la operacion
     *       nace siempre en estado {@link EstadoLiquidacion#PENDIENTE} (RN05).</li>
     *   <li>En actualizacion (PUT /api/v1/operaciones/{id}): si se envia {@code null}, se preserva
     *       el estado de liquidacion actual derivado de la imputacion de cobros. Si se envia un valor no nulo,
     *       se aplica un override explicito.</li>
     *   <li>El frontend de Fase 2.B debe omitir este campo tanto en formularios de alta como de edicion ordinaria.</li>
     * </ul>
     */
    private EstadoLiquidacion estadoLiquidacion;

    @NotBlank(message = "La forma de pago es obligatoria")
    @Size(max = 100, message = "La forma de pago no puede superar los 100 caracteres")
    private String formaPago;

    @Size(max = 100, message = "El plazo no puede superar los 100 caracteres")
    private String plazo;

    private Raza raza;

    @Size(max = 100, message = "El color no puede superar los 100 caracteres")
    private String color;

    @Size(max = 50, message = "La puntuacion no puede superar los 50 caracteres")
    private String puntuacion;

    @Size(max = 255, message = "El destino no puede superar los 255 caracteres")
    private String destino;

    @Min(value = 0, message = "La cantidad de machos no puede ser negativa")
    private Integer cantidadMachos;

    @Min(value = 0, message = "La cantidad de hembras no puede ser negativa")
    private Integer cantidadHembras;

    private Boolean terneros;

    private String observaciones;

    private List<@Valid CuotaOperacionRequest> cuotas = new ArrayList<>();
}
