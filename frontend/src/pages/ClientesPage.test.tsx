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

  it('calls apiFetch("/clientes") only once on initial render of ClientesPage', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue([]);

    render(<ClientesPage initialVista="lista" />);

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledTimes(1);
    });
    expect(client.apiFetch).toHaveBeenCalledWith('/clientes');
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

    vi.mocked(client.apiFetch).mockImplementation(async (_url, options) => {
      if (options?.method === 'POST') {
        return nuevo;
      }
      return [];
    });

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
    vi.mocked(client.apiFetch).mockResolvedValue([]);

    render(<ClientesPage initialVista="lista" />);

    const btnAlta = await screen.findByRole('button', { name: /dar de alta/i });
    fireEvent.click(btnAlta);

    expect(screen.getByRole('heading', { level: 2, name: 'Nuevo Cliente' })).toBeInTheDocument();
  });

  it('renders both MobileCopilot (md:hidden) and ClienteList (hidden md:block) for responsive coexistence in vista lista', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue([]);

    const { container } = render(<ClientesPage initialVista="lista" />);

    expect(await screen.findByRole('heading', { level: 2, name: 'Tareas de Hoy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Clientes' })).toBeInTheDocument();

    const mobileContainer = container.querySelector('.md\\:hidden');
    const desktopContainer = container.querySelector('.hidden.md\\:block');

    expect(mobileContainer).toBeInTheDocument();
    expect(desktopContainer).toBeInTheDocument();
  });

  it('renders defensive message and allows returning to list when vista is edicion but selectedCliente is null', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue([]);
    render(<ClientesPage initialVista="edicion" initialSelectedCliente={null} />);

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledTimes(1);
    });

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

  it('navigates from ClienteDetail to edit form when clicking "Editar Cliente" with pre-populated data', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue([]);
    const clienteMock = {
      id: 'c-edit-1',
      nombreRazonSocial: 'Estancia La Campana',
      telefono: '3415559876',
      direccion: 'Ruta 33 Km 12',
    };

    render(<ClientesPage initialVista="detalle" initialSelectedCliente={clienteMock} />);

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledTimes(1);
    });

    const btnEditar = screen.getByRole('button', { name: /editar cliente/i });
    fireEvent.click(btnEditar);

    expect(screen.getByRole('heading', { level: 2, name: 'Editar Cliente' })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre \/ razón social \*/i)).toHaveValue('Estancia La Campana');
    expect(screen.getByLabelText(/teléfono \*/i)).toHaveValue('3415559876');
    expect(screen.getByLabelText(/dirección \*/i)).toHaveValue('Ruta 33 Km 12');
  });

  it('returns to ClienteDetail when clicking "Cancelar" in edit form', async () => {
    vi.mocked(client.apiFetch).mockResolvedValue([]);
    const clienteMock = {
      id: 'c-edit-1',
      nombreRazonSocial: 'Estancia La Campana',
      telefono: '3415559876',
      direccion: 'Ruta 33 Km 12',
    };

    render(<ClientesPage initialVista="edicion" initialSelectedCliente={clienteMock} />);

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Editar Cliente' })).toBeInTheDocument();

    const btnCancelar = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(btnCancelar);

    expect(screen.getByRole('heading', { level: 2, name: 'Estancia La Campana' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar cliente/i })).toBeInTheDocument();
  });

  it('submits edit form with PUT, refreshes clients, and returns to ClienteDetail with updated data', async () => {
    const clienteMock = {
      id: 'c-edit-1',
      nombreRazonSocial: 'Estancia La Campana',
      telefono: '3415559876',
      direccion: 'Ruta 33 Km 12',
    };

    const updatedMock = {
      ...clienteMock,
      nombreRazonSocial: 'Estancia La Campana Renovada',
      telefono: '3415559999',
    };

    vi.mocked(client.apiFetch).mockImplementation(async (url, options) => {
      if (url === '/clientes/c-edit-1' && options?.method === 'PUT') {
        return updatedMock;
      }
      return [updatedMock];
    });

    render(<ClientesPage initialVista="edicion" initialSelectedCliente={clienteMock} />);

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledWith('/clientes');
    });

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: 'Estancia La Campana Renovada' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '3415559999' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar cliente/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Estancia La Campana Renovada' })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledTimes(3);
    });

    expect(screen.getByText('3415559999')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar cliente/i })).toBeInTheDocument();
  });
});

