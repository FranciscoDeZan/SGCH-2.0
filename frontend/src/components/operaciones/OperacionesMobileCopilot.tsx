import { useState, useEffect, useRef } from 'react';
import type { OperacionResponse, OperacionRequest } from '../../types/operacion';

export interface OperacionesMobileCopilotProps {
  operaciones: OperacionResponse[];
  loading: boolean;
  error: boolean;
  onPrellenarAlta: (draft: Partial<OperacionRequest>) => void;
  onSelectOperacion: (op: OperacionResponse) => void;
  onNuevaOperacionManual: () => void;
  onRefetch: () => void;
}

const formatMoney = (n: number) =>
  '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const clean = dateStr.slice(0, 10);
  const [y, m, d] = clean.split('-');
  return `${d}/${m}/${y}`;
};

export function parseDictadoOperacion(texto: string): Partial<OperacionRequest> {
  const clean = texto.trim();
  if (!clean) return {};

  const draft: Partial<OperacionRequest> = {
    observaciones: clean,
  };

  const lower = clean.toLowerCase();

  // 1. Detección de categoría
  if (lower.includes('faena')) {
    draft.categoria = 'FAENA';
  } else if (lower.includes('invernada')) {
    draft.categoria = 'INVERNADA';
  } else if (
    lower.includes('reproduccion') ||
    lower.includes('reproducción') ||
    lower.includes('cria') ||
    lower.includes('cría')
  ) {
    draft.categoria = 'REPRODUCCION';
  }

  // 2. Detección de circuito
  if (lower.includes('consignataria')) {
    draft.modalidadCircuito = 'CONSIGNATARIA_EXTERNA';
  } else if (lower.includes('propia')) {
    draft.modalidadCircuito = 'PROPIA';
  } else if (lower.includes('directo')) {
    draft.modalidadCircuito = 'DIRECTO';
  }

  // 3. Detección de kilos netos
  const kgMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:kilos?|kg)/i);
  if (kgMatch) {
    const kg = parseFloat(kgMatch[1].replace(/\./g, ''));
    if (!isNaN(kg)) {
      draft.kgNeto = kg;
    }
  }

  // 4. Detección de precio por kilo (excluye plazos de pago como "a 30 dias")
  const precioMatch = clean.match(
    /\b(?:a|@)\s*\$?\s*(\d+(?:[.,]\d+)?)(?!\s*(?:d[ií]as|meses|cuotas))\b/i
  );
  if (precioMatch) {
    const rawPrecio = precioMatch[1].replace(/\./g, '').replace(',', '.');
    const precio = parseFloat(rawPrecio);
    if (!isNaN(precio)) {
      draft.precioKgFacturado = precio;
    }
  }

  return draft;
}

export function OperacionesMobileCopilot({
  operaciones,
  loading,
  error,
  onPrellenarAlta,
  onSelectOperacion,
  onNuevaOperacionManual,
  onRefetch,
}: OperacionesMobileCopilotProps) {
  const [dictationText, setDictationText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return 'Tu navegador no soporta dictado. Escribí manualmente.';
    }
    return null;
  });

  const recognitionRef = useRef<any>(null);

  // Cleanup en unmount (R-039)
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const stopRecording = () => {
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleMicClick = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSpeechError('Tu navegador no soporta dictado. Escribí manualmente.');
      return;
    }

    if (isRecording) {
      stopRecording();
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
        setSpeechError('Error en dictado: ' + (e.error || 'error desconocido'));
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
      setSpeechError('Error al iniciar micrófono: ' + (err.message || 'error'));
      recognitionRef.current = null;
      setIsRecording(false);
    }
  };

  const handlePrellenar = () => {
    if (!dictationText.trim()) return;
    stopRecording();
    const draft = parseDictadoOperacion(dictationText);
    onPrellenarAlta(draft);
  };

  const handleNuevaManual = () => {
    stopRecording();
    onNuevaOperacionManual();
  };

  const handleSelect = (op: OperacionResponse) => {
    stopRecording();
    onSelectOperacion(op);
  };

  const recientes = operaciones.slice(0, 5);

  return (
    <div className="space-y-4 p-4 bg-gray-50 min-h-screen">
      {/* 1. Header con micrófono */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Operaciones</h2>
          <p className="text-xs text-gray-500">Copilot móvil de operaciones ganaderas</p>
        </div>
        <button
          type="button"
          onClick={handleNuevaManual}
          className="px-3 py-1.5 text-xs font-medium text-white bg-green-700 rounded-md hover:bg-green-800 transition cursor-pointer"
        >
          Nueva Operación Manual
        </button>
      </div>

      {/* Banner de error de operaciones */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200"
        >
          <span>No se pudieron cargar las operaciones.</span>
          <button
            type="button"
            onClick={onRefetch}
            className="px-3 py-1 bg-red-100 text-red-800 font-semibold rounded hover:bg-red-200 transition cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* 2 & 3. Panel de Dictado por Voz */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Dictado por Voz (es-AR)</span>
          {isRecording && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 animate-pulse">
              Grabando...
            </span>
          )}
        </div>

        {speechError && (
          <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
            {speechError}
          </p>
        )}

        {/* Botón grande de micrófono */}
        <div className="flex justify-center py-2">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={Boolean(speechError)}
            aria-label={isRecording ? 'Detener dictado' : 'Iniciar dictado'}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? 'bg-red-600 text-white ring-4 ring-red-200'
                : 'bg-green-700 text-white hover:bg-green-800'
            }`}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>
        </div>

        <div>
          <label htmlFor="dictationText" className="block text-xs font-medium text-gray-600 mb-1">
            Texto de la operación (dictado o escrito)
          </label>
          <textarea
            id="dictationText"
            name="dictationText"
            aria-label="Texto de la operación"
            rows={3}
            value={dictationText}
            onChange={(e) => setDictationText(e.target.value)}
            placeholder="ej. 50 novillos faena 15000 kilos a 5000 consignataria"
            className="w-full text-sm border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* 4. Botón Prellenar Operación */}
        <button
          type="button"
          onClick={handlePrellenar}
          disabled={!dictationText.trim()}
          className="w-full py-2.5 px-4 bg-green-700 text-white font-medium text-sm rounded-md hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer shadow-sm"
        >
          Prellenar Operación
        </button>
      </div>

      {/* 5. Lista de Operaciones Recientes */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Operaciones Recientes
        </h3>

        {loading ? (
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center text-sm text-gray-500">
            Cargando recientes...
          </div>
        ) : operaciones.length === 0 ? (
          <div className="bg-white p-6 rounded-lg border border-dashed border-gray-300 text-center text-sm text-gray-500">
            No hay operaciones registradas aún.
          </div>
        ) : (
          <div className="space-y-2">
            {recientes.map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => handleSelect(op)}
                aria-label={`Ver ${op.id}`}
                className="w-full text-left bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-green-600 transition cursor-pointer space-y-1.5"
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-gray-900 text-sm">
                    {op.id} • {op.compradorNombre ?? 'Comprador'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 font-medium text-gray-700 border border-gray-300">
                    {op.modalidadCircuito}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Vendedor: {op.vendedorNombre ?? 'Vendedor'} | {op.categoria}
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-100">
                  <span className="font-mono font-medium text-green-700">
                    {op.kgNeto.toLocaleString('es-AR')} kg @ {formatMoney(op.precioKgFacturado)}
                  </span>
                  <span className="text-gray-500">{formatDate(op.fechaOperacion)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
