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
  stop = vi.fn();
  abort = vi.fn();
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
  it('shows helper text "Tocá un cliente primero" and disables action buttons and mic when no client is selected', () => {
    const mockClientes: Cliente[] = [
      {
        id: 'c1',
        nombreRazonSocial: 'Estancia La Norteña',
        telefono: '3415551111',
        direccion: 'Ruta 34 Km 10',
      },
    ];

    render(<MobileCopilot clientes={mockClientes} />);

    expect(screen.getByText('Estancia La Norteña')).toBeInTheDocument();
    expect(screen.getByText('Tocá un cliente primero')).toBeInTheDocument();

    const clientBtn = screen.getByRole('button', { name: /estancia la norteña/i });
    expect(clientBtn).toHaveAttribute('aria-pressed', 'false');

    const micBtn = screen.getByRole('button', { name: /empezar dictado/i });
    const ofreceBtn = screen.getByRole('button', { name: /ofrece/i });
    const buscaBtn = screen.getByRole('button', { name: /busca/i });
    const noAtendioBtn = screen.getByRole('button', { name: /no atendió/i });

    expect(micBtn).toBeDisabled();
    expect(ofreceBtn).toBeDisabled();
    expect(buscaBtn).toBeDisabled();
    expect(noAtendioBtn).toBeDisabled();
  });

  // 2. Con cliente + dictado OK: Mockear SpeechRecognition class, simular dictado, click en "Ofrece" o "Busca" dispara PUT /clientes/{id} con [Ofrece] o [Busca] anexado a observaciones y llama a onActionSuccess
  it('simulates speech dictation with active client, appends [Ofrece] to observaciones on PUT, and calls onActionSuccess and onRefetch', async () => {
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
    const mockOnRefetch = vi.fn();
    vi.mocked(client.apiFetch).mockResolvedValueOnce({
      ...mockClientes[0],
      observaciones: 'Cliente frecuente\n[Ofrece] vende 50 novillos',
    });

    render(
      <MobileCopilot
        clientes={mockClientes}
        onActionSuccess={mockOnSuccess}
        onRefetch={mockOnRefetch}
      />
    );

    const clientCard = screen.getByRole('button', { name: /estancia la norteña/i });
    expect(clientCard).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(clientCard);
    expect(clientCard).toHaveAttribute('aria-pressed', 'true');

    // After selecting, helper text should disappear and mic should be enabled
    expect(screen.queryByText('Tocá un cliente primero')).not.toBeInTheDocument();
    const micBtn = screen.getByRole('button', { name: /empezar dictado/i });
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
    expect(mockOnRefetch).toHaveBeenCalledTimes(1);
    expect(textarea.value).toBe('');
    expect(screen.getByText('Tocá un cliente primero')).toBeInTheDocument();
  });

  // FIX 1: Micrófono toggle + stop()
  it('clicking mic twice toggles off cleanly and calls stop()', () => {
    const stopSpy = vi.fn();
    class SpySpeechRecognition extends MockSpeechRecognition {
      constructor() {
        super();
        this.stop = stopSpy;
      }
    }
    (window as any).SpeechRecognition = SpySpeechRecognition;

    const mockClientes: Cliente[] = [
      {
        id: 'c1',
        nombreRazonSocial: 'Estancia La Norteña',
        telefono: '3415551111',
        direccion: 'Ruta 34 Km 10',
      },
    ];

    render(<MobileCopilot clientes={mockClientes} />);

    // Select client first so mic is enabled
    fireEvent.click(screen.getByText('Estancia La Norteña'));

    const micBtn = screen.getByRole('button', { name: /empezar dictado/i });

    // First click: starts recording
    fireEvent.click(micBtn);
    expect(screen.getByRole('button', { name: /detener dictado/i })).toBeInTheDocument();
    expect(stopSpy).not.toHaveBeenCalled();

    // Second click: stops recording
    fireEvent.click(screen.getByRole('button', { name: /detener dictado/i }));
    expect(stopSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /empezar dictado/i })).toBeInTheDocument();
  });

  // FIX 1: Cleanup useEffect aborts on unmount
  it('aborts active speech recognition on unmount', () => {
    const abortSpy = vi.fn();
    class SpySpeechRecognition extends MockSpeechRecognition {
      constructor() {
        super();
        this.abort = abortSpy;
      }
    }
    (window as any).SpeechRecognition = SpySpeechRecognition;

    const mockClientes: Cliente[] = [
      { id: 'c1', nombreRazonSocial: 'Estancia La Norteña', telefono: '123', direccion: 'Ruta 1' },
    ];

    const { unmount } = render(<MobileCopilot clientes={mockClientes} />);
    fireEvent.click(screen.getByText('Estancia La Norteña'));
    fireEvent.click(screen.getByRole('button', { name: /empezar dictado/i }));

    unmount();
    expect(abortSpy).toHaveBeenCalledTimes(1);
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
    const mockOnRefetch = vi.fn();
    vi.mocked(client.apiFetch).mockResolvedValueOnce({ ...mockClientes[0] });

    render(
      <MobileCopilot
        clientes={mockClientes}
        onActionSuccess={mockOnSuccess}
        onRefetch={mockOnRefetch}
      />
    );

    const clientCard = screen.getByText('Agropecuaria El Ombú');
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
    expect(mockOnRefetch).toHaveBeenCalledTimes(1);
  });

  // FIX 2: "No Atendió" preserva texto dictado
  it('"No Atendió" with dictation text dispatches PUT with both date and text appended', async () => {
    const mockClientes: Cliente[] = [
      {
        id: 'c3',
        nombreRazonSocial: 'Cabaña San José',
        telefono: '3414445566',
        direccion: 'Ruta 18 Km 12',
        observaciones: 'Llamar después de las 18hs',
      },
    ];
    const mockOnSuccess = vi.fn();
    const mockOnRefetch = vi.fn();
    vi.mocked(client.apiFetch).mockResolvedValueOnce({ ...mockClientes[0] });

    render(
      <MobileCopilot
        clientes={mockClientes}
        onActionSuccess={mockOnSuccess}
        onRefetch={mockOnRefetch}
      />
    );

    const clientCard = screen.getByText('Cabaña San José');
    fireEvent.click(clientCard);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'llamó el hijo pidiendo llamar mañana' } });

    const noAtendioBtn = screen.getByRole('button', { name: /no atendió/i });
    fireEvent.click(noAtendioBtn);

    await waitFor(() => {
      expect(client.apiFetch).toHaveBeenCalledWith(
        '/clientes/c3',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    const putCall = vi.mocked(client.apiFetch).mock.calls.find(
      (c) => c[0] === '/clientes/c3' && c[1]?.method === 'PUT'
    );
    expect(putCall).toBeDefined();
    const sentBody = JSON.parse(putCall![1]!.body as string);
    expect(sentBody.fechaUltimoContacto).toBeTruthy();
    expect(sentBody.observaciones).toContain('Llamar después de las 18hs');
    expect(sentBody.observaciones).toContain('[No atendió]');
    expect(sentBody.observaciones).toContain('llamó el hijo pidiendo llamar mañana');
    expect(mockOnSuccess).toHaveBeenCalledWith('✅ Registrado');
    expect(mockOnRefetch).toHaveBeenCalledTimes(1);
    expect(textarea.value).toBe('');
  });

  // 4. Fallback: window.SpeechRecognition y webkitSpeechRecognition undefined -> mensaje "Tu navegador no soporta dictado. Escribí manualmente." y botón de micrófono deshabilitado
  it('shows unsupported browser message and disables microphone when SpeechRecognition is undefined', () => {
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

    render(<MobileCopilot clientes={mockClientes} />);

    expect(screen.getByText('Estancia La Norteña')).toBeInTheDocument();
    expect(
      screen.getByText('Tu navegador no soporta dictado. Escribí manualmente.')
    ).toBeInTheDocument();

    const micBtn = screen.getByRole('button', { name: /empezar dictado/i });
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
    const mockOnRefetch = vi.fn();
    vi.mocked(client.apiFetch)
      .mockRejectedValueOnce(new Error('Network error')) // PUT fail
      .mockResolvedValueOnce({ ...mockClientes[0] }); // Retry PUT success

    render(<MobileCopilot clientes={mockClientes} onRefetch={mockOnRefetch} />);

    const clientCard = screen.getByText('Estancia La Norteña');
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
    expect(mockOnRefetch).toHaveBeenCalledTimes(1);
  });
});
