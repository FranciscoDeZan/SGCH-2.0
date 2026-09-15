import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClientesPage } from './ClientesPage';

vi.mock('../api/client', () => ({
  apiFetch: vi.fn().mockResolvedValue([]),
}));

describe('ClientesPage', () => {
  it('renders defensive message and allows returning to list when vista is detalle but selectedCliente is null', async () => {
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
});
