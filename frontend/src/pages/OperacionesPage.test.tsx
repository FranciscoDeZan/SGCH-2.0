import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OperacionesPage } from './OperacionesPage';
import App from '../App';
import * as client from '../api/client';
import type { OperacionResponse } from '../types/operacion';

vi.mock('../api/client', async () => {
  const actual = await vi.importActual<typeof client>('../api/client');
  return {
    ...actual,
    getOperaciones: vi.fn().mockResolvedValue([]),
    getClientes: vi.fn().mockResolvedValue([]),
    apiFetch: vi.fn().mockResolvedValue([]),
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

describe('OperacionesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(client.getOperaciones).mockResolvedValue([]);
    vi.mocked(client.getClientes).mockResolvedValue([]);
  });

  it('invoca getOperaciones y getClientes al montar en vista "lista"', async () => {
    render(<OperacionesPage initialVista="lista" />);

    await waitFor(() => {
      expect(client.getOperaciones).toHaveBeenCalledTimes(1);
      expect(client.getClientes).toHaveBeenCalledTimes(1);
    });
  });

  it('renderiza EmptyOperacionFallback defensivo si initialVista="detalle" con initialSelectedOperacion={null} y vuelve a "lista" al tocar "Volver"', async () => {
    render(<OperacionesPage initialVista="detalle" initialSelectedOperacion={null} />);

    expect(
      screen.getByText('No hay ninguna operación seleccionada. Volvé a la lista.')
    ).toBeInTheDocument();

    const btnVolver = screen.getByRole('button', { name: /volver/i });
    fireEvent.click(btnVolver);

    expect(
      screen.queryByText('No hay ninguna operación seleccionada. Volvé a la lista.')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /operaciones/i })).toBeInTheDocument();
    });
  });

  it('re-consulta getOperaciones con los parametros de filtro cuando el usuario filtra por circuito o estado', async () => {
    render(<OperacionesPage initialVista="lista" />);

    await waitFor(() => {
      expect(client.getOperaciones).toHaveBeenCalledWith({});
    });

    fireEvent.change(screen.getByLabelText(/filtrar por circuito/i), {
      target: { value: 'DIRECTO' },
    });

    await waitFor(() => {
      expect(client.getOperaciones).toHaveBeenCalledWith(
        expect.objectContaining({ circuito: 'DIRECTO' })
      );
    });
  });

  it('navega de "lista" a "detalle" al seleccionar una operacion de la tabla', async () => {
    vi.mocked(client.getOperaciones).mockResolvedValue([mockOperacion]);

    render(<OperacionesPage initialVista="lista" />);

    await waitFor(() => {
      expect(screen.getByText('Estancia Don Pedro')).toBeInTheDocument();
    });

    const btnVer = screen.getByRole('button', { name: /ver detalle/i });
    fireEvent.click(btnVer);

    await waitFor(() => {
      expect(screen.getByText(/detalle de operación op-123/i)).toBeInTheDocument();
    });
  });

  it('en App, permite alternar entre el modulo "Clientes" y "Operaciones" desde la barra superior de AppLayout', async () => {
    render(<App />);

    // Default en Clientes
    expect(await screen.findByRole('heading', { level: 2, name: 'Clientes' })).toBeInTheDocument();

    // Cambiar a Operaciones
    const btnOperaciones = screen.getByRole('button', { name: /módulo operaciones/i });
    fireEvent.click(btnOperaciones);

    expect(await screen.findByRole('heading', { level: 2, name: 'Operaciones' })).toBeInTheDocument();

    // Volver a Clientes
    const btnClientes = screen.getByRole('button', { name: /módulo clientes/i });
    fireEvent.click(btnClientes);

    expect(await screen.findByRole('heading', { level: 2, name: 'Clientes' })).toBeInTheDocument();
  });
});
