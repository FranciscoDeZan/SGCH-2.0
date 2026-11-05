import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OperacionDetail, formatResumenOperacion } from './OperacionDetail';
import type { OperacionResponse } from '../../types/operacion';

// Mock CobrosPanel so OperacionDetail tests focus on detail view contracts
vi.mock('./CobrosPanel', () => ({
  CobrosPanel: () => <div data-testid="mock-cobros-panel">Mock CobrosPanel</div>,
}));

const mockOperacion: OperacionResponse = {
  id: 'op-123',
  fechaCarga: '2026-11-04T12:00:00',
  fechaOperacion: '2026-11-04T10:00:00',
  modalidadCircuito: 'DIRECTO',
  consignatariaExterna: null,
  compradorId: 'c-1',
  compradorNombre: 'Estancia Don Pedro',
  vendedorId: 'c-2',
  vendedorNombre: 'Cabaña La Tranquera',
  categoria: 'FAENA',
  subcategoria: 'Novillos',
  kgNeto: 15000,
  kgOrigenBruto: 16000,
  porcentajeDesbaste: 6.25,
  kgLlegadaReferencia: null,
  precioKgFacturado: 1200,
  montoExtraCobradoComprador: null,
  modalidadPrecio: 'NETO',
  precioEsFinal: false,
  comisionPorcentajeVendedor: 2,
  comisionPorcentajeComprador: 2,
  comisionTotalCobradaReferencia: null,
  condicionFiscalVendedor: 'RESPONSABLE_INSCRIPTO',
  porcentajeDocumentadoGanado: 100,
  porcentajeDocumentadoComisionVendedor: 100,
  porcentajeDocumentadoComisionComprador: 100,
  ivaGanadoMontoOverride: null,
  ivaComisionVendedorOverride: null,
  ivaComisionCompradorOverride: null,
  conGarantia: true,
  retencionesExternasMonto: null,
  condicionEntrega: 'A_RETIRAR_CAMPO',
  fleteCargoDe: 'COMPRADOR',
  fleteMonto: null,
  estadoLiquidacion: 'PENDIENTE',
  formaPago: '30 días',
  plazo: '30',
  raza: 'BRANGUS',
  color: 'Negro',
  puntuacion: 'Buena',
  destino: 'Frigorífico',
  cantidadMachos: 35,
  cantidadHembras: 0,
  terneros: false,
  observaciones: 'Lote parejo',
  cuotas: [
    {
      id: 'cuota-1',
      numeroCuota: 1,
      fechaBasePlazo: 'CARGA',
      diasPlazoComprador: 30,
      diasDescalceVendedor: 0,
      fechaVencimientoComprador: '2026-12-04',
      fechaVencimientoVendedor: '2026-12-04',
      montoCuota: 20325600,
      estadoCobro: 'PENDIENTE',
      estadoPago: 'PENDIENTE',
    },
  ],
  calculo: {
    subtotalGanado: 18000000,
    comisionVendedorMonto: 360000,
    comisionCompradorMonto: 360000,
    ivaGanado: 1890000,
    ivaComisionVendedorMonto: 75600,
    ivaComisionCompradorMonto: 75600,
    montoExtraCobradoComprador: 0,
    saldoHaciendaEntrePartes: 19890000,
    saldoComisionFirma: 871200,
    totalACobrarComprador: 20325600,
    totalAPagarVendedor: 19454400,
  },
};

const mockOperacionExterna: OperacionResponse = {
  ...mockOperacion,
  id: 'op-999',
  modalidadCircuito: 'CONSIGNATARIA_EXTERNA',
  consignatariaExterna: 'Madelan S.A.',
  retencionesExternasMonto: 45000,
  calculo: {
    ...mockOperacion.calculo,
    saldoHaciendaEntrePartes: 0,
    saldoComisionFirma: 435600,
    totalACobrarComprador: 0,
    totalAPagarVendedor: 0,
  },
};

