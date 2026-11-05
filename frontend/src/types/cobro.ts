/**
 * Tipos y contratos TypeScript para cobros e imputaciones pecuarias.
 * Espejo de CobroResponse.java, CobroRequest.java y enums asociados.
 */

export type TipoMovimientoCobro =
  | 'COBRO_COMPRADOR'
  | 'PAGO_VENDEDOR'
  | 'COBRO_COMISION'
  | 'RETENCION_SALDO'
  | 'DEVOLUCION_SALDO';

export type MedioPago =
  | 'ECHEQ'
  | 'TRANSFERENCIA'
  | 'CHEQUE_FISICO'
  | 'EFECTIVO'
  | 'CANJE_ESPECIE';

export interface CobroResponse {
  id: string;
  operacionId: string;
  cuotaId: string | null;
  cuotaNumero: number | null;
  clienteId: string;
  clienteNombre: string | null;
  tipoMovimiento: TipoMovimientoCobro;
  fechaMovimiento: string;
  monto: number;
  medioPago: MedioPago;
  documentado: boolean;
  observaciones: string | null;
}

export interface CobroRequest {
  operacionId: string;
  cuotaId?: string | null;
  clienteId: string;
  tipoMovimiento: TipoMovimientoCobro;
  fechaMovimiento: string;
  monto: number;
  medioPago: MedioPago;
  documentado: boolean;
  observaciones?: string | null;
}
