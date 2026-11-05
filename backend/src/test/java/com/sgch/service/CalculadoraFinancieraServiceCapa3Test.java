package com.sgch.service;

import com.sgch.dto.CalculoResultado;
import com.sgch.model.CondicionEntrega;
import com.sgch.model.CondicionFiscal;
import com.sgch.model.FleteCargoDe;
import com.sgch.model.ModalidadCircuito;
import com.sgch.model.ModalidadPrecio;
import com.sgch.model.Operacion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

public class CalculadoraFinancieraServiceCapa3Test {

    private CalculadoraFinancieraService calculadora;

    @BeforeEach
    void setUp() {
        calculadora = new CalculadoraFinancieraService();
    }

    private Operacion crearOperacionBase(ModalidadCircuito circuito) {
        Operacion op = new Operacion();
        op.setModalidadCircuito(circuito);
        op.setKgNeto(new BigDecimal("10000.00"));
        op.setPrecioKgFacturado(new BigDecimal("2000.00")); // subtotal = 20.000.000,00
        op.setModalidadPrecio(ModalidadPrecio.NETO);
        op.setPrecioEsFinal(false);
        op.setComisionPorcentajeVendedor(new BigDecimal("2.00")); // com_vend = 400.000,00
        op.setComisionPorcentajeComprador(new BigDecimal("2.00")); // com_comp = 400.000,00
        op.setCondicionFiscalVendedor(CondicionFiscal.RESPONSABLE_INSCRIPTO); // iva_ganado = 2.100.000,00
        op.setPorcentajeDocumentadoGanado(new BigDecimal("100.00"));
        op.setPorcentajeDocumentadoComisionVendedor(new BigDecimal("100.00")); // iva_com_vend = 84.000,00
        op.setPorcentajeDocumentadoComisionComprador(new BigDecimal("100.00")); // iva_com_comp = 84.000,00
        return op;
    }

    // =========================================================================
    // CIRCUITO DIRECTO (Tests 1 a 4 — Anexo II §4)
    // =========================================================================

    @Test
    void test01_directo_saldoHaciendaEntrePartesEsSubtotalMasIvaGanado() {
        Operacion op = crearOperacionBase(ModalidadCircuito.DIRECTO);

        BigDecimal saldoHacienda = calculadora.calcularSaldoHaciendaEntrePartes(op);

        // 20.000.000,00 + 2.100.000,00 = 22.100.000,00
        assertThat(saldoHacienda).isEqualByComparingTo(new BigDecimal("22100000.00"));
        assertThat(saldoHacienda.scale()).isEqualTo(2);
    }

    @Test
    void test02_directo_saldoComisionFirmaSinSpread() {
        Operacion op = crearOperacionBase(ModalidadCircuito.DIRECTO);
        op.setMontoExtraCobradoComprador(null);

        BigDecimal saldoComision = calculadora.calcularSaldoComisionFirma(op);

        // (400.000 + 84.000) + (400.000 + 84.000) = 968.000,00
        assertThat(saldoComision).isEqualByComparingTo(new BigDecimal("968000.00"));
        assertThat(saldoComision.scale()).isEqualTo(2);
    }

    @Test
    void test03_directo_saldoComisionFirmaConSpread_R069() {
        Operacion op = crearOperacionBase(ModalidadCircuito.DIRECTO);
        op.setMontoExtraCobradoComprador(new BigDecimal("6000000.00"));

        BigDecimal saldoComision = calculadora.calcularSaldoComisionFirma(op);

        // 968.000,00 + 6.000.000,00 = 6.968.000,00
        assertThat(saldoComision).isEqualByComparingTo(new BigDecimal("6968000.00"));
        assertThat(saldoComision.scale()).isEqualTo(2);
    }

    @Test
    void test04_directo_totalACobrarCompradorConSpreadYTotalAPagarVendedorCero() {
        Operacion op = crearOperacionBase(ModalidadCircuito.DIRECTO);
        op.setMontoExtraCobradoComprador(new BigDecimal("1500000.00"));

        BigDecimal totalCobrarComprador = calculadora.calcularTotalACobrarComprador(op);
        BigDecimal totalPagarVendedor = calculadora.calcularTotalAPagarVendedor(op);

        // 400.000 + 84.000 + 1.500.000 = 1.984.000,00
        assertThat(totalCobrarComprador).isEqualByComparingTo(new BigDecimal("1984000.00"));
        assertThat(totalCobrarComprador.scale()).isEqualTo(2);
        assertThat(totalPagarVendedor).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(totalPagarVendedor.scale()).isEqualTo(2);
    }

