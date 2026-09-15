import { useState } from 'react';
import type { Cliente } from '../types/cliente';
import { ClienteList } from '../components/clientes/ClienteList';
import { ClienteDetail } from '../components/clientes/ClienteDetail';
import { ClienteForm } from '../components/clientes/ClienteForm';

export type Vista = 'lista' | 'detalle' | 'alta' | 'edicion';

export interface ClientesPageProps {
  initialVista?: Vista;
  initialSelectedCliente?: Cliente | null;
}

export function ClientesPage({ initialVista = 'lista', initialSelectedCliente = null }: ClientesPageProps = {}) {
  const [vista, setVista] = useState<Vista>(initialVista);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(initialSelectedCliente);

  if (vista === 'lista') {
    return (
      <ClienteList
        onSelectCliente={(c: Cliente) => {
          setSelectedCliente(c);
          setVista('detalle');
        }}
        onNuevoCliente={() => setVista('alta')}
      />
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