describe('OperacionDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renderiza cabecera + partes + los 4 saldos Capa 3 + desglose Capa 1 y 2', () => {
    render(
      <OperacionDetail
        operacion={mockOperacion}
        onVolver={vi.fn()}
        onEditar={vi.fn()}
        onCobroRegistrado={vi.fn()}
      />
    );

    // Cabecera con ID y badge
    expect(screen.getByText(/detalle de operación op-123/i)).toBeInTheDocument();
    expect(screen.getByText('DIRECTO')).toBeInTheDocument();
    expect(screen.getAllByText('PENDIENTE').length).toBeGreaterThanOrEqual(1);

    // Partes y condición fiscal
    expect(screen.getByText('Estancia Don Pedro')).toBeInTheDocument();
    expect(screen.getByText('Cabaña La Tranquera')).toBeInTheDocument();
    expect(screen.getByText(/responsable inscripto/i)).toBeInTheDocument();

    // Hacienda
    expect(screen.getByText(/novillos/i)).toBeInTheDocument();
    expect(screen.getByText(/brangus/i)).toBeInTheDocument();
    expect(screen.getByText(/15\.000/)).toBeInTheDocument();

    // Capa 1
    expect(screen.getByText(/18\.000\.000/)).toBeInTheDocument();
    expect(screen.getAllByText(/360\.000/).length).toBeGreaterThanOrEqual(1);

    // Capa 2
    expect(screen.getByText(/1\.890\.000/)).toBeInTheDocument();
    expect(screen.getAllByText(/75\.600/).length).toBeGreaterThanOrEqual(1);

    // Capa 3 (los 4 saldos)
    expect(screen.getByText(/19\.890\.000/)).toBeInTheDocument(); // saldoHaciendaEntrePartes
    expect(screen.getByText(/871\.200/)).toBeInTheDocument(); // saldoComisionFirma
    expect(screen.getAllByText(/20\.325\.600/).length).toBeGreaterThanOrEqual(1); // totalACobrarComprador
    expect(screen.getByText(/19\.454\.400/)).toBeInTheDocument(); // totalAPagarVendedor
  });

  it('2. Renderiza tabla cuotas con ambas fechas + badges de estado', () => {
    render(
      <OperacionDetail
        operacion={mockOperacion}
        onVolver={vi.fn()}
        onEditar={vi.fn()}
        onCobroRegistrado={vi.fn()}
      />
    );

    // Tabla de cuotas
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Cuota 1')).toBeInTheDocument();
    expect(screen.getAllByText(/04\/12\/2026/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('PENDIENTE').length).toBeGreaterThanOrEqual(2);
  });

  it('3. Click "Copiar resumen" -> navigator.clipboard.writeText con texto plano sin emojis -> onActionSuccess("Resumen copiado al portapapeles")', async () => {
    const handleActionSuccess = vi.fn();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);

    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <OperacionDetail
        operacion={mockOperacion}
        onVolver={vi.fn()}
        onEditar={vi.fn()}
        onCobroRegistrado={vi.fn()}
        onActionSuccess={handleActionSuccess}
      />
    );

    const btnCopiar = screen.getByRole('button', { name: /copiar resumen/i });
    fireEvent.click(btnCopiar);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledTimes(1);
    });

    const copiedText = writeTextMock.mock.calls[0][0];
    const directResumen = formatResumenOperacion(mockOperacion);
    expect(copiedText).toBe(directResumen);

    // Verificación de texto plano puro
    expect(copiedText).toContain('RESUMEN DE OPERACION - SGCH');
    expect(copiedText).toContain('Comprador: Estancia Don Pedro');
    expect(copiedText).toContain('Vendedor: Cabaña La Tranquera (RESPONSABLE_INSCRIPTO)');
    expect(copiedText).toContain('--- LIQUIDACION ---');
    expect(copiedText).toContain('Capital Ganado: $18.000.000');
    expect(copiedText).toContain('--- PLAZO Y CUOTAS (30 días 30) ---');
    expect(copiedText).toContain('Cuota 1: $20.325.600');

    // Cero emojis en el texto copiado (R-042)
    expect(copiedText).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);

    // Notificación exitosa
    expect(handleActionSuccess).toHaveBeenCalledWith('Resumen copiado al portapapeles');
  });

  it('4. Click "Volver" -> onVolver; click "Editar Operación" -> onEditar', () => {
    const handleVolver = vi.fn();
    const handleEditar = vi.fn();

    render(
      <OperacionDetail
        operacion={mockOperacion}
        onVolver={handleVolver}
        onEditar={handleEditar}
        onCobroRegistrado={vi.fn()}
      />
    );

    const btnVolver = screen.getByRole('button', { name: /volver/i });
    fireEvent.click(btnVolver);
    expect(handleVolver).toHaveBeenCalledTimes(1);

    const btnEditar = screen.getByRole('button', { name: /editar operación/i });
    fireEvent.click(btnEditar);
    expect(handleEditar).toHaveBeenCalledTimes(1);
  });

  it('5. Si CONSIGNATARIA_EXTERNA: muestra consignatariaExterna + retencionesExternasMonto', () => {
    render(
      <OperacionDetail
        operacion={mockOperacionExterna}
        onVolver={vi.fn()}
        onEditar={vi.fn()}
        onCobroRegistrado={vi.fn()}
      />
    );

    expect(screen.getByText('Madelan S.A.')).toBeInTheDocument();
    expect(screen.getByText(/45\.000/)).toBeInTheDocument();
  });
});
