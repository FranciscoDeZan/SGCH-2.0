import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OperacionForm } from './OperacionForm';
import * as client from '../../api/client';
import { ApiError } from '../../api/client';
import type { Cliente } from '../../types/cliente';
import type { OperacionResponse } from '../../types/operacion';

vi.mock('../../api/client', async () => {
  const actual = await vi.importActual<typeof client>('../../api/client');
  return {
    ...actual,
    createOperacion: vi.fn(),
    updateOperacion: vi.fn(),
  };
});

const mockClientes: Cliente[] = [
  {
    id: 'c-1',
    nombreRazonSocial: 'Estancia Don Pedro',
    telefono: '1122334455',
    direccion: 'Ruta 9 km 100',
    condicionFiscal: 'RESPONSABLE_INSCRIPTO',
  },
  {
    id: 'c-2',
    nombreRazonSocial: 'Cabaña La Tranquera',
    telefono: '1199887766',
    direccion: 'Ruta 8 km 50',
    condicionFiscal: 'MONOTRIBUTISTA',
  },
];

const mockOp: OperacionResponse = {
  id: 'op-101',
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
  condicionFiscalVendedor: 'MONOTRIBUTISTA',
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
  puntuacion: 'Muy buena',
  destino: 'Frigorífico',
  cantidadMachos: 30,
  cantidadHembras: 0,
  terneros: false,
  observaciones: 'Lote homogéneo',
  cuotas: [],
  calculo: {
    subtotalGanado: 18000000,
    comisionVendedorMonto: 360000,
    comisionCompradorMonto: 360000,
    ivaGanado: 0,
    ivaComisionVendedorMonto: 75600,
    ivaComisionCompradorMonto: 75600,
    montoExtraCobradoComprador: 0,
    saldoHaciendaEntrePartes: 18000000,
    saldoComisionFirma: 871200,
    totalACobrarComprador: 18435600,
    totalAPagarVendedor: 17564400,
  },
};

