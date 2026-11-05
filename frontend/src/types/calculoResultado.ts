/**
 * Espejo TypeScript del DTO backend CalculoResultado.java (11 campos).
 * Representa los resultados del calculo fiscal en tres capas para operaciones pecuarias.
 */
export interface CalculoResultado {
  subtotalGanado: number;
  comisionVendedorMonto: number;
  comisionCompradorMonto: number;
  ivaGanado: number;
  ivaComisionVendedorMonto: number;
  ivaComisionCompradorMonto: number;
  montoExtraCobradoComprador: number;
  saldoHaciendaEntrePartes: number;
  saldoComisionFirma: number;
  totalACobrarComprador: number;
  totalAPagarVendedor: number;
}
