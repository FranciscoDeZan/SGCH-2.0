package com.sgch.repository;

import com.sgch.model.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(FlywayAutoConfiguration.class)
public class CobroRepositoryTest {

    @Container
    @ServiceConnection
    static MySQLContainer mysql = new MySQLContainer("mysql:8.0");

    @Autowired
    private CobroRepository cobroRepository;

    @Autowired
    private CuotaOperacionRepository cuotaRepository;

    @Autowired
    private OperacionRepository operacionRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EntityManager entityManager;

    private Cliente comprador;
    private Cliente vendedor;
    private Operacion operacion;
    private CuotaOperacion cuota;

    @BeforeEach
    void setUp() {
        comprador = new Cliente();
        comprador.setNombreRazonSocial("Comprador S.A.");
        comprador.setTelefono("3411112222");
        comprador.setDireccion("Ruta 9 Km 200");
        comprador = clienteRepository.saveAndFlush(comprador);

        vendedor = new Cliente();
        vendedor.setNombreRazonSocial("Vendedor Campo Norte");
        vendedor.setTelefono("3413334444");
        vendedor.setDireccion("Ruta 34 Km 50");
        vendedor = clienteRepository.saveAndFlush(vendedor);

        operacion = new Operacion();
        operacion.setFechaCarga(LocalDateTime.of(2026, 11, 3, 10, 0));
        operacion.setFechaOperacion(LocalDateTime.of(2026, 11, 3, 10, 0));
        operacion.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        operacion.setComprador(comprador);
        operacion.setVendedor(vendedor);
        operacion.setCategoria(CategoriaOperacion.FAENA);
        operacion.setKgNeto(new BigDecimal("10000.00"));
        operacion.setPrecioKgFacturado(new BigDecimal("2000.00"));
        operacion.setModalidadPrecio(ModalidadPrecio.FINAL);
        operacion.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        operacion.setFormaPago("Contado y plazo");
        operacion = operacionRepository.saveAndFlush(operacion);

        cuota = new CuotaOperacion();
        cuota.setOperacion(operacion);
        cuota.setNumeroCuota(1);
        cuota.setFechaBasePlazo(FechaBasePlazo.CARGA);
        cuota.setDiasPlazoComprador(30);
        cuota.setDiasDescalceVendedor(0);
        cuota.setFechaVencimientoComprador(LocalDate.of(2026, 12, 3));
        cuota.setFechaVencimientoVendedor(LocalDate.of(2026, 12, 3));
        cuota.setMontoCuota(new BigDecimal("5000000.00"));
        cuota = cuotaRepository.saveAndFlush(cuota);

        entityManager.clear();
    }

    @ParameterizedTest
    @EnumSource(MedioPago.class)
    void testPersistCobroWithAll5MediosDePago(MedioPago medioPago) {
        Cobro cobro = new Cobro();
        cobro.setOperacion(operacion);
        cobro.setCuota(cuota);
        cobro.setCliente(comprador);
        cobro.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMPRADOR);
        cobro.setFechaMovimiento(LocalDate.of(2026, 11, 3));
        cobro.setMonto(new BigDecimal("1000000.00"));
        cobro.setMedioPago(medioPago);
        cobro.setDocumentado(true);
        cobro.setObservaciones("Pago con medio " + medioPago);

        Cobro saved = cobroRepository.saveAndFlush(cobro);
        entityManager.clear();

