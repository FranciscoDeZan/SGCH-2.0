package com.sgch.dto;

import com.sgch.model.CategoriaOperacion;
import com.sgch.model.MedioPago;
import com.sgch.model.ModalidadCircuito;
import com.sgch.model.ModalidadPrecio;
import com.sgch.model.TipoMovimientoCobro;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

public class OperacionDtoValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private OperacionRequest createValidOperacionRequest() {
        OperacionRequest req = new OperacionRequest();
        req.setFechaOperacion(LocalDateTime.of(2026, 11, 3, 10, 0));
        req.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        req.setCompradorId("comp-1");
        req.setVendedorId("vend-1");
        req.setCategoria(CategoriaOperacion.FAENA);
        req.setKgNeto(new BigDecimal("10000.00"));
        req.setPrecioKgFacturado(new BigDecimal("2100.00"));
        req.setModalidadPrecio(ModalidadPrecio.NETO);
        req.setFormaPago("Cheque 30 dias");
        return req;
    }

    @Test
    void testValidOperacionRequestHasZeroViolations() {
        OperacionRequest req = createValidOperacionRequest();
        Set<ConstraintViolation<OperacionRequest>> violations = validator.validate(req);
        assertThat(violations).isEmpty();
    }

    @Test
    void testKgNetoNullOrZeroTriggersViolation() {
        OperacionRequest reqNull = createValidOperacionRequest();
        reqNull.setKgNeto(null);
        assertThat(validator.validate(reqNull)).isNotEmpty();

        OperacionRequest reqZero = createValidOperacionRequest();
        reqZero.setKgNeto(new BigDecimal("0.00"));
        assertThat(validator.validate(reqZero)).isNotEmpty();

        OperacionRequest reqNeg = createValidOperacionRequest();
        reqNeg.setKgNeto(new BigDecimal("-10.00"));
        assertThat(validator.validate(reqNeg)).isNotEmpty();
    }

    @Test
    void testPrecioKgFacturadoNullOrZeroTriggersViolation() {
        OperacionRequest reqNull = createValidOperacionRequest();
        reqNull.setPrecioKgFacturado(null);
        assertThat(validator.validate(reqNull)).isNotEmpty();

        OperacionRequest reqZero = createValidOperacionRequest();
        reqZero.setPrecioKgFacturado(BigDecimal.ZERO);
        assertThat(validator.validate(reqZero)).isNotEmpty();
    }

    @Test
    void testPorcentajeDesbasteRangeValidation() {
        OperacionRequest req = createValidOperacionRequest();

        // Límites válidos: -8.00 y +15.00
        req.setPorcentajeDesbaste(new BigDecimal("-8.00"));
        assertThat(validator.validate(req)).isEmpty();

        req.setPorcentajeDesbaste(new BigDecimal("15.00"));
        assertThat(validator.validate(req)).isEmpty();

        req.setPorcentajeDesbaste(null);
        assertThat(validator.validate(req)).isEmpty();

        // Fuera de rango: -8.01 y +15.01
        req.setPorcentajeDesbaste(new BigDecimal("-8.01"));
        assertThat(validator.validate(req)).isNotEmpty();

        req.setPorcentajeDesbaste(new BigDecimal("15.01"));
        assertThat(validator.validate(req)).isNotEmpty();
    }

    @Test
    void testPorcentajesDocumentadosRangeValidation() {
        OperacionRequest req = createValidOperacionRequest();

        req.setPorcentajeDocumentadoGanado(new BigDecimal("100.00"));
        req.setPorcentajeDocumentadoComisionVendedor(new BigDecimal("0.00"));
        assertThat(validator.validate(req)).isEmpty();

        req.setPorcentajeDocumentadoGanado(new BigDecimal("-1.00"));
        assertThat(validator.validate(req)).isNotEmpty();

        req.setPorcentajeDocumentadoGanado(new BigDecimal("100.00"));
        req.setPorcentajeDocumentadoComisionVendedor(new BigDecimal("100.01"));
        assertThat(validator.validate(req)).isNotEmpty();
    }

    @Test
    void testMontoExtraCobradoCompradorNullableAndNonNegative() {
        OperacionRequest req = createValidOperacionRequest();
        req.setMontoExtraCobradoComprador(null);
        assertThat(validator.validate(req)).isEmpty();

        req.setMontoExtraCobradoComprador(new BigDecimal("0.00"));
        assertThat(validator.validate(req)).isEmpty();

        req.setMontoExtraCobradoComprador(new BigDecimal("50000.00"));
        assertThat(validator.validate(req)).isEmpty();

        req.setMontoExtraCobradoComprador(new BigDecimal("-1.00"));
        assertThat(validator.validate(req)).isNotEmpty();
    }

    @Test
    void testMandatoryFieldsValidation() {
        OperacionRequest req = createValidOperacionRequest();

        req.setFechaOperacion(null);
        assertThat(validator.validate(req)).isNotEmpty();

        req = createValidOperacionRequest();
        req.setModalidadCircuito(null);
        assertThat(validator.validate(req)).isNotEmpty();

        req = createValidOperacionRequest();
        req.setCompradorId("   ");
        assertThat(validator.validate(req)).isNotEmpty();

        req = createValidOperacionRequest();
        req.setVendedorId("");
        assertThat(validator.validate(req)).isNotEmpty();

        req = createValidOperacionRequest();
        req.setCategoria(null);
        assertThat(validator.validate(req)).isNotEmpty();

        req = createValidOperacionRequest();
        req.setModalidadPrecio(null);
        assertThat(validator.validate(req)).isNotEmpty();

        req = createValidOperacionRequest();
        req.setFormaPago("");
        assertThat(validator.validate(req)).isNotEmpty();
    }

    @Test
    void testCantidadMachosHembrasNonNegative() {
        OperacionRequest req = createValidOperacionRequest();
        req.setCantidadMachos(0);
        req.setCantidadHembras(10);
        assertThat(validator.validate(req)).isEmpty();

        req.setCantidadMachos(-1);
        assertThat(validator.validate(req)).isNotEmpty();
    }

    @Test
    void testCobroRequestValidation() {
        CobroRequest req = new CobroRequest();
        req.setOperacionId("op-1");
        req.setCuotaId(null); // Contado
        req.setClienteId("cli-1");
        req.setTipoMovimiento(TipoMovimientoCobro.COBRO_COMPRADOR);
        req.setFechaMovimiento(LocalDate.of(2026, 11, 3));
        req.setMonto(new BigDecimal("1000.00"));
        req.setMedioPago(MedioPago.TRANSFERENCIA);
        req.setDocumentado(true);

        assertThat(validator.validate(req)).isEmpty();

        req.setOperacionId("");
        assertThat(validator.validate(req)).isNotEmpty();

        req.setOperacionId("op-1");
        req.setMonto(BigDecimal.ZERO);
        assertThat(validator.validate(req)).isNotEmpty();

        req.setMonto(new BigDecimal("1000.00"));
        req.setMedioPago(null);
        assertThat(validator.validate(req)).isNotEmpty();

        req.setMedioPago(MedioPago.ECHEQ);
        req.setDocumentado(null);
        assertThat(validator.validate(req)).isNotEmpty();
    }

    @Test
    void testStringLengthLimits() {
        OperacionRequest req = createValidOperacionRequest();

        req.setConsignatariaExterna("A".repeat(256));
        assertThat(validator.validate(req)).isNotEmpty();
        req.setConsignatariaExterna("A".repeat(255));
        assertThat(validator.validate(req)).isEmpty();

        req.setSubcategoria("B".repeat(101));
        assertThat(validator.validate(req)).isNotEmpty();
        req.setSubcategoria("B".repeat(100));
        assertThat(validator.validate(req)).isEmpty();

        req.setFormaPago("C".repeat(101));
        assertThat(validator.validate(req)).isNotEmpty();
        req.setFormaPago("C".repeat(100));
        assertThat(validator.validate(req)).isEmpty();

        req.setPlazo("D".repeat(101));
        assertThat(validator.validate(req)).isNotEmpty();
        req.setPlazo("D".repeat(100));
        assertThat(validator.validate(req)).isEmpty();

        req.setColor("E".repeat(101));
        assertThat(validator.validate(req)).isNotEmpty();
        req.setColor("E".repeat(100));
        assertThat(validator.validate(req)).isEmpty();

        req.setPuntuacion("F".repeat(51));
        assertThat(validator.validate(req)).isNotEmpty();
        req.setPuntuacion("F".repeat(50));
        assertThat(validator.validate(req)).isEmpty();

        req.setDestino("G".repeat(256));
        assertThat(validator.validate(req)).isNotEmpty();
        req.setDestino("G".repeat(255));
        assertThat(validator.validate(req)).isEmpty();
    }

    @Test
    void testOptionalWeightsPositiveValidation() {
        OperacionRequest req = createValidOperacionRequest();

        req.setKgOrigenBruto(BigDecimal.ZERO);
        assertThat(validator.validate(req)).isNotEmpty();

        req.setKgOrigenBruto(new BigDecimal("10000.00"));
        assertThat(validator.validate(req)).isEmpty();

        req.setKgLlegadaReferencia(new BigDecimal("-1.00"));
        assertThat(validator.validate(req)).isNotEmpty();

        req.setKgLlegadaReferencia(new BigDecimal("9800.00"));
        assertThat(validator.validate(req)).isEmpty();
    }

    @Test
    void testIvaOverridesNonNegativeValidation() {
        OperacionRequest req = createValidOperacionRequest();

        req.setIvaGanadoMontoOverride(new BigDecimal("-0.01"));
        assertThat(validator.validate(req)).isNotEmpty();
        req.setIvaGanadoMontoOverride(BigDecimal.ZERO);
        assertThat(validator.validate(req)).isEmpty();

        req.setIvaComisionVendedorOverride(new BigDecimal("-0.01"));
        assertThat(validator.validate(req)).isNotEmpty();
        req.setIvaComisionVendedorOverride(new BigDecimal("1000.00"));
        assertThat(validator.validate(req)).isEmpty();

        req.setIvaComisionCompradorOverride(new BigDecimal("-0.01"));
        assertThat(validator.validate(req)).isNotEmpty();
        req.setIvaComisionCompradorOverride(new BigDecimal("1000.00"));
        assertThat(validator.validate(req)).isEmpty();
    }

    @Test
    void testCascadedCuotasValidation() {
        OperacionRequest req = createValidOperacionRequest();

        CuotaOperacionRequest cuota = new CuotaOperacionRequest();
        cuota.setNumeroCuota(1);
        cuota.setMontoCuota(new BigDecimal("5000.00"));
        cuota.setDiasPlazoComprador(30);
        cuota.setDiasDescalceVendedor(0);
        req.getCuotas().add(cuota);
        assertThat(validator.validate(req)).isEmpty();

        // Monto cuota invalido (0)
        cuota.setMontoCuota(BigDecimal.ZERO);
        assertThat(validator.validate(req)).isNotEmpty();

        // Numero cuota invalido (0)
        cuota.setMontoCuota(new BigDecimal("5000.00"));
        cuota.setNumeroCuota(0);
        assertThat(validator.validate(req)).isNotEmpty();

        // Dias plazo negativo
        cuota.setNumeroCuota(1);
        cuota.setDiasPlazoComprador(-1);
        assertThat(validator.validate(req)).isNotEmpty();
    }
}
