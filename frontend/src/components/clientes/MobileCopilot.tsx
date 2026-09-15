import { useState, useEffect, useCallback } from 'react';
import type { Cliente } from '../../types/cliente';
import { apiFetch } from '../../api/client';

export interface MobileCopilotProps {
  onActionSuccess?: (msg: string) => void;
}

export function MobileCopilot({ onActionSuccess }: MobileCopilotProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState<boolean>(true);
  const [activeCliente, setActiveCliente] = useState<Cliente | null>(null);
  const [dictationText, setDictationText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [putError, setPutError] = useState<string | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<(() => Promise<void>) | null>(null);

  const [speechError, setSpeechError] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return 'Tu navegador no soporta dictado. Escribí manualmente.';
    }
    return null;
  });

  const hasSpeechRecognition =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const fetchClientes = useCallback(async () => {
    setLoadingClientes(true);
    try {
      const data = await apiFetch<Cliente[]>('/clientes');
      setClientes(data ?? []);
    } catch {
      // Ignorar o mantener lista previa
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleMicClick = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSpeechError('Tu navegador no soporta dictado. Escribí manualmente.');
      return;
    }
    setSpeechError(null);
    try {
      const rec = new SR();
      rec.lang = 'es-AR';
      setIsRecording(true);
      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setDictationText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      rec.onerror = (e: any) => {
        setSpeechError('Error: ' + e.error);
        setIsRecording(false);
      };
      rec.onend = () => {
        setIsRecording(false);
      };
      rec.start();
    } catch (err: any) {
      setSpeechError('Error: ' + (err.message || 'error desconocido'));
      setIsRecording(false);
    }
  };

  const executeAction = async (payload: Cliente) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setPutError(null);

    try {
      await apiFetch<Cliente>(`/clientes/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setPutError(null);
      setLastFailedAction(null);
      onActionSuccess?.('✅ Registrado');
      setDictationText('');
      setActiveCliente(null);
      await fetchClientes();
    } catch {
      setPutError('No se pudo guardar. Reintentá en un momento.');
      setLastFailedAction(() => () => executeAction(payload));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfrece = () => {
    if (!activeCliente?.id) return;
    const newObservaciones = activeCliente.observaciones
      ? `${activeCliente.observaciones}\n[Ofrece] ${dictationText.trim()}`
      : `[Ofrece] ${dictationText.trim()}`;
    const payload: Cliente = {
      ...activeCliente,
      observaciones: newObservaciones,
    };
    executeAction(payload);
  };

  const handleBusca = () => {
    if (!activeCliente?.id) return;
    const newObservaciones = activeCliente.observaciones
      ? `${activeCliente.observaciones}\n[Busca] ${dictationText.trim()}`
      : `[Busca] ${dictationText.trim()}`;
    const payload: Cliente = {
      ...activeCliente,
      observaciones: newObservaciones,
    };
    executeAction(payload);
  };

  const handleNoAtendio = () => {
    if (!activeCliente?.id) return;
    const dateStr = new Date().toLocaleDateString('es-AR');
    const newObservaciones = activeCliente.observaciones
      ? `${activeCliente.observaciones}\n[No atendió] ${dateStr}`
      : `[No atendió] ${dateStr}`;
    const payload: Cliente = {
      ...activeCliente,
      fechaUltimoContacto: new Date().toISOString(),
      observaciones: newObservaciones,
    };
    executeAction(payload);
  };

  const isActionsDisabled = !activeCliente || isSubmitting;
  const isMicDisabled = !activeCliente || !hasSpeechRecognition || isSubmitting;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-gray-800">Tareas de Hoy</h2>
        {!activeCliente && (
          <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            Tocá un cliente primero
          </span>
        )}
      </div>

      {/* Lista de clientes para seleccionar */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {loadingClientes && clientes.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">Cargando tareas...</p>
        ) : clientes.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No hay clientes disponibles para hoy.</p>
        ) : (
          clientes.map((cliente) => {
            const isSelected = activeCliente?.id === cliente.id;
            return (
              <button
                key={cliente.id || cliente.nombreRazonSocial}
                type="button"
                onClick={() => setActiveCliente(cliente)}
                className={`w-full text-left p-3 rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-green-600 bg-green-50 border-green-600'
                    : 'border-gray-200 bg-white hover:border-green-500 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-gray-900">{cliente.nombreRazonSocial}</div>
                <div className="text-xs text-gray-500">
                  {cliente.telefono} • {cliente.direccion}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Banner de error de reconocimiento de voz */}
      {speechError && (
        <div
          role="alert"
          className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-md"
        >
          {speechError}
        </div>
      )}

      {/* Textarea para dictado o notas manuales con botón de micrófono */}
      <div className="relative">
        <textarea
          rows={3}
          value={dictationText}
          onChange={(e) => setDictationText(e.target.value)}
          disabled={isSubmitting}
          placeholder={
            activeCliente
              ? `Anotá o dictá para ${activeCliente.nombreRazonSocial}...`
              : 'Escribí manualmente o tocá un cliente primero para dictar...'
          }
          className="w-full rounded-md border border-gray-300 p-3 pr-12 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
        />
        <button
          type="button"
          aria-label="Micrófono"
          disabled={isMicDisabled}
          onClick={handleMicClick}
          className={`absolute right-2.5 top-2.5 p-2 rounded-full border transition cursor-pointer ${
            isRecording
              ? 'bg-red-600 text-white border-red-600 animate-pulse'
              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
          title="Dictar nota"
        >
          🎙️
        </button>
      </div>

      {/* Banner de error en PUT con botón de reintento */}
      {putError && (
        <div
          role="alert"
          className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center justify-between gap-2"
        >
          <span>{putError}</span>
          {lastFailedAction && (
            <button
              type="button"
              onClick={() => lastFailedAction()}
              disabled={isSubmitting}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* Botones de acción rápida */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={isActionsDisabled}
          onClick={handleOfrece}
          className="py-2 px-3 bg-green-700 text-white text-sm font-semibold rounded-md hover:bg-green-800 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
        >
          Ofrece
        </button>
        <button
          type="button"
          disabled={isActionsDisabled}
          onClick={handleBusca}
          className="py-2 px-3 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
        >
          Busca
        </button>
        <button
          type="button"
          disabled={isActionsDisabled}
          onClick={handleNoAtendio}
          className="py-2 px-3 bg-gray-600 text-white text-sm font-semibold rounded-md hover:bg-gray-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
        >
          No Atendió
        </button>
      </div>
    </div>
  );
}