        Cobro found = cobroRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getMedioPago()).isEqualTo(medioPago);
        assertThat(found.getMonto()).isEqualByComparingTo(new BigDecimal("1000000.00"));
        assertThat(found.getCliente().getId()).isEqualTo(comprador.getId());
        assertThat(found.getOperacion().getId()).isEqualTo(operacion.getId());
        assertThat(found.getCuota().getId()).isEqualTo(cuota.getId());
    }

    @Test
    void testPersistCobroContadoWithoutCuota() {
        Cobro cobro = new Cobro();
        cobro.setOperacion(operacion);
        cobro.setCuota(null); // Pago de contado / anticipo sin cuota asignada
        cobro.setCliente(comprador);
        cobro.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMPRADOR);
        cobro.setFechaMovimiento(LocalDate.of(2026, 11, 4));
        cobro.setMonto(new BigDecimal("2500000.50"));
        cobro.setMedioPago(MedioPago.TRANSFERENCIA);
        cobro.setObservaciones("Anticipo de contado");

        Cobro saved = cobroRepository.saveAndFlush(cobro);
        entityManager.clear();

        Cobro found = cobroRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getCuota()).isNull();
        assertThat(found.getMonto()).isEqualByComparingTo(new BigDecimal("2500000.50"));
        assertThat(found.getDocumentado()).isTrue();
    }

    @Test
    void testPersistCobroWithCuotaOfDifferentOperacionPersistsAtDatabaseLevel() {
        // Otra operación con su propia cuota
        Operacion op2 = new Operacion();
        op2.setFechaCarga(LocalDateTime.now());
        op2.setFechaOperacion(LocalDateTime.now());
        op2.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        op2.setComprador(comprador);
        op2.setVendedor(vendedor);
        op2.setCategoria(CategoriaOperacion.REPRODUCCION);
        op2.setKgNeto(new BigDecimal("5000.00"));
        op2.setPrecioKgFacturado(new BigDecimal("3000.00"));
        op2.setModalidadPrecio(ModalidadPrecio.NETO);
        op2.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        op2.setFormaPago("Plazo");
        op2 = operacionRepository.saveAndFlush(op2);

        CuotaOperacion cuotaOp2 = new CuotaOperacion();
        cuotaOp2.setOperacion(op2);
        cuotaOp2.setNumeroCuota(1);
        cuotaOp2.setFechaBasePlazo(FechaBasePlazo.CARGA);
        cuotaOp2.setDiasPlazoComprador(15);
        cuotaOp2.setDiasDescalceVendedor(0);
        cuotaOp2.setFechaVencimientoComprador(LocalDate.of(2026, 11, 20));
        cuotaOp2.setFechaVencimientoVendedor(LocalDate.of(2026, 11, 20));
        cuotaOp2.setMontoCuota(new BigDecimal("3000000.00"));
        cuotaOp2 = cuotaRepository.saveAndFlush(cuotaOp2);

        // Cobro vinculado a operacion1 pero apuntando a cuotaOp2
        Cobro cobroCruzado = new Cobro();
        cobroCruzado.setOperacion(operacion);
        cobroCruzado.setCuota(cuotaOp2);
        cobroCruzado.setCliente(comprador);
        cobroCruzado.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMPRADOR);
        cobroCruzado.setFechaMovimiento(LocalDate.of(2026, 11, 5));
        cobroCruzado.setMonto(new BigDecimal("500000.00"));
        cobroCruzado.setMedioPago(MedioPago.ECHEQ);

        Cobro saved = cobroRepository.saveAndFlush(cobroCruzado);
        entityManager.clear();

        Cobro found = cobroRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getOperacion().getId()).isEqualTo(operacion.getId());
        assertThat(found.getCuota().getId()).isEqualTo(cuotaOp2.getId());
    }

    @Test
    void testFindByOperacionIdAndFindByCuotaId() {
        Cobro c1 = new Cobro();
        c1.setOperacion(operacion);
        c1.setCuota(cuota);
        c1.setCliente(comprador);
        c1.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMPRADOR);
        c1.setFechaMovimiento(LocalDate.of(2026, 11, 10));
        c1.setMonto(new BigDecimal("100000.00"));
        c1.setMedioPago(MedioPago.TRANSFERENCIA);

        Cobro c2 = new Cobro();
        c2.setOperacion(operacion);
        c2.setCuota(cuota);
        c2.setCliente(vendedor);
        c2.setTipoMovimiento(TipoMovimientoCobro.PAGO_VENDEDOR);
        c2.setFechaMovimiento(LocalDate.of(2026, 11, 15));
        c2.setMonto(new BigDecimal("90000.00"));
        c2.setMedioPago(MedioPago.TRANSFERENCIA);

        cobroRepository.saveAndFlush(c2);
        cobroRepository.saveAndFlush(c1);
        entityManager.clear();

        List<Cobro> porOperacion = cobroRepository.findByOperacionIdOrderByFechaMovimientoAsc(operacion.getId());
        assertThat(porOperacion).hasSize(2);
        assertThat(porOperacion.get(0).getFechaMovimiento()).isEqualTo(LocalDate.of(2026, 11, 10));
        assertThat(porOperacion.get(1).getFechaMovimiento()).isEqualTo(LocalDate.of(2026, 11, 15));

        List<Cobro> porCuota = cobroRepository.findByCuotaIdOrderByFechaMovimientoAsc(cuota.getId());
        assertThat(porCuota).hasSize(2);
    }

    @Test
    void testDocumentadoDefaultTrueAndExplicitFalse() {
        Cobro cobroDefault = new Cobro();
        cobroDefault.setOperacion(operacion);
        cobroDefault.setCliente(comprador);
        cobroDefault.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMISION);
        cobroDefault.setFechaMovimiento(LocalDate.of(2026, 11, 6));
        cobroDefault.setMonto(new BigDecimal("50000.00"));
        cobroDefault.setMedioPago(MedioPago.EFECTIVO);

        Cobro savedDefault = cobroRepository.saveAndFlush(cobroDefault);

        Cobro cobroNoDoc = new Cobro();
        cobroNoDoc.setOperacion(operacion);
        cobroNoDoc.setCliente(comprador);
        cobroNoDoc.setTipoMovimiento(TipoMovimientoCobro.RETENCION_SALDO);
        cobroNoDoc.setFechaMovimiento(LocalDate.of(2026, 11, 7));
        cobroNoDoc.setMonto(new BigDecimal("20000.00"));
        cobroNoDoc.setMedioPago(MedioPago.CANJE_ESPECIE);
        cobroNoDoc.setDocumentado(false);

        Cobro savedNoDoc = cobroRepository.saveAndFlush(cobroNoDoc);
        entityManager.clear();

        Cobro foundDefault = cobroRepository.findById(savedDefault.getId()).orElseThrow();
        assertThat(foundDefault.getDocumentado()).isTrue();

        Cobro foundNoDoc = cobroRepository.findById(savedNoDoc.getId()).orElseThrow();
        assertThat(foundNoDoc.getDocumentado()).isFalse();
    }
}
