import { useState } from 'react';
import type { Cliente } from '../types/cliente';
import { ClienteList } from '../components/clientes/ClienteList';
import { ClienteDetail } from '../components/clientes/ClienteDetail';

export type Vista = 'lista' | 'detalle' | 'alta' | 'edicion';

export function ClientesPage() {
  const [vista, setVista] = useState<Vista>('lista');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

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

  if (vista === 'detalle' && selectedCliente) {
    return (
      <ClienteDetail
        cliente={selectedCliente}
        onVolver={() => setVista('lista')}
        onEditar={() => setVista('edicion')}
      />
    );
  }

  // TODO: Implementar en próximas tasks
  return <div className="p-4">En construcción</div>;
}
