import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { ClientesPage } from './pages/ClientesPage';
import { OperacionesPage } from './pages/OperacionesPage';

export default function App() {
  const [modulo, setModulo] = useState<'clientes' | 'operaciones'>('clientes');

  return (
    <AppLayout moduloActivo={modulo} onSelectModulo={setModulo}>
      {modulo === 'clientes' ? <ClientesPage /> : <OperacionesPage />}
    </AppLayout>
  );
}
