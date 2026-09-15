import { useState, useEffect, useCallback } from 'react';
import type { Cliente } from '../types/cliente';
import { apiFetch } from '../api/client';
import { ClienteList } from '../components/clientes/ClienteList';
import { ClienteDetail } from '../components/clientes/ClienteDetail';
import { ClienteForm } from '../components/clientes/ClienteForm';
import { MobileCopilot } from '../components/clientes/MobileCopilot';
import { Toast } from '../components/ui/Toast';

export type Vista = 'lista' | 'detalle' | 'alta' | 'edicion';

export interface ClientesPageProps {
  initialVista?: Vista;
  initialSelectedCliente?: Cliente | null;
}

function EmptyFallback({ onVolver }: { onVolver: () => void }) {
  return (
    <div className="p-8 text-center text-xl" role="status">
      <p className="mb-4">No hay ningún cliente seleccionado. Volvé a la lista.</p>
      <button
        type="button"
        onClick={onVolver}
        className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 transition cursor-pointer"
      >
        Volver
      </button>
    </div>
  );
}

export function ClientesPage({ initialVista = 'lista', initialSelectedCliente = null }: ClientesPageProps = {}) {
  const [vista, setVista] = useState<Vista>(initialVista);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(initialSelectedCliente);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const renderContent = () => {
    if (vista === 'lista') {
      return (
        <div className="space-y-4">
          <div className="md:hidden">
            <MobileCopilot
              clientes={clientes}
              loading={loading}
              error={error}
              onRefetch={fetchClientes}
              onActionSuccess={(msg) => setToastMessage(msg)}
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
        return <EmptyFallback onVolver={() => setVista('lista')} />;
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
          onSuccess={() => {
            fetchClientes();
            setToastMessage('✅ Cliente guardado');
            setVista('lista');
          }}
          onCancel={() => setVista('lista')}
        />
      );
    }

    if (vista === 'edicion') {
      if (!selectedCliente) {
        return <EmptyFallback onVolver={() => setVista('lista')} />;
      }
      return (
        <ClienteForm
          initialData={selectedCliente}
          onSuccess={(updated: Cliente) => {
            fetchClientes();
            setSelectedCliente(updated);
            setToastMessage('✅ Cambios guardados');
            setVista('detalle');
          }}
          onCancel={() => setVista('detalle')}
        />
      );
    }

    // TODO: Implementar en próximas tasks
    return <div className="p-4">En construcción</div>;
  };

  return (
    <>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {renderContent()}
    </>
  );
}
