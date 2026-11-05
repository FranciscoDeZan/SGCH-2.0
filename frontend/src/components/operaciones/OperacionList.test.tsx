import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OperacionList } from './OperacionList';
import type { OperacionResponse } from '../../types/operacion';
import type { Cliente } from '../../types/cliente';

const mockClientes: Cliente[] = [
  { id: 'c-1', nombreRazonSocial: 'Estancia Don Pedro', telefono: '1123456789', direccion: 'Ruta 5 Km 100' },
  { id: 'c-2', nombreRazonSocial: 'Cabaña La Tranquera', telefono: '1198765432', direccion: 'Ruta 8 Km 50' },
];

const mockOperacion: OperacionResponse = {
  id: 'op-1',
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

describe('OperacionList', () => {
  it('renderiza estado loading con texto "Cargando operaciones..."', () => {
    render(
      <OperacionList
        operaciones={[]}
        clientes={[]}
        loading={true}
        onSelectOperacion={vi.fn()}
        onNuevaOperacion={vi.fn()}
        onFilterChange={vi.fn()}
      />
    );

    expect(screen.getByText('Cargando operaciones...')).toBeInTheDocument();
  });

  it('renderiza estado error y ejecuta onRefetch al hacer clic en "Reintentar"', () => {
    const handleRefetch = vi.fn();
    render(
      <OperacionList
        operaciones={[]}
        clientes={[]}
        error={true}
        onRefetch={handleRefetch}
        onSelectOperacion={vi.fn()}
        onNuevaOperacion={vi.fn()}
        onFilterChange={vi.fn()}
      />
    );

    expect(screen.getByText('No se pudo conectar. Revisá tu conexión a internet.')).toBeInTheDocument();
    const btnReintentar = screen.getByRole('button', { name: /reintentar/i });
    fireEvent.click(btnReintentar);
    expect(handleRefetch).toHaveBeenCalledTimes(1);
  });

  it('renderiza estado vacio y dispara onNuevaOperacion al tocar "Nueva Operación"', () => {
    const handleNueva = vi.fn();
    render(
      <OperacionList
        operaciones={[]}
        clientes={[]}
        loading={false}
        error={false}
        onNuevaOperacion={handleNueva}
        onSelectOperacion={vi.fn()}
        onFilterChange={vi.fn()}
      />
    );

    expect(
      screen.getByText("No hay operaciones registradas. Tocá 'Nueva Operación' para cargar la primera.")
    ).toBeInTheDocument();

    const btnNueva = screen.getAllByRole('button', { name: /nueva operación/i })[0];
    fireEvent.click(btnNueva);
    expect(handleNueva).toHaveBeenCalled();
  });

  it('renderiza filas con comprador, vendedor, kg netos, saldo comision firma y badge de estadoLiquidacion, invocando onSelectOperacion al hacer clic', () => {
    const handleSelect = vi.fn();
    render(
      <OperacionList
        operaciones={[mockOperacion]}
        clientes={mockClientes}
        loading={false}
        error={false}
        onSelectOperacion={handleSelect}
        onNuevaOperacion={vi.fn()}
        onFilterChange={vi.fn()}
      />
    );

    const table = screen.getByRole('table');
    expect(within(table).getByText('Estancia Don Pedro')).toBeInTheDocument();
    expect(within(table).getByText('Cabaña La Tranquera')).toBeInTheDocument();
    expect(within(table).getByText(/15\.?000/)).toBeInTheDocument();
    expect(within(table).getByText(/871\.?200/)).toBeInTheDocument();
    expect(within(table).getByText('PENDIENTE')).toBeInTheDocument();

    const btnVer = screen.getByRole('button', { name: /ver detalle/i });
    fireEvent.click(btnVer);
    expect(handleSelect).toHaveBeenCalledWith(mockOperacion);
  });

  it('dispara onFilterChange cuando el operador cambia circuito, estado, cliente o fechas', () => {
    const handleFilterChange = vi.fn();
    render(
      <OperacionList
        operaciones={[mockOperacion]}
        clientes={mockClientes}
        loading={false}
        error={false}
        onSelectOperacion={vi.fn()}
        onNuevaOperacion={vi.fn()}
        onFilterChange={handleFilterChange}
      />
    );

    // Cambiar circuito
    fireEvent.change(screen.getByLabelText(/filtrar por circuito/i), {
      target: { value: 'DIRECTO' },
    });
    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ circuito: 'DIRECTO' })
    );

    // Cambiar estado
    fireEvent.change(screen.getByLabelText(/filtrar por estado/i), {
      target: { value: 'PENDIENTE' },
    });
    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'PENDIENTE' })
    );

    // Cambiar cliente
    fireEvent.change(screen.getByLabelText(/filtrar por cliente/i), {
      target: { value: 'c-1' },
    });
    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ clienteId: 'c-1' })
    );

    // Cambiar fecha desde
    fireEvent.change(screen.getByLabelText(/fecha desde/i), {
      target: { value: '2026-11-01' },
    });
    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ fechaDesde: '2026-11-01' })
    );

    // Cambiar fecha hasta
    fireEvent.change(screen.getByLabelText(/fecha hasta/i), {
      target: { value: '2026-11-05' },
    });
    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ fechaHasta: '2026-11-05' })
    );

    // Limpiar filtros
    const btnLimpiar = screen.getByRole('button', { name: /limpiar filtros/i });
    fireEvent.click(btnLimpiar);
    expect(handleFilterChange).toHaveBeenCalledWith({});
  });
});
