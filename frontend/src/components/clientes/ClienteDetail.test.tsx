import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClienteDetail } from './ClienteDetail';
import type { Cliente } from '../../types/cliente';
import * as client from '../../api/client';
import type { OperacionResponse } from '../../types/operacion';

vi.mock('../../api/client', async () => {
  const actual = await vi.importActual<typeof client>('../../api/client');
  return {
    ...actual,
    getOperaciones: vi.fn().mockResolvedValue([]),
  };
});

describe('ClienteDetail', () => {
  const mockClienteCompleto: Cliente = {
    id: 'c1',
    nombreRazonSocial: 'Estancia Don Pedro S.A.',
    telefono: '+54 9 341 555-4321',
    email: 'contacto@donpedro.com',
    direccion: 'Ruta Provincial 34, Km 72, Santa Fe',
    latitud: -32.95,
    longitud: -60.65,
    calificacion: 'A',
    tipoHacienda: 'Invernada / Engorde',
    formasPagoPreferidas: 'Cheque 30-60 días, Transferencia',
    observaciones: 'Cliente de confianza desde 2018. Cumple plazos.',
    fechaUltimaOperacion: '2026-02-20',
    fechaUltimoContacto: '2026-03-10',
  };

  const mockOperacion: OperacionResponse = {
    id: 'op-1',
    fechaCarga: '2026-11-04T12:00:00',
    fechaOperacion: '2026-11-04T10:00:00',
    modalidadCircuito: 'DIRECTO',
    consignatariaExterna: null,
    compradorId: 'c1',
    compradorNombre: 'Estancia Don Pedro S.A.',
    vendedorId: 'c2',
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
    cuotas: [],
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

  const mockOnVolver = vi.fn();
  const mockOnEditar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(client.getOperaciones).mockResolvedValue([]);
  });

  it('renders all client fields (name, phone, address, qualification, notes, etc.)', () => {
    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    // Name
    expect(screen.getByText('Estancia Don Pedro S.A.')).toBeInTheDocument();
    // Calificacion badge
    expect(screen.getByText(/Cat\. A|Calificación:? A/i)).toBeInTheDocument();
    // Phone
    expect(screen.getByText('+54 9 341 555-4321')).toBeInTheDocument();
    // Email
    expect(screen.getByText('contacto@donpedro.com')).toBeInTheDocument();
    // Address
    expect(screen.getByText('Ruta Provincial 34, Km 72, Santa Fe')).toBeInTheDocument();
    // Lat / Long
    expect(screen.getByText(/-32\.95/)).toBeInTheDocument();
    expect(screen.getByText(/-60\.65/)).toBeInTheDocument();
    // Tipo hacienda
    expect(screen.getByText('Invernada / Engorde')).toBeInTheDocument();
    // Formas de pago
    expect(screen.getByText('Cheque 30-60 días, Transferencia')).toBeInTheDocument();
    // Observaciones
    expect(screen.getByText('Cliente de confianza desde 2018. Cumple plazos.')).toBeInTheDocument();
    // Fechas
    expect(screen.getByText('20/2/2026')).toBeInTheDocument();
    expect(screen.getByText('10/3/2026')).toBeInTheDocument();
  });

  it('renders phone as a tel: link with digits and plus preserved', () => {
    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    const phoneLink = screen.getByRole('link', { name: '+54 9 341 555-4321' });
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink).toHaveAttribute('href', 'tel:+5493415554321');
  });

  it('renders "Sin registro" when dates are missing', () => {
    const clienteSinFechas: Cliente = {
      nombreRazonSocial: 'La Querencia',
      telefono: '123456',
      direccion: 'Ruta 5',
    };

    render(
      <ClienteDetail
        cliente={clienteSinFechas}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    const sinRegistroList = screen.getAllByText('Sin registro');
    expect(sinRegistroList.length).toBeGreaterThanOrEqual(2);
  });

  it('renders enabled buttons "Registrar compra" and "Registrar venta"', () => {
    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    const btnCompra = screen.getByRole('button', { name: /registrar compra/i });
    expect(btnCompra).toBeInTheDocument();
    expect(btnCompra).not.toBeDisabled();

    const btnVenta = screen.getByRole('button', { name: /registrar venta/i });
    expect(btnVenta).toBeInTheDocument();
    expect(btnVenta).not.toBeDisabled();
  });

  it('renders "Historial de Operaciones" section and empty state when no operations', async () => {
    vi.mocked(client.getOperaciones).mockResolvedValue([]);

    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    expect(
      screen.getByRole('heading', { level: 3, name: /historial de operaciones/i })
    ).toBeInTheDocument();
    expect(await screen.findByText(/sin operaciones registradas/i)).toBeInTheDocument();
  });

  it('testRegistrarCompraInvokesCallback: click "Registrar compra" invokes onRegistrarOperacion(id, "COMPRADOR")', () => {
    const mockOnRegistrar = vi.fn();
    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
        onRegistrarOperacion={mockOnRegistrar}
      />
    );

    const btnCompra = screen.getByRole('button', { name: /registrar compra/i });
    fireEvent.click(btnCompra);
    expect(mockOnRegistrar).toHaveBeenCalledTimes(1);
    expect(mockOnRegistrar).toHaveBeenCalledWith('c1', 'COMPRADOR');
  });

  it('testRegistrarVentaInvokesCallback: click "Registrar venta" invokes onRegistrarOperacion(id, "VENDEDOR")', () => {
    const mockOnRegistrar = vi.fn();
    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
        onRegistrarOperacion={mockOnRegistrar}
      />
    );

    const btnVenta = screen.getByRole('button', { name: /registrar venta/i });
    fireEvent.click(btnVenta);
    expect(mockOnRegistrar).toHaveBeenCalledTimes(1);
    expect(mockOnRegistrar).toHaveBeenCalledWith('c1', 'VENDEDOR');
  });

  it('testHistorialOperacionesCargaYRenderiza: loads operations via getOperaciones and renders table with type and state', async () => {
    vi.mocked(client.getOperaciones).mockResolvedValue([mockOperacion]);
    const mockOnSelectOp = vi.fn();

    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
        onSelectOperacion={mockOnSelectOp}
      />
    );

    expect(client.getOperaciones).toHaveBeenCalledWith({ clienteId: 'c1' });

    expect(await screen.findByText('Compra')).toBeInTheDocument();
    expect(screen.getByText('FAENA')).toBeInTheDocument();
    expect(screen.getByText('PENDIENTE')).toBeInTheDocument();

    const rowBtn = screen.getByRole('button', { name: /ver op-1/i });
    fireEvent.click(rowBtn);
    expect(mockOnSelectOp).toHaveBeenCalledWith('op-1');
  });

  it('renders error state and retries fetching operations on click "Reintentar"', async () => {
    vi.mocked(client.getOperaciones).mockRejectedValueOnce(new Error('Network error'));
    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(/error al cargar las operaciones/i);

    vi.mocked(client.getOperaciones).mockResolvedValueOnce([mockOperacion]);
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(await screen.findByText('Compra')).toBeInTheDocument();
  });

  it('invokes onVolver when clicking "Volver"', () => {
    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    const btnVolver = screen.getByRole('button', { name: /volver/i });
    fireEvent.click(btnVolver);
    expect(mockOnVolver).toHaveBeenCalledTimes(1);
  });

  it('invokes onEditar when clicking "Editar Cliente"', () => {
    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    const btnEditar = screen.getByRole('button', { name: /editar cliente/i });
    fireEvent.click(btnEditar);
    expect(mockOnEditar).toHaveBeenCalledTimes(1);
  });

  it('renders correctly with minimal client data (handles empty optional fields)', () => {
    const clienteMinimo: Cliente = {
      nombreRazonSocial: 'Juan Pérez',
      telefono: '11223344',
      direccion: 'Calle Falsa 123',
    };

    render(
      <ClienteDetail
        cliente={clienteMinimo}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('11223344')).toBeInTheDocument();
    expect(screen.getByText('Calle Falsa 123')).toBeInTheDocument();
  });
});
