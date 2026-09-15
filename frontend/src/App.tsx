import { useState, useEffect, useCallback } from 'react';
import type { Cliente } from './types/cliente';
import { getClientes, createCliente, updateCliente, deleteCliente } from './api/client';
import { ClienteTable } from './components/ClienteTable';
import { ClienteModal } from './components/ClienteModal';

export default function App() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClientes();
      setClientes(data);
    } catch {
      setNotification({
        type: 'error',
        message: 'No se pudo conectar con el servidor backend (http://localhost:8080). Verificá que esté levantado.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleOpenCreate = () => {
    setSelectedCliente(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const handleSave = async (clienteData: Cliente) => {
    if (selectedCliente && selectedCliente.id) {
      const updated = await updateCliente(selectedCliente.id, clienteData);
      setClientes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showNotification('success', `Cliente "${updated.nombreRazonSocial}" actualizado con éxito.`);
    } else {
      const created = await createCliente(clienteData);
      setClientes((prev) => [created, ...prev]);
      showNotification('success', `Cliente "${created.nombreRazonSocial}" dado de alta con éxito.`);
    }
  };

  const handleDelete = async (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar al cliente "${cliente?.nombreRazonSocial || 'seleccionado'}"?`
    );
    if (!confirmDelete) return;

    try {
      await deleteCliente(id);
      setClientes((prev) => prev.filter((c) => c.id !== id));
      showNotification('success', 'Cliente eliminado con éxito.');
    } catch {
      showNotification('error', 'Error al intentar eliminar el cliente.');
    }
  };

  // Metrics
  const totalClientes = clientes.length;
  const clientesCatA = clientes.filter((c) => c.calificacion === 'A').length;
  const clientesConEmail = clientes.filter((c) => c.email && c.email.length > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-inner">
              🐂
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">SGCH v2</h1>
              <p className="text-xs text-slate-400">Consignataria de Hacienda • Gestión Comercial</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 mr-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              API Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between shadow-sm transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 ml-4 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Metrics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Clientes</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalClientes}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
              👥
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría A (Alta Confiabilidad)</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{clientesCatA}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
              ⭐
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contactos con Email</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{clientesConEmail}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-bold">
              ✉️
            </div>
          </div>
        </section>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Directorio de Clientes</h2>
            <p className="text-xs text-slate-500">Administrá los compradores, vendedores y sus preferencias comerciales.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <span className="mr-1.5 text-base leading-none">+</span> Nuevo Cliente
          </button>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm">Cargando clientes desde el backend...</p>
          </div>
        ) : (
          <ClienteTable
            clientes={clientes}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}
      </main>

      {/* Modal Form */}
      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        clienteToEdit={selectedCliente}
      />
    </div>
  );
}
