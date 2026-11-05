package com.sgch.service;

import com.sgch.dto.CalculoResultado;
import com.sgch.dto.CuotaOperacionRequest;
import com.sgch.dto.OperacionRequest;
import com.sgch.dto.OperacionResponse;
import com.sgch.exception.ResourceNotFoundException;
import com.sgch.mapper.OperacionMapper;
import com.sgch.model.CategoriaOperacion;
import com.sgch.model.Cliente;
import com.sgch.model.CondicionFiscal;
import com.sgch.model.CuotaOperacion;
import com.sgch.model.EstadoCuotaCobro;
import com.sgch.model.EstadoCuotaPago;
import com.sgch.model.EstadoLiquidacion;
import com.sgch.model.FechaBasePlazo;
import com.sgch.model.ModalidadCircuito;
import com.sgch.model.ModalidadPrecio;
import com.sgch.model.Operacion;
import com.sgch.repository.ClienteRepository;
import com.sgch.repository.CuotaOperacionRepository;
import com.sgch.repository.OperacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class OperacionServiceTest {

    @Mock
    private OperacionRepository operacionRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private CuotaOperacionRepository cuotaOperacionRepository;

    @Mock
    private CalculadoraFinancieraService calculadoraFinancieraService;

    @Spy
    private OperacionMapper operacionMapper = new OperacionMapper();

    @InjectMocks
    private OperacionService operacionService;

    private Cliente comprador;
    private Cliente vendedor;
    private OperacionRequest requestBase;

    @BeforeEach
    void setUp() {
        comprador = new Cliente();
        comprador.setId("comp-1");
        comprador.setNombreRazonSocial("Comprador Test");
        comprador.setCondicionFiscal(CondicionFiscal.RESPONSABLE_INSCRIPTO);

        vendedor = new Cliente();
        vendedor.setId("vend-1");
        vendedor.setNombreRazonSocial("Vendedor Test");
        vendedor.setCondicionFiscal(CondicionFiscal.RESPONSABLE_INSCRIPTO);

        requestBase = new OperacionRequest();
        requestBase.setCompradorId("comp-1");
        requestBase.setVendedorId("vend-1");
        requestBase.setFechaOperacion(LocalDateTime.of(2026, 11, 3, 10, 0));
        requestBase.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        requestBase.setCategoria(CategoriaOperacion.INVERNADA);
        requestBase.setKgNeto(new BigDecimal("10000.00"));
        requestBase.setPrecioKgFacturado(new BigDecimal("2000.00"));
        requestBase.setModalidadPrecio(ModalidadPrecio.NETO);
        requestBase.setComisionPorcentajeVendedor(new BigDecimal("2.00"));
        requestBase.setComisionPorcentajeComprador(new BigDecimal("2.00"));
        requestBase.setFormaPago("Cheque");
        requestBase.setPlazo("30/60/90");
    }

    private CalculoResultado crearCalculoResultadoDummy() {
        return new CalculoResultado(
                new BigDecimal("20000000.00"),
                new BigDecimal("400000.00"),
                new BigDecimal("400000.00"),
                new BigDecimal("2100000.00"),
                new BigDecimal("84000.00"),
                new BigDecimal("84000.00"),
                null,
                new BigDecimal("22100000.00"),
                new BigDecimal("968000.00"),
                new BigDecimal("484000.00"),
                BigDecimal.ZERO
        );
    }

    @Test
    void test01_createDirectoValida_devuelveResponseConCalculoEmbebido() {
        when(clienteRepository.findById("comp-1")).thenReturn(Optional.of(comprador));
        when(clienteRepository.findById("vend-1")).thenReturn(Optional.of(vendedor));

        when(operacionRepository.save(any(Operacion.class))).thenAnswer(inv -> {
            Operacion op = inv.getArgument(0);
            op.setId("op-123");
            return op;
        });

        CalculoResultado dummyCalculo = crearCalculoResultadoDummy();
        when(calculadoraFinancieraService.calcular(any(Operacion.class))).thenReturn(dummyCalculo);
        when(calculadoraFinancieraService.calcularSubtotalGanado(any(Operacion.class))).thenReturn(new BigDecimal("20000000.00"));
        when(calculadoraFinancieraService.calcularIvaGanado(any(Operacion.class))).thenReturn(new BigDecimal("2100000.00"));

        when(cuotaOperacionRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        OperacionResponse response = operacionService.create(requestBase);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo("op-123");
        assertThat(response.calculo()).isEqualTo(dummyCalculo);
        assertThat(response.estadoLiquidacion()).isEqualTo(EstadoLiquidacion.PENDIENTE);
        verify(clienteRepository).save(comprador);
        verify(clienteRepository).save(vendedor);
        assertThat(comprador.getFechaUltimaOperacion()).isNotNull();
        assertThat(vendedor.getFechaUltimaOperacion()).isNotNull();
    }

    @Test
    void test02_createConsignatariaExternaSinNombre_lanzaIllegalArgumentException() {
        requestBase.setModalidadCircuito(ModalidadCircuito.CONSIGNATARIA_EXTERNA);
        requestBase.setConsignatariaExterna("   ");

        when(clienteRepository.findById("comp-1")).thenReturn(Optional.of(comprador));
        when(clienteRepository.findById("vend-1")).thenReturn(Optional.of(vendedor));

        assertThatThrownBy(() -> operacionService.create(requestBase))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("consignataria externa");
    }

    @Test
    void test03_createDirectoConRetencionesExternas_lanzaIllegalArgumentException() {
        requestBase.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        requestBase.setRetencionesExternasMonto(new BigDecimal("15000.00"));

        when(clienteRepository.findById("comp-1")).thenReturn(Optional.of(comprador));
        when(clienteRepository.findById("vend-1")).thenReturn(Optional.of(vendedor));

        assertThatThrownBy(() -> operacionService.create(requestBase))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("retenciones externas");
    }

    @Test
    void test04_createPropiaConAmbasComisionesMayoresACero_lanzaIllegalArgumentException_DA04() {
        requestBase.setModalidadCircuito(ModalidadCircuito.PROPIA);
        requestBase.setComisionPorcentajeVendedor(new BigDecimal("2.00"));
        requestBase.setComisionPorcentajeComprador(new BigDecimal("2.00"));

        when(clienteRepository.findById("comp-1")).thenReturn(Optional.of(comprador));
        when(clienteRepository.findById("vend-1")).thenReturn(Optional.of(vendedor));

        assertThatThrownBy(() -> operacionService.create(requestBase))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("PROPIA");
    }

    @Test
    void test05_createTomaSnapshotCondicionFiscalDesdeClienteVendedor_R075() {
        vendedor.setCondicionFiscal(CondicionFiscal.MONOTRIBUTISTA);

        when(clienteRepository.findById("comp-1")).thenReturn(Optional.of(comprador));
        when(clienteRepository.findById("vend-1")).thenReturn(Optional.of(vendedor));

        ArgumentCaptor<Operacion> opCaptor = ArgumentCaptor.forClass(Operacion.class);
        when(operacionRepository.save(opCaptor.capture())).thenAnswer(inv -> {
            Operacion op = inv.getArgument(0);
            op.setId("op-snap");
            return op;
        });
        when(calculadoraFinancieraService.calcular(any(Operacion.class))).thenReturn(crearCalculoResultadoDummy());

        operacionService.create(requestBase);

        Operacion savedOp = opCaptor.getValue();
        assertThat(savedOp.getCondicionFiscalVendedor()).isEqualTo(CondicionFiscal.MONOTRIBUTISTA);
    }

    @Test
    void test06_createForzaEstadoLiquidacionPendienteAunqueRequestTraigaLiquidado_RN05() {
        requestBase.setEstadoLiquidacion(EstadoLiquidacion.LIQUIDADO);

        when(clienteRepository.findById("comp-1")).thenReturn(Optional.of(comprador));
        when(clienteRepository.findById("vend-1")).thenReturn(Optional.of(vendedor));

        ArgumentCaptor<Operacion> opCaptor = ArgumentCaptor.forClass(Operacion.class);
        when(operacionRepository.save(opCaptor.capture())).thenAnswer(inv -> {
            Operacion op = inv.getArgument(0);
            op.setId("op-pend");
            return op;
        });
        when(calculadoraFinancieraService.calcular(any(Operacion.class))).thenReturn(crearCalculoResultadoDummy());

        OperacionResponse response = operacionService.create(requestBase);

        assertThat(opCaptor.getValue().getEstadoLiquidacion()).isEqualTo(EstadoLiquidacion.PENDIENTE);
        assertThat(response.estadoLiquidacion()).isEqualTo(EstadoLiquidacion.PENDIENTE);
    }

    @Test
    @SuppressWarnings("unchecked")
    void test07_createDirectoSinCuotas_generaNCuotasEnPartesIgualesConDescalceCero_R073() {
        requestBase.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        requestBase.setPlazo("30/60/90");
        requestBase.setCuotas(new ArrayList<>());

        when(clienteRepository.findById("comp-1")).thenReturn(Optional.of(comprador));
        when(clienteRepository.findById("vend-1")).thenReturn(Optional.of(vendedor));

        when(operacionRepository.save(any(Operacion.class))).thenAnswer(inv -> {
            Operacion op = inv.getArgument(0);
            op.setId("op-cuotas-dir");
            return op;
        });

        // total = subtotal (300.00) + iva (31.50) = 331.50 -> 331.50 / 3 = 110.50 c/u
        when(calculadoraFinancieraService.calcularSubtotalGanado(any(Operacion.class))).thenReturn(new BigDecimal("300.00"));
        when(calculadoraFinancieraService.calcularIvaGanado(any(Operacion.class))).thenReturn(new BigDecimal("31.50"));
        when(calculadoraFinancieraService.calcular(any(Operacion.class))).thenReturn(crearCalculoResultadoDummy());

        ArgumentCaptor<List<CuotaOperacion>> cuotasCaptor = ArgumentCaptor.forClass(List.class);
        when(cuotaOperacionRepository.saveAll(cuotasCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));

        operacionService.create(requestBase);

        List<CuotaOperacion> cuotas = cuotasCaptor.getValue();
        assertThat(cuotas).hasSize(3);

        assertThat(cuotas.get(0).getNumeroCuota()).isEqualTo(1);
        assertThat(cuotas.get(0).getDiasPlazoComprador()).isEqualTo(30);
        assertThat(cuotas.get(0).getDiasDescalceVendedor()).isEqualTo(0);
        assertThat(cuotas.get(0).getMontoCuota()).isEqualByComparingTo(new BigDecimal("110.50"));

        assertThat(cuotas.get(1).getNumeroCuota()).isEqualTo(2);
        assertThat(cuotas.get(1).getDiasPlazoComprador()).isEqualTo(60);
        assertThat(cuotas.get(1).getDiasDescalceVendedor()).isEqualTo(0);
        assertThat(cuotas.get(1).getMontoCuota()).isEqualByComparingTo(new BigDecimal("110.50"));

        assertThat(cuotas.get(2).getNumeroCuota()).isEqualTo(3);
        assertThat(cuotas.get(2).getDiasPlazoComprador()).isEqualTo(90);
        assertThat(cuotas.get(2).getDiasDescalceVendedor()).isEqualTo(0);
        assertThat(cuotas.get(2).getMontoCuota()).isEqualByComparingTo(new BigDecimal("110.50"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void test08_createConsignatariaExternaSinCuotas_generaCuota1ConIvaYDescalceSiete_R073() {
        requestBase.setModalidadCircuito(ModalidadCircuito.CONSIGNATARIA_EXTERNA);
        requestBase.setConsignatariaExterna("Consignataria Sur S.A.");
        requestBase.setPlazo("30/60/90");
        requestBase.setCuotas(null);

        when(clienteRepository.findById("comp-1")).thenReturn(Optional.of(comprador));
        when(clienteRepository.findById("vend-1")).thenReturn(Optional.of(vendedor));

        when(operacionRepository.save(any(Operacion.class))).thenAnswer(inv -> {
            Operacion op = inv.getArgument(0);
            op.setId("op-cuotas-ext");
            return op;
        });

        // subtotal 300.00 / 3 = 100.00 por cuota de capital. iva = 31.50
        // cuota 1 = 100.00 + 31.50 = 131.50. cuota 2 = 100.00. cuota 3 = 100.00.
        when(calculadoraFinancieraService.calcularSubtotalGanado(any(Operacion.class))).thenReturn(new BigDecimal("300.00"));
        when(calculadoraFinancieraService.calcularIvaGanado(any(Operacion.class))).thenReturn(new BigDecimal("31.50"));
        when(calculadoraFinancieraService.calcular(any(Operacion.class))).thenReturn(crearCalculoResultadoDummy());

        ArgumentCaptor<List<CuotaOperacion>> cuotasCaptor = ArgumentCaptor.forClass(List.class);
        when(cuotaOperacionRepository.saveAll(cuotasCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));

        operacionService.create(requestBase);

        List<CuotaOperacion> cuotas = cuotasCaptor.getValue();
        assertThat(cuotas).hasSize(3);

        assertThat(cuotas.get(0).getNumeroCuota()).isEqualTo(1);
        assertThat(cuotas.get(0).getDiasPlazoComprador()).isEqualTo(30);
        assertThat(cuotas.get(0).getDiasDescalceVendedor()).isEqualTo(7);
        assertThat(cuotas.get(0).getMontoCuota()).isEqualByComparingTo(new BigDecimal("131.50"));

        assertThat(cuotas.get(1).getNumeroCuota()).isEqualTo(2);
        assertThat(cuotas.get(1).getDiasPlazoComprador()).isEqualTo(60);
        assertThat(cuotas.get(1).getDiasDescalceVendedor()).isEqualTo(7);
        assertThat(cuotas.get(1).getMontoCuota()).isEqualByComparingTo(new BigDecimal("100.00"));

        assertThat(cuotas.get(2).getNumeroCuota()).isEqualTo(3);
        assertThat(cuotas.get(2).getDiasPlazoComprador()).isEqualTo(90);
        assertThat(cuotas.get(2).getDiasDescalceVendedor()).isEqualTo(7);
        assertThat(cuotas.get(2).getMontoCuota()).isEqualByComparingTo(new BigDecimal("100.00"));
    }

    @Test
    void test09_findByIdInexistente_lanzaResourceNotFoundException() {
        when(operacionRepository.findById("no-existe")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> operacionService.findById("no-existe"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("no encontrada");
    }

    @Test
    void test10_findByIdExistente_devuelveResponseConCuotasYCalculo() {
        Operacion op = new Operacion();
        op.setId("op-existente");
        op.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        op.setComprador(comprador);
        op.setVendedor(vendedor);

        when(operacionRepository.findById("op-existente")).thenReturn(Optional.of(op));
        when(cuotaOperacionRepository.findByOperacionIdOrderByNumeroCuotaAsc("op-existente")).thenReturn(Collections.emptyList());
        when(calculadoraFinancieraService.calcular(op)).thenReturn(crearCalculoResultadoDummy());

        OperacionResponse res = operacionService.findById("op-existente");

        assertThat(res).isNotNull();
        assertThat(res.id()).isEqualTo("op-existente");
        assertThat(res.calculo()).isNotNull();
    }

    @Test
    void test11_updateOperacion_actualizaVendedorYCondicionFiscalVendedor_R075() {
        Operacion opExistente = new Operacion();
        opExistente.setId("op-upd");
        opExistente.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        opExistente.setComprador(comprador);
        opExistente.setVendedor(vendedor);
        opExistente.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);

        when(operacionRepository.findById("op-upd")).thenReturn(Optional.of(opExistente));
        when(clienteRepository.findById("comp-1")).thenReturn(Optional.of(comprador));

        Cliente nuevoVendedor = new Cliente();
        nuevoVendedor.setId("vend-mono");
        nuevoVendedor.setCondicionFiscal(CondicionFiscal.MONOTRIBUTISTA);
        when(clienteRepository.findById("vend-mono")).thenReturn(Optional.of(nuevoVendedor));

        requestBase.setVendedorId("vend-mono");
        when(operacionRepository.save(any(Operacion.class))).thenAnswer(inv -> inv.getArgument(0));
        when(cuotaOperacionRepository.findByOperacionIdOrderByNumeroCuotaAsc("op-upd")).thenReturn(Collections.emptyList());
        when(calculadoraFinancieraService.calcular(any(Operacion.class))).thenReturn(crearCalculoResultadoDummy());

        OperacionResponse response = operacionService.update("op-upd", requestBase);

        assertThat(opExistente.getVendedor()).isEqualTo(nuevoVendedor);
        assertThat(opExistente.getCondicionFiscalVendedor()).isEqualTo(CondicionFiscal.MONOTRIBUTISTA);
        assertThat(response.condicionFiscalVendedor()).isEqualTo(CondicionFiscal.MONOTRIBUTISTA);
    }

    @Test
    @SuppressWarnings("unchecked")
    void test12_createConsignatariaExternaConCuotaExplicitaSinDescalce_aplicaDefaultSiete_R076() {
        requestBase.setModalidadCircuito(ModalidadCircuito.CONSIGNATARIA_EXTERNA);
        requestBase.setConsignatariaExterna("Consignataria Central");

        CuotaOperacionRequest cuotaReq = new CuotaOperacionRequest();
        cuotaReq.setNumeroCuota(1);
        cuotaReq.setDiasPlazoComprador(30);
        cuotaReq.setDiasDescalceVendedor(null); // Null explícito
        cuotaReq.setMontoCuota(new BigDecimal("500000.00"));
        requestBase.setCuotas(List.of(cuotaReq));

        when(clienteRepository.findById("comp-1")).thenReturn(Optional.of(comprador));
        when(clienteRepository.findById("vend-1")).thenReturn(Optional.of(vendedor));
        when(operacionRepository.save(any(Operacion.class))).thenAnswer(inv -> {
            Operacion op = inv.getArgument(0);
            op.setId("op-cuota-exp");
            return op;
        });

        ArgumentCaptor<List<CuotaOperacion>> captor = ArgumentCaptor.forClass(List.class);
        when(cuotaOperacionRepository.saveAll(captor.capture())).thenAnswer(inv -> inv.getArgument(0));
        when(calculadoraFinancieraService.calcular(any(Operacion.class))).thenReturn(crearCalculoResultadoDummy());

        operacionService.create(requestBase);

        List<CuotaOperacion> guardadas = captor.getValue();
        assertThat(guardadas).hasSize(1);
        assertThat(guardadas.get(0).getDiasDescalceVendedor()).isEqualTo(7);
    }

    @Test
    void testCreateYUpdateConCuotasFechaBasePlazoInconsistente_lanzaIllegalArgumentException() {
        CuotaOperacionRequest cuota1 = new CuotaOperacionRequest();
        cuota1.setNumeroCuota(1);
        cuota1.setFechaBasePlazo(FechaBasePlazo.CARGA);
        cuota1.setDiasPlazoComprador(30);
        cuota1.setMontoCuota(new BigDecimal("500000.00"));

        CuotaOperacionRequest cuota2 = new CuotaOperacionRequest();
        cuota2.setNumeroCuota(2);
        cuota2.setFechaBasePlazo(FechaBasePlazo.REMATE);
        cuota2.setDiasPlazoComprador(60);
        cuota2.setMontoCuota(new BigDecimal("500000.00"));

        requestBase.setCuotas(List.of(cuota1, cuota2));

        when(clienteRepository.findById("comp-1")).thenReturn(Optional.of(comprador));
        when(clienteRepository.findById("vend-1")).thenReturn(Optional.of(vendedor));

        assertThatThrownBy(() -> operacionService.create(requestBase))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("fecha base de plazo");

        Operacion opExistente = new Operacion();
        opExistente.setId("op-1");
        when(operacionRepository.findById("op-1")).thenReturn(Optional.of(opExistente));

        assertThatThrownBy(() -> operacionService.update("op-1", requestBase))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("fecha base de plazo");

        // Caso borde: cuota 1 con null (equivale a CARGA) y cuota 2 con CARGA explícita -> debe permitir
        CuotaOperacionRequest cuotaDefaultCarga = new CuotaOperacionRequest();
        cuotaDefaultCarga.setNumeroCuota(1);
        cuotaDefaultCarga.setFechaBasePlazo(null);
        cuotaDefaultCarga.setDiasPlazoComprador(30);
        cuotaDefaultCarga.setMontoCuota(new BigDecimal("500000.00"));

        CuotaOperacionRequest cuotaExplicitaCarga = new CuotaOperacionRequest();
        cuotaExplicitaCarga.setNumeroCuota(2);
        cuotaExplicitaCarga.setFechaBasePlazo(FechaBasePlazo.CARGA);
        cuotaExplicitaCarga.setDiasPlazoComprador(60);
        cuotaExplicitaCarga.setMontoCuota(new BigDecimal("500000.00"));

        requestBase.setCuotas(List.of(cuotaDefaultCarga, cuotaExplicitaCarga));

        when(operacionRepository.save(any(Operacion.class))).thenAnswer(inv -> inv.getArgument(0));
        when(cuotaOperacionRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));
        when(calculadoraFinancieraService.calcular(any(Operacion.class))).thenReturn(crearCalculoResultadoDummy());

        OperacionResponse response = operacionService.create(requestBase);
        assertThat(response).isNotNull();
    }
}
