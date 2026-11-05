export type CalificacionCliente = 'A' | 'B' | 'C';

export type CondicionFiscal =
  | 'RESPONSABLE_INSCRIPTO'
  | 'MONOTRIBUTISTA'
  | 'EXENTO'
  | 'CONSUMIDOR_FINAL';

export interface Cliente {
  id?: string;
  nombreRazonSocial: string;
  cuit?: string | null;
  condicionFiscal?: CondicionFiscal;
  telefono: string;
  email?: string;
  direccion: string;
  latitud?: number | null;
  longitud?: number | null;
  calificacion?: CalificacionCliente;
  tipoHacienda?: string;
  formasPagoPreferidas?: string;
  observaciones?: string;
  fechaUltimaOperacion?: string | null;
  fechaUltimoContacto?: string | null;
}
