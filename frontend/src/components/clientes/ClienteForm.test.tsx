import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClienteForm } from './ClienteForm';
import * as client from '../../api/client';
import { ApiError } from '../../api/client';
import type { Cliente } from '../../types/cliente';

vi.mock('../../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/client')>();
  return {
    ...actual,
    apiFetch: vi.fn(),
  };
});

describe('ClienteForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header "Nuevo Cliente" by default and all required and optional fields', () => {
    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Nuevo Cliente' })).toBeInTheDocument();

    expect(screen.getByLabelText(/nombre \/ razón social \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/latitud/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/longitud/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/calificación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo de hacienda/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/formas de pago preferidas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/observaciones/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de última operación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de último contacto/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar cliente/i })).toBeInTheDocument();
  });

  it('renders header "Editar Cliente" and populates initial values when initialData with id is provided', () => {
    const initialData: Cliente = {
      id: 'c123',
      nombreRazonSocial: 'Estancia La Campana',
      telefono: '3415559876',
      email: 'lacampana@campo.com',
      direccion: 'Ruta 33 Km 12',
      latitud: -33.1,
      longitud: -61.2,
      calificacion: 'A',
      tipoHacienda: 'Cría',
      formasPagoPreferidas: 'Cheque 30 días',
      observaciones: 'Pago puntual',
      fechaUltimaOperacion: '2026-01-15',
      fechaUltimoContacto: '2026-02-10',
    };

    render(
      <ClienteForm
        initialData={initialData}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Editar Cliente' })).toBeInTheDocument();

    expect(screen.getByLabelText(/nombre \/ razón social \*/i)).toHaveValue('Estancia La Campana');
    expect(screen.getByLabelText(/teléfono \*/i)).toHaveValue('3415559876');
    expect(screen.getByLabelText(/dirección \*/i)).toHaveValue('Ruta 33 Km 12');
    expect(screen.getByLabelText(/^email/i)).toHaveValue('lacampana@campo.com');
    expect(screen.getByLabelText(/latitud/i)).toHaveValue(-33.1);
    expect(screen.getByLabelText(/longitud/i)).toHaveValue(-61.2);
    expect(screen.getByLabelText(/calificación/i)).toHaveValue('A');
    expect(screen.getByLabelText(/tipo de hacienda/i)).toHaveValue('Cría');
    expect(screen.getByLabelText(/formas de pago preferidas/i)).toHaveValue('Cheque 30 días');
    expect(screen.getByLabelText(/observaciones/i)).toHaveValue('Pago puntual');
    expect(screen.getByLabelText(/fecha de última operación/i)).toHaveValue('2026-01-15');
    expect(screen.getByLabelText(/fecha de último contacto/i)).toHaveValue('2026-02-10');
  });

  it('submits form with initialData using PUT /clientes/{id} and invokes onSuccess', async () => {
    const existingCliente: Cliente = {
      id: 'c123',
      nombreRazonSocial: 'Estancia La Campana',
      telefono: '3415559876',
      direccion: 'Ruta 33 Km 12',
      email: 'lacampana@campo.com',
      latitud: -33.1,
      longitud: -61.2,
      calificacion: 'A',
      tipoHacienda: 'Cría',
      formasPagoPreferidas: 'Cheque 30 días',
      observaciones: 'Pago puntual',
      fechaUltimaOperacion: '2026-01-15',
      fechaUltimoContacto: '2026-02-10',
    };

    const updatedCliente: Cliente = {
      ...existingCliente,
      nombreRazonSocial: 'Estancia La Campana Renovada',
      telefono: '3415550000',
    };

    vi.mocked(client.apiFetch).mockResolvedValueOnce(updatedCliente);

    render(
      <ClienteForm
        initialData={existingCliente}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: '  Estancia La Campana Renovada  ' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '  3415550000  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar cliente/i }));

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledTimes(1);
    });

    expect(client.apiFetch).toHaveBeenCalledWith('/clientes/c123', {
      method: 'PUT',
      body: JSON.stringify({
        id: 'c123',
        nombreRazonSocial: 'Estancia La Campana Renovada',
        telefono: '3415550000',
        direccion: 'Ruta 33 Km 12',
        email: 'lacampana@campo.com',
        latitud: -33.1,
        longitud: -61.2,
        calificacion: 'A',
        tipoHacienda: 'Cría',
        formasPagoPreferidas: 'Cheque 30 días',
        observaciones: 'Pago puntual',
        fechaUltimaOperacion: '2026-01-15',
        fechaUltimoContacto: '2026-02-10',
      }),
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(updatedCliente);
  });

  it('calls onCancel when clicking "Cancelar"', () => {
    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('validates required fields and prevents API call when empty or whitespace only', async () => {
    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /guardar cliente/i }));

    expect(client.apiFetch).not.toHaveBeenCalled();
    expect(screen.getByText('El nombre o razón social es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('El teléfono es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('La dirección es obligatoria.')).toBeInTheDocument();

    // Fill with whitespace only
    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: '   ' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '   ' },
    });
    fireEvent.change(screen.getByLabelText(/dirección \*/i), {
      target: { value: '   ' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar cliente/i }));
    expect(client.apiFetch).not.toHaveBeenCalled();
  });

  it('clears field-specific error when user types into that field', () => {
    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /guardar cliente/i }));
    expect(screen.getByText('El nombre o razón social es obligatorio.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: 'Agro Litoral' },
    });
    expect(screen.queryByText('El nombre o razón social es obligatorio.')).not.toBeInTheDocument();
  });

  it('submits form successfully with all fields and calls onSuccess with response', async () => {
    const createdCliente: Cliente = {
      id: 'c999',
      nombreRazonSocial: 'Agro Litoral',
      telefono: '3415550000',
      direccion: 'Ruta 11 Km 80',
      email: 'contacto@agrolitoral.com',
      latitud: -32.5,
      longitud: -60.8,
      calificacion: 'B',
      tipoHacienda: 'Invernada',
      formasPagoPreferidas: 'Transferencia',
      observaciones: 'Buenas referencias',
      fechaUltimaOperacion: '2026-03-01',
      fechaUltimoContacto: '2026-03-10',
    };

    vi.mocked(client.apiFetch).mockResolvedValueOnce(createdCliente);

    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: '  Agro Litoral  ' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '  3415550000  ' },
    });
    fireEvent.change(screen.getByLabelText(/dirección \*/i), {
      target: { value: '  Ruta 11 Km 80  ' },
    });
    fireEvent.change(screen.getByLabelText(/^email/i), {
      target: { value: '  contacto@agrolitoral.com  ' },
    });
    fireEvent.change(screen.getByLabelText(/latitud/i), {
      target: { value: '-32.5' },
    });
    fireEvent.change(screen.getByLabelText(/longitud/i), {
      target: { value: '-60.8' },
    });
    fireEvent.change(screen.getByLabelText(/calificación/i), {
      target: { value: 'B' },
    });
    fireEvent.change(screen.getByLabelText(/tipo de hacienda/i), {
      target: { value: '  Invernada  ' },
    });
    fireEvent.change(screen.getByLabelText(/formas de pago preferidas/i), {
      target: { value: '  Transferencia  ' },
    });
    fireEvent.change(screen.getByLabelText(/observaciones/i), {
      target: { value: '  Buenas referencias  ' },
    });
    fireEvent.change(screen.getByLabelText(/fecha de última operación/i), {
      target: { value: '2026-03-01' },
    });
    fireEvent.change(screen.getByLabelText(/fecha de último contacto/i), {
      target: { value: '2026-03-10' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar cliente/i }));

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledTimes(1);
    });

    expect(client.apiFetch).toHaveBeenCalledWith('/clientes', {
      method: 'POST',
      body: JSON.stringify({
        nombreRazonSocial: 'Agro Litoral',
        telefono: '3415550000',
        direccion: 'Ruta 11 Km 80',
        email: 'contacto@agrolitoral.com',
        latitud: -32.5,
        longitud: -60.8,
        calificacion: 'B',
        tipoHacienda: 'Invernada',
        formasPagoPreferidas: 'Transferencia',
        observaciones: 'Buenas referencias',
        fechaUltimaOperacion: '2026-03-01',
        fechaUltimoContacto: '2026-03-10',
      }),
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(createdCliente);
  });

  it('submits form with null numeric fields and undefined/null empty strings', async () => {
    const createdCliente: Cliente = {
      id: 'c888',
      nombreRazonSocial: 'Campo Simple',
      telefono: '12345678',
      direccion: 'Camino Rural s/n',
    };

    vi.mocked(client.apiFetch).mockResolvedValueOnce(createdCliente);

    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: 'Campo Simple' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '12345678' },
    });
    fireEvent.change(screen.getByLabelText(/dirección \*/i), {
      target: { value: 'Camino Rural s/n' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar cliente/i }));

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledTimes(1);
    });

    expect(client.apiFetch).toHaveBeenCalledWith('/clientes', {
      method: 'POST',
      body: JSON.stringify({
        nombreRazonSocial: 'Campo Simple',
        telefono: '12345678',
        direccion: 'Camino Rural s/n',
        email: undefined,
        latitud: undefined,
        longitud: undefined,
        calificacion: undefined,
        tipoHacienda: undefined,
        formasPagoPreferidas: undefined,
        observaciones: undefined,
        fechaUltimaOperacion: null,
        fechaUltimoContacto: null,
      }),
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(createdCliente);
  });

  it('handles ApiError with detail message, keeps user input intact, and shows Reintentar button', async () => {
    const error = new ApiError(400, 'Bad Request', {
      detail: 'El teléfono ya está registrado.',
    });
    vi.mocked(client.apiFetch).mockRejectedValueOnce(error);

    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: 'Estancia Sol' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '3415551111' },
    });
    fireEvent.change(screen.getByLabelText(/dirección \*/i), {
      target: { value: 'Ruta 9 Km 5' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar cliente/i }));

    expect(await screen.findByText('El teléfono ya está registrado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();

    // User input is preserved!
    expect(screen.getByLabelText(/nombre \/ razón social \*/i)).toHaveValue('Estancia Sol');
    expect(screen.getByLabelText(/teléfono \*/i)).toHaveValue('3415551111');
    expect(screen.getByLabelText(/dirección \*/i)).toHaveValue('Ruta 9 Km 5');
  });

  it('handles ApiError with field-specific errores and maps them under fields', async () => {
    const error = new ApiError(422, 'Unprocessable Entity', {
      errores: {
        telefono: 'El formato del teléfono es inválido',
        email: 'El email no tiene un formato válido',
      },
    });
    vi.mocked(client.apiFetch).mockRejectedValueOnce(error);

    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: 'Estancia Sol' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: 'invalid-tel' },
    });
    fireEvent.change(screen.getByLabelText(/dirección \*/i), {
      target: { value: 'Ruta 9 Km 5' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar cliente/i }));

    expect(await screen.findByText('El formato del teléfono es inválido')).toBeInTheDocument();
    expect(screen.getByText('El email no tiene un formato válido')).toBeInTheDocument();
  });

  it('falls back to default message "No se pudo guardar. Reintentá en un momento." on generic error', async () => {
    vi.mocked(client.apiFetch).mockRejectedValueOnce(new Error('Network failure'));

    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: 'Estancia Sol' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '3415551111' },
    });
    fireEvent.change(screen.getByLabelText(/dirección \*/i), {
      target: { value: 'Ruta 9 Km 5' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar cliente/i }));

    expect(
      await screen.findByText('No se pudo guardar. Reintentá en un momento.')
    ).toBeInTheDocument();
  });

  it('re-executes submission with current form data when clicking "Reintentar"', async () => {
    vi.mocked(client.apiFetch)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        id: 'c555',
        nombreRazonSocial: 'Estancia Sol',
        telefono: '3415551111',
        direccion: 'Ruta 9 Km 5',
      });

    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: 'Estancia Sol' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '3415551111' },
    });
    fireEvent.change(screen.getByLabelText(/dirección \*/i), {
      target: { value: 'Ruta 9 Km 5' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar cliente/i }));

    expect(
      await screen.findByText('No se pudo guardar. Reintentá en un momento.')
    ).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /reintentar/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledTimes(2);
    });

    expect(mockOnSuccess).toHaveBeenCalledWith({
      id: 'c555',
      nombreRazonSocial: 'Estancia Sol',
      telefono: '3415551111',
      direccion: 'Ruta 9 Km 5',
    });
  });

  it('disables "Guardar Cliente" button while submitting', async () => {
    let resolvePromise: (val: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(client.apiFetch).mockReturnValueOnce(promise as any);

    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: 'Estancia Sol' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '3415551111' },
    });
    fireEvent.change(screen.getByLabelText(/dirección \*/i), {
      target: { value: 'Ruta 9 Km 5' },
    });

    const submitBtn = screen.getByRole('button', { name: /guardar cliente/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();

    resolvePromise!({ id: 'done' });
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('prevents double submission on rapid clicks', async () => {
    let resolvePromise: (val: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(client.apiFetch).mockReturnValueOnce(promise as any);

    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: 'Estancia Sol' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '3415551111' },
    });
    fireEvent.change(screen.getByLabelText(/dirección \*/i), {
      target: { value: 'Ruta 9 Km 5' },
    });

    const submitBtn = screen.getByRole('button', { name: /guardar cliente/i });
    fireEvent.click(submitBtn);
    fireEvent.click(submitBtn);

    expect(client.apiFetch).toHaveBeenCalledTimes(1);

    resolvePromise!({ id: 'done' });
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('disables Cancelar button and displays "Guardando..." on submit button during submission', async () => {
    let resolvePromise: (val: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(client.apiFetch).mockReturnValueOnce(promise as any);

    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: 'Estancia Sol' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '3415551111' },
    });
    fireEvent.change(screen.getByLabelText(/dirección \*/i), {
      target: { value: 'Ruta 9 Km 5' },
    });

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    const submitBtn = screen.getByRole('button', { name: /guardar cliente/i });
    expect(cancelBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    expect(cancelBtn).toBeDisabled();
    expect(screen.getByRole('button', { name: /guardando\.\.\./i })).toBeInTheDocument();

    resolvePromise!({ id: 'done' });
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('omits latitud and longitud when inputs are empty or whitespace', async () => {
    vi.mocked(client.apiFetch).mockResolvedValueOnce({ id: 'new-id' });

    render(<ClienteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/nombre \/ razón social \*/i), {
      target: { value: 'Estancia Sol' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '3415551111' },
    });
    fireEvent.change(screen.getByLabelText(/dirección \*/i), {
      target: { value: 'Ruta 9 Km 5' },
    });
    fireEvent.change(screen.getByLabelText(/latitud/i), {
      target: { value: '   ' },
    });
    fireEvent.change(screen.getByLabelText(/longitud/i), {
      target: { value: '' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar cliente/i }));

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledTimes(1);
    });

    const callArgs = vi.mocked(client.apiFetch).mock.calls[0];
    const sentBody = JSON.parse(callArgs[1]?.body as string);
    expect(sentBody.latitud).toBeUndefined();
    expect(sentBody.longitud).toBeUndefined();
  });
});
