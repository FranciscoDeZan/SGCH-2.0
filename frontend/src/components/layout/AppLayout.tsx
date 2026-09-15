import React from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans">
      <header className="bg-green-800 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">SGCH v2</h1>
      </header>
      <main className="p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
