import React from 'react';

export interface AppLayoutProps {
  children: React.ReactNode;
  moduloActivo?: 'clientes' | 'operaciones';
  onSelectModulo?: (modulo: 'clientes' | 'operaciones') => void;
}

export function AppLayout({
  children,
  moduloActivo,
  onSelectModulo,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans">
      <header className="bg-green-800 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">SGCH v2</h1>

        {onSelectModulo && (
          <nav aria-label="Navegación principal" className="flex items-center space-x-2">
            <button
              type="button"
              aria-label="Módulo Clientes"
              aria-current={moduloActivo === 'clientes' ? 'page' : undefined}
              onClick={() => onSelectModulo('clientes')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                moduloActivo === 'clientes'
                  ? 'bg-green-950 text-white shadow-inner'
                  : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Clientes</span>
            </button>

            <button
              type="button"
              aria-label="Módulo Operaciones"
              aria-current={moduloActivo === 'operaciones' ? 'page' : undefined}
              onClick={() => onSelectModulo('operaciones')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                moduloActivo === 'operaciones'
                  ? 'bg-green-950 text-white shadow-inner'
                  : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <span>Operaciones</span>
            </button>
          </nav>
        )}
      </header>
      <main className="p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
