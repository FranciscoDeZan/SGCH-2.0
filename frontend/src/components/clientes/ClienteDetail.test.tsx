import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClienteDetail } from './ClienteDetail';
import type { Cliente } from '../../types/cliente';

describe('ClienteDetail', () => {
  const mockClienteCompleto: Cliente = {
    id: 'c1',
    nombreRazonSocial: 'Estancia Don Pedro S.A.',
    telefono: '+54 9 341 555-4321',
    email: 'contacto@donpedro.com',
    direccion: 'Ruta Provincial 34, Km 72, Santa Fe',
    latitud: -32.95,
    longitud: -60.65,
    calificacion: 'A',
    tipoHacienda: 'Invernada / Engorde',
    formasPagoPreferidas: 'Cheque 30-60 días, Transferencia',
    observaciones: 'Cliente de confianza desde 2018. Cumple plazos.',
    fechaUltimaOperacion: '2026-02-20',
    fechaUltimoContacto: '2026-03-10',
  };

  const mockOnVolver = vi.fn();
  const mockOnEditar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all client fields (name, phone, address, qualification, notes, etc.)', () => {
    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    // Name
    expect(screen.getByText('Estancia Don Pedro S.A.')).toBeInTheDocument();
    // Calificacion badge
    expect(screen.getByText(/Cat\. A|Calificación:? A/i)).toBeInTheDocument();
    // Phone
    expect(screen.getByText('+54 9 341 555-4321')).toBeInTheDocument();
    // Email
    expect(screen.getByText('contacto@donpedro.com')).toBeInTheDocument();
    // Address
    expect(screen.getByText('Ruta Provincial 34, Km 72, Santa Fe')).toBeInTheDocument();
    // Lat / Long
    expect(screen.getByText(/-32\.95/)).toBeInTheDocument();
    expect(screen.getByText(/-60\.65/)).toBeInTheDocument();
    // Tipo hacienda
    expect(screen.getByText('Invernada / Engorde')).toBeInTheDocument();
    // Formas de pago
    expect(screen.getByText('Cheque 30-60 días, Transferencia')).toBeInTheDocument();
    // Observaciones
    expect(screen.getByText('Cliente de confianza desde 2018. Cumple plazos.')).toBeInTheDocument();
    // Fechas
    expect(screen.getByText('2026-02-20')).toBeInTheDocument();
    expect(screen.getByText('2026-03-10')).toBeInTheDocument();
  });

  it('renders button "Registrar Operación" as disabled with title="Próximamente"', () => {
    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    const btnOperacion = screen.getByRole('button', { name: /registrar operación/i });
    expect(btnOperacion).toBeInTheDocument();
    expect(btnOperacion).toBeDisabled();
    expect(btnOperacion).toHaveAttribute('title', 'Próximamente');
  });

  it('renders placeholder text "El historial de operaciones va a estar disponible en la próxima actualización."', () => {
    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    expect(
      screen.getByText('El historial de operaciones va a estar disponible en la próxima actualización.')
    ).toBeInTheDocument();
  });

  it('invokes onVolver when clicking "Volver"', () => {
    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    const btnVolver = screen.getByRole('button', { name: /volver/i });
    fireEvent.click(btnVolver);
    expect(mockOnVolver).toHaveBeenCalledTimes(1);
  });

  it('invokes onEditar when clicking "Editar Cliente"', () => {
    render(
      <ClienteDetail
        cliente={mockClienteCompleto}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    const btnEditar = screen.getByRole('button', { name: /editar cliente/i });
    fireEvent.click(btnEditar);
    expect(mockOnEditar).toHaveBeenCalledTimes(1);
  });

  it('renders correctly with minimal client data (handles empty optional fields)', () => {
    const clienteMinimo: Cliente = {
      nombreRazonSocial: 'Juan Pérez',
      telefono: '11223344',
      direccion: 'Calle Falsa 123',
    };

    render(
      <ClienteDetail
        cliente={clienteMinimo}
        onVolver={mockOnVolver}
        onEditar={mockOnEditar}
      />
    );

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('11223344')).toBeInTheDocument();
    expect(screen.getByText('Calle Falsa 123')).toBeInTheDocument();
  });
});
