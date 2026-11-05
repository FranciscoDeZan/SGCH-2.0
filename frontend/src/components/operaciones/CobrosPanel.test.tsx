import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CobrosPanel } from './CobrosPanel';
import * as client from '../../api/client';
import { ApiError } from '../../api/client';
import type { OperacionResponse } from '../../types/operacion';
import type { CobroResponse } from '../../types/cobro';

vi.mock('../../api/client', async () => {
  const actual = await vi.importActual<typeof client>('../../api/client');
  return {
    ...actual,
    getCobrosByOperacion: vi.fn(),
    createCobro: vi.fn(),
  };
});

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
  kgOrigenBruto: null,
  porcentajeDesbaste: null,
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

const mockCobroExistente: CobroResponse = {
  id: 'cob-001',
  operacionId: 'op-123',
  cuotaId: 'cuota-1',
  cuotaNumero: 1,
  clienteId: 'c-1',
  clienteNombre: 'Estancia Don Pedro',
  tipoMovimiento: 'COBRO_COMPRADOR',
  fechaMovimiento: '2026-11-05',
  monto: 5000000,
  medioPago: 'TRANSFERENCIA',
  documentado: true,
  observaciones: 'Pago parcial cuota 1',
};

describe('CobrosPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Carga y lista cobros existentes vía getCobrosByOperacion', async () => {
    vi.mocked(client.getCobrosByOperacion).mockResolvedValue([mockCobroExistente]);

    render(
      <CobrosPanel
        operacion={mockOperacion}
        onCobroRegistrado={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(client.getCobrosByOperacion).toHaveBeenCalledWith('op-123');
    });

    expect(await screen.findByText('Pago parcial cuota 1')).toBeInTheDocument();
    expect(screen.getByText(/5\.000\.000/)).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('TRANSFERENCIA')).toBeInTheDocument();
  });

  it('2. Preselecciona clienteId según tipoMovimiento y permite asociar cuota', async () => {
    vi.mocked(client.getCobrosByOperacion).mockResolvedValue([]);

    render(
      <CobrosPanel
        operacion={mockOperacion}
        onCobroRegistrado={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(client.getCobrosByOperacion).toHaveBeenCalled();
    });

    // Default tipoMovimiento: COBRO_COMPRADOR -> clienteId preseleccionado es compradorId (c-1)
    const selectTipo = screen.getByRole('combobox', { name: /tipo de movimiento/i });
    expect(selectTipo).toHaveValue('COBRO_COMPRADOR');
    expect(screen.getByText(/estancia don pedro/i)).toBeInTheDocument();

    // Cambiar a PAGO_VENDEDOR -> cambia automáticamente a vendedorId (c-2)
    fireEvent.change(selectTipo, { target: { value: 'PAGO_VENDEDOR' } });
    expect(screen.getByText(/cabaña la tranquera/i)).toBeInTheDocument();

    // Permite asociar cuota
    const selectCuota = screen.getByRole('combobox', { name: /asociar a cuota/i });
    fireEvent.change(selectCuota, { target: { value: 'cuota-1' } });
    expect(selectCuota).toHaveValue('cuota-1');
  });

  it('3. Envía createCobro + refresca + onCobroRegistrado + onActionSuccess', async () => {
    vi.mocked(client.getCobrosByOperacion).mockResolvedValue([]);
    vi.mocked(client.createCobro).mockResolvedValue({
      id: 'cob-new',
      operacionId: 'op-123',
      cuotaId: 'cuota-1',
      cuotaNumero: 1,
      clienteId: 'c-1',
      clienteNombre: 'Estancia Don Pedro',
      tipoMovimiento: 'COBRO_COMPRADOR',
      fechaMovimiento: '2026-11-05',
      monto: 2500000,
      medioPago: 'ECHEQ',
      documentado: true,
      observaciones: 'Pago con echeq',
    });

    const handleCobroRegistrado = vi.fn();
    const handleActionSuccess = vi.fn();

    render(
      <CobrosPanel
        operacion={mockOperacion}
        onCobroRegistrado={handleCobroRegistrado}
        onActionSuccess={handleActionSuccess}
      />
    );

    await waitFor(() => {
      expect(client.getCobrosByOperacion).toHaveBeenCalledTimes(1);
    });

    fireEvent.change(screen.getByRole('combobox', { name: /asociar a cuota/i }), {
      target: { value: 'cuota-1' },
    });
    fireEvent.change(screen.getByLabelText(/monto/i), {
      target: { value: '2500000' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: /medio de pago/i }), {
      target: { value: 'ECHEQ' },
    });
    fireEvent.change(screen.getByLabelText(/observaciones/i), {
      target: { value: 'Pago con echeq' },
    });

    const btnSubmit = screen.getByRole('button', { name: /registrar cobro|registrar movimiento/i });
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(client.createCobro).toHaveBeenCalledTimes(1);
    });

    const payload = vi.mocked(client.createCobro).mock.calls[0][0];
    expect(payload.operacionId).toBe('op-123');
    expect(payload.cuotaId).toBe('cuota-1');
    expect(payload.clienteId).toBe('c-1');
    expect(payload.monto).toBe(2500000);
    expect(payload.medioPago).toBe('ECHEQ');

    expect(client.getCobrosByOperacion).toHaveBeenCalledTimes(2);
    expect(handleCobroRegistrado).toHaveBeenCalledTimes(1);
    expect(handleActionSuccess).toHaveBeenCalledWith(expect.stringMatching(/cobro registrado/i));
  });

  it('4. Guard doble-submit R-032', async () => {
    vi.mocked(client.getCobrosByOperacion).mockResolvedValue([]);
    let resolvePromise: (val: CobroResponse) => void;
    const pendingPromise = new Promise<CobroResponse>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(client.createCobro).mockReturnValue(pendingPromise);

    render(
      <CobrosPanel
        operacion={mockOperacion}
        onCobroRegistrado={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(client.getCobrosByOperacion).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText(/monto/i), {
      target: { value: '100000' },
    });

    const btnSubmit = screen.getByRole('button', { name: /registrar cobro|registrar movimiento/i });
    fireEvent.click(btnSubmit);
    fireEvent.click(btnSubmit);
    fireEvent.click(btnSubmit);

    expect(screen.getByRole('button', { name: /guardando\.\.\./i })).toBeDisabled();
    expect(client.createCobro).toHaveBeenCalledTimes(1);

    resolvePromise!(mockCobroExistente);
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /guardando\.\.\./i })).not.toBeInTheDocument();
    });
  });

  it('5. Errores ApiError 400/404: banner role="alert"', async () => {
    vi.mocked(client.getCobrosByOperacion).mockResolvedValue([]);
    vi.mocked(client.createCobro).mockRejectedValueOnce(
      new ApiError(400, 'Bad Request', {
        detail: 'El monto supera el saldo pendiente de la cuota.',
        errores: { monto: 'Monto excesivo' },
      })
    );

    render(
      <CobrosPanel
        operacion={mockOperacion}
        onCobroRegistrado={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(client.getCobrosByOperacion).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText(/monto/i), {
      target: { value: '99999999' },
    });

    const btnSubmit = screen.getByRole('button', { name: /registrar cobro|registrar movimiento/i });
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /el monto supera el saldo pendiente de la cuota/i
      );
      expect(screen.getByText('Monto excesivo')).toBeInTheDocument();
    });
  });
});