describe('OperacionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('valida campos obligatorios, circuito consignataria, regla de circuito PROPIA y rango de desbaste', async () => {
    const handleSuccess = vi.fn();
    const handleCancel = vi.fn();

    render(
      <OperacionForm
        mode="create"
        clientes={mockClientes}
        operaciones={[]}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );

    // Form starts with empty comprador, vendedor, kgNeto 0, precio 0, formaPago empty
    const btnSubmit = screen.getByRole('button', { name: /guardar operación/i });
    fireEvent.click(btnSubmit);

    expect(client.createOperacion).not.toHaveBeenCalled();
    expect(handleSuccess).not.toHaveBeenCalled();

    expect(screen.getByText(/el comprador es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/el vendedor es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/los kilos netos deben ser mayores a 0/i)).toBeInTheDocument();
    expect(screen.getByText(/el precio por kilo debe ser mayor a 0/i)).toBeInTheDocument();
    expect(screen.getByText(/la forma de pago es obligatoria/i)).toBeInTheDocument();

    // If circuit is CONSIGNATARIA_EXTERNA, consignatariaExterna is mandatory
    fireEvent.change(screen.getByRole('combobox', { name: 'Circuito' }), {
      target: { value: 'CONSIGNATARIA_EXTERNA' },
    });
    fireEvent.click(btnSubmit);
    expect(
      screen.getByText(/el nombre de la consignataria externa es obligatorio/i)
    ).toBeInTheDocument();

    // If circuit is PROPIA, at least one commission must be 0
    fireEvent.change(screen.getByRole('combobox', { name: 'Circuito' }), {
      target: { value: 'PROPIA' },
    });
    fireEvent.click(btnSubmit);
    expect(
      screen.getByText(/en operaciones propias, al menos una comisión debe ser 0%/i)
    ).toBeInTheDocument();

    // Desbaste outside [-8, 15] is rejected
    fireEvent.change(screen.getByLabelText(/porcentaje de desbaste/i), {
      target: { value: '25' },
    });
    fireEvent.click(btnSubmit);
    expect(
      screen.getByText(/el desbaste debe estar entre -8% y \+15%/i)
    ).toBeInTheDocument();
  });

  it('actualiza en vivo el panel Vista Previa de Liquidación al ingresar kilos, precio y vendedor', async () => {
    render(
      <OperacionForm
        mode="create"
        clientes={mockClientes}
        operaciones={[]}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Select vendedor c-1 (RESPONSABLE_INSCRIPTO)
    fireEvent.change(screen.getByRole('combobox', { name: 'Vendedor' }), {
      target: { value: 'c-1' },
    });

    // Badge of fiscal condition appears
    expect(screen.getByText(/responsable inscripto/i)).toBeInTheDocument();

    // Set kgNeto = 30000, precioKgFacturado = 5000
    fireEvent.change(screen.getByLabelText(/kilos netos/i), {
      target: { value: '30000' },
    });
    fireEvent.change(screen.getByLabelText(/precio por kilo facturado/i), {
      target: { value: '5000' },
    });

    // Preview panel shows Anexo II §6.1 numbers:
    // Subtotal: 150.000.000, IVA Ganado: 15.750.000, Saldo Comision Firma: 7.260.000
    const previewPanel = screen.getByLabelText(/vista previa de liquidación/i);
    expect(previewPanel).toBeInTheDocument();
    expect(previewPanel).toHaveTextContent(/150\.000\.000/);
    expect(previewPanel).toHaveTextContent(/15\.750\.000/);
    expect(previewPanel).toHaveTextContent(/7\.260\.000/);

    // Switch seller to c-2 (MONOTRIBUTISTA)
    fireEvent.change(screen.getByRole('combobox', { name: 'Vendedor' }), {
      target: { value: 'c-2' },
    });
    expect(screen.getByText(/monotributista/i)).toBeInTheDocument();

    // IVA Ganado should now be 0
    expect(previewPanel).toHaveTextContent(/iva ganado.*\$0/i);
  });

  it('autocompleta el formulario al usar Copiar de operación anterior y limpia errores previos', async () => {
    render(
      <OperacionForm
        mode="create"
        clientes={mockClientes}
        operaciones={[mockOp]}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Trigger validation errors first
    fireEvent.click(screen.getByRole('button', { name: /guardar operación/i }));
    expect(screen.getByText(/el comprador es obligatorio/i)).toBeInTheDocument();

    const selectCopiar = screen.getByRole('combobox', { name: /copiar de operación anterior/i });
    fireEvent.change(selectCopiar, { target: { value: 'op-101' } });

    const btnCopiar = screen.getByRole('button', { name: /copiar datos/i });
    fireEvent.click(btnCopiar);

    // Verify errors cleared
    expect(screen.queryByText(/el comprador es obligatorio/i)).not.toBeInTheDocument();

    // Verify fields populated
    expect(screen.getByRole('combobox', { name: 'Comprador' })).toHaveValue('c-1');
    expect(screen.getByRole('combobox', { name: 'Vendedor' })).toHaveValue('c-2');
    expect(screen.getByLabelText(/kilos netos/i)).toHaveValue(15000);
    expect(screen.getByLabelText(/precio por kilo facturado/i)).toHaveValue(1200);
    expect(screen.getByLabelText(/forma de pago/i)).toHaveValue('30 días');
    expect(screen.getByLabelText(/subcategoría/i)).toHaveValue('Novillos');

    // fechaOperacion should NOT be empty (remains today or valid date)
    const fechaInput = screen.getByLabelText(/fecha de operación/i);
    expect(fechaInput).toHaveValue(new Date().toISOString().slice(0, 10));
  });

  it('autocompleta kgNeto al ingresar kgOrigenBruto y porcentajeDesbaste', async () => {
    render(
      <OperacionForm
        mode="create"
        clientes={mockClientes}
        operaciones={[]}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/kilos origen bruto/i), {
      target: { value: '10000' },
    });
    fireEvent.change(screen.getByLabelText(/porcentaje de desbaste/i), {
      target: { value: '5' },
    });

    // 10000 * (1 - 0.05) = 9500
    expect(screen.getByLabelText(/kilos netos/i)).toHaveValue(9500);
  });

  it('en modo alta (create), envía el payload válido con formato LocalDateTime e invoca onSuccess', async () => {
    const handleSuccess = vi.fn();
    vi.mocked(client.createOperacion).mockResolvedValue(mockOp);

    render(
      <OperacionForm
        mode="create"
        clientes={mockClientes}
        operaciones={[]}
        onSuccess={handleSuccess}
        onCancel={vi.fn()}
      />
    );

    fireEvent.change(screen.getByRole('combobox', { name: 'Comprador' }), { target: { value: 'c-1' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Vendedor' }), { target: { value: 'c-2' } });
    fireEvent.change(screen.getByLabelText(/kilos netos/i), { target: { value: '10000' } });
    fireEvent.change(screen.getByLabelText(/precio por kilo facturado/i), { target: { value: '1500' } });
    fireEvent.change(screen.getByLabelText(/forma de pago/i), { target: { value: 'Contado' } });

    const btnSubmit = screen.getByRole('button', { name: /guardar operación/i });
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(client.createOperacion).toHaveBeenCalledTimes(1);
    });

    const payload = vi.mocked(client.createOperacion).mock.calls[0][0];
    expect(payload).not.toHaveProperty('estadoLiquidacion');
    expect(payload.compradorId).toBe('c-1');
    expect(payload.vendedorId).toBe('c-2');
    expect(payload.kgNeto).toBe(10000);
    expect(payload.precioKgFacturado).toBe(1500);
    expect(payload.formaPago).toBe('Contado');
    // Verifica compatibilidad con LocalDateTime de Spring Boot (YYYY-MM-DDTHH:mm:ss)
    expect(payload.fechaOperacion).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);

    expect(handleSuccess).toHaveBeenCalledWith(mockOp);
  });

  it('en modo edición (edit), precarga initialOperacion, omite estadoLiquidacion y envía PUT con fecha LocalDateTime', async () => {
    const handleSuccess = vi.fn();
    const updatedOp = { ...mockOp, formaPago: '60 días' };
    vi.mocked(client.updateOperacion).mockResolvedValue(updatedOp);

    render(
      <OperacionForm
        mode="edit"
        initialOperacion={mockOp}
        clientes={mockClientes}
        operaciones={[]}
        onSuccess={handleSuccess}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/kilos netos/i)).toHaveValue(15000);
    expect(screen.getByLabelText(/forma de pago/i)).toHaveValue('30 días');

    fireEvent.change(screen.getByLabelText(/forma de pago/i), {
      target: { value: '60 días' },
    });

    const btnSubmit = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(client.updateOperacion).toHaveBeenCalledTimes(1);
    });

    const [id, payload] = vi.mocked(client.updateOperacion).mock.calls[0];
    expect(id).toBe('op-101');
    expect(payload).not.toHaveProperty('estadoLiquidacion');
    expect(payload.formaPago).toBe('60 días');
    expect(payload.kgNeto).toBe(15000);
    expect(payload.fechaOperacion).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);

    expect(handleSuccess).toHaveBeenCalledWith(updatedOp);
  });

  it('aplica guard contra doble-submit (R-032)', async () => {
    let resolvePromise: (val: OperacionResponse) => void;
    const pendingPromise = new Promise<OperacionResponse>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(client.createOperacion).mockReturnValue(pendingPromise);

    render(
      <OperacionForm
        mode="create"
        clientes={mockClientes}
        operaciones={[]}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    fireEvent.change(screen.getByRole('combobox', { name: 'Comprador' }), { target: { value: 'c-1' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Vendedor' }), { target: { value: 'c-2' } });
    fireEvent.change(screen.getByLabelText(/kilos netos/i), { target: { value: '10000' } });
    fireEvent.change(screen.getByLabelText(/precio por kilo facturado/i), { target: { value: '1500' } });
    fireEvent.change(screen.getByLabelText(/forma de pago/i), { target: { value: 'Contado' } });

    const btnSubmit = screen.getByRole('button', { name: /guardar operación/i });
    fireEvent.click(btnSubmit);
    fireEvent.click(btnSubmit);
    fireEvent.click(btnSubmit);

    expect(screen.getByRole('button', { name: /guardando\.\.\./i })).toBeDisabled();
    expect(client.createOperacion).toHaveBeenCalledTimes(1);

    // Resolve promise to clean up
    resolvePromise!(mockOp);
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /guardando\.\.\./i })).not.toBeInTheDocument();
    });
  });

  it('muestra errores por campo (data.errores) y banner general (data.detail) con botón Reintentar ante ApiError 400/409', async () => {
    vi.mocked(client.createOperacion)
      .mockRejectedValueOnce(
        new ApiError(400, 'Bad Request', {
          detail: 'Error de validación fiscal.',
          errores: {
            kgNeto: 'Kilos inválidos',
          },
        })
      )
      .mockResolvedValueOnce(mockOp);

    render(
      <OperacionForm
        mode="create"
        clientes={mockClientes}
        operaciones={[]}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    fireEvent.change(screen.getByRole('combobox', { name: 'Comprador' }), { target: { value: 'c-1' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Vendedor' }), { target: { value: 'c-2' } });
    fireEvent.change(screen.getByLabelText(/kilos netos/i), { target: { value: '10000' } });
    fireEvent.change(screen.getByLabelText(/precio por kilo facturado/i), { target: { value: '1500' } });
    fireEvent.change(screen.getByLabelText(/forma de pago/i), { target: { value: 'Contado' } });

    const btnSubmit = screen.getByRole('button', { name: /guardar operación/i });
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/error de validación fiscal/i);
      expect(screen.getByText('Kilos inválidos')).toBeInTheDocument();
    });

    const btnReintentar = screen.getByRole('button', { name: /reintentar/i });
    fireEvent.click(btnReintentar);

    await waitFor(() => {
      expect(client.createOperacion).toHaveBeenCalledTimes(2);
    });
  });

  it('hidrata el formulario correctamente desde initialDraft para integraciones con Copilot o Detalle', () => {
    render(
      <OperacionForm
        mode="create"
        initialDraft={{
          compradorId: 'c-1',
          vendedorId: 'c-2',
          subcategoria: 'Terneras',
          kgNeto: 8500,
          precioKgFacturado: 1800,
          formaPago: 'Contado inmediato',
        }}
        clientes={mockClientes}
        operaciones={[]}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole('combobox', { name: 'Comprador' })).toHaveValue('c-1');
    expect(screen.getByRole('combobox', { name: 'Vendedor' })).toHaveValue('c-2');
    expect(screen.getByLabelText(/subcategoría/i)).toHaveValue('Terneras');
    expect(screen.getByLabelText(/kilos netos/i)).toHaveValue(8500);
    expect(screen.getByLabelText(/precio por kilo facturado/i)).toHaveValue(1800);
    expect(screen.getByLabelText(/forma de pago/i)).toHaveValue('Contado inmediato');
  });
});
