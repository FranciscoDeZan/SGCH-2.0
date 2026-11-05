import { useState, useEffect, useCallback } from 'react';
import type { Cliente, CalificacionCliente } from '../../types/cliente';
import type { OperacionResponse } from '../../types/operacion';
import { getOperaciones } from '../../api/client';

export interface ClienteDetailProps {
  cliente: Cliente;
  onVolver: () => void;
  onEditar: () => void;
  onRegistrarOperacion?: (clienteId: string, rol: 'COMPRADOR' | 'VENDEDOR') => void;
  onSelectOperacion?: (operacionId: string) => void;
}

const calificacionStyles: Record<CalificacionCliente, string> = {
  A: 'bg-green-100 text-green-800 border-green-300',
  B: 'bg-blue-100 text-blue-800 border-blue-300',
  C: 'bg-amber-100 text-amber-800 border-amber-300',
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Sin registro';
  const d = dateStr.includes('T') ? new Date(dateStr) : new Date(`${dateStr}T00:00:00`);
  return isNaN(d.getTime()) ? 'Sin registro' : d.toLocaleDateString('es-AR');
}

export function ClienteDetail({
  cliente,
  onVolver,
  onEditar,
  onRegistrarOperacion,
  onSelectOperacion,
}: ClienteDetailProps) {
  const [operaciones, setOperaciones] = useState<OperacionResponse[]>([]);
  const [loadingOps, setLoadingOps] = useState<boolean>(true);
  const [errorOps, setErrorOps] = useState<boolean>(false);

  const fetchOperaciones = useCallback(async () => {
    if (!cliente.id) {
      setOperaciones([]);
      setLoadingOps(false);
      return;
    }

    setLoadingOps(true);
    setErrorOps(false);
    try {
      const data = await getOperaciones({ clienteId: cliente.id });
      setOperaciones(data ?? []);
    } catch {
      setErrorOps(true);
    } finally {
      setLoadingOps(false);
    }
  }, [cliente.id]);

  useEffect(() => {
    fetchOperaciones();
  }, [fetchOperaciones]);
  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onVolver}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition cursor-pointer"
          >
            Volver
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{cliente.nombreRazonSocial}</h2>
          {cliente.calificacion && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                calificacionStyles[cliente.calificacion] || 'bg-gray-100 text-gray-800 border-gray-300'
              }`}
            >
              Cat. {cliente.calificacion}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onEditar}
            className="bg-green-700 hover:bg-green-800 text-white px-3.5 py-2 rounded-md font-medium text-sm transition cursor-pointer"
          >
            Editar Cliente
          </button>
          <button
            type="button"
            onClick={() => cliente.id && onRegistrarOperacion?.(cliente.id, 'COMPRADOR')}
            className="bg-green-700 hover:bg-green-800 text-white px-3.5 py-2 rounded-md font-medium text-sm transition cursor-pointer inline-flex items-center gap-1.5"
            aria-label="Registrar compra"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Registrar compra
          </button>
          <button
            type="button"
            onClick={() => cliente.id && onRegistrarOperacion?.(cliente.id, 'VENDEDOR')}
            className="bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-2 rounded-md font-medium text-sm transition cursor-pointer inline-flex items-center gap-1.5"
            aria-label="Registrar venta"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Registrar venta
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contacto y Ubicación */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
            Contacto y Ubicación
          </h3>
          <dl className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <dt className="text-gray-500 font-medium">Teléfono</dt>
              <dd className="text-gray-900 mt-0.5">
                <a
                  href={'tel:' + cliente.telefono.replace(/[^0-9+]/g, '')}
                  className="text-blue-600 hover:underline"
                >
                  {cliente.telefono}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Email</dt>
              <dd className="text-gray-900 mt-0.5">{cliente.email || 'No especificado'}</dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Dirección</dt>
              <dd className="text-gray-900 mt-0.5">{cliente.direccion}</dd>
            </div>
            {cliente.latitud != null && cliente.longitud != null && (
              <div>
                <dt className="text-gray-500 font-medium">Coordenadas geográficas</dt>
                <dd className="text-gray-900 mt-0.5">
                  {cliente.latitud}, {cliente.longitud}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Información Comercial */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
            Información Comercial
          </h3>
          <dl className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <dt className="text-gray-500 font-medium">Tipo de Hacienda</dt>
              <dd className="text-gray-900 mt-0.5">{cliente.tipoHacienda || 'No especificado'}</dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Formas de Pago Preferidas</dt>
              <dd className="text-gray-900 mt-0.5">{cliente.formasPagoPreferidas || 'No especificado'}</dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Fecha de Última Operación</dt>
              <dd className="text-gray-900 mt-0.5">{formatDate(cliente.fechaUltimaOperacion)}</dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Fecha de Último Contacto</dt>
              <dd className="text-gray-900 mt-0.5">{formatDate(cliente.fechaUltimoContacto)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Observaciones */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
          Observaciones
        </h3>
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {cliente.observaciones || 'Sin observaciones registradas.'}
        </p>
      </div>

      {/* Historial de Operaciones */}
      <section
        aria-labelledby="historial-operaciones"
        className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3"
      >
        <h3
          id="historial-operaciones"
          className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2"
        >
          Historial de Operaciones
        </h3>

        {loadingOps && (
          <p role="status" className="text-sm text-gray-500 py-4 text-center">
            Cargando operaciones...
          </p>
        )}

        {errorOps && (
          <div
            role="alert"
            className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center justify-between"
          >
            <span>Error al cargar las operaciones.</span>
            <button
              type="button"
              onClick={fetchOperaciones}
              className="font-semibold underline hover:text-red-900 cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loadingOps && !errorOps && operaciones.length === 0 && (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 text-sm">
            Sin operaciones registradas
          </div>
        )}

        {!loadingOps && !errorOps && operaciones.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-2.5 text-left font-semibold">
                    Fecha
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-left font-semibold">
                    Tipo
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-left font-semibold">
                    Categoría
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                    Kg Netos
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                    Monto
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-center font-semibold">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-center font-semibold">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {operaciones.map((op) => {
                  const tipo = op.compradorId === cliente.id ? 'Compra' : 'Venta';
                  const monto = op.calculo?.subtotalGanado ?? op.kgNeto * op.precioKgFacturado;
                  return (
                    <tr key={op.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-900">
                        {formatDate(op.fechaOperacion)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                            tipo === 'Compra'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {tipo}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-700">
                        {op.categoria}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right font-mono text-gray-900">
                        {op.kgNeto.toLocaleString('es-AR')} kg
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right font-mono text-gray-900 font-medium">
                        ${monto.toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-300 font-medium">
                          {op.estadoLiquidacion}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => onSelectOperacion?.(op.id)}
                          aria-label={`Ver ${op.id}`}
                          className="text-xs text-green-700 hover:text-green-800 font-semibold px-2 py-1 rounded hover:bg-green-50 transition cursor-pointer"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
