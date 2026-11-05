import { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { ClientesPage } from './pages/ClientesPage';
import { OperacionesPage } from './pages/OperacionesPage';
import type { OperacionRequest } from './types/operacion';

export default function App() {
  const [modulo, setModulo] = useState<'clientes' | 'operaciones'>('clientes');
  const [initialOperacionDraft, setInitialOperacionDraft] = useState<Partial<OperacionRequest> | null>(null);

  useEffect(() => {
    if (modulo === 'clientes') {
      setInitialOperacionDraft(null);
    }
  }, [modulo]);

  return (
    <AppLayout moduloActivo={modulo} onSelectModulo={setModulo}>
      {modulo === 'clientes' ? (
        <ClientesPage
          onRegistrarOperacion={(clienteId, rol) => {
            setInitialOperacionDraft(
              rol === 'COMPRADOR' ? { compradorId: clienteId } : { vendedorId: clienteId }
            );
            setModulo('operaciones');
          }}
          onSelectOperacion={(_operacionId) => {
            setModulo('operaciones');
          }}
        />
      ) : (
        <OperacionesPage
          initialDraft={initialOperacionDraft}
          initialVista={initialOperacionDraft ? 'alta' : 'lista'}
        />
      )}
    </AppLayout>
  );
}