    // =========================================================================
    // CIRCUITO CONSIGNATARIA_EXTERNA (Tests 5 a 7 — Anexo II §4, D-08, R-071)
    // =========================================================================

    @Test
    void test05_consignatariaExterna_saldoHaciendaEntrePartesEsCero() {
        Operacion op = crearOperacionBase(ModalidadCircuito.CONSIGNATARIA_EXTERNA);
        op.setConsignatariaExterna("Consignataria del Norte S.A.");

        BigDecimal saldoHacienda = calculadora.calcularSaldoHaciendaEntrePartes(op);

        assertThat(saldoHacienda).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(saldoHacienda.scale()).isEqualTo(2);
    }

    @Test
    void test06_consignatariaExterna_saldoComisionFirmaEsComisionVendedorNetaMasIva_R071() {
        Operacion op = crearOperacionBase(ModalidadCircuito.CONSIGNATARIA_EXTERNA);
        op.setConsignatariaExterna("Consignataria del Norte S.A.");
        // El porcentaje cargado en vendedor (2%) es el neto que factura la firma a la consignataria (R-071)
        op.setComisionPorcentajeVendedor(new BigDecimal("2.00"));
        op.setComisionPorcentajeComprador(new BigDecimal("3.00")); // No integra el saldo de la firma en circuito externo
        op.setComisionTotalCobradaReferencia(new BigDecimal("4.00")); // Informativo

        BigDecimal saldoComision = calculadora.calcularSaldoComisionFirma(op);

        // 400.000,00 + 84.000,00 = 484.000,00
        assertThat(saldoComision).isEqualByComparingTo(new BigDecimal("484000.00"));
        assertThat(saldoComision.scale()).isEqualTo(2);
    }

    @Test
    void test07_consignatariaExterna_totalACobrarCompradorYTotalAPagarVendedorSonCero() {
        Operacion op = crearOperacionBase(ModalidadCircuito.CONSIGNATARIA_EXTERNA);
        op.setConsignatariaExterna("Consignataria del Norte S.A.");

        BigDecimal totalCobrarComprador = calculadora.calcularTotalACobrarComprador(op);
        BigDecimal totalPagarVendedor = calculadora.calcularTotalAPagarVendedor(op);

        assertThat(totalCobrarComprador).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(totalCobrarComprador.scale()).isEqualTo(2);
        assertThat(totalPagarVendedor).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(totalPagarVendedor.scale()).isEqualTo(2);
    }

    // =========================================================================
    // CIRCUITO PROPIA (Test 8 — Anexo II §4, DA-04)
    // =========================================================================

