import type { OperacionResponse } from '../../types/operacion';
import type { EstadoCuotaCobro, EstadoCuotaPago } from '../../types/cuotaOperacion';
import { CobrosPanel } from './CobrosPanel';

export interface OperacionDetailProps {
  operacion: OperacionResponse;
  onVolver: () => void;
  onEditar: () => void;
  onCobroRegistrado: () => Promise<void> | void;
  onActionSuccess?: (msg: string) => void;
}

const formatMoney = (n: number) =>
  '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Sin fecha';
  const clean = dateStr.slice(0, 10);
  const [y, m, d] = clean.split('-');
  return `${d}/${m}/${y}`;
};

const estadoCobroStyles: Record<EstadoCuotaCobro, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 border-amber-300',
  PARCIAL: 'bg-blue-100 text-blue-800 border-blue-300',
  COBRADO: 'bg-green-100 text-green-800 border-green-300',
};

const estadoPagoStyles: Record<EstadoCuotaPago, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 border-amber-300',
  PARCIAL: 'bg-blue-100 text-blue-800 border-blue-300',
  PAGADO: 'bg-green-100 text-green-800 border-green-300',
};

const estadoLiquidacionStyles = {
  PENDIENTE: 'bg-amber-100 text-amber-800 border-amber-300',
  PARCIALMENTE_PAGADO: 'bg-blue-100 text-blue-800 border-blue-300',
  LIQUIDADO: 'bg-green-100 text-green-800 border-green-300',
};

export function formatResumenOperacion(operacion: OperacionResponse): string {
  const calc = operacion.calculo;
  const fecha = formatDate(operacion.fechaOperacion);
  const comprador = operacion.compradorNombre ?? operacion.compradorId ?? 'Sin comprador';
  const vendedor = operacion.vendedorNombre ?? operacion.vendedorId ?? 'Sin vendedor';
  const condicionVendedor = operacion.condicionFiscalVendedor ?? 'RESPONSABLE_INSCRIPTO';
  const haciendaDesc = [operacion.categoria, operacion.subcategoria].filter(Boolean).join(' ');
  const plazoText = [operacion.formaPago, operacion.plazo].filter(Boolean).join(' ');

  const cuotasLines =
    operacion.cuotas && operacion.cuotas.length > 0
      ? operacion.cuotas
          .map(
            (c) =>
              `Cuota ${c.numeroCuota}: $${c.montoCuota.toLocaleString('es-AR')} | Vto Comprador: ${formatDate(
                c.fechaVencimientoComprador
              )} | Vto Vendedor: ${formatDate(c.fechaVencimientoVendedor)} | Cobro: ${c.estadoCobro}`
          )
          .join('\n')
      : 'Sin cuotas registradas';

  return [
    'RESUMEN DE OPERACION - SGCH',
    `Fecha: ${fecha} | Circuito: ${operacion.modalidadCircuito} | Estado: ${operacion.estadoLiquidacion}`,
    `Comprador: ${comprador}`,
    `Vendedor: ${vendedor} (${condicionVendedor})`,
    `Hacienda: ${haciendaDesc} | Kg Netos: ${operacion.kgNeto.toLocaleString('es-AR')} kg | Precio: $${operacion.precioKgFacturado.toLocaleString('es-AR')}/kg (${operacion.modalidadPrecio})`,
    '--- LIQUIDACION ---',
    `Capital Ganado: $${calc.subtotalGanado.toLocaleString('es-AR')}`,
    `IVA Ganado: $${calc.ivaGanado.toLocaleString('es-AR')}`,
    `Comision Vendedor (${operacion.comisionPorcentajeVendedor}%): $${calc.comisionVendedorMonto.toLocaleString('es-AR')} + IVA $${calc.ivaComisionVendedorMonto.toLocaleString('es-AR')}`,
    `Comision Comprador (${operacion.comisionPorcentajeComprador}%): $${calc.comisionCompradorMonto.toLocaleString('es-AR')} + IVA $${calc.ivaComisionCompradorMonto.toLocaleString('es-AR')}`,
    `Saldo Hacienda entre Partes: $${calc.saldoHaciendaEntrePartes.toLocaleString('es-AR')}`,
    `Saldo Comision Firma: $${calc.saldoComisionFirma.toLocaleString('es-AR')}`,
    `Total a Cobrar Comprador (Firma): $${calc.totalACobrarComprador.toLocaleString('es-AR')}`,
    `Total a Pagar Vendedor (Firma): $${calc.totalAPagarVendedor.toLocaleString('es-AR')}`,
    `--- PLAZO Y CUOTAS (${plazoText || 'Sin plazo'}) ---`,
    cuotasLines,
  ].join('\n');
}

