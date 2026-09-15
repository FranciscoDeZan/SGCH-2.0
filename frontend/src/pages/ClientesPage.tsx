import { useState } from 'react';
import type { Cliente } from '../types/cliente';
import { ClienteList } from '../components/clientes/ClienteList';

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

  // TODO: Implementar en próximas tasks
  void selectedCliente;
  return <div className="p-4">En construcción</div>;
}