    @Test
    void test08_propia_comisionCeroEnPuntaPropiaYSaldosIdenticosADirecto_DA04() {
        // Caso 1: La firma compra para sí (comisión comprador = 0%, comisión vendedor = 2%)
        Operacion opPropiaCompra = crearOperacionBase(ModalidadCircuito.PROPIA);
        opPropiaCompra.setComisionPorcentajeComprador(new BigDecimal("0.00"));

        Operacion opDirectoEquivalenteCompra = crearOperacionBase(ModalidadCircuito.DIRECTO);
        opDirectoEquivalenteCompra.setComisionPorcentajeComprador(new BigDecimal("0.00"));

        CalculoResultado resPropiaCompra = calculadora.calcular(opPropiaCompra);
        CalculoResultado resDirectoCompra = calculadora.calcular(opDirectoEquivalenteCompra);

        assertThat(resPropiaCompra.saldoHaciendaEntrePartes()).isEqualByComparingTo(new BigDecimal("22100000.00"));
        assertThat(resPropiaCompra.saldoComisionFirma()).isEqualByComparingTo(new BigDecimal("484000.00"));
        assertThat(resPropiaCompra.totalACobrarComprador()).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(resPropiaCompra.totalAPagarVendedor()).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(resPropiaCompra.saldoHaciendaEntrePartes()).isEqualByComparingTo(resDirectoCompra.saldoHaciendaEntrePartes());
        assertThat(resPropiaCompra.saldoComisionFirma()).isEqualByComparingTo(resDirectoCompra.saldoComisionFirma());
        assertThat(resPropiaCompra.totalACobrarComprador()).isEqualByComparingTo(resDirectoCompra.totalACobrarComprador());
        assertThat(resPropiaCompra.totalAPagarVendedor()).isEqualByComparingTo(resDirectoCompra.totalAPagarVendedor());

        // Caso 2: La firma vende hacienda propia (comisión vendedor = 0%, comisión comprador = 2%)
        Operacion opPropiaVenta = crearOperacionBase(ModalidadCircuito.PROPIA);
        opPropiaVenta.setComisionPorcentajeVendedor(new BigDecimal("0.00"));

        CalculoResultado resPropiaVenta = calculadora.calcular(opPropiaVenta);
        assertThat(resPropiaVenta.saldoHaciendaEntrePartes()).isEqualByComparingTo(new BigDecimal("22100000.00"));
        assertThat(resPropiaVenta.saldoComisionFirma()).isEqualByComparingTo(new BigDecimal("484000.00"));
        assertThat(resPropiaVenta.totalACobrarComprador()).isEqualByComparingTo(new BigDecimal("484000.00"));
        assertThat(resPropiaVenta.totalAPagarVendedor()).isEqualByComparingTo(new BigDecimal("0.00"));
    }

    @Test
    void test08b_propia_ventaPropiaConSpreadYModalidadFinalEsIdenticaADirectoConComisionVendedorCero() {
        // Venta de hacienda propia con spread y precio FINAL
        Operacion opPropia = crearOperacionBase(ModalidadCircuito.PROPIA);
        opPropia.setComisionPorcentajeVendedor(new BigDecimal("0.00")); // firma es vendedor
        opPropia.setComisionPorcentajeComprador(new BigDecimal("3.00"));
        opPropia.setModalidadPrecio(ModalidadPrecio.FINAL);
        opPropia.setPrecioEsFinal(true);
        opPropia.setMontoExtraCobradoComprador(new BigDecimal("500000.00"));

        Operacion opDirecto = crearOperacionBase(ModalidadCircuito.DIRECTO);
        opDirecto.setComisionPorcentajeVendedor(new BigDecimal("0.00"));
        opDirecto.setComisionPorcentajeComprador(new BigDecimal("3.00"));
        opDirecto.setModalidadPrecio(ModalidadPrecio.FINAL);
        opDirecto.setPrecioEsFinal(true);
        opDirecto.setMontoExtraCobradoComprador(new BigDecimal("500000.00"));

        CalculoResultado resPropia = calculadora.calcular(opPropia);
        CalculoResultado resDirecto = calculadora.calcular(opDirecto);

        // Subtotal = 20.000.000,00. Desglose FINAL: neto = 20M / 1.105 = 18.099.547,51. ivaGanado = 1.900.452,49.
        // comisionComprador = 20M * 3% = 600.000,00. ivaComisionComprador = 600.000 * 21% = 126.000,00.
        // saldoHacienda = 20.000.000,00 + 1.900.452,49 = 21.900.452,49
        // saldoComisionFirma = 600.000,00 + 126.000,00 + 500.000,00 = 1.226.000,00
        // totalACobrarComprador = 600.000,00 + 126.000,00 + 500.000,00 = 1.226.000,00
        // totalAPagarVendedor = 0.00
        assertThat(resPropia.saldoHaciendaEntrePartes()).isEqualByComparingTo(new BigDecimal("21900452.49"));
        assertThat(resPropia.saldoComisionFirma()).isEqualByComparingTo(new BigDecimal("1226000.00"));
        assertThat(resPropia.totalACobrarComprador()).isEqualByComparingTo(new BigDecimal("1226000.00"));
        assertThat(resPropia.totalAPagarVendedor()).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(resPropia.totalACobrarComprador()).isEqualByComparingTo(resPropia.saldoComisionFirma());

        // Identidad exacta con DIRECTO con comisión vendedor cero
        assertThat(resPropia.saldoHaciendaEntrePartes()).isEqualByComparingTo(resDirecto.saldoHaciendaEntrePartes());
        assertThat(resPropia.saldoComisionFirma()).isEqualByComparingTo(resDirecto.saldoComisionFirma());
        assertThat(resPropia.totalACobrarComprador()).isEqualByComparingTo(resDirecto.totalACobrarComprador());
        assertThat(resPropia.totalAPagarVendedor()).isEqualByComparingTo(resDirecto.totalAPagarVendedor());
    }

