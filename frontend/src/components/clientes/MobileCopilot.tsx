import { useState, useEffect, useRef } from 'react';
import type { Cliente } from '../../types/cliente';
import { apiFetch } from '../../api/client';

export interface MobileCopilotProps {
  clientes: Cliente[];
  loading?: boolean;
  error?: boolean;
  onRefetch?: () => void;
  onActionSuccess?: (msg: string) => void;
}

export function MobileCopilot({
  clientes = [],
  loading = false,
  error = false,
  onRefetch,
  onActionSuccess,
}: MobileCopilotProps) {
  const [activeCliente, setActiveCliente] = useState<Cliente | null>(null);
  const [dictationText, setDictationText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [putError, setPutError] = useState<string | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<(() => Promise<void>) | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

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

  const handleMicClick = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSpeechError('Tu navegador no soporta dictado. Escribí manualmente.');
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      recognitionRef.current = null;
      setIsRecording(false);
      return;
    }

    setSpeechError(null);
    try {
      const rec = new SR();
      rec.lang = 'es-AR';
      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setDictationText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      rec.onerror = (e: any) => {
        setSpeechError('Error: ' + e.error);
        recognitionRef.current = null;
        setIsRecording(false);
      };
      rec.onend = () => {
        recognitionRef.current = null;
        setIsRecording(false);
      };
      recognitionRef.current = rec;
      setIsRecording(true);
      rec.start();
    } catch (err: any) {
      setSpeechError('Error: ' + (err.message || 'error desconocido'));
      recognitionRef.current = null;
      setIsRecording(false);
    }
  };

  const executeAction = async (payload: Cliente, successMsg: string) => {
    if (isSubmitting) return;
    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsRecording(false);
    }
    setIsSubmitting(true);
    setPutError(null);

    try {
      await apiFetch<Cliente>(`/clientes/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setPutError(null);
      setLastFailedAction(null);
      onActionSuccess?.(successMsg);
      setDictationText('');
      setActiveCliente(null);
      onRefetch?.();
    } catch {
      setPutError('No se pudo guardar. Reintentá en un momento.');
      setLastFailedAction(() => () => executeAction(payload, successMsg));
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
    executeAction(payload, '✅ Nota guardada');
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
    executeAction(payload, '✅ Nota guardada');
  };

  const handleNoAtendio = () => {
    if (!activeCliente?.id) return;
    const dateStr = new Date().toLocaleDateString('es-AR');
    // Decisión R-041: si hay texto dictado + click en "No Atendió",
    // anexamos el texto. Caso raro pero preferimos sobre-guardar a perder
    // información. El usuario puede editar y limpiar después.
    const entry = dictationText.trim()
      ? `[No atendió] ${dateStr} - ${dictationText.trim()}`
      : `[No atendió] ${dateStr}`;

    const newObservaciones = activeCliente.observaciones
      ? `${activeCliente.observaciones}\n${entry}`
      : entry;

    const payload: Cliente = {
      ...activeCliente,
      fechaUltimoContacto: new Date().toISOString(),
      observaciones: newObservaciones,
    };
    executeAction(payload, '✅ Registrado: no atendió');
  };

  const isActionsDisabled = !activeCliente || isSubmitting;
  const isMicDisabled = !activeCliente || !hasSpeechRecognition || isSubmitting;

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-xl font-bold mb-4">
          No se pudo conectar. Revisá tu conexión a internet.
        </p>
        <button
          type="button"
          onClick={onRefetch}
          className="bg-black text-white font-bold py-3 px-6 text-lg rounded-md"
        >
          Reintentar
        </button>
      </div>
    );
  }

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
        {loading && clientes.length === 0 ? (
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
                aria-pressed={isSelected}
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
          aria-label="Nota o dictado para el cliente"
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
          aria-label={isRecording ? 'Detener dictado' : 'Empezar dictado'}
          disabled={isMicDisabled}
          onClick={handleMicClick}
          className={`absolute right-2.5 top-2.5 p-2 rounded-full border transition cursor-pointer ${
            isRecording
              ? 'bg-red-600 text-white border-red-600 animate-pulse'
              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
          title="Dictar nota"
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
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
