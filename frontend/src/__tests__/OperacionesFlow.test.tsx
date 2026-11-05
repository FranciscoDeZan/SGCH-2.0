import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';
import type { Cliente } from '../types/cliente';
import type { OperacionResponse } from '../types/operacion';
import type { CobroResponse } from '../types/cobro';

// Mock data
const mockClientes: Cliente[] = [
  {
    id: 'c1',
    nombreRazonSocial: 'Estancia Don Pedro',
    cuit: '20301112224',
    condicionFiscal: 'RESPONSABLE_INSCRIPTO',
    telefono: '3415551111',
    direccion: 'Ruta 34 Km 10',
  },
  {
    id: 'c2',
    nombreRazonSocial: 'Cabaña La Tranquera',
    cuit: '30708889991',
    condicionFiscal: 'RESPONSABLE_INSCRIPTO',
    telefono: '3415552222',
    direccion: 'Ruta 9 Km 50',
  },
];

const mockOperacionPendiente: OperacionResponse = {
  id: 'op-100',
  fechaCarga: '2026-11-05T12:00:00',
  fechaOperacion: '2026-11-05T10:00:00',
  modalidadCircuito: 'DIRECTO',
  consignatariaExterna: null,
  compradorId: 'c1',
  compradorNombre: 'Estancia Don Pedro',
  vendedorId: 'c2',
  vendedorNombre: 'Cabaña La Tranquera',
  categoria: 'FAENA',
  subcategoria: 'Novillos',
  kgNeto: 30000,
  kgOrigenBruto: null,
  porcentajeDesbaste: null,
  kgLlegadaReferencia: null,
  precioKgFacturado: 5000,
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
  cantidadMachos: 60,
  cantidadHembras: 0,
  terneros: false,
  observaciones: 'Lote parejo faena',
  cuotas: [
    {
      id: 'cuota-1',
      numeroCuota: 1,
      fechaBasePlazo: 'CARGA',
      diasPlazoComprador: 30,
      diasDescalceVendedor: 0,
      fechaVencimientoComprador: '2026-12-05',
      fechaVencimientoVendedor: '2026-12-05',
      montoCuota: 165750000,
      estadoCobro: 'PENDIENTE',
      estadoPago: 'PENDIENTE',
    },
  ],
  calculo: {
    subtotalGanado: 150000000,
    comisionVendedorMonto: 3000000,
    comisionCompradorMonto: 3000000,
    ivaGanado: 15750000,
    ivaComisionVendedorMonto: 630000,
    ivaComisionCompradorMonto: 630000,
    montoExtraCobradoComprador: 0,
    saldoHaciendaEntrePartes: 165750000,
    saldoComisionFirma: 7260000,
    totalACobrarComprador: 169380000,
    totalAPagarVendedor: 162120000,
  },
};

const mockOperacionParcial: OperacionResponse = {
  ...mockOperacionPendiente,
  estadoLiquidacion: 'PARCIALMENTE_PAGADO',
  cuotas: [
    {
      ...mockOperacionPendiente.cuotas[0],
      estadoCobro: 'COBRADO',
      estadoPago: 'PENDIENTE',
    },
  ],
};

const mockOperacionLiquidada: OperacionResponse = {
  ...mockOperacionPendiente,
  estadoLiquidacion: 'LIQUIDADO',
  cuotas: [
    {
      ...mockOperacionPendiente.cuotas[0],
      estadoCobro: 'COBRADO',
      estadoPago: 'PAGADO',
    },
  ],
};