    @Test
    void test08c_propia_compraPropiaConVendedorMonotributistaExentoYOverridesEsIdenticaADirecto() {
        // Caso Monotributista: IVA ganado = 0
        Operacion opMono = crearOperacionBase(ModalidadCircuito.PROPIA);
        opMono.setComisionPorcentajeComprador(new BigDecimal("0.00")); // firma es comprador
        opMono.setComisionPorcentajeVendedor(new BigDecimal("2.50"));
        opMono.setCondicionFiscalVendedor(CondicionFiscal.MONOTRIBUTISTA);

        Operacion opMonoDirecto = crearOperacionBase(ModalidadCircuito.DIRECTO);
        opMonoDirecto.setComisionPorcentajeComprador(new BigDecimal("0.00"));
        opMonoDirecto.setComisionPorcentajeVendedor(new BigDecimal("2.50"));
        opMonoDirecto.setCondicionFiscalVendedor(CondicionFiscal.MONOTRIBUTISTA);

        CalculoResultado resMono = calculadora.calcular(opMono);
        CalculoResultado resMonoDirecto = calculadora.calcular(opMonoDirecto);

        // subtotal = 20M, ivaGanado = 0 -> saldoHacienda = 20M
        // comisionVendedor = 20M * 2.5% = 500.000,00. ivaComisionVendedor = 500.000 * 21% = 105.000,00.
        // saldoComisionFirma = 500.000,00 + 105.000,00 = 605.000,00.
        // totalACobrarComprador = 0.00, totalAPagarVendedor = 0.00
        assertThat(resMono.saldoHaciendaEntrePartes()).isEqualByComparingTo(new BigDecimal("20000000.00"));
        assertThat(resMono.saldoComisionFirma()).isEqualByComparingTo(new BigDecimal("605000.00"));
        assertThat(resMono.totalACobrarComprador()).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(resMono.totalAPagarVendedor()).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(resMono.saldoHaciendaEntrePartes()).isEqualByComparingTo(resMonoDirecto.saldoHaciendaEntrePartes());
        assertThat(resMono.saldoComisionFirma()).isEqualByComparingTo(resMonoDirecto.saldoComisionFirma());
        assertThat(resMono.totalACobrarComprador()).isEqualByComparingTo(resMonoDirecto.totalACobrarComprador());
        assertThat(resMono.totalAPagarVendedor()).isEqualByComparingTo(resMonoDirecto.totalAPagarVendedor());

        // Caso Exento (R-075): IVA ganado = 0
        Operacion opExento = crearOperacionBase(ModalidadCircuito.PROPIA);
        opExento.setComisionPorcentajeComprador(new BigDecimal("0.00"));
        opExento.setComisionPorcentajeVendedor(new BigDecimal("2.50"));
        opExento.setCondicionFiscalVendedor(CondicionFiscal.EXENTO);

        CalculoResultado resExento = calculadora.calcular(opExento);
        assertThat(resExento.saldoHaciendaEntrePartes()).isEqualByComparingTo(new BigDecimal("20000000.00"));
        assertThat(resExento.saldoComisionFirma()).isEqualByComparingTo(new BigDecimal("605000.00"));
        assertThat(resExento.totalACobrarComprador()).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(resExento.totalAPagarVendedor()).isEqualByComparingTo(new BigDecimal("0.00"));

        // Caso con Overrides manuales activos (R-079)
        Operacion opOverrides = crearOperacionBase(ModalidadCircuito.PROPIA);
        opOverrides.setComisionPorcentajeComprador(new BigDecimal("0.00"));
        opOverrides.setComisionPorcentajeVendedor(new BigDecimal("2.50"));
        opOverrides.setIvaGanadoMontoOverride(new BigDecimal("150000.00"));
        opOverrides.setIvaComisionVendedorOverride(new BigDecimal("25000.00"));

        Operacion opOverridesDirecto = crearOperacionBase(ModalidadCircuito.DIRECTO);
        opOverridesDirecto.setComisionPorcentajeComprador(new BigDecimal("0.00"));
        opOverridesDirecto.setComisionPorcentajeVendedor(new BigDecimal("2.50"));
        opOverridesDirecto.setIvaGanadoMontoOverride(new BigDecimal("150000.00"));
        opOverridesDirecto.setIvaComisionVendedorOverride(new BigDecimal("25000.00"));

        CalculoResultado resOverrides = calculadora.calcular(opOverrides);
        CalculoResultado resOverridesDirecto = calculadora.calcular(opOverridesDirecto);

        // saldoHacienda = 20M + 150.000,00 = 20.150.000,00
        // saldoComisionFirma = 500.000,00 + 25.000,00 = 525.000,00
        assertThat(resOverrides.saldoHaciendaEntrePartes()).isEqualByComparingTo(new BigDecimal("20150000.00"));
        assertThat(resOverrides.saldoComisionFirma()).isEqualByComparingTo(new BigDecimal("525000.00"));
        assertThat(resOverrides.totalACobrarComprador()).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(resOverrides.totalAPagarVendedor()).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(resOverrides.saldoHaciendaEntrePartes()).isEqualByComparingTo(resOverridesDirecto.saldoHaciendaEntrePartes());
        assertThat(resOverrides.saldoComisionFirma()).isEqualByComparingTo(resOverridesDirecto.saldoComisionFirma());
        assertThat(resOverrides.totalACobrarComprador()).isEqualByComparingTo(resOverridesDirecto.totalACobrarComprador());
        assertThat(resOverrides.totalAPagarVendedor()).isEqualByComparingTo(resOverridesDirecto.totalAPagarVendedor());
    }

