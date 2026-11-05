/**
 * Tipos y contratos TypeScript para cuotas de operaciones pecuarias.
 * Espejo de FechaBasePlazo.java, EstadoCuotaCobro.java, EstadoCuotaPago.java,
 * CuotaOperacionResponse.java y CuotaOperacionRequest.java.
 */

export type FechaBasePlazo = 'CARGA' | 'REMATE';

export type EstadoCuotaCobro = 'PENDIENTE' | 'PARCIAL' | 'COBRADO';

export type EstadoCuotaPago = 'PENDIENTE' | 'PARCIAL' | 'PAGADO';

export interface CuotaOperacionResponse {
  id: string;
  numeroCuota: number;
  fechaBasePlazo: FechaBasePlazo;
  diasPlazoComprador: number;
  diasDescalceVendedor: number;
  fechaVencimientoComprador: string;
  fechaVencimientoVendedor: string;
  montoCuota: number;
  estadoCobro: EstadoCuotaCobro;
  estadoPago: EstadoCuotaPago;
}

export interface CuotaOperacionRequest {
  numeroCuota?: number;
  fechaBasePlazo?: FechaBasePlazo;
  diasPlazoComprador: number;
  diasDescalceVendedor?: number;
  fechaVencimientoComprador?: string;
  fechaVencimientoVendedor?: string;
  montoCuota: number;
}
