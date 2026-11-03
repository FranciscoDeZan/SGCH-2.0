package com.sgch.repository;

import com.sgch.model.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(FlywayAutoConfiguration.class)
public class CuotaOperacionRepositoryTest {

    @Container
    @ServiceConnection
    static MySQLContainer mysql = new MySQLContainer("mysql:8.0");

    @Autowired
    private CuotaOperacionRepository cuotaRepository;

    @Autowired
    private OperacionRepository operacionRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EntityManager entityManager;

    private Operacion operacion;

    @BeforeEach
    void setUp() {
        Cliente comprador = new Cliente();
        comprador.setNombreRazonSocial("Comprador S.A.");
        comprador.setTelefono("3411112222");
        comprador.setDireccion("Ruta 9 Km 200");
        comprador = clienteRepository.saveAndFlush(comprador);

        Cliente vendedor = new Cliente();
        vendedor.setNombreRazonSocial("Vendedor Campo Norte");
        vendedor.setTelefono("3413334444");
        vendedor.setDireccion("Ruta 34 Km 50");
        vendedor = clienteRepository.saveAndFlush(vendedor);

        operacion = new Operacion();
        operacion.setFechaCarga(LocalDateTime.of(2026, 11, 3, 10, 0));
        operacion.setFechaOperacion(LocalDateTime.of(2026, 11, 3, 10, 0));
        operacion.setModalidadCircuito(ModalidadCircuito.CONSIGNATARIA_EXTERNA);
        operacion.setConsignatariaExterna("Consignataria Litoral");
        operacion.setComprador(comprador);
        operacion.setVendedor(vendedor);
        operacion.setCategoria(CategoriaOperacion.INVERNADA);
        operacion.setKgNeto(new BigDecimal("15000.00"));
        operacion.setPrecioKgFacturado(new BigDecimal("2000.00"));
        operacion.setModalidadPrecio(ModalidadPrecio.NETO);
        operacion.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        operacion.setFormaPago("Cuotas 30/60/90");
        operacion = operacionRepository.saveAndFlush(operacion);

        entityManager.clear();
    }

    @Test
    void testSaveAndRetrieve3CuotasWithDescalceOrderedByNumeroCuota() {
        LocalDate baseDate = LocalDate.of(2026, 11, 1);

        CuotaOperacion c1 = new CuotaOperacion();
        c1.setOperacion(operacion);
        c1.setNumeroCuota(1);
        c1.setFechaBasePlazo(FechaBasePlazo.CARGA);
        c1.setDiasPlazoComprador(30);
        c1.setDiasDescalceVendedor(7);
        c1.setFechaVencimientoComprador(baseDate.plusDays(30));
        c1.setFechaVencimientoVendedor(baseDate.plusDays(37));
        c1.setMontoCuota(new BigDecimal("10000000.00"));

        CuotaOperacion c2 = new CuotaOperacion();
        c2.setOperacion(operacion);
        c2.setNumeroCuota(2);
        c2.setFechaBasePlazo(FechaBasePlazo.CARGA);
        c2.setDiasPlazoComprador(60);
        c2.setDiasDescalceVendedor(7);
        c2.setFechaVencimientoComprador(baseDate.plusDays(60));
        c2.setFechaVencimientoVendedor(baseDate.plusDays(67));
        c2.setMontoCuota(new BigDecimal("10000000.00"));

        CuotaOperacion c3 = new CuotaOperacion();
        c3.setOperacion(operacion);
        c3.setNumeroCuota(3);
        c3.setFechaBasePlazo(FechaBasePlazo.CARGA);
        c3.setDiasPlazoComprador(90);
        c3.setDiasDescalceVendedor(7);
        c3.setFechaVencimientoComprador(baseDate.plusDays(90));
        c3.setFechaVencimientoVendedor(baseDate.plusDays(97));
        c3.setMontoCuota(new BigDecimal("10000000.00"));

        cuotaRepository.saveAndFlush(c2);
        cuotaRepository.saveAndFlush(c1);
        cuotaRepository.saveAndFlush(c3);
        entityManager.clear();

        List<CuotaOperacion> cuotas = cuotaRepository.findByOperacionIdOrderByNumeroCuotaAsc(operacion.getId());
        assertThat(cuotas).hasSize(3);

        assertThat(cuotas.get(0).getNumeroCuota()).isEqualTo(1);
        assertThat(cuotas.get(0).getFechaVencimientoComprador()).isEqualTo(LocalDate.of(2026, 12, 1));
        assertThat(cuotas.get(0).getFechaVencimientoVendedor()).isEqualTo(LocalDate.of(2026, 12, 8));
        assertThat(cuotas.get(0).getMontoCuota()).isEqualByComparingTo(new BigDecimal("10000000.00"));

        assertThat(cuotas.get(1).getNumeroCuota()).isEqualTo(2);
        assertThat(cuotas.get(1).getFechaVencimientoComprador()).isEqualTo(LocalDate.of(2026, 12, 31));
        assertThat(cuotas.get(1).getFechaVencimientoVendedor()).isEqualTo(LocalDate.of(2027, 1, 7));

        assertThat(cuotas.get(2).getNumeroCuota()).isEqualTo(3);
        assertThat(cuotas.get(2).getFechaVencimientoComprador()).isEqualTo(LocalDate.of(2027, 1, 30));
        assertThat(cuotas.get(2).getFechaVencimientoVendedor()).isEqualTo(LocalDate.of(2027, 2, 6));
    }

