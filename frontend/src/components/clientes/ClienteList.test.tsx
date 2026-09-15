import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClienteList } from './ClienteList';
import * as client from '../../api/client';
import type { Cliente } from '../../types/cliente';

vi.mock('../../api/client', () => ({
  apiFetch: vi.fn(),
}));

describe('ClienteList', () => {
  const mockOnSelectCliente = vi.fn();
  const mockOnNuevoCliente = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially with spinner and loading message', () => {
    vi.mocked(client.apiFetch).mockReturnValue(new Promise(() => {}));

    render(
      <ClienteList
        onSelectCliente={mockOnSelectCliente}
        onNuevoCliente={mockOnNuevoCliente}
      />
    );

    expect(screen.getByText('Cargando clientes...')).toBeInTheDocument();
  });

  it('shows empty state when no clients are returned', async () => {
    vi.mocked(client.apiFetch).mockResolvedValueOnce([]);

    render(
      <ClienteList
        onSelectCliente={mockOnSelectCliente}
        onNuevoCliente={mockOnNuevoCliente}
      />
    );

    expect(
      await screen.findByText("No hay clientes todavía. Tocá 'Dar de alta' para agregar el primero.")
    ).toBeInTheDocument();

    const altaButton = screen.getByRole('button', { name: /dar de alta/i });
    expect(altaButton).toBeInTheDocument();
    fireEvent.click(altaButton);
    expect(mockOnNuevoCliente).toHaveBeenCalledTimes(1);
  });

  it('shows data state with client list and allows selection and creating new client', async () => {
    const mockClientes: Cliente[] = [
      {
        id: '1',
        nombreRazonSocial: 'Estancia La Ilusión',
        telefono: '3415551234',
        direccion: 'Ruta 11 Km 50',
      },
      {
        id: '2',
        nombreRazonSocial: 'Agropecuaria El Ombú',
        telefono: '3419998877',
        direccion: 'Ruta 9 Km 200',
      },
    ];

    vi.mocked(client.apiFetch).mockResolvedValueOnce(mockClientes);

    render(
      <ClienteList
        onSelectCliente={mockOnSelectCliente}
        onNuevoCliente={mockOnNuevoCliente}
      />
    );

    expect(await screen.findByText('Estancia La Ilusión')).toBeInTheDocument();
    expect(screen.getByText('3415551234')).toBeInTheDocument();
    expect(screen.getByText('Ruta 11 Km 50')).toBeInTheDocument();

    expect(screen.getByText('Agropecuaria El Ombú')).toBeInTheDocument();
    expect(screen.getByText('3419998877')).toBeInTheDocument();
    expect(screen.getByText('Ruta 9 Km 200')).toBeInTheDocument();

    // Select a client
    fireEvent.click(screen.getByText('Estancia La Ilusión'));
    expect(mockOnSelectCliente).toHaveBeenCalledWith(mockClientes[0]);

    // Click "Dar de alta" button
    const altaButton = screen.getByRole('button', { name: /dar de alta/i });
    fireEvent.click(altaButton);
    expect(mockOnNuevoCliente).toHaveBeenCalledTimes(1);
  });

  it('shows error state when apiFetch fails', async () => {
    vi.mocked(client.apiFetch).mockRejectedValueOnce(new Error('Network error'));

    render(
      <ClienteList
        onSelectCliente={mockOnSelectCliente}
        onNuevoCliente={mockOnNuevoCliente}
      />
    );

    expect(
      await screen.findByText('No se pudo conectar. Revisá tu conexión a internet.')
    ).toBeInTheDocument();
  });

  it('re-fetches clients when clicking Reintentar in error state', async () => {
    vi.mocked(client.apiFetch)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce([
        {
          id: '1',
          nombreRazonSocial: 'Estancia La Paz',
          telefono: '123456',
          direccion: 'Ruta 1',
        },
      ]);

    render(
      <ClienteList
        onSelectCliente={mockOnSelectCliente}
        onNuevoCliente={mockOnNuevoCliente}
      />
    );

    expect(
      await screen.findByText('No se pudo conectar. Revisá tu conexión a internet.')
    ).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /reintentar/i });
    fireEvent.click(retryButton);

    expect(await screen.findByText('Estancia La Paz')).toBeInTheDocument();
    expect(client.apiFetch).toHaveBeenCalledTimes(2);
  });
});
