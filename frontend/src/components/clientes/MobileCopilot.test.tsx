import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { MobileCopilot } from './MobileCopilot';
import * as client from '../../api/client';
import type { Cliente } from '../../types/cliente';

vi.mock('../../api/client', () => ({
  apiFetch: vi.fn(),
}));

class MockSpeechRecognition {
  lang = '';
  onresult: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  onend: (() => void) | null = null;
  start() {
    if (this.onresult) {
      this.onresult({
        results: [[{ transcript: 'vende 50 novillos' }]],
      });
    }
  }
  stop() {}
}

describe('MobileCopilot', () => {
  const originalSpeechRecognition = (window as any).SpeechRecognition;
  const originalWebkitSpeechRecognition = (window as any).webkitSpeechRecognition;

  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).SpeechRecognition = MockSpeechRecognition;
    (window as any).webkitSpeechRecognition = undefined;
  });

  afterAll(() => {
    (window as any).SpeechRecognition = originalSpeechRecognition;
    (window as any).webkitSpeechRecognition = originalWebkitSpeechRecognition;
  });

  // 1. Sin cliente: Botones de acción y micrófono deshabilitados con mensaje "Tocá un cliente primero"
  it('shows helper text "Tocá un cliente primero" and disables action buttons and mic when no client is selected', async () => {
    const mockClientes: Cliente[] = [
      {
        id: 'c1',
        nombreRazonSocial: 'Estancia La Norteña',
        telefono: '3415551111',
        direccion: 'Ruta 34 Km 10',
      },
    ];
    vi.mocked(client.apiFetch).mockResolvedValueOnce(mockClientes);

    render(<MobileCopilot />);

    expect(await screen.findByText('Estancia La Norteña')).toBeInTheDocument();
    expect(screen.getByText('Tocá un cliente primero')).toBeInTheDocument();

    const micBtn = screen.getByRole('button', { name: /micrófono/i });
    const ofreceBtn = screen.getByRole('button', { name: /ofrece/i });
    const buscaBtn = screen.getByRole('button', { name: /busca/i });
    const noAtendioBtn = screen.getByRole('button', { name: /no atendió/i });

    expect(micBtn).toBeDisabled();
    expect(ofreceBtn).toBeDisabled();
    expect(buscaBtn).toBeDisabled();
    expect(noAtendioBtn).toBeDisabled();
  });

  // 2. Con cliente + dictado OK: Mockear SpeechRecognition class, simular dictado, click en "Ofrece" o "Busca" dispara PUT /clientes/{id} con [Ofrece] o [Busca] anexado a observaciones y llama a onActionSuccess
  it('simulates speech dictation with active client, appends [Ofrece] to observaciones on PUT, and calls onActionSuccess', async () => {
    const mockClientes: Cliente[] = [
      {
        id: 'c1',
        nombreRazonSocial: 'Estancia La Norteña',
        telefono: '3415551111',
        direccion: 'Ruta 34 Km 10',
        observaciones: 'Cliente frecuente',
      },
    ];
    const mockOnSuccess = vi.fn();
    vi.mocked(client.apiFetch)
      .mockResolvedValueOnce(mockClientes) // Mount GET
      .mockResolvedValueOnce({ ...mockClientes[0], observaciones: 'Cliente frecuente\n[Ofrece] vende 50 novillos' }) // PUT
      .mockResolvedValueOnce(mockClientes); // Refetch GET

    render(<MobileCopilot onActionSuccess={mockOnSuccess} />);

    const clientCard = await screen.findByText('Estancia La Norteña');
    fireEvent.click(clientCard);

    // After selecting, helper text should disappear and mic should be enabled
    expect(screen.queryByText('Tocá un cliente primero')).not.toBeInTheDocument();
    const micBtn = screen.getByRole('button', { name: /micrófono/i });
    expect(micBtn).not.toBeDisabled();

    // Click mic to start dictation
    fireEvent.click(micBtn);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('vende 50 novillos');

    // Click "Ofrece"
    const ofreceBtn = screen.getByRole('button', { name: /ofrece/i });
    expect(ofreceBtn).not.toBeDisabled();
    fireEvent.click(ofreceBtn);

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledWith(
        '/clientes/c1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            ...mockClientes[0],
            observaciones: 'Cliente frecuente\n[Ofrece] vende 50 novillos',
          }),
        })
      );
    });

    expect(mockOnSuccess).toHaveBeenCalledWith('✅ Registrado');
    expect(textarea.value).toBe('');
    expect(screen.getByText('Tocá un cliente primero')).toBeInTheDocument();
  });

  // 3. "No Atendió": Con cliente activo, click en "No Atendió" dispara PUT con fechaUltimoContacto y [No atendió] anexado
  it('dispatches PUT with fechaUltimoContacto and [No atendió] in observaciones when clicking "No Atendió"', async () => {
    const mockClientes: Cliente[] = [
      {
        id: 'c2',
        nombreRazonSocial: 'Agropecuaria El Ombú',
        telefono: '3419998877',
        direccion: 'Ruta 9 Km 200',
      },
    ];
    const mockOnSuccess = vi.fn();
    vi.mocked(client.apiFetch)
      .mockResolvedValueOnce(mockClientes)
      .mockResolvedValueOnce({ ...mockClientes[0] })
      .mockResolvedValueOnce(mockClientes);

    render(<MobileCopilot onActionSuccess={mockOnSuccess} />);

    const clientCard = await screen.findByText('Agropecuaria El Ombú');
    fireEvent.click(clientCard);

    const noAtendioBtn = screen.getByRole('button', { name: /no atendió/i });
    fireEvent.click(noAtendioBtn);

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledWith(
        '/clientes/c2',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringMatching(/"fechaUltimoContacto":\s*"[^"]+".*"\[No atendió\]/),
        })
      );
    });

    const putCall = vi.mocked(client.apiFetch).mock.calls.find(
      (c) => c[0] === '/clientes/c2' && c[1]?.method === 'PUT'
    );
    expect(putCall).toBeDefined();
    const sentBody = JSON.parse(putCall![1]!.body as string);
    expect(sentBody.fechaUltimoContacto).toBeTruthy();
    expect(sentBody.observaciones).toMatch(/\[No atendió\]/);
    expect(mockOnSuccess).toHaveBeenCalledWith('✅ Registrado');
  });

  // 4. Fallback: window.SpeechRecognition y webkitSpeechRecognition undefined -> mensaje "Tu navegador no soporta dictado. Escribí manualmente." y botón de micrófono deshabilitado
  it('shows unsupported browser message and disables microphone when SpeechRecognition is undefined', async () => {
    (window as any).SpeechRecognition = undefined;
    (window as any).webkitSpeechRecognition = undefined;

    const mockClientes: Cliente[] = [
      {
        id: 'c1',
        nombreRazonSocial: 'Estancia La Norteña',
        telefono: '3415551111',
        direccion: 'Ruta 34 Km 10',
      },
    ];
    vi.mocked(client.apiFetch).mockResolvedValueOnce(mockClientes);

    render(<MobileCopilot />);

    expect(await screen.findByText('Estancia La Norteña')).toBeInTheDocument();
    expect(
      screen.getByText('Tu navegador no soporta dictado. Escribí manualmente.')
    ).toBeInTheDocument();

    const micBtn = screen.getByRole('button', { name: /micrófono/i });
    expect(micBtn).toBeDisabled();
  });

  // 5. Error en PUT: PUT rechaza -> texto persiste en textarea, cliente sigue seleccionado, mensaje "No se pudo guardar. Reintentá en un momento." visible, y botón "Reintentar" presente
  it('preserves dictation text and selected client on PUT failure, shows error banner and Reintentar button', async () => {
    const mockClientes: Cliente[] = [
      {
        id: 'c1',
        nombreRazonSocial: 'Estancia La Norteña',
        telefono: '3415551111',
        direccion: 'Ruta 34 Km 10',
      },
    ];
    vi.mocked(client.apiFetch)
      .mockResolvedValueOnce(mockClientes) // Mount GET
      .mockRejectedValueOnce(new Error('Network error')) // PUT fail
      .mockResolvedValueOnce({ ...mockClientes[0] }) // Retry PUT success
      .mockResolvedValueOnce(mockClientes); // Refetch GET

    render(<MobileCopilot />);

    const clientCard = await screen.findByText('Estancia La Norteña');
    fireEvent.click(clientCard);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'busca 30 vacas preñadas' } });

    const buscaBtn = screen.getByRole('button', { name: /busca/i });
    fireEvent.click(buscaBtn);

    expect(
      await screen.findByText('No se pudo guardar. Reintentá en un momento.')
    ).toBeInTheDocument();

    // Textarea still has the text
    expect(textarea.value).toBe('busca 30 vacas preñadas');

    // Client is STILL selected (no "Tocá un cliente primero")
    expect(screen.queryByText('Tocá un cliente primero')).not.toBeInTheDocument();

    // Reintentar button is present
    const retryBtn = screen.getByRole('button', { name: /reintentar/i });
    expect(retryBtn).toBeInTheDocument();

    // Click Reintentar -> succeeds
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.queryByText('No se pudo guardar. Reintentá en un momento.')).not.toBeInTheDocument();
    });
    expect(textarea.value).toBe('');
    expect(screen.getByText('Tocá un cliente primero')).toBeInTheDocument();
  });
});
