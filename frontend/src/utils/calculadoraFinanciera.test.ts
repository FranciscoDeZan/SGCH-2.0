import { describe, it, expect } from 'vitest';
import {
  calcularPreviewOperacion,
  type CalculoPreviewInput,
} from './calculadoraFinanciera';
import type { CondicionFiscal } from '../types/operacion';

describe('calculadoraFinanciera (Capa 1 + 2 + 3 Anexo II)', () => {
  it('1. Regresion Ejemplo 1 §6.1: DIRECTO sin spread 100% documentada', () => {
    const input: CalculoPreviewInput = {
      kgNeto: 30000,
      precioKgFacturado: 5000,
      comisionPorcentajeVendedor: 2,
      comisionPorcentajeComprador: 2,
      modalidadPrecio: 'NETO',
      condicionFiscalVendedor: 'RESPONSABLE_INSCRIPTO',
      modalidadCircuito: 'DIRECTO',
      porcentajeDocumentadoGanado: 100,
      porcentajeDocumentadoComisionVendedor: 100,
      porcentajeDocumentadoComisionComprador: 100,
      montoExtraCobradoComprador: null,
    };

    const res = calcularPreviewOperacion(input);

    expect(res.subtotalGanado).toBe(150_000_000);
    expect(res.comisionVendedorMonto).toBe(3_000_000);
    expect(res.comisionCompradorMonto).toBe(3_000_000);
    expect(res.ivaGanado).toBe(15_750_000);
    expect(res.ivaComisionVendedorMonto).toBe(630_000);
    expect(res.ivaComisionCompradorMonto).toBe(630_000);
    expect(res.saldoHaciendaEntrePartes).toBe(165_750_000);
    expect(res.saldoComisionFirma).toBe(7_260_000);
    expect(res.totalACobrarComprador).toBe(3_630_000);
    expect(res.totalAPagarVendedor).toBe(0);
  });

  it('2. Regresion Ejemplo 2 §6.2: DIRECTO con spread 6M', () => {
    const input: CalculoPreviewInput = {
      kgNeto: 30000,
      precioKgFacturado: 5000,
      comisionPorcentajeVendedor: 2,
      comisionPorcentajeComprador: 2,
      modalidadPrecio: 'NETO',
      condicionFiscalVendedor: 'RESPONSABLE_INSCRIPTO',
      modalidadCircuito: 'DIRECTO',
      porcentajeDocumentadoGanado: 100,
      porcentajeDocumentadoComisionVendedor: 100,
      porcentajeDocumentadoComisionComprador: 100,
      montoExtraCobradoComprador: 6_000_000,
    };

    const res = calcularPreviewOperacion(input);

    expect(res.subtotalGanado).toBe(150_000_000);
    expect(res.comisionVendedorMonto).toBe(3_000_000);
    expect(res.comisionCompradorMonto).toBe(3_000_000);
    expect(res.ivaGanado).toBe(15_750_000);
    expect(res.ivaComisionVendedorMonto).toBe(630_000);
    expect(res.ivaComisionCompradorMonto).toBe(630_000);
    expect(res.saldoHaciendaEntrePartes).toBe(165_750_000);
    expect(res.saldoComisionFirma).toBe(13_260_000);
    expect(res.totalACobrarComprador).toBe(9_630_000);
    expect(res.totalAPagarVendedor).toBe(0);
  });

  it('3. FINAL con RI: desglose / 1.105 exacto al centavo y comisiones sobre bruto', () => {
    const input: CalculoPreviewInput = {
      kgNeto: 30000,
      precioKgFacturado: 5000,
      comisionPorcentajeVendedor: 2,
      comisionPorcentajeComprador: 2,
      modalidadPrecio: 'FINAL',
      condicionFiscalVendedor: 'RESPONSABLE_INSCRIPTO',
      modalidadCircuito: 'DIRECTO',
      porcentajeDocumentadoGanado: 100,
      porcentajeDocumentadoComisionVendedor: 100,
      porcentajeDocumentadoComisionComprador: 100,
    };

    const res = calcularPreviewOperacion(input);

    expect(res.subtotalGanado).toBe(150_000_000);
    expect(res.comisionVendedorMonto).toBe(3_000_000);
    expect(res.comisionCompradorMonto).toBe(3_000_000);
    // 150_000_000 / 1.105 = 135_746_606.33 -> ivaGanado = 150_000_000 - 135_746_606.33 = 14_253_393.67
    expect(res.ivaGanado).toBe(14_253_393.67);
    expect(res.ivaComisionVendedorMonto).toBe(630_000);
    expect(res.ivaComisionCompradorMonto).toBe(630_000);
    expect(res.saldoHaciendaEntrePartes).toBe(164_253_393.67);
    expect(res.saldoComisionFirma).toBe(7_260_000);
    expect(res.totalACobrarComprador).toBe(3_630_000);
    expect(res.totalAPagarVendedor).toBe(0);
  });

  it('4. MONOTRIBUTISTA/EXENTO/CONSUMIDOR_FINAL produce ivaGanado = 0 tanto en NETO como en FINAL', () => {
    const condiciones: CondicionFiscal[] = ['MONOTRIBUTISTA', 'EXENTO', 'CONSUMIDOR_FINAL'];
    for (const condicion of condiciones) {
      // NETO
      const resNeto = calcularPreviewOperacion({
        kgNeto: 10000,
        precioKgFacturado: 2000,
        comisionPorcentajeVendedor: 2,
        comisionPorcentajeComprador: 2,
        modalidadPrecio: 'NETO',
        condicionFiscalVendedor: condicion,
        modalidadCircuito: 'DIRECTO',
      });
      expect(resNeto.ivaGanado).toBe(0);
      expect(resNeto.saldoHaciendaEntrePartes).toBe(resNeto.subtotalGanado);

      // FINAL
      const resFinal = calcularPreviewOperacion({
        kgNeto: 10000,
        precioKgFacturado: 2210,
        comisionPorcentajeVendedor: 2,
        comisionPorcentajeComprador: 2,
        modalidadPrecio: 'FINAL',
        condicionFiscalVendedor: condicion,
        modalidadCircuito: 'DIRECTO',
      });
      expect(resFinal.ivaGanado).toBe(0);
      expect(resFinal.saldoHaciendaEntrePartes).toBe(resFinal.subtotalGanado);
    }
  });

  it('5. Override manual ivaGanadoMontoOverride pisa el calculo teorico', () => {
    const input: CalculoPreviewInput = {
      kgNeto: 30000,
      precioKgFacturado: 5000,
      comisionPorcentajeVendedor: 2,
      comisionPorcentajeComprador: 2,
      modalidadPrecio: 'NETO',
      condicionFiscalVendedor: 'RESPONSABLE_INSCRIPTO',
      modalidadCircuito: 'DIRECTO',
      ivaGanadoMontoOverride: 1_234_567,
    };

    const res = calcularPreviewOperacion(input);

    expect(res.ivaGanado).toBe(1_234_567);
    expect(res.saldoHaciendaEntrePartes).toBe(151_234_567);
  });

  it('6. CONSIGNATARIA_EXTERNA anula saldoHacienda y cobra solo comision vendedor', () => {
    const input: CalculoPreviewInput = {
      kgNeto: 10000,
      precioKgFacturado: 2000,
      comisionPorcentajeVendedor: 2,
      comisionPorcentajeComprador: 3,
      modalidadPrecio: 'NETO',
      condicionFiscalVendedor: 'RESPONSABLE_INSCRIPTO',
      modalidadCircuito: 'CONSIGNATARIA_EXTERNA',
      montoExtraCobradoComprador: 500_000,
    };

    const res = calcularPreviewOperacion(input);

    // subtotal = 20M, comisionVendedor = 400.000, ivaComisionVendedor = 84.000
    expect(res.saldoHaciendaEntrePartes).toBe(0);
    expect(res.saldoComisionFirma).toBe(484_000);
    expect(res.totalACobrarComprador).toBe(0);
    expect(res.totalAPagarVendedor).toBe(0);
  });

  it('7. PROPIA con comision 0 en punta propia produce los mismos 4 saldos que DIRECTO', () => {
    // Venta propia con comision vendedor 0%
    const inputPropia: CalculoPreviewInput = {
      kgNeto: 10000,
      precioKgFacturado: 2000,
      comisionPorcentajeVendedor: 0,
      comisionPorcentajeComprador: 2,
      modalidadPrecio: 'NETO',
      condicionFiscalVendedor: 'RESPONSABLE_INSCRIPTO',
      modalidadCircuito: 'PROPIA',
      montoExtraCobradoComprador: 500_000,
    };

    const inputDirecto: CalculoPreviewInput = {
      ...inputPropia,
      modalidadCircuito: 'DIRECTO',
    };

    const resPropia = calcularPreviewOperacion(inputPropia);
    const resDirecto = calcularPreviewOperacion(inputDirecto);

    // Saldos exactos
    expect(resPropia.saldoHaciendaEntrePartes).toBe(resDirecto.saldoHaciendaEntrePartes);
    expect(resPropia.saldoComisionFirma).toBe(resDirecto.saldoComisionFirma);
    expect(resPropia.totalACobrarComprador).toBe(resDirecto.totalACobrarComprador);
    expect(resPropia.totalAPagarVendedor).toBe(resDirecto.totalAPagarVendedor);

    // Verificación de valores de saldos
    expect(resPropia.saldoHaciendaEntrePartes).toBe(22_100_000);
    expect(resPropia.saldoComisionFirma).toBe(984_000); // 0 + 0 + 400.000 + 84.000 + 500.000
    expect(resPropia.totalACobrarComprador).toBe(984_000);
    expect(resPropia.totalAPagarVendedor).toBe(0);
  });
});
