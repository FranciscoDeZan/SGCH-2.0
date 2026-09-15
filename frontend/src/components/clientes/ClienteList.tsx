import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../api/client';
import type { Cliente } from '../../types/cliente';

export interface ClienteListProps {
  onSelectCliente: (cliente: Cliente) => void;
  onNuevoCliente: () => void;
}

export function ClienteList({ onSelectCliente, onNuevoCliente }: ClienteListProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchClientes = useCallback(() => {
    setLoading(true);
    setError(false);
    apiFetch<Cliente[]>('/clientes')
      .then((data) => {
        setClientes(data ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="animate-spin h-8 w-8 text-green-700 mb-4" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p className="text-xl font-semibold text-gray-700">Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center text-red-700 max-w-md mx-auto my-8">
        <p className="font-medium mb-4">No se pudo conectar. Revisá tu conexión a internet.</p>
        <button
          type="button"
          onClick={fetchClientes}
          className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md font-medium transition cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Clientes</h2>
        <button
          type="button"
          onClick={onNuevoCliente}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md font-medium transition cursor-pointer"
        >
          Dar de alta
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          No hay clientes todavía. Tocá &apos;Dar de alta&apos; para agregar el primero.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => (
            <div
              key={cliente.id || cliente.nombreRazonSocial}
              onClick={() => onSelectCliente(cliente)}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-green-600 cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{cliente.nombreRazonSocial}</h3>
                <p className="text-sm text-gray-600 mt-1">{cliente.telefono}</p>
                <p className="text-sm text-gray-500 mt-1">{cliente.direccion}</p>
              </div>
              <div className="mt-4 pt-2 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCliente(cliente);
                  }}
                  className="text-green-700 hover:text-green-900 font-medium text-sm"
                >
                  Ver detalle &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
