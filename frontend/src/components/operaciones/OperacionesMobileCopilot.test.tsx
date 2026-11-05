import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import {
  OperacionesMobileCopilot,
  parseDictadoOperacion,
} from './OperacionesMobileCopilot';
import type { OperacionResponse } from '../../types/operacion';

class MockSpeechRecognition {
  lang = '';
  onresult: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
}

const mockOperacion: OperacionResponse = {
  id: 'op-101',
  fechaCarga: '2026-11-04T12:00:00',
  fechaOperacion: '2026-11-04T10:00:00',
  modalidadCircuito: 'DIRECTO',
  consignatariaExterna: null,
  compradorId: 'c-1',
  compradorNombre: 'Estancia Don Pedro',
  vendedorId: 'c-2',
  vendedorNombre: 'Cabaña La Tranquera',
  categoria: 'FAENA',
  subcategoria: 'Novillos',
  kgNeto: 15000,
  kgOrigenBruto: null,
  porcentajeDesbaste: null,
  kgLlegadaReferencia: null,
  precioKgFacturado: 1200,
  montoExtraCobradoComprador: null,
  modalidadPrecio: 'NETO',
  precioEsFinal: false,
  comisionPorcentajeVendedor: 2,
  comisionPorcentajeComprador: 2,
  comisionTotalCobradaReferencia: null,
  condicionFiscalVendedor: 'RESPONSABLE_INSCRIPTO',
  porcentajeDocumentadoGanado: 100,
  porcentajeDocumentadoComisionVendedor: 100,
  porcentajeDocumentadoComisionComprador: 100,
  ivaGanadoMontoOverride: null,
  ivaComisionVendedorOverride: null,
  ivaComisionCompradorOverride: null,
  conGarantia: true,
  retencionesExternasMonto: null,
  condicionEntrega: 'A_RETIRAR_CAMPO',
  fleteCargoDe: 'COMPRADOR',
  fleteMonto: null,
  estadoLiquidacion: 'PENDIENTE',
  formaPago: '30 días',
  plazo: '30',
  raza: 'BRANGUS',
  color: 'Negro',
  puntuacion: 'Buena',
  destino: 'Frigorífico',
  cantidadMachos: 35,
  cantidadHembras: 0,
  terneros: false,
  observaciones: 'Lote parejo',
  cuotas: [],
  calculo: {
    subtotalGanado: 18000000,
    comisionVendedorMonto: 360000,
    comisionCompradorMonto: 360000,
    ivaGanado: 1890000,
    ivaComisionVendedorMonto: 75600,
    ivaComisionCompradorMonto: 75600,
    montoExtraCobradoComprador: 0,
    saldoHaciendaEntrePartes: 19890000,
    saldoComisionFirma: 871200,
    totalACobrarComprador: 20325600,
    totalAPagarVendedor: 19454400,
  },
};

