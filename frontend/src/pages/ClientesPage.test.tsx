import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientesPage } from './ClientesPage';
import * as client from '../api/client';

vi.mock('../api/client', () => ({
  apiFetch: vi.fn().mockResolvedValue([]),
}));

describe('ClientesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders defensive message and allows returning to list when vista is detalle but selectedCliente is null', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue([]);
    render(<ClientesPage initialVista="detalle" initialSelectedCliente={null} />);

    expect(
      screen.getByText('No hay ningún cliente seleccionado. Volvé a la lista.')
    ).toBeInTheDocument();

    const btnVolver = screen.getByRole('button', { name: /volver/i });
    expect(btnVolver).toBeInTheDocument();

    fireEvent.click(btnVolver);

    expect(
      screen.queryByText('No hay ningún cliente seleccionado. Volvé a la lista.')
    ).not.toBeInTheDocument();

    expect(
      await screen.findByText("No hay clientes todavía. Tocá 'Dar de alta' para agregar el primero.")
    ).toBeInTheDocument();
  });

  it('renders ClienteForm when initialVista is alta and returns to lista on Cancel', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue([]);
    render(<ClientesPage initialVista="alta" />);

    expect(screen.getByRole('heading', { level: 2, name: 'Nuevo Cliente' })).toBeInTheDocument();

    const btnCancelar = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(btnCancelar);

    expect(screen.queryByRole('heading', { level: 2, name: 'Nuevo Cliente' })).not.toBeInTheDocument();
    expect(
      await screen.findByText("No hay clientes todavía. Tocá 'Dar de alta' para agregar el primero.")
    ).toBeInTheDocument();
  });

  it('transitions to detalle when ClienteForm successfully creates a client', async () => {
    const nuevo = {
      id: 'c-created-1',
      nombreRazonSocial: 'Estancia Creada S.A.',
      telefono: '3415554321',
      direccion: 'Ruta 33 Km 50',
    };

    vi.mocked(client.apiFetch).mockResolvedValueOnce(nuevo);

    render(<ClientesPage initialVista="alta" />);

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: 'Estancia Creada S.A.' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '3415554321' },
    });
    fireEvent.change(screen.getByLabelText(/dirección \*/i), {
      target: { value: 'Ruta 33 Km 50' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar cliente/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Estancia Creada S.A.' })).toBeInTheDocument();
    });
    expect(screen.getByText('3415554321')).toBeInTheDocument();
    expect(screen.getByText('Ruta 33 Km 50')).toBeInTheDocument();
  });

  it('navigates from lista to alta when clicking "Dar de alta"', async () => {
    vi.mocked(client.apiFetch).mockResolvedValueOnce([]);

    render(<ClientesPage initialVista="lista" />);

    const btnAlta = await screen.findByRole('button', { name: /dar de alta/i });
    fireEvent.click(btnAlta);

    expect(screen.getByRole('heading', { level: 2, name: 'Nuevo Cliente' })).toBeInTheDocument();
  });
});
