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
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(FlywayAutoConfiguration.class)
public class OperacionRepositoryTest {

    @Container
    @ServiceConnection
    static MySQLContainer mysql = new MySQLContainer("mysql:8.0");

    @Autowired
    private OperacionRepository operacionRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EntityManager entityManager;

    private Cliente comprador;
    private Cliente vendedor;

    @BeforeEach
    void setUp() {
        comprador = new Cliente();
        comprador.setNombreRazonSocial("Comprador S.A.");
        comprador.setTelefono("3411112222");
        comprador.setDireccion("Ruta 9 Km 200");
        comprador.setCuit("20301112224");
        comprador.setCondicionFiscal(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        comprador = clienteRepository.saveAndFlush(comprador);

        vendedor = new Cliente();
        vendedor.setNombreRazonSocial("Vendedor Campo Norte");
        vendedor.setTelefono("3413334444");
        vendedor.setDireccion("Ruta 34 Km 50");
        vendedor.setCuit("27401112228");
        vendedor.setCondicionFiscal(CondicionFiscal.MONOTRIBUTISTA);
        vendedor = clienteRepository.saveAndFlush(vendedor);

        entityManager.clear();
    }

    @Test
    void testSaveAndRetrieveFullOperacionDirecto43Campos() {
        Operacion op = new Operacion();
        LocalDateTime now = LocalDateTime.of(2026, 11, 3, 10, 0, 0);
        op.setFechaCarga(now);
        op.setFechaOperacion(now.minusDays(1));
        op.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        op.setConsignatariaExterna(null);
        op.setComprador(comprador);
        op.setVendedor(vendedor);
        op.setCategoria(CategoriaOperacion.INVERNADA);
        op.setSubcategoria("Terneros medianos");
        op.setKgNeto(new BigDecimal("15000.50"));
        op.setKgOrigenBruto(new BigDecimal("15500.00"));
        op.setPorcentajeDesbaste(new BigDecimal("3.22"));
        op.setKgLlegadaReferencia(new BigDecimal("14980.00"));
        op.setPrecioKgFacturado(new BigDecimal("2100.50"));
        op.setMontoExtraCobradoComprador(new BigDecimal("50000.00"));
        op.setModalidadPrecio(ModalidadPrecio.NETO);
        op.setPrecioEsFinal(false);
        op.setComisionPorcentajeVendedor(new BigDecimal("2.50"));
        op.setComisionPorcentajeComprador(new BigDecimal("2.00"));
        op.setComisionTotalCobradaReferencia(null);
        op.setCondicionFiscalVendedor(CondicionFiscal.MONOTRIBUTISTA);
        op.setPorcentajeDocumentadoGanado(new BigDecimal("100.00"));
        op.setPorcentajeDocumentadoComisionVendedor(new BigDecimal("100.00"));
        op.setPorcentajeDocumentadoComisionComprador(new BigDecimal("100.00"));
        op.setIvaGanadoMontoOverride(null);
        op.setIvaComisionVendedorOverride(null);
        op.setIvaComisionCompradorOverride(null);
        op.setConGarantia(true);
        op.setRetencionesExternasMonto(null);
        op.setCondicionEntrega(CondicionEntrega.A_RETIRAR_CAMPO);
        op.setFleteCargoDe(FleteCargoDe.COMPRADOR);
        op.setFleteMonto(new BigDecimal("180000.00"));
        op.setEstadoLiquidacion(EstadoLiquidacion.PENDIENTE);
        op.setFormaPago("Cheque 30 dias");
        op.setPlazo("30 dias fecha carga");
        op.setRaza(Raza.BRANGUS);
        op.setColor("Colorado");
        op.setPuntuacion("Muy buena");
        op.setDestino("Engorde a corral");
        op.setCantidadMachos(40);
        op.setCantidadHembras(10);
        op.setTerneros(true);
        op.setObservaciones("Tropa uniforme, pesada en origen");

        Operacion saved = operacionRepository.saveAndFlush(op);
        entityManager.clear();

        Operacion found = operacionRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getId()).isNotNull();
        assertThat(found.getFechaCarga()).isEqualTo(now);
        assertThat(found.getFechaOperacion()).isEqualTo(now.minusDays(1));
        assertThat(found.getModalidadCircuito()).isEqualTo(ModalidadCircuito.DIRECTO);
        assertThat(found.getConsignatariaExterna()).isNull();
        assertThat(found.getComprador().getId()).isEqualTo(comprador.getId());
        assertThat(found.getVendedor().getId()).isEqualTo(vendedor.getId());
        assertThat(found.getCategoria()).isEqualTo(CategoriaOperacion.INVERNADA);
        assertThat(found.getSubcategoria()).isEqualTo("Terneros medianos");
        assertThat(found.getKgNeto()).isEqualByComparingTo(new BigDecimal("15000.50"));
        assertThat(found.getKgOrigenBruto()).isEqualByComparingTo(new BigDecimal("15500.00"));
        assertThat(found.getPorcentajeDesbaste()).isEqualByComparingTo(new BigDecimal("3.22"));
        assertThat(found.getKgLlegadaReferencia()).isEqualByComparingTo(new BigDecimal("14980.00"));
        assertThat(found.getPrecioKgFacturado()).isEqualByComparingTo(new BigDecimal("2100.50"));
        assertThat(found.getMontoExtraCobradoComprador()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(found.getModalidadPrecio()).isEqualTo(ModalidadPrecio.NETO);
        assertThat(found.getPrecioEsFinal()).isFalse();
        assertThat(found.getComisionPorcentajeVendedor()).isEqualByComparingTo(new BigDecimal("2.50"));
        assertThat(found.getComisionPorcentajeComprador()).isEqualByComparingTo(new BigDecimal("2.00"));
        assertThat(found.getComisionTotalCobradaReferencia()).isNull();
        assertThat(found.getCondicionFiscalVendedor()).isEqualTo(CondicionFiscal.MONOTRIBUTISTA);
        assertThat(found.getPorcentajeDocumentadoGanado()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(found.getPorcentajeDocumentadoComisionVendedor()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(found.getPorcentajeDocumentadoComisionComprador()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(found.getIvaGanadoMontoOverride()).isNull();
        assertThat(found.getIvaComisionVendedorOverride()).isNull();
        assertThat(found.getIvaComisionCompradorOverride()).isNull();
        assertThat(found.getConGarantia()).isTrue();
        assertThat(found.getRetencionesExternasMonto()).isNull();
        assertThat(found.getCondicionEntrega()).isEqualTo(CondicionEntrega.A_RETIRAR_CAMPO);
        assertThat(found.getFleteCargoDe()).isEqualTo(FleteCargoDe.COMPRADOR);
        assertThat(found.getFleteMonto()).isEqualByComparingTo(new BigDecimal("180000.00"));
        assertThat(found.getEstadoLiquidacion()).isEqualTo(EstadoLiquidacion.PENDIENTE);
        assertThat(found.getFormaPago()).isEqualTo("Cheque 30 dias");
        assertThat(found.getPlazo()).isEqualTo("30 dias fecha carga");
        assertThat(found.getRaza()).isEqualTo(Raza.BRANGUS);
        assertThat(found.getColor()).isEqualTo("Colorado");
        assertThat(found.getPuntuacion()).isEqualTo("Muy buena");
        assertThat(found.getDestino()).isEqualTo("Engorde a corral");
        assertThat(found.getCantidadMachos()).isEqualTo(40);
        assertThat(found.getCantidadHembras()).isEqualTo(10);
        assertThat(found.getTerneros()).isTrue();
        assertThat(found.getObservaciones()).isEqualTo("Tropa uniforme, pesada en origen");
    }

    @Test
    void testDesbasteRangoNegativoYPositivo() {
        Operacion opNeg = new Operacion();
        opNeg.setFechaCarga(LocalDateTime.now());
        opNeg.setFechaOperacion(LocalDateTime.now());
        opNeg.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        opNeg.setComprador(comprador);
        opNeg.setVendedor(vendedor);
        opNeg.setCategoria(CategoriaOperacion.FAENA);
        opNeg.setKgNeto(new BigDecimal("10000.00"));
        opNeg.setPrecioKgFacturado(new BigDecimal("2000.00"));
        opNeg.setModalidadPrecio(ModalidadPrecio.FINAL);
        opNeg.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        opNeg.setFormaPago("Contado");
        opNeg.setPorcentajeDesbaste(new BigDecimal("-4.50"));

        Operacion savedNeg = operacionRepository.saveAndFlush(opNeg);
        entityManager.clear();

        Operacion foundNeg = operacionRepository.findById(savedNeg.getId()).orElseThrow();
        assertThat(foundNeg.getPorcentajeDesbaste()).isEqualByComparingTo(new BigDecimal("-4.50"));

        foundNeg.setPorcentajeDesbaste(new BigDecimal("1.50"));
        operacionRepository.saveAndFlush(foundNeg);
        entityManager.clear();

        Operacion foundPos = operacionRepository.findById(savedNeg.getId()).orElseThrow();
        assertThat(foundPos.getPorcentajeDesbaste()).isEqualByComparingTo(new BigDecimal("1.50"));
    }

    @Test
    void testConsignatariaExternaCamposEspecificos() {
        Operacion op = new Operacion();
        op.setFechaCarga(LocalDateTime.now());
        op.setFechaOperacion(LocalDateTime.now());
        op.setModalidadCircuito(ModalidadCircuito.CONSIGNATARIA_EXTERNA);
        op.setConsignatariaExterna("Consignataria del Litoral S.A.");
        op.setComprador(comprador);
        op.setVendedor(vendedor);
        op.setCategoria(CategoriaOperacion.REPRODUCCION);
        op.setKgNeto(new BigDecimal("8000.00"));
        op.setPrecioKgFacturado(new BigDecimal("3000.00"));
        op.setModalidadPrecio(ModalidadPrecio.NETO);
        op.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        op.setFormaPago("Plazo 60 dias");
        op.setComisionPorcentajeVendedor(new BigDecimal("1.50"));
        op.setComisionTotalCobradaReferencia(new BigDecimal("4.00"));
        op.setRetencionesExternasMonto(new BigDecimal("45000.00"));

        Operacion saved = operacionRepository.saveAndFlush(op);
        entityManager.clear();

        Operacion found = operacionRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getModalidadCircuito()).isEqualTo(ModalidadCircuito.CONSIGNATARIA_EXTERNA);
        assertThat(found.getConsignatariaExterna()).isEqualTo("Consignataria del Litoral S.A.");
        assertThat(found.getComisionTotalCobradaReferencia()).isEqualByComparingTo(new BigDecimal("4.00"));
        assertThat(found.getRetencionesExternasMonto()).isEqualByComparingTo(new BigDecimal("45000.00"));
    }

    @Test
    void testIvaOverridesYPorcentajesDocumentados() {
        Operacion op = new Operacion();
        op.setFechaCarga(LocalDateTime.now());
        op.setFechaOperacion(LocalDateTime.now());
        op.setModalidadCircuito(ModalidadCircuito.PROPIA);
        op.setComprador(comprador);
        op.setVendedor(vendedor);
        op.setCategoria(CategoriaOperacion.INVERNADA);
        op.setKgNeto(new BigDecimal("12000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2200.00"));
        op.setModalidadPrecio(ModalidadPrecio.NETO);
        op.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        op.setFormaPago("Valores 30-60");
        op.setPorcentajeDocumentadoGanado(new BigDecimal("80.00"));
        op.setPorcentajeDocumentadoComisionVendedor(new BigDecimal("90.00"));
        op.setPorcentajeDocumentadoComisionComprador(new BigDecimal("100.00"));
        op.setIvaGanadoMontoOverride(new BigDecimal("150000.00"));
        op.setIvaComisionVendedorOverride(new BigDecimal("25000.00"));
        op.setIvaComisionCompradorOverride(new BigDecimal("30000.00"));

        Operacion saved = operacionRepository.saveAndFlush(op);
        entityManager.clear();

        Operacion found = operacionRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getPorcentajeDocumentadoGanado()).isEqualByComparingTo(new BigDecimal("80.00"));
        assertThat(found.getPorcentajeDocumentadoComisionVendedor()).isEqualByComparingTo(new BigDecimal("90.00"));
        assertThat(found.getPorcentajeDocumentadoComisionComprador()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(found.getIvaGanadoMontoOverride()).isEqualByComparingTo(new BigDecimal("150000.00"));
        assertThat(found.getIvaComisionVendedorOverride()).isEqualByComparingTo(new BigDecimal("25000.00"));
        assertThat(found.getIvaComisionCompradorOverride()).isEqualByComparingTo(new BigDecimal("30000.00"));
    }

    @Test
    void testFindByCompradorIdOrVendedorIdOrderByFechaOperacionDesc() {
        LocalDateTime f1 = LocalDateTime.of(2026, 10, 1, 10, 0);
        LocalDateTime f2 = LocalDateTime.of(2026, 10, 15, 10, 0);
        LocalDateTime f3 = LocalDateTime.of(2026, 11, 1, 10, 0);

        Operacion op1 = createMinOperacion(comprador, vendedor, f1);
        Operacion op2 = createMinOperacion(vendedor, comprador, f2); // cliente actúa como vendedor o comprador
        Operacion op3 = createMinOperacion(comprador, vendedor, f3);

        operacionRepository.saveAndFlush(op1);
        operacionRepository.saveAndFlush(op2);
        operacionRepository.saveAndFlush(op3);
        entityManager.clear();

        List<Operacion> list = operacionRepository.findByCompradorIdOrVendedorIdOrderByFechaOperacionDesc(
                comprador.getId(), comprador.getId());

        assertThat(list).hasSize(3);
        assertThat(list.get(0).getFechaOperacion()).isEqualTo(f3);
        assertThat(list.get(1).getFechaOperacion()).isEqualTo(f2);
        assertThat(list.get(2).getFechaOperacion()).isEqualTo(f1);
    }

    @Test
    void testNullCompradorOrVendedorThrowsException() {
        Operacion opSinComprador = new Operacion();
        opSinComprador.setFechaCarga(LocalDateTime.now());
        opSinComprador.setFechaOperacion(LocalDateTime.now());
        opSinComprador.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        opSinComprador.setComprador(null);
        opSinComprador.setVendedor(vendedor);
        opSinComprador.setCategoria(CategoriaOperacion.FAENA);
        opSinComprador.setKgNeto(new BigDecimal("5000.00"));
        opSinComprador.setPrecioKgFacturado(new BigDecimal("2000.00"));
        opSinComprador.setModalidadPrecio(ModalidadPrecio.NETO);
        opSinComprador.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        opSinComprador.setFormaPago("Contado");

        assertThrows(DataIntegrityViolationException.class, () -> {
            operacionRepository.saveAndFlush(opSinComprador);
        });
    }

    private Operacion createMinOperacion(Cliente comp, Cliente vend, LocalDateTime fechaOp) {
        Operacion op = new Operacion();
        op.setFechaCarga(fechaOp);
        op.setFechaOperacion(fechaOp);
        op.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        op.setComprador(comp);
        op.setVendedor(vend);
        op.setCategoria(CategoriaOperacion.FAENA);
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2000.00"));
        op.setModalidadPrecio(ModalidadPrecio.NETO);
        op.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        op.setFormaPago("Contado");
        return op;
    }
}