describe('OperacionesMobileCopilot', () => {
  const originalSpeechRecognition = (window as any).SpeechRecognition;
  const originalWebkitSpeechRecognition = (window as any).webkitSpeechRecognition;

  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).SpeechRecognition = MockSpeechRecognition;
    (window as any).webkitSpeechRecognition = undefined;
  });

  afterAll(() => {
    (window as any).SpeechRecognition = originalSpeechRecognition;
    (window as any).webkitSpeechRecognition = originalWebkitSpeechRecognition;
  });

  // 1. Error state
  it('1. Error state: error={true} -> renderiza banner + botón "Reintentar" conectado a onRefetch', () => {
    const handleRefetch = vi.fn();
    render(
      <OperacionesMobileCopilot
        operaciones={[]}
        loading={false}
        error={true}
        onPrellenarAlta={vi.fn()}
        onSelectOperacion={vi.fn()}
        onNuevaOperacionManual={vi.fn()}
        onRefetch={handleRefetch}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/no se pudieron cargar las operaciones/i);
    const btnReintentar = screen.getByRole('button', { name: /reintentar/i });
    fireEvent.click(btnReintentar);
    expect(handleRefetch).toHaveBeenCalledTimes(1);
  });

  // 2. Sin soporte SpeechRecognition
  it('2. Sin soporte SpeechRecognition: muestra aviso + permite escritura manual', () => {
    (window as any).SpeechRecognition = undefined;
    (window as any).webkitSpeechRecognition = undefined;

    render(
      <OperacionesMobileCopilot
        operaciones={[]}
        loading={false}
        error={false}
        onPrellenarAlta={vi.fn()}
        onSelectOperacion={vi.fn()}
        onNuevaOperacionManual={vi.fn()}
        onRefetch={vi.fn()}
      />
    );

    expect(screen.getByText(/tu navegador no soporta dictado/i)).toBeInTheDocument();
    const textarea = screen.getByLabelText(/texto de la operación/i);
    fireEvent.change(textarea, { target: { value: 'escritura manual' } });
    expect(textarea).toHaveValue('escritura manual');
  });

  // 3. Grabación
  it('3. Grabación: mic click -> recognition.start() con lang="es-AR" -> texto se concatena al textarea -> segundo click -> recognition.stop()', () => {
    let mockInstance: MockSpeechRecognition | null = null;
    (window as any).SpeechRecognition = class extends MockSpeechRecognition {
      constructor() {
        super();
        mockInstance = this;
      }
    };

    render(
      <OperacionesMobileCopilot
        operaciones={[]}
        loading={false}
        error={false}
        onPrellenarAlta={vi.fn()}
        onSelectOperacion={vi.fn()}
        onNuevaOperacionManual={vi.fn()}
        onRefetch={vi.fn()}
      />
    );

    const micBtn = screen.getByRole('button', { name: /iniciar dictado/i });
    fireEvent.click(micBtn);

    expect(mockInstance).not.toBeNull();
    expect(mockInstance!.lang).toBe('es-AR');
    expect(mockInstance!.start).toHaveBeenCalledTimes(1);

    // Simular evento onresult dentro de act
    act(() => {
      mockInstance!.onresult!({
        results: [[{ transcript: '50 novillos faena' }]],
      });
    });

    const textarea = screen.getByLabelText(/texto de la operación/i);
    expect(textarea).toHaveValue('50 novillos faena');

    // Segundo click: stop
    const stopBtn = screen.getByRole('button', { name: /detener dictado/i });
    fireEvent.click(stopBtn);
    expect(mockInstance!.stop).toHaveBeenCalledTimes(1);
  });

  // 4. Cleanup
  it('4. Cleanup: unmount -> recognition.abort() invocado', () => {
    let mockInstance: MockSpeechRecognition | null = null;
    (window as any).SpeechRecognition = class extends MockSpeechRecognition {
      constructor() {
        super();
        mockInstance = this;
      }
    };

    const { unmount } = render(
      <OperacionesMobileCopilot
        operaciones={[]}
        loading={false}
        error={false}
        onPrellenarAlta={vi.fn()}
        onSelectOperacion={vi.fn()}
        onNuevaOperacionManual={vi.fn()}
        onRefetch={vi.fn()}
      />
    );

    const micBtn = screen.getByRole('button', { name: /iniciar dictado/i });
    fireEvent.click(micBtn);

    unmount();
    expect(mockInstance!.abort).toHaveBeenCalledTimes(1);
    expect(mockInstance!.onresult).toBeNull();
  });

  // 5. Prellenar Operación
  it('5. "Prellenar Operación" con texto "50 novillos faena 15000 kilos a 5000": onPrellenarAlta invocado y si estaba grabando recognition.stop() invocado antes', () => {
    let mockInstance: MockSpeechRecognition | null = null;
    (window as any).SpeechRecognition = class extends MockSpeechRecognition {
      constructor() {
        super();
        mockInstance = this;
      }
    };

    const handlePrellenar = vi.fn();

    render(
      <OperacionesMobileCopilot
        operaciones={[]}
        loading={false}
        error={false}
        onPrellenarAlta={handlePrellenar}
        onSelectOperacion={vi.fn()}
        onNuevaOperacionManual={vi.fn()}
        onRefetch={vi.fn()}
      />
    );

    // Iniciar grabación
    const micBtn = screen.getByRole('button', { name: /iniciar dictado/i });
    fireEvent.click(micBtn);

    // Escribir / recibir texto
    const textarea = screen.getByLabelText(/texto de la operación/i);
    fireEvent.change(textarea, {
      target: { value: '50 novillos faena 15000 kilos a 5000' },
    });

    const btnPrellenar = screen.getByRole('button', { name: /prellenar operación/i });
    expect(btnPrellenar).not.toBeDisabled();
    fireEvent.click(btnPrellenar);

    // Verifica que si estaba grabando, se detuvo
    expect(mockInstance!.stop).toHaveBeenCalledTimes(1);

    // Verifica draft parseado
    expect(handlePrellenar).toHaveBeenCalledTimes(1);
    expect(handlePrellenar).toHaveBeenCalledWith({
      categoria: 'FAENA',
      kgNeto: 15000,
      precioKgFacturado: 5000,
      observaciones: '50 novillos faena 15000 kilos a 5000',
    });
  });

  // 6. Click operación reciente y Nueva Operación Manual
  it('6. Click operación reciente -> onSelectOperacion(op); click "Nueva Operación Manual" -> onNuevaOperacionManual()', () => {
    const handleSelect = vi.fn();
    const handleNuevaManual = vi.fn();

    render(
      <OperacionesMobileCopilot
        operaciones={[mockOperacion]}
        loading={false}
        error={false}
        onPrellenarAlta={vi.fn()}
        onSelectOperacion={handleSelect}
        onNuevaOperacionManual={handleNuevaManual}
        onRefetch={vi.fn()}
      />
    );

    expect(screen.getByText(/Estancia Don Pedro/i)).toBeInTheDocument();
    const opCard = screen.getByRole('button', { name: /ver op-101/i });
    fireEvent.click(opCard);
    expect(handleSelect).toHaveBeenCalledWith(mockOperacion);

    const btnManual = screen.getByRole('button', { name: /nueva operación manual/i });
    fireEvent.click(btnManual);
    expect(handleNuevaManual).toHaveBeenCalledTimes(1);
  });

  // Test directo del helper parseDictadoOperacion
  it('parseDictadoOperacion detecta circuito, categorías, desbaste y conserva texto completo', () => {
    const res = parseDictadoOperacion('Lote invernada consignataria 12000 kg a 4500');
    expect(res).toEqual({
      categoria: 'INVERNADA',
      modalidadCircuito: 'CONSIGNATARIA_EXTERNA',
      kgNeto: 12000,
      precioKgFacturado: 4500,
      observaciones: 'Lote invernada consignataria 12000 kg a 4500',
    });

    const vacio = parseDictadoOperacion('');
    expect(vacio).toEqual({});

    // Ignora plazos de pago como "a 30 dias" y extrae el precio real
    const conPlazo = parseDictadoOperacion('faena a 30 dias 15000 kg a 4800');
    expect(conPlazo.precioKgFacturado).toBe(4800);
    expect(conPlazo.kgNeto).toBe(15000);
    expect(conPlazo.categoria).toBe('FAENA');
  });

  it('soporta webkitSpeechRecognition como fallback cuando window.SpeechRecognition es undefined', () => {
    (window as any).SpeechRecognition = undefined;
    (window as any).webkitSpeechRecognition = class extends MockSpeechRecognition {};

    render(
      <OperacionesMobileCopilot
        operaciones={[]}
        loading={false}
        error={false}
        onPrellenarAlta={vi.fn()}
        onSelectOperacion={vi.fn()}
        onNuevaOperacionManual={vi.fn()}
        onRefetch={vi.fn()}
      />
    );

    expect(screen.queryByText(/tu navegador no soporta dictado/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar dictado/i })).not.toBeDisabled();
  });
});
