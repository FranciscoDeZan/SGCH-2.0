import { useState } from 'react';
import type {
  OperacionResponse,
  OperacionFiltros,
  ModalidadCircuito,
  EstadoLiquidacion,
} from '../../types/operacion';
import type { Cliente } from '../../types/cliente';

export interface OperacionListProps {
  operaciones: OperacionResponse[];
  clientes: Cliente[];
  loading?: boolean;
  error?: boolean;
  initialFiltros?: OperacionFiltros;
  onRefetch?: () => void;
  onSelectOperacion: (operacion: OperacionResponse) => void;
  onNuevaOperacion: () => void;
  onFilterChange: (filtros: OperacionFiltros) => void;
}

export function OperacionList({
  operaciones = [],
  clientes = [],
  loading = false,
  error = false,
  initialFiltros,
  onRefetch,
  onSelectOperacion,
  onNuevaOperacion,
  onFilterChange,
}: OperacionListProps) {
  const [circuito, setCircuito] = useState<string>(initialFiltros?.circuito ?? '');
  const [estado, setEstado] = useState<string>(initialFiltros?.estado ?? '');
  const [clienteId, setClienteId] = useState<string>(initialFiltros?.clienteId ?? '');
  const [fechaDesde, setFechaDesde] = useState<string>(initialFiltros?.fechaDesde ?? '');
  const [fechaHasta, setFechaHasta] = useState<string>(initialFiltros?.fechaHasta ?? '');

  const triggerFilter = (updates: Partial<{
    circuito: string;
    estado: string;
    clienteId: string;
    fechaDesde: string;
    fechaHasta: string;
  }>) => {
    const next = {
      circuito,
      estado,
      clienteId,
      fechaDesde,
      fechaHasta,
      ...updates,
    };
    const filtros: OperacionFiltros = {};
    if (next.circuito) filtros.circuito = next.circuito as ModalidadCircuito;
    if (next.estado) filtros.estado = next.estado as EstadoLiquidacion;
    if (next.clienteId) filtros.clienteId = next.clienteId;
    if (next.fechaDesde) filtros.fechaDesde = next.fechaDesde;
    if (next.fechaHasta) filtros.fechaHasta = next.fechaHasta;
    onFilterChange(filtros);
  };

  const handleLimpiar = () => {
    setCircuito('');
    setEstado('');
    setClienteId('');
    setFechaDesde('');
    setFechaHasta('');
    onFilterChange({});
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          className="animate-spin h-8 w-8 text-green-700 mb-4"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p className="text-xl font-semibold text-gray-700">Cargando operaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center text-red-700 max-w-md mx-auto my-8">
        <p className="font-medium mb-4">No se pudo conectar. Revisá tu conexión a internet.</p>
        <button
          type="button"
          onClick={onRefetch}
          className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md font-medium transition cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const renderBadgeEstado = (est: EstadoLiquidacion) => {
    switch (est) {
      case 'PENDIENTE':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
            PENDIENTE
          </span>
        );
      case 'PARCIALMENTE_PAGADO':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            PARCIALMENTE_PAGADO
          </span>
        );
      case 'LIQUIDADO':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            LIQUIDADO
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {est}
          </span>
        );
    }
  };

  const renderBadgeCircuito = (circ: ModalidadCircuito) => {
    switch (circ) {
      case 'DIRECTO':
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            DIRECTO
          </span>
        );
      case 'CONSIGNATARIA_EXTERNA':
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-50 text-purple-700 border border-purple-200">
            CONSIGNATARIA
          </span>
        );
      case 'PROPIA':
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            PROPIA
          </span>
        );
      default:
        return <span>{circ}</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Operaciones</h2>
        <button
          type="button"
          onClick={onNuevaOperacion}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md font-medium transition cursor-pointer flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Operación</span>
        </button>
      </div>

      {/* Barra de filtros */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Circuito</label>
            <select
              aria-label="Filtrar por circuito"
              value={circuito}
              onChange={(e) => {
                setCircuito(e.target.value);
                triggerFilter({ circuito: e.target.value });
              }}
              className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white text-gray-800"
            >
              <option value="">Todos</option>
              <option value="DIRECTO">DIRECTO</option>
              <option value="CONSIGNATARIA_EXTERNA">CONSIGNATARIA_EXTERNA</option>
              <option value="PROPIA">PROPIA</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
            <select
              aria-label="Filtrar por estado"
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                triggerFilter({ estado: e.target.value });
              }}
              className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white text-gray-800"
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="PARCIALMENTE_PAGADO">PARCIALMENTE_PAGADO</option>
              <option value="LIQUIDADO">LIQUIDADO</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cliente</label>
            <select
              aria-label="Filtrar por cliente"
              value={clienteId}
              onChange={(e) => {
                setClienteId(e.target.value);
                triggerFilter({ clienteId: e.target.value });
              }}
              className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white text-gray-800"
            >
              <option value="">Todos</option>
              {clientes.map((c) => (
                <option key={c.id ?? c.nombreRazonSocial} value={c.id ?? ''}>
                  {c.nombreRazonSocial}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha desde</label>
            <input
              type="date"
              aria-label="Fecha desde"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                triggerFilter({ fechaDesde: e.target.value });
              }}
              className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white text-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha hasta</label>
            <input
              type="date"
              aria-label="Fecha hasta"
              value={fechaHasta}
              min={fechaDesde || undefined}
              onChange={(e) => {
                setFechaHasta(e.target.value);
                triggerFilter({ fechaHasta: e.target.value });
              }}
              className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white text-gray-800"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleLimpiar}
              aria-label="Limpiar filtros"
              className="w-full text-sm border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-md p-2 transition cursor-pointer font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Contenido / Grilla */}
      {operaciones.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg bg-white border border-gray-200 rounded-lg">
          No hay operaciones registradas. Tocá &apos;Nueva Operación&apos; para cargar la primera.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold">Fecha</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">Circuito</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">Comprador &rarr; Vendedor</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">Categoría / Raza</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Kg Netos</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Precio/Kg</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Comisión Firma</th>
                <th scope="col" className="px-4 py-3 text-center font-semibold">Estado</th>
                <th scope="col" className="px-4 py-3 text-center font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {operaciones.map((op) => (
                <tr
                  key={op.id}
                  onClick={() => onSelectOperacion(op)}
                  className="hover:bg-green-50/50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-medium">
                    {op.fechaOperacion ? op.fechaOperacion.slice(0, 10) : ''}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderBadgeCircuito(op.modalidadCircuito)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">
                    <span className="font-medium text-gray-900">{op.compradorNombre ?? op.compradorId}</span>
                    <span className="text-gray-400 mx-1">&rarr;</span>
                    <span className="text-gray-600">{op.vendedorNombre ?? op.vendedorId}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {op.categoria}
                    {op.raza ? ` / ${op.raza}` : ''}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 font-mono">
                    {op.kgNeto.toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 font-mono">
                    ${op.precioKgFacturado.toLocaleString('es-AR')} ({op.modalidadPrecio})
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-green-800 font-mono font-medium">
                    ${(op.calculo?.saldoComisionFirma ?? 0).toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {renderBadgeEstado(op.estadoLiquidacion)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button
                      type="button"
                      aria-label={`Ver detalle de operación ${op.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOperacion(op);
                      }}
                      className="text-green-700 hover:text-green-900 font-medium text-xs border border-green-700 hover:border-green-900 rounded px-2 py-1 transition cursor-pointer"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
