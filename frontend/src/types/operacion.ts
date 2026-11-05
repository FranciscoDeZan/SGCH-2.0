/**
 * Tipos y contratos TypeScript para operaciones comerciales pecuarias.
 * Espejo de OperacionResponse.java, OperacionRequest.java y enums asociados.
 */

import type { CondicionFiscal } from './cliente';
import type { CalculoResultado } from './calculoResultado';
import type {
  CuotaOperacionResponse,
  CuotaOperacionRequest,
} from './cuotaOperacion';

// Re-exportar tipos para conveniencia de consumo en vistas y componentes
export type { CondicionFiscal } from './cliente';
export type { CalculoResultado } from './calculoResultado';
export type {
  FechaBasePlazo,
  EstadoCuotaCobro,
  EstadoCuotaPago,
  CuotaOperacionResponse,
  CuotaOperacionRequest,
} from './cuotaOperacion';

export type ModalidadCircuito = 'DIRECTO' | 'CONSIGNATARIA_EXTERNA' | 'PROPIA';

export type CategoriaOperacion = 'FAENA' | 'INVERNADA' | 'REPRODUCCION';

export type ModalidadPrecio = 'NETO' | 'FINAL';

export type CondicionEntrega = 'A_RETIRAR_CAMPO' | 'PUESTO_EN_PLANTA';

export type FleteCargoDe = 'COMPRADOR' | 'VENDEDOR' | 'NINGUNO';

export type EstadoLiquidacion = 'PENDIENTE' | 'PARCIALMENTE_PAGADO' | 'LIQUIDADO';

export type Raza = 'BRANGUS' | 'COLORADO' | 'NEGRO' | 'BRAFORD' | 'DEFINIDO' | 'VARIOS';

/**
 * Respuesta completa de una operacion pecuaria (47 campos exactos).
 */
export interface OperacionResponse {
  id: string;
  fechaCarga: string;
  fechaOperacion: string;
  modalidadCircuito: ModalidadCircuito;
  consignatariaExterna: string | null;
  compradorId: string | null;
  compradorNombre: string | null;
  vendedorId: string | null;
  vendedorNombre: string | null;
  categoria: CategoriaOperacion;
  subcategoria: string | null;
  kgNeto: number;
  kgOrigenBruto: number | null;
  porcentajeDesbaste: number | null;
  kgLlegadaReferencia: number | null;
  precioKgFacturado: number;
  montoExtraCobradoComprador: number | null;
  modalidadPrecio: ModalidadPrecio;
  precioEsFinal: boolean | null;
  comisionPorcentajeVendedor: number;
  comisionPorcentajeComprador: number;
  comisionTotalCobradaReferencia: number | null;
  condicionFiscalVendedor: CondicionFiscal;
  porcentajeDocumentadoGanado: number;
  porcentajeDocumentadoComisionVendedor: number;
  porcentajeDocumentadoComisionComprador: number;
  ivaGanadoMontoOverride: number | null;
  ivaComisionVendedorOverride: number | null;
  ivaComisionCompradorOverride: number | null;
  conGarantia: boolean | null;
  retencionesExternasMonto: number | null;
  condicionEntrega: CondicionEntrega | null;
  fleteCargoDe: FleteCargoDe | null;
  fleteMonto: number | null;
  estadoLiquidacion: EstadoLiquidacion;
  formaPago: string | null;
  plazo: string | null;
  raza: Raza | null;
  color: string | null;
  puntuacion: string | null;
  destino: string | null;
  cantidadMachos: number | null;
  cantidadHembras: number | null;
  terneros: boolean | null;
  observaciones: string | null;
  cuotas: CuotaOperacionResponse[];
  calculo: CalculoResultado;
}

/**
 * Payload para creacion o actualizacion de operaciones pecuarias.
 * OMITE estadoLiquidacion conforme a A-08 / NA-009 / NA-016.
 */
export interface OperacionRequest {
  fechaOperacion: string;
  modalidadCircuito: ModalidadCircuito;
  consignatariaExterna?: string | null;
  compradorId: string;
  vendedorId: string;
  categoria: CategoriaOperacion;
  subcategoria?: string | null;
  kgNeto: number;
  kgOrigenBruto?: number | null;
  porcentajeDesbaste?: number | null;
  kgLlegadaReferencia?: number | null;
  precioKgFacturado: number;
  montoExtraCobradoComprador?: number | null;
  modalidadPrecio: ModalidadPrecio;
  precioEsFinal?: boolean | null;
  comisionPorcentajeVendedor?: number | null;
  comisionPorcentajeComprador?: number | null;
  comisionTotalCobradaReferencia?: number | null;
  porcentajeDocumentadoGanado?: number | null;
  porcentajeDocumentadoComisionVendedor?: number | null;
  porcentajeDocumentadoComisionComprador?: number | null;
  ivaGanadoMontoOverride?: number | null;
  ivaComisionVendedorOverride?: number | null;
  ivaComisionCompradorOverride?: number | null;
  conGarantia?: boolean | null;
  retencionesExternasMonto?: number | null;
  condicionEntrega?: CondicionEntrega | null;
  fleteCargoDe?: FleteCargoDe | null;
  fleteMonto?: number | null;
  formaPago: string;
  plazo?: string | null;
  raza?: Raza | null;
  color?: string | null;
  puntuacion?: string | null;
  destino?: string | null;
  cantidadMachos?: number | null;
  cantidadHembras?: number | null;
  terneros?: boolean | null;
  observaciones?: string | null;
  cuotas?: CuotaOperacionRequest[];
}

export interface OperacionFiltros {
  circuito?: ModalidadCircuito;
  clienteId?: string;
  estado?: EstadoLiquidacion;
  fechaDesde?: string;
  fechaHasta?: string;
}
