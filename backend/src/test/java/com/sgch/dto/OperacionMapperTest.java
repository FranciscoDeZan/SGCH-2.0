package com.sgch.dto;

import com.sgch.mapper.CobroMapper;
import com.sgch.mapper.OperacionMapper;
import com.sgch.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

public class OperacionMapperTest {

    private OperacionMapper operacionMapper;
    private CobroMapper cobroMapper;
    private Cliente comprador;
    private Cliente vendedor;

    @BeforeEach
    void setUp() {
        operacionMapper = new OperacionMapper();
        cobroMapper = new CobroMapper();

        comprador = new Cliente();
        comprador.setId("cli-comp");
        comprador.setNombreRazonSocial("Comprador Agro S.A.");

        vendedor = new Cliente();
        vendedor.setId("cli-vend");
        vendedor.setNombreRazonSocial("Cabaña Las Lilas");
        vendedor.setCondicionFiscal(CondicionFiscal.MONOTRIBUTISTA);
    }

    @Test
    void testToEntityAppliesDefaultsWhenRequestFieldsAreNull() {
        OperacionRequest req = new OperacionRequest();
        req.setFechaOperacion(LocalDateTime.of(2026, 11, 3, 10, 0));
        req.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        req.setCategoria(CategoriaOperacion.INVERNADA);
        req.setKgNeto(new BigDecimal("12000.00"));
        req.setPrecioKgFacturado(new BigDecimal("2000.00"));
        req.setModalidadPrecio(ModalidadPrecio.NETO);
        req.setFormaPago("Cheque");

        Operacion entity = operacionMapper.toEntity(req, comprador, vendedor);

        assertThat(entity.getComprador()).isEqualTo(comprador);
        assertThat(entity.getVendedor()).isEqualTo(vendedor);
        assertThat(entity.getCondicionFiscalVendedor()).isEqualTo(CondicionFiscal.MONOTRIBUTISTA);
        assertThat(entity.getFechaCarga()).isNotNull();
        assertThat(entity.getPrecioEsFinal()).isFalse();
        assertThat(entity.getConGarantia()).isTrue();
        assertThat(entity.getEstadoLiquidacion()).isEqualTo(EstadoLiquidacion.PENDIENTE);
        assertThat(entity.getComisionPorcentajeVendedor()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(entity.getComisionPorcentajeComprador()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(entity.getPorcentajeDocumentadoGanado()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(entity.getPorcentajeDocumentadoComisionVendedor()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(entity.getPorcentajeDocumentadoComisionComprador()).isEqualByComparingTo(new BigDecimal("100.00"));
    }

    @Test
    void testModalidadPrecioFinalSynchronizesPrecioEsFinalTrue() {
        OperacionRequest req = new OperacionRequest();
        req.setModalidadPrecio(ModalidadPrecio.FINAL);
        req.setPrecioEsFinal(false); // incongruencia intencional en request

        Operacion entity = operacionMapper.toEntity(req, comprador, vendedor);
        assertThat(entity.getModalidadPrecio()).isEqualTo(ModalidadPrecio.FINAL);
        assertThat(entity.getPrecioEsFinal()).isTrue();
    }

    @Test
    void testModalidadPrecioNetoSynchronizesPrecioEsFinalFalse() {
        OperacionRequest req = new OperacionRequest();
        req.setModalidadPrecio(ModalidadPrecio.NETO);
        req.setPrecioEsFinal(true); // incongruencia intencional en request

        Operacion entity = operacionMapper.toEntity(req, comprador, vendedor);
        assertThat(entity.getModalidadPrecio()).isEqualTo(ModalidadPrecio.NETO);
        assertThat(entity.getPrecioEsFinal()).isFalse();
    }

    @Test
    void testSnapshotCondicionFiscalVendedorFromCliente() {
        vendedor.setCondicionFiscal(CondicionFiscal.EXENTO);
        OperacionRequest req = new OperacionRequest();
        req.setModalidadPrecio(ModalidadPrecio.NETO);

        Operacion entity = operacionMapper.toEntity(req, comprador, vendedor);
        assertThat(entity.getCondicionFiscalVendedor()).isEqualTo(CondicionFiscal.EXENTO);
    }

    @Test
    void testToResponsePreservesAllFieldsAndNestedCalculo() {
        Operacion op = new Operacion();
        op.setId("op-123");
        op.setFechaCarga(LocalDateTime.of(2026, 11, 3, 9, 0));
        op.setFechaOperacion(LocalDateTime.of(2026, 11, 3, 10, 0));
        op.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        op.setComprador(comprador);
        op.setVendedor(vendedor);
        op.setCategoria(CategoriaOperacion.FAENA);
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2000.00"));
        op.setModalidadPrecio(ModalidadPrecio.NETO);
        op.setPrecioEsFinal(false);
        op.setCondicionFiscalVendedor(CondicionFiscal.MONOTRIBUTISTA);
        op.setFormaPago("Contado");
        op.setEstadoLiquidacion(EstadoLiquidacion.LIQUIDADO);

        CuotaOperacion cuota = new CuotaOperacion();
        cuota.setId("cuota-1");
        cuota.setNumeroCuota(1);
        cuota.setFechaBasePlazo(FechaBasePlazo.CARGA);
        cuota.setDiasPlazoComprador(30);
        cuota.setDiasDescalceVendedor(0);
        cuota.setFechaVencimientoComprador(LocalDate.of(2026, 12, 3));
        cuota.setFechaVencimientoVendedor(LocalDate.of(2026, 12, 3));
        cuota.setMontoCuota(new BigDecimal("20000000.00"));
        cuota.setEstadoCobro(EstadoCuotaCobro.COBRADO);
        cuota.setEstadoPago(EstadoCuotaPago.PAGADO);

        CalculoResultado calc = new CalculoResultado(
                new BigDecimal("20000000.00"),
                new BigDecimal("400000.00"),
                new BigDecimal("400000.00"),
                BigDecimal.ZERO,
                new BigDecimal("84000.00"),
                new BigDecimal("84000.00"),
                null,
                new BigDecimal("20000000.00"),
                new BigDecimal("800000.00"),
                new BigDecimal("20484000.00"),
                new BigDecimal("19516000.00")
        );

        OperacionResponse res = operacionMapper.toResponse(op, Collections.singletonList(cuota), calc);

        assertThat(res.id()).isEqualTo("op-123");
        assertThat(res.compradorId()).isEqualTo("cli-comp");
        assertThat(res.compradorNombre()).isEqualTo("Comprador Agro S.A.");
        assertThat(res.vendedorId()).isEqualTo("cli-vend");
        assertThat(res.vendedorNombre()).isEqualTo("Cabaña Las Lilas");
        assertThat(res.cuotas()).hasSize(1);
        assertThat(res.cuotas().get(0).id()).isEqualTo("cuota-1");
        assertThat(res.cuotas().get(0).montoCuota()).isEqualByComparingTo(new BigDecimal("20000000.00"));
        assertThat(res.calculo()).isNotNull();
        assertThat(res.calculo().subtotalGanado()).isEqualByComparingTo(new BigDecimal("20000000.00"));
        assertThat(res.calculo().totalACobrarComprador()).isEqualByComparingTo(new BigDecimal("20484000.00"));
    }

    @Test
    void testCobroMapperRequestToEntityAndResponse() {
        Operacion op = new Operacion();
        op.setId("op-99");

        CuotaOperacion cuota = new CuotaOperacion();
        cuota.setId("cuota-88");
        cuota.setNumeroCuota(1);

        CobroRequest req = new CobroRequest();
        req.setOperacionId("op-99");
        req.setCuotaId("cuota-88");
        req.setClienteId("cli-comp");
        req.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMPRADOR);
        req.setFechaMovimiento(LocalDate.of(2026, 11, 3));
        req.setMonto(new BigDecimal("500000.00"));
        req.setMedioPago(MedioPago.TRANSFERENCIA);
        req.setDocumentado(true);
        req.setObservaciones("Cobro banco");

        Cobro entity = cobroMapper.toEntity(req, op, cuota, comprador);

        assertThat(entity.getOperacion()).isEqualTo(op);
        assertThat(entity.getCuota()).isEqualTo(cuota);
        assertThat(entity.getCliente()).isEqualTo(comprador);
        assertThat(entity.getMonto()).isEqualByComparingTo(new BigDecimal("500000.00"));
        assertThat(entity.getMedioPago()).isEqualTo(MedioPago.TRANSFERENCIA);
        assertThat(entity.getDocumentado()).isTrue();

        entity.setId("cobro-1");
        CobroResponse res = cobroMapper.toResponse(entity);

        assertThat(res.id()).isEqualTo("cobro-1");
        assertThat(res.operacionId()).isEqualTo("op-99");
        assertThat(res.cuotaId()).isEqualTo("cuota-88");
        assertThat(res.cuotaNumero()).isEqualTo(1);
        assertThat(res.clienteId()).isEqualTo("cli-comp");
        assertThat(res.clienteNombre()).isEqualTo("Comprador Agro S.A.");
        assertThat(res.monto()).isEqualByComparingTo(new BigDecimal("500000.00"));
    }

    @Test
    void testToCuotaEntityAppliesDefaults() {
        Operacion op = new Operacion();
        op.setId("op-cuota-test");

        CuotaOperacionRequest req = new CuotaOperacionRequest();
        req.setNumeroCuota(1);
        req.setFechaBasePlazo(FechaBasePlazo.CARGA);
        req.setDiasPlazoComprador(30);
        req.setDiasDescalceVendedor(null); // Debe aplicar default 0
        req.setFechaVencimientoComprador(LocalDate.of(2026, 12, 3));
        req.setFechaVencimientoVendedor(LocalDate.of(2026, 12, 3));
        req.setMontoCuota(new BigDecimal("1500000.00"));

        CuotaOperacion cuota = operacionMapper.toCuotaEntity(req, op);

        assertThat(cuota.getOperacion()).isEqualTo(op);
        assertThat(cuota.getNumeroCuota()).isEqualTo(1);
        assertThat(cuota.getFechaBasePlazo()).isEqualTo(FechaBasePlazo.CARGA);
        assertThat(cuota.getDiasPlazoComprador()).isEqualTo(30);
        assertThat(cuota.getDiasDescalceVendedor()).isEqualTo(0);
        assertThat(cuota.getFechaVencimientoComprador()).isEqualTo(LocalDate.of(2026, 12, 3));
        assertThat(cuota.getFechaVencimientoVendedor()).isEqualTo(LocalDate.of(2026, 12, 3));
        assertThat(cuota.getMontoCuota()).isEqualByComparingTo(new BigDecimal("1500000.00"));
        assertThat(cuota.getEstadoCobro()).isEqualTo(EstadoCuotaCobro.PENDIENTE);
        assertThat(cuota.getEstadoPago()).isEqualTo(EstadoCuotaPago.PENDIENTE);
    }
}
