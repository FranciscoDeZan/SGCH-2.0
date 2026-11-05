import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import * as client from './api/client';

vi.mock('./api/client', async () => {
  const actual = await vi.importActual<typeof client>('./api/client');
  return {
    ...actual,
    apiFetch: vi.fn().mockResolvedValue([]),
    getClientes: vi.fn().mockResolvedValue([]),
    getOperaciones: vi.fn().mockResolvedValue([]),
  };
});

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AppLayout and ClientesPage without crashing', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue([]);
    render(<App />);
    expect(screen.getByText('SGCH v2')).toBeInTheDocument();
    expect(await screen.findByText('Clientes')).toBeInTheDocument();
  });

  it('testCrossPageNavigationFromClientesToOperacionesConDraft: navigates from Clientes detail to Operaciones create form with prefilled client', async () => {
    const mockCliente = {
      id: 'c-100',
      nombreRazonSocial: 'Estancia La Oriental',
      telefono: '3415551234',
      direccion: 'Ruta 8 Km 100',
    };

    vi.mocked(client.apiFetch).mockImplementation(async (endpoint: string) => {
      if (endpoint === '/clientes') return [mockCliente];
      return [];
    });
    vi.mocked(client.getClientes).mockResolvedValue([mockCliente]);
    vi.mocked(client.getOperaciones).mockResolvedValue([]);

    render(<App />);

    // Esperar a que la lista de clientes cargue (en ClienteList desktop)
    expect(
      await screen.findByRole('heading', { level: 3, name: 'Estancia La Oriental' })
    ).toBeInTheDocument();

    // Click en el cliente para ir a detalle (desde ClienteList en desktop)
    const btnVer = screen.getByRole('button', { name: /ver detalle/i });
    fireEvent.click(btnVer);

    // En detalle, click "Registrar compra"
    const btnCompra = await screen.findByRole('button', { name: /registrar compra/i });
    fireEvent.click(btnCompra);

    // Debe cambiar al módulo Operaciones y abrir el formulario de alta
    expect(await screen.findByRole('heading', { level: 2, name: /nueva operación/i })).toBeInTheDocument();

    // Verifica que el comprador esté preseleccionado
    const selectComprador = screen.getByLabelText(/comprador \*/i) as HTMLSelectElement;
    expect(selectComprador.value).toBe('c-100');
  });
});
