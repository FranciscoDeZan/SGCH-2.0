import type { Cliente, CalificacionCliente } from '../../types/cliente';

export interface ClienteDetailProps {
  cliente: Cliente;
  onVolver: () => void;
  onEditar: () => void;
}

const calificacionStyles: Record<CalificacionCliente, string> = {
  A: 'bg-green-100 text-green-800 border-green-300',
  B: 'bg-blue-100 text-blue-800 border-blue-300',
  C: 'bg-amber-100 text-amber-800 border-amber-300',
};

export function ClienteDetail({ cliente, onVolver, onEditar }: ClienteDetailProps) {
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onEditar}
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md font-medium text-sm transition cursor-pointer"
          >
            Editar Cliente
          </button>
          <button
            type="button"
            disabled
            title="Próximamente"
            className="bg-gray-400 text-white px-4 py-2 rounded-md font-medium text-sm cursor-not-allowed opacity-50"
          >
            Registrar Operación
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
              <dd className="text-gray-900 mt-0.5">{cliente.telefono}</dd>
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
            {cliente.fechaUltimaOperacion && (
              <div>
                <dt className="text-gray-500 font-medium">Fecha de Última Operación</dt>
                <dd className="text-gray-900 mt-0.5">{cliente.fechaUltimaOperacion}</dd>
              </div>
            )}
            {cliente.fechaUltimoContacto && (
              <div>
                <dt className="text-gray-500 font-medium">Fecha de Último Contacto</dt>
                <dd className="text-gray-900 mt-0.5">{cliente.fechaUltimoContacto}</dd>
              </div>
            )}
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

      {/* Historial de Operaciones Placeholder */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
          Historial de Operaciones
        </h3>
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 text-sm">
          El historial de operaciones va a estar disponible en la próxima actualización.
        </div>
      </div>
    </div>
  );
}