    @Test
    void test08d_propia_ambasComisionesCeroProduceSaldoComisionCeroYSaldoHaciendaIntacto() {
        Operacion op = crearOperacionBase(ModalidadCircuito.PROPIA);
        op.setComisionPorcentajeVendedor(new BigDecimal("0.00"));
        op.setComisionPorcentajeComprador(new BigDecimal("0.00"));
        op.setMontoExtraCobradoComprador(null);

        CalculoResultado res = calculadora.calcular(op);

        assertThat(res.saldoComisionFirma()).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(res.totalACobrarComprador()).isEqualByComparingTo(new BigDecimal("0.00"));
        assertThat(res.totalAPagarVendedor()).isEqualByComparingTo(new BigDecimal("0.00"));
        // subtotal 20M + ivaGanado 2.1M = 22.100.000,00
        assertThat(res.saldoHaciendaEntrePartes()).isEqualByComparingTo(new BigDecimal("22100000.00"));
        assertThat(res.saldoHaciendaEntrePartes()).isEqualByComparingTo(
                res.subtotalGanado().add(res.ivaGanado())
        );
    }

    // =========================================================================
    // REGRESIÓN OBLIGATORIA AL CENTAVO: Anexo II §6.1 y §6.2 (Tests 9 y 10)
    // =========================================================================

    @Test
    void test09_regresionAnexoII_seccion6_1_ejemplo1_directoSinSpread() {
        Operacion op = new Operacion();
        op.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        op.setConGarantia(true);
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
        op.setMontoExtraCobradoComprador(null);

        CalculoResultado resultado = calculadora.calcular(op);

        // Capa 1
        assertThat(resultado.subtotalGanado()).isEqualByComparingTo(new BigDecimal("150000000.00"));
        assertThat(resultado.comisionVendedorMonto()).isEqualByComparingTo(new BigDecimal("3000000.00"));
        assertThat(resultado.comisionCompradorMonto()).isEqualByComparingTo(new BigDecimal("3000000.00"));
        assertThat(resultado.montoExtraCobradoComprador()).isNull();

        // Capa 2
        assertThat(resultado.ivaGanado()).isEqualByComparingTo(new BigDecimal("15750000.00"));
        assertThat(resultado.ivaComisionVendedorMonto()).isEqualByComparingTo(new BigDecimal("630000.00"));
        assertThat(resultado.ivaComisionCompradorMonto()).isEqualByComparingTo(new BigDecimal("630000.00"));

        // Capa 3 (Anexo II §6.1 al centavo)
        assertThat(resultado.saldoHaciendaEntrePartes()).isEqualByComparingTo(new BigDecimal("165750000.00"));
        assertThat(resultado.saldoComisionFirma()).isEqualByComparingTo(new BigDecimal("7260000.00"));
        assertThat(resultado.totalACobrarComprador()).isEqualByComparingTo(new BigDecimal("3630000.00"));
        assertThat(resultado.totalAPagarVendedor()).isEqualByComparingTo(new BigDecimal("0.00"));
    }

