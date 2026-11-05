import { useState, useEffect, useCallback } from 'react';
import type { OperacionResponse, OperacionFiltros, OperacionRequest } from '../types/operacion';
import type { Cliente } from '../types/cliente';
import { getOperaciones, getClientes, getOperacionById } from '../api/client';
import { OperacionList } from '../components/operaciones/OperacionList';
import { OperacionForm } from '../components/operaciones/OperacionForm';
import { OperacionDetail } from '../components/operaciones/OperacionDetail';
import { OperacionesMobileCopilot } from '../components/operaciones/OperacionesMobileCopilot';
import { Toast } from '../components/ui/Toast';

export type VistaOperacion = 'lista' | 'detalle' | 'alta' | 'edicion';

export interface OperacionesPageProps {
  initialVista?: VistaOperacion;
  initialSelectedOperacion?: OperacionResponse | null;
  initialDraft?: Partial<OperacionRequest> | null;
}

function EmptyOperacionFallback({ onVolver }: { onVolver: () => void }) {
  return (
    <div className="p-8 text-center text-xl" role="status">
      <p className="mb-4">No hay ninguna operación seleccionada. Volvé a la lista.</p>
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

export function OperacionesPage({
  initialVista = 'lista',
  initialSelectedOperacion = null,
  initialDraft = null,
}: OperacionesPageProps = {}) {
  const [vista, setVista] = useState<VistaOperacion>(initialVista);
  const [selectedOperacion, setSelectedOperacion] = useState<OperacionResponse | null>(
    initialSelectedOperacion
  );
  const [draftOperacion, setDraftOperacion] = useState<Partial<OperacionRequest> | null>(
    initialDraft
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [operaciones, setOperaciones] = useState<OperacionResponse[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtros, setFiltros] = useState<OperacionFiltros>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchData = useCallback(async (currentFiltros: OperacionFiltros = {}) => {
    setLoading(true);
    setError(false);
    try {
      const [opsData, clientesData] = await Promise.all([
        getOperaciones(currentFiltros),
        getClientes(),
      ]);
      setOperaciones(opsData ?? []);
      setClientes(clientesData ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOperacionesOnly = useCallback(async (currentFiltros: OperacionFiltros) => {
    setLoading(true);
    setError(false);
    try {
      const opsData = await getOperaciones(currentFiltros);
      setOperaciones(opsData ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (newFiltros: OperacionFiltros) => {
    setFiltros(newFiltros);
    fetchOperacionesOnly(newFiltros);
  };

  const renderContent = () => {
    if (vista === 'lista') {
      return (
        <div className="space-y-4">
          <div className="md:hidden">
            <OperacionesMobileCopilot
              operaciones={operaciones}
              loading={loading}
              error={error}
              onPrellenarAlta={(draft) => {
                setDraftOperacion(draft);
                setVista('alta');
              }}
              onSelectOperacion={(op: OperacionResponse) => {
                setSelectedOperacion(op);
                setVista('detalle');
              }}
              onNuevaOperacionManual={() => {
                setDraftOperacion(null);
                setVista('alta');
              }}
              onRefetch={() => fetchOperacionesOnly(filtros)}
            />
          </div>
          <div className="hidden md:block">
            <OperacionList
              operaciones={operaciones}
              clientes={clientes}
              loading={loading}
              error={error}
              initialFiltros={filtros}
              onRefetch={() => fetchOperacionesOnly(filtros)}
              onSelectOperacion={(op: OperacionResponse) => {
                setSelectedOperacion(op);
                setVista('detalle');
              }}
              onNuevaOperacion={() => {
                setDraftOperacion(null);
                setVista('alta');
              }}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>
      );
    }

    if (vista === 'detalle') {
      if (!selectedOperacion) {
        return <EmptyOperacionFallback onVolver={() => setVista('lista')} />;
      }
      return (
        <OperacionDetail
          operacion={selectedOperacion}
          onVolver={() => setVista('lista')}
          onEditar={() => setVista('edicion')}
          onCobroRegistrado={async () => {
            const fresh = await getOperacionById(selectedOperacion.id);
            setSelectedOperacion(fresh);
            fetchData(filtros);
          }}
          onActionSuccess={(msg) => setToastMessage(msg)}
        />
      );
    }

    if (vista === 'alta') {
      return (
        <OperacionForm
          mode="create"
          clientes={clientes}
          operaciones={operaciones}
          initialDraft={draftOperacion}
          onSuccess={(savedOp) => {
            fetchData(filtros);
            setSelectedOperacion(savedOp);
            setDraftOperacion(null);
            setVista('lista');
            setToastMessage('Operación guardada exitosamente');
          }}
          onCancel={() => {
            setDraftOperacion(null);
            setVista('lista');
          }}
        />
      );
    }

    if (vista === 'edicion') {
      if (!selectedOperacion) {
        return <EmptyOperacionFallback onVolver={() => setVista('lista')} />;
      }
      return (
        <OperacionForm
          mode="edit"
          initialOperacion={selectedOperacion}
          clientes={clientes}
          operaciones={operaciones}
          onSuccess={(savedOp) => {
            fetchData(filtros);
            setSelectedOperacion(savedOp);
            setVista('detalle');
            setToastMessage('Cambios guardados exitosamente');
          }}
          onCancel={() => setVista('detalle')}
        />
      );
    }
  };

  return (
    <>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {renderContent()}
    </>
  );
}
