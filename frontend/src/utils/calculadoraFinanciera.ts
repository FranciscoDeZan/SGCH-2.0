/**
 * Motor de calculo financiero y fiscal en 3 capas para operaciones pecuarias en TypeScript.
 * Espejo puro y exacto al centavo de CalculadoraFinancieraService.java (Anexo II v1.1).
 */

import type { CalculoResultado } from '../types/calculoResultado';
import type {
  ModalidadCircuito,
  ModalidadPrecio,
  CondicionFiscal,
} from '../types/operacion';

export interface CalculoPreviewInput {
  kgNeto: number;
  precioKgFacturado: number;
  montoExtraCobradoComprador?: number | null;
  comisionPorcentajeVendedor?: number | null;
  comisionPorcentajeComprador?: number | null;
  modalidadPrecio: ModalidadPrecio;
  precioEsFinal?: boolean | null;
  condicionFiscalVendedor: CondicionFiscal;
  modalidadCircuito: ModalidadCircuito;
  porcentajeDocumentadoGanado?: number | null;
  porcentajeDocumentadoComisionVendedor?: number | null;
  porcentajeDocumentadoComisionComprador?: number | null;
  ivaGanadoMontoOverride?: number | null;
  ivaComisionVendedorOverride?: number | null;
  ivaComisionCompradorOverride?: number | null;
}

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Calcula el preview consolidado de una operacion pecuaria en tres capas.
 */
export function calcularPreviewOperacion(input: CalculoPreviewInput): CalculoResultado {
  // =========================================================================
  // CAPA 1: Valorizacion economica (Anexo II §2)
  // =========================================================================
  const subtotalGanado = round2(input.kgNeto * input.precioKgFacturado);
  const comisionVendedorPct = input.comisionPorcentajeVendedor ?? 0;
  const comisionCompradorPct = input.comisionPorcentajeComprador ?? 0;
  const comisionVendedorMonto = round2(
    subtotalGanado * (comisionVendedorPct / 100)
  );
  const comisionCompradorMonto = round2(
    subtotalGanado * (comisionCompradorPct / 100)
  );
  const montoExtra = input.montoExtraCobradoComprador != null
    ? round2(input.montoExtraCobradoComprador)
    : 0;

  // =========================================================================
  // CAPA 2: Liquidacion fiscal (Anexo II §3)
  // =========================================================================
  let ivaGanado: number;
  if (input.ivaGanadoMontoOverride != null) {
    ivaGanado = round2(input.ivaGanadoMontoOverride);
  } else if (
    input.condicionFiscalVendedor === 'MONOTRIBUTISTA' ||
    input.condicionFiscalVendedor === 'EXENTO' ||
    input.condicionFiscalVendedor === 'CONSUMIDOR_FINAL'
  ) {
    ivaGanado = 0;
  } else {
    // Vendedor RESPONSABLE_INSCRIPTO
    const docGanado = input.porcentajeDocumentadoGanado ?? 100;
    const esFinal = input.modalidadPrecio === 'FINAL' || Boolean(input.precioEsFinal);
    if (esFinal) {
      // Caso C: Desglose / 1.105
      const subtotalNeto = round2(subtotalGanado / 1.105);
      const ivaTeorico = subtotalGanado - subtotalNeto;
      ivaGanado = round2(ivaTeorico * (docGanado / 100));
    } else {
      // Caso B: 10.5% sobre subtotal neto
      const ivaTeorico = subtotalGanado * 0.105;
      ivaGanado = round2(ivaTeorico * (docGanado / 100));
    }
  }

  // IVA Comision Vendedor (21%)
  let ivaComisionVendedorMonto: number;
  if (input.ivaComisionVendedorOverride != null) {
    ivaComisionVendedorMonto = round2(input.ivaComisionVendedorOverride);
  } else {
    const docComisionVendedor = input.porcentajeDocumentadoComisionVendedor ?? 100;
    const ivaTeorico = comisionVendedorMonto * 0.21;
    ivaComisionVendedorMonto = round2(ivaTeorico * (docComisionVendedor / 100));
  }

  // IVA Comision Comprador (21%)
  let ivaComisionCompradorMonto: number;
  if (input.ivaComisionCompradorOverride != null) {
    ivaComisionCompradorMonto = round2(input.ivaComisionCompradorOverride);
  } else {
    const docComisionComprador = input.porcentajeDocumentadoComisionComprador ?? 100;
    const ivaTeorico = comisionCompradorMonto * 0.21;
    ivaComisionCompradorMonto = round2(ivaTeorico * (docComisionComprador / 100));
  }

  // =========================================================================
  // CAPA 3: Saldos por contraparte e integrador (Anexo II §4)
  // =========================================================================
  let saldoHaciendaEntrePartes: number;
  let saldoComisionFirma: number;
  let totalACobrarComprador: number;
  const totalAPagarVendedor = 0;

  if (input.modalidadCircuito === 'CONSIGNATARIA_EXTERNA') {
    saldoHaciendaEntrePartes = 0;
    saldoComisionFirma = round2(comisionVendedorMonto + ivaComisionVendedorMonto);
    totalACobrarComprador = 0;
  } else {
    // DIRECTO y PROPIA (DA-04: en PROPIA la comision propia ya viene en 0%)
    saldoHaciendaEntrePartes = round2(subtotalGanado + ivaGanado);
    saldoComisionFirma = round2(
      comisionVendedorMonto +
        ivaComisionVendedorMonto +
        comisionCompradorMonto +
        ivaComisionCompradorMonto +
        montoExtra
    );
    totalACobrarComprador = round2(
      comisionCompradorMonto + ivaComisionCompradorMonto + montoExtra
    );
  }

  return {
    subtotalGanado,
    comisionVendedorMonto,
    comisionCompradorMonto,
    ivaGanado,
    ivaComisionVendedorMonto,
    ivaComisionCompradorMonto,
    montoExtraCobradoComprador: montoExtra,
    saldoHaciendaEntrePartes,
    saldoComisionFirma,
    totalACobrarComprador,
    totalAPagarVendedor,
  };
}