    @Test
    void test10_regresionAnexoII_seccion6_2_ejemplo2_directoConSpread() {
        Operacion op = new Operacion();
        op.setModalidadCircuito(ModalidadCircuito.DIRECTO);
        op.setConGarantia(true);
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
        op.setMontoExtraCobradoComprador(new BigDecimal("6000000.00"));

        CalculoResultado resultado = calculadora.calcular(op);

        // Capa 1 y Capa 2 idénticas al Ejemplo 1 (R-069)
        assertThat(resultado.subtotalGanado()).isEqualByComparingTo(new BigDecimal("150000000.00"));
        assertThat(resultado.comisionVendedorMonto()).isEqualByComparingTo(new BigDecimal("3000000.00"));
        assertThat(resultado.comisionCompradorMonto()).isEqualByComparingTo(new BigDecimal("3000000.00"));
        assertThat(resultado.ivaGanado()).isEqualByComparingTo(new BigDecimal("15750000.00"));
        assertThat(resultado.ivaComisionVendedorMonto()).isEqualByComparingTo(new BigDecimal("630000.00"));
        assertThat(resultado.ivaComisionCompradorMonto()).isEqualByComparingTo(new BigDecimal("630000.00"));
        assertThat(resultado.montoExtraCobradoComprador()).isEqualByComparingTo(new BigDecimal("6000000.00"));

        // Capa 3 (Anexo II §6.2 al centavo)
        assertThat(resultado.saldoHaciendaEntrePartes()).isEqualByComparingTo(new BigDecimal("165750000.00"));
        assertThat(resultado.saldoComisionFirma()).isEqualByComparingTo(new BigDecimal("13260000.00"));
        assertThat(resultado.totalACobrarComprador()).isEqualByComparingTo(new BigDecimal("9630000.00"));
        assertThat(resultado.totalAPagarVendedor()).isEqualByComparingTo(new BigDecimal("0.00"));
    }

    // =========================================================================
    // CASOS DE BORDE (Tests 11 y 12)
    // =========================================================================

    @Test
    void test11_montoExtraNuloVsCeroProducenIdenticosSaldosPreservandoNullEnRecord() {
        Operacion opConNull = crearOperacionBase(ModalidadCircuito.DIRECTO);
        opConNull.setMontoExtraCobradoComprador(null);

        Operacion opConCero = crearOperacionBase(ModalidadCircuito.DIRECTO);
        opConCero.setMontoExtraCobradoComprador(new BigDecimal("0.00"));

        CalculoResultado resNull = calculadora.calcular(opConNull);
        CalculoResultado resCero = calculadora.calcular(opConCero);

        assertThat(resNull.montoExtraCobradoComprador()).isNull();
        assertThat(resCero.montoExtraCobradoComprador()).isNotNull();
        assertThat(resCero.montoExtraCobradoComprador()).isEqualByComparingTo(new BigDecimal("0.00"));

        assertThat(resNull.saldoHaciendaEntrePartes().compareTo(resCero.saldoHaciendaEntrePartes())).isZero();
        assertThat(resNull.saldoComisionFirma().compareTo(resCero.saldoComisionFirma())).isZero();
        assertThat(resNull.totalACobrarComprador().compareTo(resCero.totalACobrarComprador())).isZero();
        assertThat(resNull.totalAPagarVendedor().compareTo(resCero.totalAPagarVendedor())).isZero();
    }

