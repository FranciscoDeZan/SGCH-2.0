import { useState, useEffect, useCallback } from 'react';
import type { OperacionResponse, OperacionFiltros, OperacionRequest } from '../types/operacion';
import type { Cliente } from '../types/cliente';
import { getOperaciones, getClientes } from '../api/client';
import { OperacionList } from '../components/operaciones/OperacionList';
import { OperacionForm } from '../components/operaciones/OperacionForm';
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
            onNuevaOperacion={() => setVista('alta')}
            onFilterChange={handleFilterChange}
          />
        </div>
      );
    }

    if (vista === 'detalle') {
      if (!selectedOperacion) {
        return <EmptyOperacionFallback onVolver={() => setVista('lista')} />;
      }
      return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Detalle de Operación {selectedOperacion.id}
            </h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setVista('edicion')}
                className="px-3 py-1 text-sm bg-green-700 text-white rounded hover:bg-green-800 transition cursor-pointer"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setVista('lista')}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition cursor-pointer"
              >
                Volver
              </button>
            </div>
          </div>
          <p className="text-gray-700 mb-2">
            Comprador: <span className="font-medium">{selectedOperacion.compradorNombre ?? selectedOperacion.compradorId}</span>
          </p>
          <p className="text-gray-700 mb-2">
            Vendedor: <span className="font-medium">{selectedOperacion.vendedorNombre ?? selectedOperacion.vendedorId}</span>
          </p>
          <p className="text-gray-700 mb-2">
            Categoría: <span className="font-medium">{selectedOperacion.categoria}</span>
          </p>
          <p className="text-gray-700">
            Kilos Netos: <span className="font-mono font-medium">{selectedOperacion.kgNeto.toLocaleString('es-AR')} kg</span>
          </p>
        </div>
      );
    }

    if (vista === 'alta') {
      return (
        <OperacionForm
          mode="create"
          clientes={clientes}
          operaciones={operaciones}
          initialDraft={initialDraft}
          onSuccess={(savedOp) => {
            fetchData(filtros);
            setSelectedOperacion(savedOp);
            setVista('lista');
            setToastMessage('Operación guardada exitosamente');
          }}
          onCancel={() => setVista('lista')}
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