    @Test
    void testUniqueOperacionIdAndNumeroCuotaThrowsException() {
        CuotaOperacion c1 = new CuotaOperacion();
        c1.setOperacion(operacion);
        c1.setNumeroCuota(1);
        c1.setFechaBasePlazo(FechaBasePlazo.CARGA);
        c1.setDiasPlazoComprador(30);
        c1.setDiasDescalceVendedor(0);
        c1.setFechaVencimientoComprador(LocalDate.of(2026, 12, 1));
        c1.setFechaVencimientoVendedor(LocalDate.of(2026, 12, 1));
        c1.setMontoCuota(new BigDecimal("5000000.00"));
        cuotaRepository.saveAndFlush(c1);

        CuotaOperacion c2 = new CuotaOperacion();
        c2.setOperacion(operacion);
        c2.setNumeroCuota(1); // Mismo número de cuota para la misma operación
        c2.setFechaBasePlazo(FechaBasePlazo.CARGA);
        c2.setDiasPlazoComprador(60);
        c2.setDiasDescalceVendedor(0);
        c2.setFechaVencimientoComprador(LocalDate.of(2026, 12, 31));
        c2.setFechaVencimientoVendedor(LocalDate.of(2026, 12, 31));
        c2.setMontoCuota(new BigDecimal("5000000.00"));

        assertThrows(DataIntegrityViolationException.class, () -> {
            cuotaRepository.saveAndFlush(c2);
        });
    }

    @Test
    void testMontoCuotaEditableDistintoATotalSobreN() {
        CuotaOperacion c = new CuotaOperacion();
        c.setOperacion(operacion);
        c.setNumeroCuota(1);
        c.setFechaBasePlazo(FechaBasePlazo.REMATE);
        c.setDiasPlazoComprador(45);
        c.setDiasDescalceVendedor(0);
        c.setFechaVencimientoComprador(LocalDate.of(2026, 12, 15));
        c.setFechaVencimientoVendedor(LocalDate.of(2026, 12, 15));
        c.setMontoCuota(new BigDecimal("12345678.99"));

        CuotaOperacion saved = cuotaRepository.saveAndFlush(c);
        entityManager.clear();

        CuotaOperacion found = cuotaRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getMontoCuota()).isEqualByComparingTo(new BigDecimal("12345678.99"));
        assertThat(found.getFechaBasePlazo()).isEqualTo(FechaBasePlazo.REMATE);
    }

    @Test
    void testDefaultEstadoCobroYEstadoPagoIsPendiente() {
        CuotaOperacion c = new CuotaOperacion();
        c.setOperacion(operacion);
        c.setNumeroCuota(1);
        c.setFechaBasePlazo(FechaBasePlazo.CARGA);
        c.setDiasPlazoComprador(30);
        c.setFechaVencimientoComprador(LocalDate.of(2026, 12, 1));
        c.setFechaVencimientoVendedor(LocalDate.of(2026, 12, 1));
        c.setMontoCuota(new BigDecimal("100000.00"));

        CuotaOperacion saved = cuotaRepository.saveAndFlush(c);
        entityManager.clear();

        CuotaOperacion found = cuotaRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getEstadoCobro()).isEqualTo(EstadoCuotaCobro.PENDIENTE);
        assertThat(found.getEstadoPago()).isEqualTo(EstadoCuotaPago.PENDIENTE);
        assertThat(found.getDiasDescalceVendedor()).isEqualTo(0);
    }

    @Test
    void testDeleteByOperacionId() {
        CuotaOperacion c1 = new CuotaOperacion();
        c1.setOperacion(operacion);
        c1.setNumeroCuota(1);
        c1.setFechaBasePlazo(FechaBasePlazo.CARGA);
        c1.setDiasPlazoComprador(30);
        c1.setFechaVencimientoComprador(LocalDate.of(2026, 12, 1));
        c1.setFechaVencimientoVendedor(LocalDate.of(2026, 12, 1));
        c1.setMontoCuota(new BigDecimal("500000.00"));
        cuotaRepository.saveAndFlush(c1);

        cuotaRepository.deleteByOperacionId(operacion.getId());
        entityManager.flush();
        entityManager.clear();

        List<CuotaOperacion> cuotas = cuotaRepository.findByOperacionIdOrderByNumeroCuotaAsc(operacion.getId());
        assertThat(cuotas).isEmpty();
    }
}
