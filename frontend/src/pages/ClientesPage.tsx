import { useState, useEffect, useCallback } from 'react';
import type { Cliente } from '../types/cliente';
import { apiFetch } from '../api/client';
import { ClienteList } from '../components/clientes/ClienteList';
import { ClienteDetail } from '../components/clientes/ClienteDetail';
import { ClienteForm } from '../components/clientes/ClienteForm';
import { MobileCopilot } from '../components/clientes/MobileCopilot';

export type Vista = 'lista' | 'detalle' | 'alta' | 'edicion';

export interface ClientesPageProps {
  initialVista?: Vista;
  initialSelectedCliente?: Cliente | null;
}

export function ClientesPage({ initialVista = 'lista', initialSelectedCliente = null }: ClientesPageProps = {}) {
  const [vista, setVista] = useState<Vista>(initialVista);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(initialSelectedCliente);
  const [copilotFeedback, setCopilotFeedback] = useState<string | null>(null);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetch<Cliente[]>('/clientes');
      setClientes(data ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  if (vista === 'lista') {
    return (
      <div className="space-y-4">
        {copilotFeedback && (
          <div
            role="status"
            className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-md"
          >
            {copilotFeedback}
          </div>
        )}
        <div className="md:hidden">
          <MobileCopilot
            clientes={clientes}
            loading={loading}
            error={error}
            onRefetch={fetchClientes}
            onActionSuccess={(msg) => {
              setCopilotFeedback(msg);
              setTimeout(() => setCopilotFeedback(null), 3000);
            }}
          />
        </div>
        <div className="hidden md:block">
          <ClienteList
            clientes={clientes}
            loading={loading}
            error={error}
            onSelectCliente={(c: Cliente) => {
              setSelectedCliente(c);
              setVista('detalle');
            }}
            onNuevoCliente={() => setVista('alta')}
            onRefetch={fetchClientes}
          />
        </div>
      </div>
    );
  }

  if (vista === 'detalle') {
    if (!selectedCliente) {
      return (
        <div className="p-8 text-center text-xl">
          <p className="mb-4">No hay ningún cliente seleccionado. Volvé a la lista.</p>
          <button
            type="button"
            onClick={() => setVista('lista')}
            className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 transition cursor-pointer"
          >
            Volver
          </button>
        </div>
      );
    }
    return (
      <ClienteDetail
        cliente={selectedCliente}
        onVolver={() => setVista('lista')}
        onEditar={() => setVista('edicion')}
      />
    );
  }

  if (vista === 'alta') {
    return (
      <ClienteForm
        onSuccess={(nuevoCliente: Cliente) => {
          fetchClientes();
          setSelectedCliente(nuevoCliente);
          setVista('detalle');
        }}
        onCancel={() => setVista('lista')}
      />
    );
  }

  // TODO: Implementar en próximas tasks
  return <div className="p-4">En construcción</div>;
}