export function OperacionDetail({
  operacion,
  onVolver,
  onEditar,
  onCobroRegistrado,
  onActionSuccess,
}: OperacionDetailProps) {
  const calc = operacion.calculo;

  const handleCopiarResumen = async () => {
    const texto = formatResumenOperacion(operacion);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto);
        onActionSuccess?.('Resumen copiado al portapapeles');
      } else {
        onActionSuccess?.('No se pudo acceder al portapapeles del navegador');
      }
    } catch {
      onActionSuccess?.('No se pudo copiar el resumen al portapapeles');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={onVolver}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition cursor-pointer"
            >
              Volver
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              Detalle de Operación {operacion.id}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
              {operacion.modalidadCircuito}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                estadoLiquidacionStyles[operacion.estadoLiquidacion] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {operacion.estadoLiquidacion}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Fecha de operación: {formatDate(operacion.fechaOperacion)} | Registrada:{' '}
            {formatDate(operacion.fechaCarga)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopiarResumen}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition cursor-pointer"
          >
            Copiar resumen
          </button>
          <button
            type="button"
            onClick={onEditar}
            className="px-4 py-1.5 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 transition cursor-pointer"
          >
            Editar Operación
          </button>
        </div>
      </div>

      {/* Grid: 2. Partes & 3. Hacienda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Partes Comerciales */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Partes Comerciales
          </h3>
          <dl className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <dt className="text-gray-500 font-medium">Comprador</dt>
              <dd className="text-gray-900 font-semibold mt-0.5">
                {operacion.compradorNombre ?? operacion.compradorId}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Vendedor</dt>
              <dd className="text-gray-900 font-semibold mt-0.5 flex items-center gap-2">
                <span>{operacion.vendedorNombre ?? operacion.vendedorId}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                  {operacion.condicionFiscalVendedor === 'RESPONSABLE_INSCRIPTO'
                    ? 'Responsable Inscripto'
                    : operacion.condicionFiscalVendedor}
                </span>
              </dd>
            </div>
            {operacion.modalidadCircuito === 'CONSIGNATARIA_EXTERNA' && (
              <div className="p-3 bg-amber-50 rounded-md border border-amber-200 space-y-1">
                <div>
                  <dt className="text-xs text-amber-900 font-medium">Consignataria Externa</dt>
                  <dd className="text-sm font-semibold text-amber-950">
                    {operacion.consignatariaExterna || '-'}
                  </dd>
                </div>
                {operacion.retencionesExternasMonto != null && (
                  <div>
                    <dt className="text-xs text-amber-900 font-medium">Retenciones Externas</dt>
                    <dd className="text-sm font-mono font-semibold text-amber-950">
                      {formatMoney(operacion.retencionesExternasMonto)}
                    </dd>
                  </div>
                )}
              </div>
            )}
          </dl>
        </div>

        {/* 3. Hacienda y Pesos */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Hacienda y Precios
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500 font-medium">Categoría</dt>
              <dd className="text-gray-900 font-semibold mt-0.5">{operacion.categoria}</dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Subcategoría</dt>
              <dd className="text-gray-900 mt-0.5">{operacion.subcategoria || '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Raza</dt>
              <dd className="text-gray-900 mt-0.5">{operacion.raza || '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Destino</dt>
              <dd className="text-gray-900 mt-0.5">{operacion.destino || '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Kilos Netos</dt>
              <dd className="text-gray-900 font-mono font-bold mt-0.5 text-base text-green-700">
                {operacion.kgNeto.toLocaleString('es-AR')} kg
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Precio por Kilo</dt>
              <dd className="text-gray-900 font-mono font-bold mt-0.5 text-base">
                ${operacion.precioKgFacturado.toLocaleString('es-AR')} ({operacion.modalidadPrecio})
              </dd>
            </div>
            {operacion.kgOrigenBruto != null && (
              <div>
                <dt className="text-gray-500 font-medium">Kilos Brutos</dt>
                <dd className="text-gray-900 font-mono mt-0.5">
                  {operacion.kgOrigenBruto.toLocaleString('es-AR')} kg
                </dd>
              </div>
            )}
            {operacion.porcentajeDesbaste != null && (
              <div>
                <dt className="text-gray-500 font-medium">Desbaste</dt>
                <dd className="text-gray-900 font-mono mt-0.5">{operacion.porcentajeDesbaste}%</dd>
              </div>
            )}
            {operacion.condicionEntrega && (
              <div>
                <dt className="text-gray-500 font-medium">Condición de Entrega</dt>
                <dd className="text-gray-900 mt-0.5">{operacion.condicionEntrega}</dd>
              </div>
            )}
            {operacion.fleteCargoDe && (
              <div>
                <dt className="text-gray-500 font-medium">Flete</dt>
                <dd className="text-gray-900 mt-0.5">
                  A cargo de {operacion.fleteCargoDe}
                  {operacion.fleteMonto ? ` (${formatMoney(operacion.fleteMonto)})` : ''}
                </dd>
              </div>
            )}
            {operacion.observaciones && (
              <div className="col-span-2 pt-2 border-t border-gray-100">
                <dt className="text-gray-500 font-medium">Observaciones</dt>
                <dd className="text-gray-900 mt-0.5 italic">{operacion.observaciones}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* 4. Desglose Fiscal en 3 Capas */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
          Liquidación y Desglose Financiero (Anexo II)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Capa 1 */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Capa 1: Valor Económico
            </h4>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Capital Ganado:</span>
              <span className="font-semibold text-gray-900 font-mono">
                {formatMoney(calc.subtotalGanado)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Comisión Vendedor ({operacion.comisionPorcentajeVendedor}%):</span>
              <span className="font-mono">{formatMoney(calc.comisionVendedorMonto)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Comisión Comprador ({operacion.comisionPorcentajeComprador}%):</span>
              <span className="font-mono">{formatMoney(calc.comisionCompradorMonto)}</span>
            </div>
            {calc.montoExtraCobradoComprador > 0 && (
              <div className="flex justify-between text-xs text-gray-600">
                <span>Monto Extra Comprador:</span>
                <span className="font-mono">{formatMoney(calc.montoExtraCobradoComprador)}</span>
              </div>
            )}
          </div>

          {/* Capa 2 */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Capa 2: Impuestos (IVA)
            </h4>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IVA Ganado:</span>
              <span className="font-semibold text-gray-900 font-mono">
                {formatMoney(calc.ivaGanado)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>IVA Com. Vendedor (21%):</span>
              <span className="font-mono">{formatMoney(calc.ivaComisionVendedorMonto)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>IVA Com. Comprador (21%):</span>
              <span className="font-mono">{formatMoney(calc.ivaComisionCompradorMonto)}</span>
            </div>
          </div>

          {/* Capa 3 */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-2">
            <h4 className="text-xs font-bold text-green-900 uppercase tracking-wider mb-2">
              Capa 3: Saldos Finales
            </h4>
            <div className="flex justify-between text-xs text-green-900">
              <span>Saldo Hacienda Partes:</span>
              <span className="font-bold font-mono">
                {formatMoney(calc.saldoHaciendaEntrePartes)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-green-900 pt-1 border-t border-green-200">
              <span className="font-bold">Comisión Firma:</span>
              <span className="font-bold font-mono text-base text-green-700">
                {formatMoney(calc.saldoComisionFirma)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-green-800">
              <span>Total a Cobrar Comprador:</span>
              <span className="font-mono">{formatMoney(calc.totalACobrarComprador)}</span>
            </div>
            <div className="flex justify-between text-xs text-green-800">
              <span>Total a Pagar Vendedor:</span>
              <span className="font-mono">{formatMoney(calc.totalAPagarVendedor)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Tabla de Cuotas y Plazos */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Cuotas y Vencimientos</h3>
          <span className="text-xs text-gray-500 font-medium">
            Forma de pago: {operacion.formaPago || 'Contado'}{' '}
            {operacion.plazo ? `(${operacion.plazo} días)` : ''}
          </span>
        </div>

        {operacion.cuotas && operacion.cuotas.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500">N°</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium text-gray-500">Monto</th>
                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500">Vto Comprador</th>
                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500">Vto Vendedor</th>
                  <th scope="col" className="px-4 py-2 text-center font-medium text-gray-500">Estado Cobro</th>
                  <th scope="col" className="px-4 py-2 text-center font-medium text-gray-500">Estado Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {operacion.cuotas.map((c) => (
                  <tr key={c.id || c.numeroCuota} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">Cuota {c.numeroCuota}</td>
                    <td className="px-4 py-2 text-right font-mono font-semibold text-gray-900">
                      {formatMoney(c.montoCuota)}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{formatDate(c.fechaVencimientoComprador)}</td>
                    <td className="px-4 py-2 text-gray-700">{formatDate(c.fechaVencimientoVendedor)}</td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          estadoCobroStyles[c.estadoCobro] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {c.estadoCobro}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          estadoPagoStyles[c.estadoPago] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {c.estadoPago}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded text-center border border-dashed border-gray-200">
            Sin cuotas registradas.
          </p>
        )}
      </div>

      {/* 8. Panel de Cobros e Imputaciones */}
      <CobrosPanel
        operacion={operacion}
        onCobroRegistrado={onCobroRegistrado}
        onActionSuccess={onActionSuccess}
      />
    </div>
  );
}
