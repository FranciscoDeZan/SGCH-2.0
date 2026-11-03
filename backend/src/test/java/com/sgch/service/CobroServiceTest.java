package com.sgch.service;

import com.sgch.dto.CobroRequest;
import com.sgch.dto.CobroResponse;
import com.sgch.exception.ResourceNotFoundException;
import com.sgch.mapper.CobroMapper;
import com.sgch.model.Cliente;
import com.sgch.model.Cobro;
import com.sgch.model.CuotaOperacion;
import com.sgch.model.EstadoCuotaCobro;
import com.sgch.model.EstadoCuotaPago;
import com.sgch.model.EstadoLiquidacion;
import com.sgch.model.MedioPago;
import com.sgch.model.ModalidadCircuito;
import com.sgch.model.Operacion;
import com.sgch.model.TipoMovimientoCobro;
import com.sgch.repository.ClienteRepository;
import com.sgch.repository.CobroRepository;
import com.sgch.repository.CuotaOperacionRepository;
import com.sgch.repository.OperacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CobroServiceTest {

    @Mock
    private CobroRepository cobroRepository;

    @Mock
    private OperacionRepository operacionRepository;

    @Mock
    private CuotaOperacionRepository cuotaOperacionRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private CalculadoraFinancieraService calculadoraFinancieraService;

    @Spy
    private CobroMapper cobroMapper = new CobroMapper();

    @InjectMocks
    private CobroService cobroService;

    private Operacion operacion;
    private Cliente cliente;
    private CuotaOperacion cuota;
    private CobroRequest requestBase;

    @BeforeEach
    void setUp() {
        operacion = new Operacion();
        operacion.setId("op-1");
        operacion.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        operacion.setEstadoLiquidacion(EstadoLiquidacion.PENDIENTE);

        cliente = new Cliente();
        cliente.setId("cli-1");
        cliente.setNombreRazonSocial("Cliente Test");

        cuota = new CuotaOperacion();
        cuota.setId("cuota-1");
        cuota.setOperacion(operacion);
        cuota.setNumeroCuota(1);
        cuota.setMontoCuota(new BigDecimal("1000000.00"));
        cuota.setEstadoCobro(EstadoCuotaCobro.PENDIENTE);
        cuota.setEstadoPago(EstadoCuotaPago.PENDIENTE);

        requestBase = new CobroRequest();
        requestBase.setOperacionId("op-1");
        requestBase.setCuotaId("cuota-1");
        requestBase.setClienteId("cli-1");
        requestBase.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMPRADOR);
        requestBase.setFechaMovimiento(LocalDate.of(2026, 11, 3));
        requestBase.setMonto(new BigDecimal("500000.00"));
        requestBase.setMedioPago(MedioPago.TRANSFERENCIA);
        requestBase.setDocumentado(true);
    }

    @Test
    void test10_createCobroParcial_actualizaEstadoCuotaAParcial() {
        when(operacionRepository.findById("op-1")).thenReturn(Optional.of(operacion));
        when(clienteRepository.findById("cli-1")).thenReturn(Optional.of(cliente));
        when(cuotaOperacionRepository.findById("cuota-1")).thenReturn(Optional.of(cuota));

        Cobro cobroPersistido = new Cobro();
        cobroPersistido.setId("cobro-1");
        cobroPersistido.setOperacion(operacion);
        cobroPersistido.setCuota(cuota);
        cobroPersistido.setCliente(cliente);
        cobroPersistido.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMPRADOR);
        cobroPersistido.setMonto(new BigDecimal("500000.00"));
        when(cobroRepository.save(any(Cobro.class))).thenReturn(cobroPersistido);

        when(cobroRepository.findByCuotaIdOrderByFechaMovimientoAsc("cuota-1"))
                .thenReturn(List.of(cobroPersistido));
        when(cobroRepository.findByOperacionIdOrderByFechaMovimientoAsc("op-1"))
                .thenReturn(List.of(cobroPersistido));

        when(calculadoraFinancieraService.calcularSaldoHaciendaEntrePartes(operacion))
                .thenReturn(new BigDecimal("22100000.00"));
        when(calculadoraFinancieraService.calcularSaldoComisionFirma(operacion))
                .thenReturn(new BigDecimal("968000.00"));

        CobroResponse response = cobroService.create(requestBase);

        assertThat(response).isNotNull();
        assertThat(cuota.getEstadoCobro()).isEqualTo(EstadoCuotaCobro.PARCIAL);
        assertThat(operacion.getEstadoLiquidacion()).isEqualTo(EstadoLiquidacion.PARCIALMENTE_PAGADO);
        verify(cuotaOperacionRepository).save(cuota);
        verify(operacionRepository).save(operacion);
    }

    @Test
    void test11_createCobroCompleto_actualizaEstadoCuotaACobrado() {
        requestBase.setMonto(new BigDecimal("1000000.00"));

        when(operacionRepository.findById("op-1")).thenReturn(Optional.of(operacion));
        when(clienteRepository.findById("cli-1")).thenReturn(Optional.of(cliente));
        when(cuotaOperacionRepository.findById("cuota-1")).thenReturn(Optional.of(cuota));

        Cobro cobroPersistido = new Cobro();
        cobroPersistido.setId("cobro-1");
        cobroPersistido.setOperacion(operacion);
        cobroPersistido.setCuota(cuota);
        cobroPersistido.setCliente(cliente);
        cobroPersistido.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMPRADOR);
        cobroPersistido.setMonto(new BigDecimal("1000000.00"));
        when(cobroRepository.save(any(Cobro.class))).thenReturn(cobroPersistido);

        when(cobroRepository.findByCuotaIdOrderByFechaMovimientoAsc("cuota-1"))
                .thenReturn(List.of(cobroPersistido));
        when(cobroRepository.findByOperacionIdOrderByFechaMovimientoAsc("op-1"))
                .thenReturn(List.of(cobroPersistido));

        when(calculadoraFinancieraService.calcularSaldoHaciendaEntrePartes(operacion))
                .thenReturn(new BigDecimal("22100000.00"));
        when(calculadoraFinancieraService.calcularSaldoComisionFirma(operacion))
                .thenReturn(new BigDecimal("968000.00"));

        CobroResponse response = cobroService.create(requestBase);

        assertThat(response).isNotNull();
        assertThat(cuota.getEstadoCobro()).isEqualTo(EstadoCuotaCobro.COBRADO);
        verify(cuotaOperacionRepository).save(cuota);
    }

    @Test
    void test12_createCobroImputadoACuotaDeOtraOperacion_lanzaIllegalArgumentException() {
        Operacion otraOperacion = new Operacion();
        otraOperacion.setId("op-otra");
        cuota.setOperacion(otraOperacion);

        when(operacionRepository.findById("op-1")).thenReturn(Optional.of(operacion));
        when(clienteRepository.findById("cli-1")).thenReturn(Optional.of(cliente));
        when(cuotaOperacionRepository.findById("cuota-1")).thenReturn(Optional.of(cuota));

        assertThatThrownBy(() -> cobroService.create(requestBase))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("no pertenece a la operacion");
    }

    @Test
    void test13_createCobroAlContadoSinCuota_persisteCorrectamente() {
        requestBase.setCuotaId(null);

        when(operacionRepository.findById("op-1")).thenReturn(Optional.of(operacion));
        when(clienteRepository.findById("cli-1")).thenReturn(Optional.of(cliente));

        Cobro cobroPersistido = new Cobro();
        cobroPersistido.setId("cobro-contado");
        cobroPersistido.setOperacion(operacion);
        cobroPersistido.setCliente(cliente);
        cobroPersistido.setCuota(null);
        cobroPersistido.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMPRADOR);
        cobroPersistido.setMonto(new BigDecimal("500000.00"));
        when(cobroRepository.save(any(Cobro.class))).thenReturn(cobroPersistido);

        when(cobroRepository.findByOperacionIdOrderByFechaMovimientoAsc("op-1"))
                .thenReturn(List.of(cobroPersistido));
        when(calculadoraFinancieraService.calcularSaldoHaciendaEntrePartes(operacion))
                .thenReturn(new BigDecimal("22100000.00"));
        when(calculadoraFinancieraService.calcularSaldoComisionFirma(operacion))
                .thenReturn(new BigDecimal("968000.00"));

        CobroResponse response = cobroService.create(requestBase);

        assertThat(response).isNotNull();
        assertThat(response.cuotaId()).isNull();
    }

    @Test
    void test14_createCobrosCubrenHaciendaYComision_estadoLiquidacionPasaALiquidado_RN05() {
        requestBase.setCuotaId(null);
        requestBase.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMISION);
        requestBase.setMonto(new BigDecimal("968000.00"));

        when(operacionRepository.findById("op-1")).thenReturn(Optional.of(operacion));
        when(clienteRepository.findById("cli-1")).thenReturn(Optional.of(cliente));

        Cobro cobroComision = new Cobro();
        cobroComision.setId("c-com");
        cobroComision.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMISION);
        cobroComision.setMonto(new BigDecimal("968000.00"));
        when(cobroRepository.save(any(Cobro.class))).thenReturn(cobroComision);

        Cobro cobroHaciendaPrevio = new Cobro();
        cobroHaciendaPrevio.setId("c-hac");
        cobroHaciendaPrevio.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMPRADOR);
        cobroHaciendaPrevio.setMonto(new BigDecimal("22100000.00"));

        when(cobroRepository.findByOperacionIdOrderByFechaMovimientoAsc("op-1"))
                .thenReturn(List.of(cobroHaciendaPrevio, cobroComision));

        when(calculadoraFinancieraService.calcularSaldoHaciendaEntrePartes(operacion))
                .thenReturn(new BigDecimal("22100000.00"));
        when(calculadoraFinancieraService.calcularSaldoComisionFirma(operacion))
                .thenReturn(new BigDecimal("968000.00"));

        cobroService.create(requestBase);

        assertThat(operacion.getEstadoLiquidacion()).isEqualTo(EstadoLiquidacion.LIQUIDADO);
        verify(operacionRepository).save(operacion);
    }

    @Test
    void test15_createCobroComisionSoloConHaciendaPendiente_noPasaALiquidado_R083OpcionA() {
        requestBase.setCuotaId(null);
        requestBase.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMISION);
        requestBase.setMonto(new BigDecimal("968000.00"));

        when(operacionRepository.findById("op-1")).thenReturn(Optional.of(operacion));
        when(clienteRepository.findById("cli-1")).thenReturn(Optional.of(cliente));

        Cobro cobroComision = new Cobro();
        cobroComision.setId("c-com");
        cobroComision.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMISION);
        cobroComision.setMonto(new BigDecimal("968000.00"));
        when(cobroRepository.save(any(Cobro.class))).thenReturn(cobroComision);

        // Sin cobro de hacienda
        when(cobroRepository.findByOperacionIdOrderByFechaMovimientoAsc("op-1"))
                .thenReturn(List.of(cobroComision));

        when(calculadoraFinancieraService.calcularSaldoHaciendaEntrePartes(operacion))
                .thenReturn(new BigDecimal("22100000.00"));
        when(calculadoraFinancieraService.calcularSaldoComisionFirma(operacion))
                .thenReturn(new BigDecimal("968000.00"));

        cobroService.create(requestBase);

        // Debe ser PARCIALMENTE_PAGADO, nunca LIQUIDADO
        assertThat(operacion.getEstadoLiquidacion()).isEqualTo(EstadoLiquidacion.PARCIALMENTE_PAGADO);
        verify(operacionRepository).save(operacion);
    }

    @Test
    void test16_findByOperacionId_ordenaPorFechaAscendente() {
        Cobro c1 = new Cobro();
        c1.setId("c1");
        c1.setFechaMovimiento(LocalDate.of(2026, 11, 1));
        c1.setMonto(new BigDecimal("1000.00"));

        Cobro c2 = new Cobro();
        c2.setId("c2");
        c2.setFechaMovimiento(LocalDate.of(2026, 11, 2));
        c2.setMonto(new BigDecimal("2000.00"));

        when(cobroRepository.findByOperacionIdOrderByFechaMovimientoAsc("op-1"))
                .thenReturn(List.of(c1, c2));

        List<CobroResponse> list = cobroService.findByOperacionId("op-1");

        assertThat(list).hasSize(2);
        assertThat(list.get(0).id()).isEqualTo("c1");
        assertThat(list.get(1).id()).isEqualTo("c2");
    }

    @Test
    void test17_findByIdExistente_devuelveCobroResponse() {
        Cobro cobro = new Cobro();
        cobro.setId("cobro-100");
        cobro.setOperacion(operacion);
        cobro.setCliente(cliente);
        cobro.setMonto(new BigDecimal("50000.00"));
        when(cobroRepository.findById("cobro-100")).thenReturn(Optional.of(cobro));

        CobroResponse response = cobroService.findById("cobro-100");

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo("cobro-100");
        assertThat(response.monto()).isEqualByComparingTo(new BigDecimal("50000.00"));
    }

    @Test
    void test18_findByIdInexistente_lanzaResourceNotFoundException() {
        when(cobroRepository.findById("no-existe")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cobroService.findById("no-existe"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("no encontrado");
    }
}