const createJsonResponse = (data: unknown, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

describe('OperacionesFlow — Tests E2E de Fase 2.B', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const setupDefaultFetchMock = (
    operaciones: OperacionResponse[] = [],
    cobros: CobroResponse[] = []
  ) => {
    mockFetch.mockImplementation(async (url: string, options?: RequestInit) => {
      const urlStr = String(url);
      const method = options?.method || 'GET';

      // 1. Clientes
      if (urlStr.includes('/clientes') && method === 'GET') {
        return createJsonResponse(mockClientes);
      }

      // 2. Cobros por operacion
      if (urlStr.includes('/cobros') && method === 'GET') {
        return createJsonResponse(cobros);
      }

      // 3. Crear cobro
      if (urlStr.includes('/cobros') && method === 'POST') {
        const body = JSON.parse(options?.body as string);
        const newCobro: CobroResponse = {
          id: `cobro-${Date.now()}`,
          operacionId: body.operacionId,
          tipoMovimiento: body.tipoMovimiento,
          cuotaId: body.cuotaId ?? null,
          cuotaNumero: null,
          clienteId: body.clienteId,
          clienteNombre: body.tipoMovimiento === 'PAGO_VENDEDOR' ? 'Cabaña La Tranquera' : 'Estancia Don Pedro',
          fechaMovimiento: body.fechaMovimiento,
          monto: Number(body.monto),
          medioPago: body.medioPago,
          documentado: body.documentado ?? true,
          observaciones: body.observaciones ?? '',
        };
        cobros.push(newCobro);
        return createJsonResponse(newCobro, 201);
      }

      // 4. Operaciones GET by id
      if (urlStr.includes('/operaciones/op-100') && method === 'GET') {
        let currentOp = mockOperacionPendiente;
        if (cobros.length >= 2) {
          currentOp = mockOperacionLiquidada;
        } else if (cobros.length === 1) {
          currentOp = mockOperacionParcial;
        }
        return createJsonResponse(currentOp);
      }

      // 5. Operaciones POST (crear)
      if (urlStr.includes('/operaciones') && method === 'POST') {
        operaciones.push(mockOperacionPendiente);
        return createJsonResponse(mockOperacionPendiente, 201);
      }

      // 6. Operaciones PUT (editar)
      if (urlStr.includes('/operaciones/op-100') && method === 'PUT') {
        const body = JSON.parse(options?.body as string);
        const updatedOp: OperacionResponse = {
          ...mockOperacionPendiente,
          ...body,
          calculo: {
            ...mockOperacionPendiente.calculo,
            subtotalGanado: body.kgNeto * body.precioKgFacturado,
          },
        };
        return createJsonResponse(updatedOp);
      }

      // 7. Operaciones GET list
      if (urlStr.includes('/operaciones') && method === 'GET') {
        return createJsonResponse(operaciones);
      }

      return createJsonResponse([]);
    });
  };

  const navigateToOperaciones = async () => {
    const btnOperaciones = screen.getByRole('button', { name: /módulo operaciones/i });
    fireEvent.click(btnOperaciones);
    expect(await screen.findByRole('heading', { level: 2, name: /operaciones/i })).toBeInTheDocument();
  };

  // Test 1 — Flujo E2E completo de liquidación
  it('1. Flujo E2E completo de liquidación: alta -> preview -> detalle -> cobro hacienda y comision -> LIQUIDADO', async () => {
    const operacionesList: OperacionResponse[] = [];
    const cobrosList: CobroResponse[] = [];
    setupDefaultFetchMock(operacionesList, cobrosList);

    render(<App />);

    // 1. Navegar a Operaciones
    await navigateToOperaciones();

    // 2. Click "Nueva Operación"
    const btnNueva = await screen.findByRole('button', { name: /^nueva operación$/i });
    fireEvent.click(btnNueva);

    expect(await screen.findByRole('heading', { level: 2, name: /nueva operación/i })).toBeInTheDocument();

    // 3. Llenar formulario
    fireEvent.change(screen.getByRole('combobox', { name: 'Comprador' }), { target: { value: 'c1' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Vendedor' }), { target: { value: 'c2' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Categoría' }), { target: { value: 'FAENA' } });
    fireEvent.change(screen.getByLabelText(/kilos netos/i), { target: { value: '30000' } });
    fireEvent.change(screen.getByLabelText(/precio por kilo facturado/i), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText(/modalidad del precio/i), { target: { value: 'NETO' } });
    fireEvent.change(screen.getByLabelText(/porcentaje de comisión al vendedor/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/porcentaje de comisión al comprador/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/forma de pago/i), { target: { value: '30 días' } });

    // 4. Verificar Preview en vivo de 3 capas
    const previewPanel = screen.getByLabelText(/vista previa de liquidación/i);
    expect(previewPanel).toHaveTextContent(/165\.750\.000/);
    expect(previewPanel).toHaveTextContent(/7\.260\.000/);

    // 5. Guardar operación
    fireEvent.click(screen.getByRole('button', { name: /guardar operación/i }));

    // 6. Verifica mensaje de éxito y retorno a lista
    expect(await screen.findByText('Operación guardada exitosamente')).toBeInTheDocument();

    // 7. Navegar a detalle de la operacion creada
    const btnVer = await screen.findByRole('button', { name: /ver detalle/i });
    fireEvent.click(btnVer);

    expect(await screen.findByText(/detalle de operación op-100/i)).toBeInTheDocument();
    expect(screen.getAllByText('PENDIENTE').length).toBeGreaterThan(0);

    // 7.1 Probar acción de copiar resumen al portapapeles
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    const btnCopiar = screen.getByRole('button', { name: /copiar resumen/i });
    fireEvent.click(btnCopiar);
    expect(await screen.findByText('Resumen copiado al portapapeles')).toBeInTheDocument();

    // 8. Registrar Cobro de Hacienda ($165.750.000)
    fireEvent.change(screen.getByLabelText(/^monto/i), { target: { value: '165750000' } });
    fireEvent.click(screen.getByRole('button', { name: /registrar cobro/i }));

    expect(await screen.findByText('Cobro registrado exitosamente')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText('PARCIALMENTE_PAGADO').length).toBeGreaterThan(0);
    });

    // 9. Registrar Cobro de Comisión ($7.260.000)
    fireEvent.change(screen.getByLabelText(/tipo de movimiento/i), { target: { value: 'COBRO_COMISION' } });
    fireEvent.change(screen.getByLabelText(/^monto/i), { target: { value: '7260000' } });
    fireEvent.click(screen.getByRole('button', { name: /registrar cobro/i }));

    expect(await screen.findByText('Cobro registrado exitosamente')).toBeInTheDocument();

    // 10. Con ambos cobros registrados, la operacion pasa a estado LIQUIDADO
    await waitFor(() => {
      expect(screen.getAllByText('LIQUIDADO').length).toBeGreaterThan(0);
    });
  });

  // Test 2 — Flujo de edición y recálculo
  it('2. Flujo de edición y recálculo: lista -> detalle -> editar -> modificar precio -> preview recalculado -> guardar', async () => {
    setupDefaultFetchMock([mockOperacionPendiente], []);

    render(<App />);
    await navigateToOperaciones();

    // Abrir detalle
    const btnVer = await screen.findByRole('button', { name: /ver detalle/i });
    fireEvent.click(btnVer);

    expect(await screen.findByText(/detalle de operación op-100/i)).toBeInTheDocument();

    // Entrar a edición
    fireEvent.click(screen.getByRole('button', { name: /editar operación/i }));
    expect(await screen.findByRole('heading', { level: 2, name: /editar operación/i })).toBeInTheDocument();

    // Modificar precio
    fireEvent.change(screen.getByLabelText(/precio por kilo facturado/i), { target: { value: '6000' } });

    // Preview recalculado (30000 kg @ $6000 = $180.000.000 + 10.5% IVA = $198.900.000)
    const previewPanel = screen.getByLabelText(/vista previa de liquidación/i);
    expect(previewPanel).toHaveTextContent(/198\.900\.000/);

    // Guardar cambios
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));
    expect(await screen.findByText('Cambios guardados exitosamente')).toBeInTheDocument();

    // Regresa a OperacionDetail mostrando el detalle actualizado
    expect(await screen.findByText(/detalle de operación op-100/i)).toBeInTheDocument();
    expect(screen.getByText(/\$180\.000\.000/)).toBeInTheDocument();
  });

  // Test 3 — Flujo móvil con dictado -> alta
  it('3. Flujo móvil con dictado -> alta: dictar en OperacionesMobileCopilot -> prellenar -> OperacionForm precargado', async () => {
    setupDefaultFetchMock([], []);

    render(<App />);
    await navigateToOperaciones();

    // Simular dictado en el textarea móvil
    const textarea = screen.getByLabelText(/texto de la operación/i);
    fireEvent.change(textarea, { target: { value: '50 novillos faena 15000 kilos a 5000' } });

    // Click "Prellenar Operación"
    const btnPrellenar = screen.getByRole('button', { name: /prellenar operación/i });
    fireEvent.click(btnPrellenar);

    // OperacionForm se abre en modo create
    expect(await screen.findByRole('heading', { level: 2, name: /nueva operación/i })).toBeInTheDocument();

    // Verificar campos precargados
    const selectCategoria = screen.getByRole('combobox', { name: 'Categoría' }) as HTMLSelectElement;
    expect(selectCategoria.value).toBe('FAENA');

    const inputKg = screen.getByLabelText(/kilos netos/i) as HTMLInputElement;
    expect(inputKg.value).toBe('15000');

    const inputPrecio = screen.getByLabelText(/precio por kilo facturado/i) as HTMLInputElement;
    expect(inputPrecio.value).toBe('5000');

    const inputObs = screen.getByLabelText(/observaciones/i) as HTMLTextAreaElement;
    expect(inputObs.value).toBe('50 novillos faena 15000 kilos a 5000');
  });

  // Test 4 — Navegación cross-page desde ClienteDetail a OperacionForm
  it('4. Navegación cross-page desde ClienteDetail a OperacionForm: click "Registrar compra" abre Operaciones en alta con comprador preseleccionado', async () => {
    setupDefaultFetchMock([], []);

    render(<App />);

    // Esperar a que la lista de clientes cargue (en Clientes)
    expect(await screen.findByRole('heading', { level: 3, name: 'Estancia Don Pedro' })).toBeInTheDocument();

    // Ver detalle del cliente
    const btnVerDetalle = screen.getAllByRole('button', { name: /ver detalle/i })[0];
    fireEvent.click(btnVerDetalle);

    // En detalle, click "Registrar compra"
    const btnCompra = await screen.findByRole('button', { name: /registrar compra/i });
    fireEvent.click(btnCompra);

    // Debe saltar a Operaciones en vista alta
    expect(await screen.findByRole('heading', { level: 2, name: /nueva operación/i })).toBeInTheDocument();

    const selectComprador = screen.getByRole('combobox', { name: 'Comprador' }) as HTMLSelectElement;
    expect(selectComprador.value).toBe('c1');
  });

  // Test 5 — Auditoría de accesibilidad y controles de teclado
  it('5. Auditoría de accesibilidad: roles semánticos, labels explícitos en form y ausencia total de emojis en UI', async () => {
    setupDefaultFetchMock([mockOperacionPendiente], []);

    const { container } = render(<App />);
    await navigateToOperaciones();

    // 1. Roles semánticos y filtros en OperacionList
    expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/filtrar por circuito/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filtrar por estado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filtrar por cliente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha desde/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha hasta/i)).toBeInTheDocument();

    // 2. Navegar al formulario de alta
    const btnNueva = await screen.findByRole('button', { name: /^nueva operación$/i });
    fireEvent.click(btnNueva);

    // 3. Todos los inputs interactivos obligatorios tienen label accesible
    expect(screen.getByRole('combobox', { name: 'Circuito' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Comprador' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Vendedor' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toBeInTheDocument();
    expect(screen.getByLabelText(/kilos netos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/precio por kilo facturado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/modalidad del precio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/forma de pago/i)).toBeInTheDocument();

    // 4. Panel lateral accesible
    expect(screen.getByLabelText(/vista previa de liquidación/i)).toBeInTheDocument();

    // 5. Foco por teclado en inputs
    const inputKg = screen.getByLabelText(/kilos netos/i);
    inputKg.focus();
    expect(inputKg).toHaveFocus();

    // 6. Cero emojis en todo el texto renderizado en el DOM (R-042 con regex Unicode nativa)
    const textContent = container.textContent || '';
    const emojiRegex = /\p{Extended_Pictographic}/u;
    expect(emojiRegex.test(textContent)).toBe(false);
  });
});
