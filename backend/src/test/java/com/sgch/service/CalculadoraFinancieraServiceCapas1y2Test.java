package com.sgch.service;

import com.sgch.model.CondicionFiscal;
import com.sgch.model.ModalidadPrecio;
import com.sgch.model.Operacion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

public class CalculadoraFinancieraServiceCapas1y2Test {

    private CalculadoraFinancieraService calculadora;

    @BeforeEach
    void setUp() {
        calculadora = new CalculadoraFinancieraService();
    }

    private Operacion crearOperacionBase() {
        Operacion op = new Operacion();
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2000.00"));
        op.setModalidadPrecio(ModalidadPrecio.NETO);
        op.setPrecioEsFinal(false);
        op.setComisionPorcentajeVendedor(new BigDecimal("2.00"));
        op.setComisionPorcentajeComprador(new BigDecimal("2.00"));
        op.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        op.setPorcentajeDocumentadoGanado(new BigDecimal("100.00"));
        op.setPorcentajeDocumentadoComisionVendedor(new BigDecimal("100.00"));
        op.setPorcentajeDocumentadoComisionComprador(new BigDecimal("100.00"));
        return op;
    }

    // =========================================================================
    // CAPA 1: Valorización económica (Tests 1 a 5 + monto extra)
    // =========================================================================

    @Test
    void test01_subtotalGanadoCasoBaseNeto() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2000.00"));

        BigDecimal subtotal = calculadora.calcularSubtotalGanado(op);

