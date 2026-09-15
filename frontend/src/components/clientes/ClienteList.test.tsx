import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClienteList } from './ClienteList';
import type { Cliente } from '../../types/cliente';

describe('ClienteList', () => {
  const mockOnSelectCliente = vi.fn();
  const mockOnNuevoCliente = vi.fn();
  const mockOnRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially with spinner and loading message', () => {
    render(
      <ClienteList
        clientes={[]}
        loading={true}
        onSelectCliente={mockOnSelectCliente}
        onNuevoCliente={mockOnNuevoCliente}
      />
    );

    expect(screen.getByText('Cargando clientes...')).toBeInTheDocument();
  });

  it('shows empty state when no clients are returned', () => {
    render(
      <ClienteList
        clientes={[]}
        loading={false}
        onSelectCliente={mockOnSelectCliente}
        onNuevoCliente={mockOnNuevoCliente}
      />
    );

    expect(
      screen.getByText("No hay clientes todavía. Tocá 'Dar de alta' para agregar el primero.")
    ).toBeInTheDocument();

    const altaButton = screen.getByRole('button', { name: /dar de alta/i });
    expect(altaButton).toBeInTheDocument();
    fireEvent.click(altaButton);
    expect(mockOnNuevoCliente).toHaveBeenCalledTimes(1);
  });

  it('shows data state with client list and allows selection and creating new client', () => {
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

    render(
      <ClienteList
        clientes={mockClientes}
        loading={false}
        onSelectCliente={mockOnSelectCliente}
        onNuevoCliente={mockOnNuevoCliente}
      />
    );

    expect(screen.getByText('Estancia La Ilusión')).toBeInTheDocument();
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

  it('shows error state when error is true', () => {
    render(
      <ClienteList
        clientes={[]}
        loading={false}
        error={true}
        onSelectCliente={mockOnSelectCliente}
        onNuevoCliente={mockOnNuevoCliente}
      />
    );

    expect(
      screen.getByText('No se pudo conectar. Revisá tu conexión a internet.')
    ).toBeInTheDocument();
  });

  it('re-fetches clients when clicking Reintentar in error state', () => {
    render(
      <ClienteList
        clientes={[]}
        loading={false}
        error={true}
        onSelectCliente={mockOnSelectCliente}
        onNuevoCliente={mockOnNuevoCliente}
        onRefetch={mockOnRefetch}
      />
    );

    expect(
      screen.getByText('No se pudo conectar. Revisá tu conexión a internet.')
    ).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /reintentar/i });
    fireEvent.click(retryButton);

    expect(mockOnRefetch).toHaveBeenCalledTimes(1);
  });
});
