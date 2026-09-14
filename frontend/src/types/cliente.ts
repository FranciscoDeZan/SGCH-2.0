export type CalificacionCliente = 'A' | 'B' | 'C';

export interface Cliente {
  id?: string;
  nombreRazonSocial: string;
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
