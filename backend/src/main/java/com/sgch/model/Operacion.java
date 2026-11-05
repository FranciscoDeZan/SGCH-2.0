package com.sgch.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
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
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "operaciones")
public class Operacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;

    @Column(name = "fecha_carga", nullable = false)
    private LocalDateTime fechaCarga;

    @Column(name = "fecha_operacion", nullable = false)
    private LocalDateTime fechaOperacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidad_circuito", nullable = false, length = 30)
    private ModalidadCircuito modalidadCircuito;

    @Column(name = "consignataria_externa", length = 255)
    private String consignatariaExterna;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comprador_id", nullable = false)
    private Cliente comprador;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Cliente vendedor;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false, length = 30)
    private CategoriaOperacion categoria;

    @Column(name = "subcategoria", length = 100)
    private String subcategoria;

    @Column(name = "kg_neto", nullable = false, precision = 12, scale = 2)
    private BigDecimal kgNeto;

    @Column(name = "kg_origen_bruto", precision = 12, scale = 2)
    private BigDecimal kgOrigenBruto;

    @Column(name = "porcentaje_desbaste", precision = 5, scale = 2)
    private BigDecimal porcentajeDesbaste;

    @Column(name = "kg_llegada_referencia", precision = 12, scale = 2)
    private BigDecimal kgLlegadaReferencia;

    @Column(name = "precio_kg_facturado", nullable = false, precision = 15, scale = 2)
    private BigDecimal precioKgFacturado;

    @Column(name = "monto_extra_cobrado_comprador", precision = 15, scale = 2)
    private BigDecimal montoExtraCobradoComprador;

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidad_precio", nullable = false, length = 20)
    private ModalidadPrecio modalidadPrecio;

    @Column(name = "precio_es_final", nullable = false)
    private Boolean precioEsFinal = false;

    @Column(name = "comision_porcentaje_vendedor", nullable = false, precision = 5, scale = 2)
    private BigDecimal comisionPorcentajeVendedor = BigDecimal.ZERO;

    @Column(name = "comision_porcentaje_comprador", nullable = false, precision = 5, scale = 2)
    private BigDecimal comisionPorcentajeComprador = BigDecimal.ZERO;

    @Column(name = "comision_total_cobrada_referencia", precision = 5, scale = 2)
    private BigDecimal comisionTotalCobradaReferencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "condicion_fiscal_vendedor", nullable = false, length = 30)
    private CondicionFiscal condicionFiscalVendedor;

    @Column(name = "porcentaje_documentado_ganado", nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentajeDocumentadoGanado = new BigDecimal("100.00");

    @Column(name = "porcentaje_documentado_comision_vendedor", nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentajeDocumentadoComisionVendedor = new BigDecimal("100.00");

    @Column(name = "porcentaje_documentado_comision_comprador", nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentajeDocumentadoComisionComprador = new BigDecimal("100.00");

    @Column(name = "iva_ganado_monto_override", precision = 15, scale = 2)
    private BigDecimal ivaGanadoMontoOverride;

    @Column(name = "iva_comision_vendedor_override", precision = 15, scale = 2)
    private BigDecimal ivaComisionVendedorOverride;

    @Column(name = "iva_comision_comprador_override", precision = 15, scale = 2)
    private BigDecimal ivaComisionCompradorOverride;

    @Column(name = "con_garantia", nullable = false)
    private Boolean conGarantia = true;

    @Column(name = "retenciones_externas_monto", precision = 15, scale = 2)
    private BigDecimal retencionesExternasMonto;

    @Enumerated(EnumType.STRING)
    @Column(name = "condicion_entrega", length = 30)
    private CondicionEntrega condicionEntrega;

    @Enumerated(EnumType.STRING)
    @Column(name = "flete_cargo_de", length = 20)
    private FleteCargoDe fleteCargoDe;

    @Column(name = "flete_monto", precision = 15, scale = 2)
    private BigDecimal fleteMonto;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_liquidacion", nullable = false, length = 30)
    private EstadoLiquidacion estadoLiquidacion = EstadoLiquidacion.PENDIENTE;

    @Column(name = "forma_pago", nullable = false, length = 100)
    private String formaPago;

    @Column(name = "plazo", length = 100)
    private String plazo;

    @Enumerated(EnumType.STRING)
    @Column(name = "raza", length = 50)
    private Raza raza;

    @Column(name = "color", length = 100)
    private String color;

    @Column(name = "puntuacion", length = 50)
    private String puntuacion;

    @Column(name = "destino", length = 255)
    private String destino;

    @Column(name = "cantidad_machos")
    private Integer cantidadMachos;

    @Column(name = "cantidad_hembras")
    private Integer cantidadHembras;

    @Column(name = "terneros")
    private Boolean terneros;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @OneToMany(mappedBy = "operacion", fetch = FetchType.LAZY)
    @OrderBy("numeroCuota ASC")
    private List<CuotaOperacion> cuotas = new ArrayList<>();
}
