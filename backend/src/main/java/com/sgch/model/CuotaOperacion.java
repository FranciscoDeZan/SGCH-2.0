package com.sgch.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "cuotas_operacion")
public class CuotaOperacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "operacion_id", nullable = false)
    private Operacion operacion;

    @Column(name = "numero_cuota", nullable = false)
    private Integer numeroCuota;

    @Enumerated(EnumType.STRING)
    @Column(name = "fecha_base_plazo", nullable = false, length = 20)
    private FechaBasePlazo fechaBasePlazo;

    @Column(name = "dias_plazo_comprador", nullable = false)
    private Integer diasPlazoComprador;

    @Column(name = "dias_descalce_vendedor", nullable = false)
    private Integer diasDescalceVendedor = 0;

    @Column(name = "fecha_vencimiento_comprador", nullable = false)
    private LocalDate fechaVencimientoComprador;

    @Column(name = "fecha_vencimiento_vendedor", nullable = false)
    private LocalDate fechaVencimientoVendedor;

    @Column(name = "monto_cuota", nullable = false, precision = 15, scale = 2)
    private BigDecimal montoCuota;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_cobro", nullable = false, length = 20)
    private EstadoCuotaCobro estadoCobro = EstadoCuotaCobro.PENDIENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago", nullable = false, length = 20)
    private EstadoCuotaPago estadoPago = EstadoCuotaPago.PENDIENTE;
}
