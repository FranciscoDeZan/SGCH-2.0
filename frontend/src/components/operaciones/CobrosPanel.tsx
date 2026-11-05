import React, { useState, useEffect, useCallback } from 'react';
import type { OperacionResponse } from '../../types/operacion';
import type {
  CobroResponse,
  CobroRequest,
  TipoMovimientoCobro,
  MedioPago,
} from '../../types/cobro';
import { getCobrosByOperacion, createCobro, ApiError } from '../../api/client';

export interface CobrosPanelProps {
  operacion: OperacionResponse;
  onCobroRegistrado: () => Promise<void> | void;
  onActionSuccess?: (msg: string) => void;
}

const formatMoney = (n: number) =>
  '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const clean = dateStr.slice(0, 10);
  const [y, m, d] = clean.split('-');
  return `${d}/${m}/${y}`;
};

function getClienteIdPorTipo(tipo: TipoMovimientoCobro, operacion: OperacionResponse): string {
  if (tipo === 'PAGO_VENDEDOR') {
    return operacion.vendedorId ?? '';
  }
  return operacion.compradorId ?? '';
}

export function CobrosPanel({
  operacion,
  onCobroRegistrado,
  onActionSuccess,
}: CobrosPanelProps) {
  const [cobros, setCobros] = useState<CobroResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorList, setErrorList] = useState(false);

  // Form State
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimientoCobro>('COBRO_COMPRADOR');
  const [cuotaId, setCuotaId] = useState<string>('');
  const [clienteId, setClienteId] = useState<string>(() =>
    getClienteIdPorTipo('COBRO_COMPRADOR', operacion)
  );
  const [fechaMovimiento, setFechaMovimiento] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [monto, setMonto] = useState<string | number>('');
  const [medioPago, setMedioPago] = useState<MedioPago>('TRANSFERENCIA');
  const [documentado, setDocumentado] = useState<boolean>(true);
  const [observaciones, setObservaciones] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCobros = useCallback(async () => {
    setLoading(true);
    setErrorList(false);
    try {
      const data = await getCobrosByOperacion(operacion.id);
      setCobros(data ?? []);
    } catch {
      setErrorList(true);
    } finally {
      setLoading(false);
    }
  }, [operacion.id]);

  useEffect(() => {
    fetchCobros();
  }, [fetchCobros]);

  const handleTipoMovimientoChange = (nuevoTipo: TipoMovimientoCobro) => {
    setTipoMovimiento(nuevoTipo);
    setClienteId(getClienteIdPorTipo(nuevoTipo, operacion));
  };

  const executeSubmit = async () => {
    if (isSubmitting) return;

    const validationErrors: Record<string, string> = {};
    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      validationErrors.monto = 'El monto debe ser mayor a 0.';
    }
    if (!fechaMovimiento) {
      validationErrors.fechaMovimiento = 'La fecha es obligatoria.';
    }

    if (!clienteId) {
      validationErrors.clienteId = 'La operación no tiene cliente asignado para este movimiento.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    const payload: CobroRequest = {
      operacionId: operacion.id,
      cuotaId: cuotaId ? cuotaId : null,
      clienteId,
      tipoMovimiento,
      fechaMovimiento: fechaMovimiento.includes('T')
        ? fechaMovimiento
        : `${fechaMovimiento}T00:00:00`,
      monto: montoNum,
      medioPago,
      documentado,
      observaciones: observaciones.trim() || null,
    };

    // 1. Ejecutar la creacion del cobro
    try {
      await createCobro(payload);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.data?.errores && typeof err.data.errores === 'object') {
          setErrors(err.data.errores as Record<string, string>);
        }
        if (err.data?.detail && typeof err.data.detail === 'string') {
          setGeneralError(err.data.detail);
        } else {
          setGeneralError('No se pudo registrar el cobro. Reintentá en un momento.');
        }
      } else {
        setGeneralError('No se pudo registrar el cobro. Reintentá en un momento.');
      }
      setIsSubmitting(false);
      return;
    }

    // 2. Cobro creado exitosamente: limpiar campos para evitar pagos duplicados
    setMonto('');
    setObservaciones('');

    // 3. Sincronizar listas y estado de operacion
    try {
      await fetchCobros();
      await onCobroRegistrado();
      onActionSuccess?.('Cobro registrado exitosamente');
    } catch {
      setGeneralError(
        'El cobro fue registrado, pero ocurrió un problema al actualizar la pantalla. Por favor recargá la página.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSubmit();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
      <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Cobros e Imputaciones</h3>
          <p className="text-xs text-gray-500">
            Registro de pagos, cobranzas y movimientos financieros asociados
          </p>
        </div>
      </div>

      {/* Lista de cobros existentes */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Movimientos Registrados</h4>

        {loading ? (
          <p className="text-sm text-gray-500">Cargando movimientos...</p>
        ) : errorList ? (
          <div className="p-3 bg-red-50 text-red-700 rounded text-sm border border-red-200">
            No se pudieron cargar los cobros existentes.
          </div>
        ) : cobros.length === 0 ? (
          <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded text-center border border-dashed border-gray-200">
            No hay cobros registrados para esta operación.
          </p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500">Fecha</th>
                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500">Tipo</th>
                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500">Cuota</th>
                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500">Cliente</th>
                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500">Medio</th>
                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500">Doc.</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium text-gray-500">Monto</th>
                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {cobros.map((cobro) => (
                  <tr key={cobro.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900 whitespace-nowrap">{formatDate(cobro.fechaMovimiento)}</td>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{cobro.tipoMovimiento}</td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                      {cobro.cuotaNumero != null ? `Cuota ${cobro.cuotaNumero}` : 'Sin cuota'}
                    </td>
                    <td className="px-4 py-2 text-gray-900">{cobro.clienteNombre ?? cobro.clienteId}</td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{cobro.medioPago}</td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{cobro.documentado ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-2 text-right font-mono font-semibold text-gray-900 whitespace-nowrap">
                      {formatMoney(cobro.monto)}
                    </td>
                    <td className="px-4 py-2 text-gray-500 max-w-xs truncate">{cobro.observaciones || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulario de registro de cobro */}
      <form onSubmit={handleSubmit} noValidate className="pt-4 border-t border-gray-200 space-y-4">
        <h4 className="text-sm font-semibold text-gray-900">Registrar Nuevo Movimiento</h4>

        {/* Banner general de error RFC 7807 */}
        {generalError && (
          <div
            role="alert"
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200"
          >
            <span>{generalError}</span>
            <button
              type="button"
              onClick={executeSubmit}
              disabled={isSubmitting}
              className="self-start sm:self-auto px-3 py-1 bg-red-100 text-red-800 rounded font-medium hover:bg-red-200 transition cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="tipoMovimiento" className="block text-xs font-medium text-gray-700 mb-1">
              Tipo de movimiento *
            </label>
            <select
              id="tipoMovimiento"
              name="tipoMovimiento"
              aria-label="Tipo de movimiento"
              value={tipoMovimiento}
              onChange={(e) => handleTipoMovimientoChange(e.target.value as TipoMovimientoCobro)}
              className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
            >
              <option value="COBRO_COMPRADOR">COBRO_COMPRADOR</option>
              <option value="PAGO_VENDEDOR">PAGO_VENDEDOR</option>
              <option value="COBRO_COMISION">COBRO_COMISION</option>
              <option value="RETENCION_SALDO">RETENCION_SALDO</option>
              <option value="DEVOLUCION_SALDO">DEVOLUCION_SALDO</option>
            </select>
            {errors.tipoMovimiento && (
              <p className="mt-1 text-xs text-red-600">{errors.tipoMovimiento}</p>
            )}
          </div>

          <div>
            <label htmlFor="cuotaId" className="block text-xs font-medium text-gray-700 mb-1">
              Asociar a cuota
            </label>
            <select
              id="cuotaId"
              name="cuotaId"
              aria-label="Asociar a cuota"
              value={cuotaId}
              onChange={(e) => setCuotaId(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
            >
              <option value="">Sin cuota / Contado</option>
              {operacion.cuotas?.map((c) => (
                <option key={c.id} value={c.id}>
                  Cuota {c.numeroCuota} - {formatMoney(c.montoCuota)} (Vto{' '}
                  {formatDate(
                    tipoMovimiento === 'PAGO_VENDEDOR'
                      ? c.fechaVencimientoVendedor
                      : c.fechaVencimientoComprador
                  )}
                  )
                </option>
              ))}
            </select>
            {errors.cuotaId && <p className="mt-1 text-xs text-red-600">{errors.cuotaId}</p>}
          </div>

          <div>
            <label htmlFor="clienteIdCobro" className="block text-xs font-medium text-gray-700 mb-1">
              Cliente imputado *
            </label>
            <select
              id="clienteIdCobro"
              name="clienteIdCobro"
              aria-label="Cliente imputado"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
            >
              {operacion.compradorId && (
                <option value={operacion.compradorId}>
                  Comprador: {operacion.compradorNombre ?? operacion.compradorId}
                </option>
              )}
              {operacion.vendedorId && (
                <option value={operacion.vendedorId}>
                  Vendedor: {operacion.vendedorNombre ?? operacion.vendedorId}
                </option>
              )}
            </select>
            {errors.clienteId && <p className="mt-1 text-xs text-red-600">{errors.clienteId}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="fechaMovimiento" className="block text-xs font-medium text-gray-700 mb-1">
              Fecha de movimiento *
            </label>
            <input
              type="date"
              id="fechaMovimiento"
              name="fechaMovimiento"
              aria-label="Fecha de movimiento"
              value={fechaMovimiento}
              onChange={(e) => setFechaMovimiento(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-md p-2"
              required
            />
            {errors.fechaMovimiento && (
              <p className="mt-1 text-xs text-red-600">{errors.fechaMovimiento}</p>
            )}
          </div>

          <div>
            <label htmlFor="montoCobro" className="block text-xs font-medium text-gray-700 mb-1">
              Monto ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              id="montoCobro"
              name="montoCobro"
              aria-label="Monto"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-md p-2"
              required
            />
            {errors.monto && <p className="mt-1 text-xs text-red-600">{errors.monto}</p>}
          </div>

          <div>
            <label htmlFor="medioPago" className="block text-xs font-medium text-gray-700 mb-1">
              Medio de pago *
            </label>
            <select
              id="medioPago"
              name="medioPago"
              aria-label="Medio de pago"
              value={medioPago}
              onChange={(e) => setMedioPago(e.target.value as MedioPago)}
              className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
            >
              <option value="TRANSFERENCIA">TRANSFERENCIA</option>
              <option value="ECHEQ">ECHEQ</option>
              <option value="CHEQUE_FISICO">CHEQUE_FISICO</option>
              <option value="EFECTIVO">EFECTIVO</option>
              <option value="CANJE_ESPECIE">CANJE_ESPECIE</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="documentado"
                aria-label="Operación documentada"
                checked={documentado}
                onChange={(e) => setDocumentado(e.target.checked)}
                className="h-4 w-4 text-green-600 rounded border-gray-300 mr-2"
              />
              Documentado fiscalmente
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="observacionesCobro" className="block text-xs font-medium text-gray-700 mb-1">
            Observaciones
          </label>
          <textarea
            id="observacionesCobro"
            name="observacionesCobro"
            aria-label="Observaciones"
            rows={2}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md p-2"
            placeholder="Detalle o referencia del pago..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-700 text-white rounded-md text-sm font-medium hover:bg-green-800 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Registrar Cobro'}
          </button>
        </div>
      </form>
    </div>
  );
}