        assertThat(subtotal).isEqualByComparingTo(new BigDecimal("20000000.00"));
    }

    @Test
    void test02_comisionVendedorSobreSubtotalNeto() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2000.00"));
        op.setModalidadPrecio(ModalidadPrecio.NETO);
        op.setComisionPorcentajeVendedor(new BigDecimal("2.50"));

        BigDecimal comision = calculadora.calcularComisionVendedor(op);

        // 20.000.000 * 2.5% = 500.000
        assertThat(comision).isEqualByComparingTo(new BigDecimal("500000.00"));
    }

    @Test
    void test03_comisionCompradorSobreSubtotalNeto() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2000.00"));
        op.setModalidadPrecio(ModalidadPrecio.NETO);
        op.setComisionPorcentajeComprador(new BigDecimal("3.00"));

        BigDecimal comision = calculadora.calcularComisionComprador(op);

        // 20.000.000 * 3% = 600.000
        assertThat(comision).isEqualByComparingTo(new BigDecimal("600000.00"));
    }

    @Test
    void test04_comisionVendedorSobreSubtotalBrutoFinal_R072() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2210.00"));
        op.setModalidadPrecio(ModalidadPrecio.FINAL);
        op.setPrecioEsFinal(true);
        op.setComisionPorcentajeVendedor(new BigDecimal("2.00"));

        BigDecimal comision = calculadora.calcularComisionVendedor(op);

        // En precio final, la comisión es sobre bruto (10.000 * 2.210 = 22.100.000) * 2% = 442.000 (R-072)
        assertThat(comision).isEqualByComparingTo(new BigDecimal("442000.00"));
    }

    @Test
    void test05_comisionCompradorSobreSubtotalBrutoFinal_R072() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2210.00"));
        op.setModalidadPrecio(ModalidadPrecio.FINAL);
        op.setPrecioEsFinal(true);
        op.setComisionPorcentajeComprador(new BigDecimal("2.00"));

        BigDecimal comision = calculadora.calcularComisionComprador(op);

        // 22.100.000 * 2% = 442.000
        assertThat(comision).isEqualByComparingTo(new BigDecimal("442000.00"));
    }

    // =========================================================================
    // CAPA 2: Liquidación fiscal - IVA Ganado (Tests 6 a 12)
    // =========================================================================

    @Test
    void test06_ivaGanadoCasoA_monotributista() {
        Operacion op = crearOperacionBase();
        op.setCondicionFiscalVendedor(CondicionFiscal.MONOTRIBUTISTA);

        BigDecimal ivaGanadoNeto = calculadora.calcularIvaGanado(op);
        assertThat(ivaGanadoNeto).isEqualByComparingTo(BigDecimal.ZERO);

        op.setModalidadPrecio(ModalidadPrecio.FINAL);
        op.setPrecioEsFinal(true);
        BigDecimal ivaGanadoFinal = calculadora.calcularIvaGanado(op);
        assertThat(ivaGanadoFinal).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void test07_ivaGanadoCasoB_riNeto100Documentado() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2000.00")); // subtotal 20.000.000
        op.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        op.setModalidadPrecio(ModalidadPrecio.NETO);
        op.setPorcentajeDocumentadoGanado(new BigDecimal("100.00"));

        BigDecimal ivaGanado = calculadora.calcularIvaGanado(op);

        // 20.000.000 * 10.5% * 100% = 2.100.000.00
        assertThat(ivaGanado).isEqualByComparingTo(new BigDecimal("2100000.00"));
    }

    @Test
    void test08_ivaGanadoCasoB_riNeto50Documentado() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2000.00")); // subtotal 20.000.000
        op.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        op.setModalidadPrecio(ModalidadPrecio.NETO);
        op.setPorcentajeDocumentadoGanado(new BigDecimal("50.00"));

        BigDecimal ivaGanado = calculadora.calcularIvaGanado(op);

        // 20.000.000 * 10.5% * 50% = 1.050.000.00
        assertThat(ivaGanado).isEqualByComparingTo(new BigDecimal("1050000.00"));
    }

    @Test
    void test09_ivaGanadoCasoC_riFinal100Documentado() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("1000.00"));
        op.setPrecioKgFacturado(new BigDecimal("1105.00")); // subtotal 1.105.000
        op.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        op.setModalidadPrecio(ModalidadPrecio.FINAL);
        op.setPrecioEsFinal(true);
        op.setPorcentajeDocumentadoGanado(new BigDecimal("100.00"));

        BigDecimal ivaGanado = calculadora.calcularIvaGanado(op);

        // subtotal_neto = 1.105.000 / 1.105 = 1.000.000
        // iva_teorico = 1.105.000 - 1.000.000 = 105.000
        // iva_ganado = 105.000 * 100% = 105.000.00
        assertThat(ivaGanado).isEqualByComparingTo(new BigDecimal("105000.00"));
    }

    @Test
    void test10_ivaGanadoCasoC_riFinal70Documentado() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("1000.00"));
        op.setPrecioKgFacturado(new BigDecimal("1105.00")); // subtotal 1.105.000
        op.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        op.setModalidadPrecio(ModalidadPrecio.FINAL);
        op.setPrecioEsFinal(true);
        op.setPorcentajeDocumentadoGanado(new BigDecimal("70.00"));

        BigDecimal ivaGanado = calculadora.calcularIvaGanado(op);

        // 105.000 * 70% = 73.500.00
        assertThat(ivaGanado).isEqualByComparingTo(new BigDecimal("73500.00"));
    }

    @Test
    void test11_ivaGanadoCasoD_exento_R075() {
        Operacion op = crearOperacionBase();
        op.setCondicionFiscalVendedor(CondicionFiscal.EXENTO);

        BigDecimal ivaGanado = calculadora.calcularIvaGanado(op);

        assertThat(ivaGanado).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void test12_ivaGanadoCasoD_consumidorFinal_R075() {
        Operacion op = crearOperacionBase();
        op.setCondicionFiscalVendedor(CondicionFiscal.CONSUMIDOR_FINAL);

        BigDecimal ivaGanado = calculadora.calcularIvaGanado(op);

        assertThat(ivaGanado).isEqualByComparingTo(BigDecimal.ZERO);
    }

    // =========================================================================
    // CAPA 2: Liquidación fiscal - IVA Comisiones (Tests 13 a 16)
    // =========================================================================

    @Test
    void test13_ivaComisionVendedor_100Documentado() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2000.00")); // subtotal 20.000.000
        op.setComisionPorcentajeVendedor(new BigDecimal("2.00")); // comision 400.000
        op.setPorcentajeDocumentadoComisionVendedor(new BigDecimal("100.00"));

        BigDecimal ivaComision = calculadora.calcularIvaComisionVendedor(op);

        // 400.000 * 21% * 100% = 84.000.00
        assertThat(ivaComision).isEqualByComparingTo(new BigDecimal("84000.00"));
    }

    @Test
    void test14_ivaComisionComprador_100Documentado() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2000.00")); // subtotal 20.000.000
        op.setComisionPorcentajeComprador(new BigDecimal("2.00")); // comision 400.000
        op.setPorcentajeDocumentadoComisionComprador(new BigDecimal("100.00"));

        BigDecimal ivaComision = calculadora.calcularIvaComisionComprador(op);

        // 400.000 * 21% * 100% = 84.000.00
        assertThat(ivaComision).isEqualByComparingTo(new BigDecimal("84000.00"));
    }

    @Test
    void test15_ivaComisionVendedor_0Documentado() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2000.00"));
        op.setComisionPorcentajeVendedor(new BigDecimal("2.00"));
        op.setPorcentajeDocumentadoComisionVendedor(BigDecimal.ZERO);

        BigDecimal ivaComision = calculadora.calcularIvaComisionVendedor(op);

        assertThat(ivaComision).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void test16_ivaComisionVendedor_50Documentado() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2000.00")); // subtotal 20.000.000
        op.setComisionPorcentajeVendedor(new BigDecimal("2.00")); // comision 400.000
        op.setPorcentajeDocumentadoComisionVendedor(new BigDecimal("50.00"));

        BigDecimal ivaComision = calculadora.calcularIvaComisionVendedor(op);

        // 400.000 * 21% * 50% = 42.000.00
        assertThat(ivaComision).isEqualByComparingTo(new BigDecimal("42000.00"));
    }

    // =========================================================================
    // CAPA 2: Overrides manuales de IVA (Tests 17 a 19 - R-079)
    // =========================================================================

    @Test
    void test17_ivaGanadoOverride_pisaCalculoAutomatico() {
        Operacion op = crearOperacionBase();
        op.setIvaGanadoMontoOverride(new BigDecimal("123456.78"));

        BigDecimal ivaGanado = calculadora.calcularIvaGanado(op);

        assertThat(ivaGanado).isEqualByComparingTo(new BigDecimal("123456.78"));
    }

    @Test
    void test18_ivaComisionVendedorOverride_pisaCalculoAutomatico() {
        Operacion op = crearOperacionBase();
        op.setIvaComisionVendedorOverride(new BigDecimal("45000.00"));

        BigDecimal ivaComision = calculadora.calcularIvaComisionVendedor(op);

        assertThat(ivaComision).isEqualByComparingTo(new BigDecimal("45000.00"));
    }

    @Test
    void test19_ivaComisionCompradorOverride_pisaCalculoAutomatico() {
        Operacion op = crearOperacionBase();
        op.setIvaComisionCompradorOverride(new BigDecimal("55000.00"));

        BigDecimal ivaComision = calculadora.calcularIvaComisionComprador(op);

        assertThat(ivaComision).isEqualByComparingTo(new BigDecimal("55000.00"));
    }

    // =========================================================================
    // REGRESIÓN OBLIGATORIA: Anexo II §6.1 Ejemplo 1 al centavo (Test 20)
    // =========================================================================

    @Test
    void test20_regresionAnexoII_seccion6_1_ejemplo1() {
        Operacion op = new Operacion();
        op.setKgNeto(new BigDecimal("30000.00"));
        op.setPrecioKgFacturado(new BigDecimal("5000.00"));
        op.setModalidadPrecio(ModalidadPrecio.NETO);
        op.setPrecioEsFinal(false);
        op.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);
        op.setComisionPorcentajeVendedor(new BigDecimal("2.00"));
        op.setComisionPorcentajeComprador(new BigDecimal("2.00"));
        op.setPorcentajeDocumentadoGanado(new BigDecimal("100.00"));
        op.setPorcentajeDocumentadoComisionVendedor(new BigDecimal("100.00"));
        op.setPorcentajeDocumentadoComisionComprador(new BigDecimal("100.00"));

        BigDecimal subtotalGanado = calculadora.calcularSubtotalGanado(op);
        BigDecimal comisionVendedor = calculadora.calcularComisionVendedor(op);
        BigDecimal comisionComprador = calculadora.calcularComisionComprador(op);
        BigDecimal ivaGanado = calculadora.calcularIvaGanado(op);
        BigDecimal ivaComisionVendedor = calculadora.calcularIvaComisionVendedor(op);
        BigDecimal ivaComisionComprador = calculadora.calcularIvaComisionComprador(op);

        assertThat(subtotalGanado).isEqualByComparingTo(new BigDecimal("150000000.00"));
        assertThat(comisionVendedor).isEqualByComparingTo(new BigDecimal("3000000.00"));
        assertThat(comisionComprador).isEqualByComparingTo(new BigDecimal("3000000.00"));
        assertThat(ivaGanado).isEqualByComparingTo(new BigDecimal("15750000.00"));
        assertThat(ivaComisionVendedor).isEqualByComparingTo(new BigDecimal("630000.00"));
        assertThat(ivaComisionComprador).isEqualByComparingTo(new BigDecimal("630000.00"));
    }

    // =========================================================================
    // BIGDECIMAL Y EDGE CASES (Tests 21 a 23)
    // =========================================================================

    @Test
    void test21_division1_105_noLanzaArithmeticExceptionPorExpansionInfinita() {
        Operacion op = crearOperacionBase();
        // 100.00 / 1.105 produce decimal periódico
        op.setKgNeto(new BigDecimal("1.00"));
        op.setPrecioKgFacturado(new BigDecimal("100.00"));
        op.setModalidadPrecio(ModalidadPrecio.FINAL);
        op.setPrecioEsFinal(true);
        op.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO);

        assertDoesNotThrow(() -> {
            BigDecimal iva = calculadora.calcularIvaGanado(op);
            assertThat(iva).isNotNull();
            assertThat(iva.scale()).isEqualTo(2);
            assertThat(iva).isEqualByComparingTo(new BigDecimal("9.50"));
        });
    }

    @Test
    void test22_comparacionBigDecimalConCompareToEnLugarDeEquals() {
        Operacion op = crearOperacionBase();
        op.setKgNeto(new BigDecimal("100.0"));
        op.setPrecioKgFacturado(new BigDecimal("2000.000"));

        BigDecimal subtotal = calculadora.calcularSubtotalGanado(op);

        // 100.0 * 2000.000 = 200000.00
        assertThat(subtotal.compareTo(new BigDecimal("200000.00"))).isZero();
        assertThat(subtotal.scale()).isEqualTo(2);
    }

    @Test
    void test23_montoExtraCobradoCompradorNoAfectaCapa1NiCapa2_R069() {
        Operacion op = crearOperacionBase();
        op.setMontoExtraCobradoComprador(new BigDecimal("6000000.00"));

        BigDecimal subtotal = calculadora.calcularSubtotalGanado(op);
        BigDecimal comisionVend = calculadora.calcularComisionVendedor(op);
        BigDecimal comisionComp = calculadora.calcularComisionComprador(op);
        BigDecimal ivaGanado = calculadora.calcularIvaGanado(op);
        BigDecimal ivaComVend = calculadora.calcularIvaComisionVendedor(op);
        BigDecimal ivaComComp = calculadora.calcularIvaComisionComprador(op);

        assertThat(subtotal).isEqualByComparingTo(new BigDecimal("20000000.00"));
        assertThat(comisionVend).isEqualByComparingTo(new BigDecimal("400000.00"));
        assertThat(comisionComp).isEqualByComparingTo(new BigDecimal("400000.00"));
        assertThat(ivaGanado).isEqualByComparingTo(new BigDecimal("2100000.00"));
        assertThat(ivaComVend).isEqualByComparingTo(new BigDecimal("84000.00"));
        assertThat(ivaComComp).isEqualByComparingTo(new BigDecimal("84000.00"));
    }

    @Test
    void test24_nullSafety_operacionNulaOCamposNulosDevuelvenCeroOSanitizan() {
        assertThat(calculadora.calcularSubtotalGanado(null)).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(calculadora.calcularComisionVendedor(null)).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(calculadora.calcularComisionComprador(null)).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(calculadora.calcularIvaGanado(null)).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(calculadora.calcularIvaComisionVendedor(null)).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(calculadora.calcularIvaComisionComprador(null)).isEqualByComparingTo(BigDecimal.ZERO);

        Operacion opVacia = new Operacion();
        assertThat(calculadora.calcularSubtotalGanado(opVacia)).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(calculadora.calcularComisionVendedor(opVacia)).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(calculadora.calcularComisionComprador(opVacia)).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(calculadora.calcularIvaGanado(opVacia)).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(calculadora.calcularIvaComisionVendedor(opVacia)).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(calculadora.calcularIvaComisionComprador(opVacia)).isEqualByComparingTo(BigDecimal.ZERO);

        // Operación con campos opcionales nulos usa defaults (comisiones 0%, doc 100%)
        Operacion opSinComision = crearOperacionBase();
        opSinComision.setComisionPorcentajeVendedor(null);
        opSinComision.setComisionPorcentajeComprador(null);
        assertThat(calculadora.calcularComisionVendedor(opSinComision)).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(calculadora.calcularComisionComprador(opSinComision)).isEqualByComparingTo(BigDecimal.ZERO);

        Operacion opSinDoc = crearOperacionBase();
        opSinDoc.setPorcentajeDocumentadoGanado(null);
        opSinDoc.setPorcentajeDocumentadoComisionVendedor(null);
        opSinDoc.setPorcentajeDocumentadoComisionComprador(null);
        // Debe usar default 100%
        assertThat(calculadora.calcularIvaGanado(opSinDoc)).isEqualByComparingTo(new BigDecimal("2100000.00"));
        assertThat(calculadora.calcularIvaComisionVendedor(opSinDoc)).isEqualByComparingTo(new BigDecimal("84000.00"));
        assertThat(calculadora.calcularIvaComisionComprador(opSinDoc)).isEqualByComparingTo(new BigDecimal("84000.00"));
    }
}