    @Test
    void test12_fleteMontoYRetencionesExternasMontoNoAlteranSaldosCapa3YOverridesSePropagan_R079_R080() {
        // 1. Inercia de fleteMonto y retencionesExternasMonto en DIRECTO y CONSIGNATARIA_EXTERNA (D-12, R-080)
        Operacion opBaseDirecto = crearOperacionBase(ModalidadCircuito.DIRECTO);
        Operacion opConFleteYRetencionesDirecto = crearOperacionBase(ModalidadCircuito.DIRECTO);
        opConFleteYRetencionesDirecto.setCondicionEntrega(CondicionEntrega.PUESTO_EN_PLANTA);
        opConFleteYRetencionesDirecto.setFleteCargoDe(FleteCargoDe.VENDEDOR);
        opConFleteYRetencionesDirecto.setFleteMonto(new BigDecimal("850000.00"));
        opConFleteYRetencionesDirecto.setRetencionesExternasMonto(new BigDecimal("320000.00"));

        CalculoResultado resSinFlete = calculadora.calcular(opBaseDirecto);
        CalculoResultado resConFlete = calculadora.calcular(opConFleteYRetencionesDirecto);

        assertThat(resConFlete.saldoHaciendaEntrePartes()).isEqualByComparingTo(resSinFlete.saldoHaciendaEntrePartes());
        assertThat(resConFlete.saldoComisionFirma()).isEqualByComparingTo(resSinFlete.saldoComisionFirma());
        assertThat(resConFlete.totalACobrarComprador()).isEqualByComparingTo(resSinFlete.totalACobrarComprador());
        assertThat(resConFlete.totalAPagarVendedor()).isEqualByComparingTo(resSinFlete.totalAPagarVendedor());

        Operacion opBaseExterna = crearOperacionBase(ModalidadCircuito.CONSIGNATARIA_EXTERNA);
        Operacion opConFleteYRetencionesExterna = crearOperacionBase(ModalidadCircuito.CONSIGNATARIA_EXTERNA);
        opConFleteYRetencionesExterna.setFleteMonto(new BigDecimal("500000.00"));
        opConFleteYRetencionesExterna.setRetencionesExternasMonto(new BigDecimal("410000.00"));

        CalculoResultado resSinRetExterna = calculadora.calcular(opBaseExterna);
        CalculoResultado resConRetExterna = calculadora.calcular(opConFleteYRetencionesExterna);

        assertThat(resConRetExterna.saldoHaciendaEntrePartes()).isEqualByComparingTo(resSinRetExterna.saldoHaciendaEntrePartes());
        assertThat(resConRetExterna.saldoComisionFirma()).isEqualByComparingTo(resSinRetExterna.saldoComisionFirma());
        assertThat(resConRetExterna.totalACobrarComprador()).isEqualByComparingTo(resSinRetExterna.totalACobrarComprador());
        assertThat(resConRetExterna.totalAPagarVendedor()).isEqualByComparingTo(resSinRetExterna.totalAPagarVendedor());

        // 2. Propagación de porcentajeDocumentado = 0 con overrides de IVA activos (R-079) a Capa 3
        Operacion opConOverrides = crearOperacionBase(ModalidadCircuito.DIRECTO);
        opConOverrides.setPorcentajeDocumentadoGanado(new BigDecimal("0.00"));
        opConOverrides.setPorcentajeDocumentadoComisionVendedor(new BigDecimal("0.00"));
        opConOverrides.setPorcentajeDocumentadoComisionComprador(new BigDecimal("0.00"));
        opConOverrides.setIvaGanadoMontoOverride(new BigDecimal("500000.00"));
        opConOverrides.setIvaComisionVendedorOverride(new BigDecimal("10000.00"));
        opConOverrides.setIvaComisionCompradorOverride(new BigDecimal("20000.00"));

        CalculoResultado resOverrides = calculadora.calcular(opConOverrides);
        // subtotal (20.000.000) + override iva ganado (500.000) = 20.500.000
        assertThat(resOverrides.saldoHaciendaEntrePartes()).isEqualByComparingTo(new BigDecimal("20500000.00"));
        // (400.000 + 10.000) + (400.000 + 20.000) = 830.000
        assertThat(resOverrides.saldoComisionFirma()).isEqualByComparingTo(new BigDecimal("830000.00"));
        // 400.000 + 20.000 = 420.000
        assertThat(resOverrides.totalACobrarComprador()).isEqualByComparingTo(new BigDecimal("420000.00"));
        assertThat(resOverrides.totalAPagarVendedor()).isEqualByComparingTo(new BigDecimal("0.00"));
    }
}
