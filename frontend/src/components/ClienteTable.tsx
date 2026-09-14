import React from 'react';
import type { Cliente, CalificacionCliente } from '../types/cliente';

interface ClienteTableProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const CalificacionBadge: React.FC<{ calificacion?: CalificacionCliente }> = ({ calificacion }) => {
  if (!calificacion) {
    return <span className="text-gray-400 italic text-xs">-</span>;
  }
  const colorStyles = {
    A: 'bg-green-100 text-green-800 border-green-300',
    B: 'bg-blue-100 text-blue-800 border-blue-300',
    C: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${colorStyles[calificacion]}`}
    >
      Cat. {calificacion}
    </span>
  );
};

export const ClienteTable: React.FC<ClienteTableProps> = ({
  clientes,
  onEdit,
  onDelete,
  searchTerm,
  onSearchChange,
}) => {
  const filteredClientes = clientes.filter(
    (c) =>
      c.nombreRazonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telefono.includes(searchTerm) ||
      c.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between gap-3 items-center">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, teléfono, dirección..."
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <span className="absolute left-3 top-2 text-gray-400 text-sm">🔍</span>
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Mostrando {filteredClientes.length} de {clientes.length} clientes
        </div>
      </div>

      {/* Spreadsheet-like Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-600">
            <tr>
              <th className="px-4 py-3">Nombre / Razón Social</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Dirección</th>
              <th className="px-4 py-3 text-center">Calificación</th>
              <th className="px-4 py-3">Tipo Hacienda</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredClientes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <div className="text-base font-semibold text-gray-700">No se encontraron clientes</div>
                  <p className="mt-1 text-xs text-gray-400">
                    {searchTerm
                      ? 'Probá ajustando los términos de búsqueda.'
                      : 'Comenzá agregando tu primer cliente con el botón superior.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredClientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="hover:bg-blue-50/50 transition-colors border-b border-gray-100 last:border-none"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {cliente.nombreRazonSocial}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {cliente.telefono}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {cliente.email || <span className="text-gray-300 italic">-</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-xs">
                    {cliente.direccion}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <CalificacionBadge calificacion={cliente.calificacion} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {cliente.tipoHacienda || <span className="text-gray-300 italic">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => onEdit(cliente)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => cliente.id && onDelete(cliente.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
