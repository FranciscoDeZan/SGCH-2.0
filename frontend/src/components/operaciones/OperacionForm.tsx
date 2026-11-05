import React, { useState, useMemo } from 'react';
import type {
  OperacionRequest,
  OperacionResponse,
  ModalidadCircuito,
  CategoriaOperacion,
  ModalidadPrecio,
  CondicionEntrega,
  FleteCargoDe,
  Raza,
} from '../../types/operacion';
import type { Cliente, CondicionFiscal } from '../../types/cliente';
import { createOperacion, updateOperacion, ApiError } from '../../api/client';
import { calcularPreviewOperacion } from '../../utils/calculadoraFinanciera';

export interface OperacionFormProps {
  mode: 'create' | 'edit';
  initialOperacion?: OperacionResponse | null;
  initialDraft?: Partial<OperacionRequest> | null;
  clientes: Cliente[];
  operaciones?: OperacionResponse[];
  onSuccess: (operacion: OperacionResponse) => void;
  onCancel: () => void;
}

interface FormState {
  fechaOperacion: string;
  modalidadCircuito: ModalidadCircuito;
  consignatariaExterna: string;
  compradorId: string;
  vendedorId: string;
  categoria: CategoriaOperacion;
  subcategoria: string;
  kgNeto: string | number;
  kgOrigenBruto: string | number;
  porcentajeDesbaste: string | number;
  kgLlegadaReferencia: string | number;
  precioKgFacturado: string | number;
  montoExtraCobradoComprador: string | number;
  modalidadPrecio: ModalidadPrecio;
  precioEsFinal: boolean;
  comisionPorcentajeVendedor: string | number;
  comisionPorcentajeComprador: string | number;
  comisionTotalCobradaReferencia: string | number;
  porcentajeDocumentadoGanado: string | number;
  porcentajeDocumentadoComisionVendedor: string | number;
  porcentajeDocumentadoComisionComprador: string | number;
  ivaGanadoMontoOverride: string | number;
  ivaComisionVendedorOverride: string | number;
  ivaComisionCompradorOverride: string | number;
  conGarantia: boolean;
  retencionesExternasMonto: string | number;
  condicionEntrega: CondicionEntrega | '';
  fleteCargoDe: FleteCargoDe | '';
  fleteMonto: string | number;
  formaPago: string;
  plazo: string;
  raza: Raza | '';
  color: string;
  puntuacion: string;
  destino: string;
  cantidadMachos: string | number;
  cantidadHembras: string | number;
  terneros: boolean;
  observaciones: string;
}

const getTodayString = () => new Date().toISOString().slice(0, 10);

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

const formatMoney = (n: number) =>
  '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function OperacionForm({
  mode,
  initialOperacion,
  initialDraft,
  clientes,
  operaciones = [],
  onSuccess,
  onCancel,
}: OperacionFormProps) {
  const [formData, setFormData] = useState<FormState>(() => {
    if (mode === 'edit' && initialOperacion) {
      return {
        fechaOperacion: initialOperacion.fechaOperacion ? initialOperacion.fechaOperacion.slice(0, 10) : getTodayString(),
        modalidadCircuito: initialOperacion.modalidadCircuito ?? 'DIRECTO',
        consignatariaExterna: initialOperacion.consignatariaExterna ?? '',
        compradorId: initialOperacion.compradorId ?? '',
        vendedorId: initialOperacion.vendedorId ?? '',
        categoria: initialOperacion.categoria ?? 'FAENA',
        subcategoria: initialOperacion.subcategoria ?? '',
        kgNeto: initialOperacion.kgNeto ?? '',
        kgOrigenBruto: initialOperacion.kgOrigenBruto ?? '',
        porcentajeDesbaste: initialOperacion.porcentajeDesbaste ?? '',
        kgLlegadaReferencia: initialOperacion.kgLlegadaReferencia ?? '',
        precioKgFacturado: initialOperacion.precioKgFacturado ?? '',
        montoExtraCobradoComprador: initialOperacion.montoExtraCobradoComprador ?? '',
        modalidadPrecio: initialOperacion.modalidadPrecio ?? 'NETO',
        precioEsFinal: Boolean(initialOperacion.precioEsFinal),
        comisionPorcentajeVendedor: initialOperacion.comisionPorcentajeVendedor ?? 2,
        comisionPorcentajeComprador: initialOperacion.comisionPorcentajeComprador ?? 2,
        comisionTotalCobradaReferencia: initialOperacion.comisionTotalCobradaReferencia ?? '',
        porcentajeDocumentadoGanado: initialOperacion.porcentajeDocumentadoGanado ?? 100,
        porcentajeDocumentadoComisionVendedor: initialOperacion.porcentajeDocumentadoComisionVendedor ?? 100,
        porcentajeDocumentadoComisionComprador: initialOperacion.porcentajeDocumentadoComisionComprador ?? 100,
        ivaGanadoMontoOverride: initialOperacion.ivaGanadoMontoOverride ?? '',
        ivaComisionVendedorOverride: initialOperacion.ivaComisionVendedorOverride ?? '',
        ivaComisionCompradorOverride: initialOperacion.ivaComisionCompradorOverride ?? '',
        conGarantia: initialOperacion.conGarantia ?? true,
        retencionesExternasMonto: initialOperacion.retencionesExternasMonto ?? '',
        condicionEntrega: initialOperacion.condicionEntrega ?? '',
        fleteCargoDe: initialOperacion.fleteCargoDe ?? '',
        fleteMonto: initialOperacion.fleteMonto ?? '',
        formaPago: initialOperacion.formaPago ?? '',
        plazo: initialOperacion.plazo ?? '',
        raza: initialOperacion.raza ?? '',
        color: initialOperacion.color ?? '',
        puntuacion: initialOperacion.puntuacion ?? '',
        destino: initialOperacion.destino ?? '',
        cantidadMachos: initialOperacion.cantidadMachos ?? '',
        cantidadHembras: initialOperacion.cantidadHembras ?? '',
        terneros: Boolean(initialOperacion.terneros),
        observaciones: initialOperacion.observaciones ?? '',
      };
    }

    return {
      fechaOperacion: initialDraft?.fechaOperacion ? initialDraft.fechaOperacion.slice(0, 10) : getTodayString(),
      modalidadCircuito: initialDraft?.modalidadCircuito ?? 'DIRECTO',
      consignatariaExterna: initialDraft?.consignatariaExterna ?? '',
      compradorId: initialDraft?.compradorId ?? '',
      vendedorId: initialDraft?.vendedorId ?? '',
      categoria: initialDraft?.categoria ?? 'FAENA',
      subcategoria: initialDraft?.subcategoria ?? '',
      kgNeto: initialDraft?.kgNeto ?? '',
      kgOrigenBruto: initialDraft?.kgOrigenBruto ?? '',
      porcentajeDesbaste: initialDraft?.porcentajeDesbaste ?? '',
      kgLlegadaReferencia: initialDraft?.kgLlegadaReferencia ?? '',
      precioKgFacturado: initialDraft?.precioKgFacturado ?? '',
      montoExtraCobradoComprador: initialDraft?.montoExtraCobradoComprador ?? '',
      modalidadPrecio: initialDraft?.modalidadPrecio ?? 'NETO',
      precioEsFinal: Boolean(initialDraft?.precioEsFinal),
      comisionPorcentajeVendedor: initialDraft?.comisionPorcentajeVendedor ?? 2,
      comisionPorcentajeComprador: initialDraft?.comisionPorcentajeComprador ?? 2,
      comisionTotalCobradaReferencia: initialDraft?.comisionTotalCobradaReferencia ?? '',
      porcentajeDocumentadoGanado: initialDraft?.porcentajeDocumentadoGanado ?? 100,
      porcentajeDocumentadoComisionVendedor: initialDraft?.porcentajeDocumentadoComisionVendedor ?? 100,
      porcentajeDocumentadoComisionComprador: initialDraft?.porcentajeDocumentadoComisionComprador ?? 100,
      ivaGanadoMontoOverride: initialDraft?.ivaGanadoMontoOverride ?? '',
      ivaComisionVendedorOverride: initialDraft?.ivaComisionVendedorOverride ?? '',
      ivaComisionCompradorOverride: initialDraft?.ivaComisionCompradorOverride ?? '',
      conGarantia: initialDraft?.conGarantia ?? true,
      retencionesExternasMonto: initialDraft?.retencionesExternasMonto ?? '',
      condicionEntrega: initialDraft?.condicionEntrega ?? '',
      fleteCargoDe: initialDraft?.fleteCargoDe ?? '',
      fleteMonto: initialDraft?.fleteMonto ?? '',
      formaPago: initialDraft?.formaPago ?? '',
      plazo: initialDraft?.plazo ?? '',
      raza: initialDraft?.raza ?? '',
      color: initialDraft?.color ?? '',
      puntuacion: initialDraft?.puntuacion ?? '',
      destino: initialDraft?.destino ?? '',
      cantidadMachos: initialDraft?.cantidadMachos ?? '',
      cantidadHembras: initialDraft?.cantidadHembras ?? '',
      terneros: Boolean(initialDraft?.terneros),
      observaciones: initialDraft?.observaciones ?? '',
    };
  });

  const [selectedOpToCopy, setSelectedOpToCopy] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vendedor seleccionado y su condición fiscal
  const vendedorSeleccionado = useMemo(() => {
    return clientes.find((c) => c.id === formData.vendedorId);
  }, [clientes, formData.vendedorId]);

  const condicionFiscalVendedor: CondicionFiscal = useMemo(() => {
    return vendedorSeleccionado?.condicionFiscal ?? initialOperacion?.condicionFiscalVendedor ?? 'RESPONSABLE_INSCRIPTO';
  }, [vendedorSeleccionado, initialOperacion?.condicionFiscalVendedor]);

  // Cálculo en vivo de preview
  const calculoPreview = useMemo(() => {
    const kg = Number(formData.kgNeto);
    const precio = Number(formData.precioKgFacturado);

    if (kg <= 0 || precio <= 0 || isNaN(kg) || isNaN(precio)) {
      return null;
    }

    try {
      return calcularPreviewOperacion({
        kgNeto: kg,
        precioKgFacturado: precio,
        montoExtraCobradoComprador:
          formData.montoExtraCobradoComprador !== '' ? Number(formData.montoExtraCobradoComprador) : null,
        comisionPorcentajeVendedor:
          formData.comisionPorcentajeVendedor !== '' ? Number(formData.comisionPorcentajeVendedor) : 0,
        comisionPorcentajeComprador:
          formData.comisionPorcentajeComprador !== '' ? Number(formData.comisionPorcentajeComprador) : 0,
        modalidadPrecio: formData.modalidadPrecio,
        precioEsFinal: formData.precioEsFinal,
        condicionFiscalVendedor,
        modalidadCircuito: formData.modalidadCircuito,
        porcentajeDocumentadoGanado:
          formData.porcentajeDocumentadoGanado !== '' ? Number(formData.porcentajeDocumentadoGanado) : 100,
        porcentajeDocumentadoComisionVendedor:
          formData.porcentajeDocumentadoComisionVendedor !== ''
            ? Number(formData.porcentajeDocumentadoComisionVendedor)
            : 100,
        porcentajeDocumentadoComisionComprador:
          formData.porcentajeDocumentadoComisionComprador !== ''
            ? Number(formData.porcentajeDocumentadoComisionComprador)
            : 100,
        ivaGanadoMontoOverride:
          formData.ivaGanadoMontoOverride !== '' ? Number(formData.ivaGanadoMontoOverride) : null,
        ivaComisionVendedorOverride:
          formData.ivaComisionVendedorOverride !== '' ? Number(formData.ivaComisionVendedorOverride) : null,
        ivaComisionCompradorOverride:
          formData.ivaComisionCompradorOverride !== '' ? Number(formData.ivaComisionCompradorOverride) : null,
      });
    } catch {
      return null;
    }
  }, [
    formData.kgNeto,
    formData.precioKgFacturado,
    formData.montoExtraCobradoComprador,
    formData.comisionPorcentajeVendedor,
    formData.comisionPorcentajeComprador,
    formData.modalidadPrecio,
    formData.precioEsFinal,
    condicionFiscalVendedor,
    formData.modalidadCircuito,
    formData.porcentajeDocumentadoGanado,
    formData.porcentajeDocumentadoComisionVendedor,
    formData.porcentajeDocumentadoComisionComprador,
    formData.ivaGanadoMontoOverride,
    formData.ivaComisionVendedorOverride,
    formData.ivaComisionCompradorOverride,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Sincronizar precioEsFinal si cambia modalidadPrecio
      if (name === 'modalidadPrecio') {
        next.precioEsFinal = value === 'FINAL';
      }

      // Autocalculo de kgNeto por desbaste (R-078)
      if (name === 'kgOrigenBruto' || name === 'porcentajeDesbaste') {
        const bruto = name === 'kgOrigenBruto' ? Number(value) : Number(prev.kgOrigenBruto);
        const desbaste = name === 'porcentajeDesbaste' ? Number(value) : Number(prev.porcentajeDesbaste);

        if (!isNaN(bruto) && bruto > 0 && !isNaN(desbaste)) {
          next.kgNeto = round2(bruto * (1 - desbaste / 100));
        }
      }

      return next;
    });

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleCopiarOperacion = () => {
    if (!selectedOpToCopy) return;
    const op = operaciones.find((o) => o.id === selectedOpToCopy);
    if (!op) return;

    setErrors({});
    setGeneralError(null);

    setFormData((prev) => ({
      ...prev,
      compradorId: op.compradorId ?? '',
      vendedorId: op.vendedorId ?? '',
      modalidadCircuito: op.modalidadCircuito,
      consignatariaExterna: op.consignatariaExterna ?? '',
      categoria: op.categoria,
      subcategoria: op.subcategoria ?? '',
      kgNeto: op.kgNeto,
      kgOrigenBruto: op.kgOrigenBruto ?? '',
      porcentajeDesbaste: op.porcentajeDesbaste ?? '',
      kgLlegadaReferencia: op.kgLlegadaReferencia ?? '',
      precioKgFacturado: op.precioKgFacturado,
      montoExtraCobradoComprador: op.montoExtraCobradoComprador ?? '',
      modalidadPrecio: op.modalidadPrecio,
      precioEsFinal: Boolean(op.precioEsFinal),
      comisionPorcentajeVendedor: op.comisionPorcentajeVendedor,
      comisionPorcentajeComprador: op.comisionPorcentajeComprador,
      comisionTotalCobradaReferencia: op.comisionTotalCobradaReferencia ?? '',
      porcentajeDocumentadoGanado: op.porcentajeDocumentadoGanado,
      porcentajeDocumentadoComisionVendedor: op.porcentajeDocumentadoComisionVendedor,
      porcentajeDocumentadoComisionComprador: op.porcentajeDocumentadoComisionComprador,
      ivaGanadoMontoOverride: op.ivaGanadoMontoOverride ?? '',
      ivaComisionVendedorOverride: op.ivaComisionVendedorOverride ?? '',
      ivaComisionCompradorOverride: op.ivaComisionCompradorOverride ?? '',
      conGarantia: op.conGarantia ?? true,
      retencionesExternasMonto: op.retencionesExternasMonto ?? '',
      condicionEntrega: op.condicionEntrega ?? '',
      fleteCargoDe: op.fleteCargoDe ?? '',
      fleteMonto: op.fleteMonto ?? '',
      formaPago: op.formaPago ?? '',
      plazo: op.plazo ?? '',
      raza: op.raza ?? '',
      color: op.color ?? '',
      puntuacion: op.puntuacion ?? '',
      destino: op.destino ?? '',
      cantidadMachos: op.cantidadMachos ?? '',
      cantidadHembras: op.cantidadHembras ?? '',
      terneros: Boolean(op.terneros),
      observaciones: op.observaciones ?? '',
      fechaOperacion: prev.fechaOperacion || getTodayString(),
    }));
  };

  const executeSubmit = async () => {
    if (isSubmitting) return;

    const validationErrors: Record<string, string> = {};

    if (!formData.compradorId.trim()) {
      validationErrors.compradorId = 'El comprador es obligatorio.';
    }
    if (!formData.vendedorId.trim()) {
      validationErrors.vendedorId = 'El vendedor es obligatorio.';
    }

    const kgNetoNum = Number(formData.kgNeto);
    if (isNaN(kgNetoNum) || kgNetoNum <= 0) {
      validationErrors.kgNeto = 'Los kilos netos deben ser mayores a 0.';
    }

    const precioNum = Number(formData.precioKgFacturado);
    if (isNaN(precioNum) || precioNum <= 0) {
      validationErrors.precioKgFacturado = 'El precio por kilo debe ser mayor a 0.';
    }

    if (!formData.formaPago.trim()) {
      validationErrors.formaPago = 'La forma de pago es obligatoria.';
    }

    if (formData.modalidadCircuito === 'CONSIGNATARIA_EXTERNA' && !formData.consignatariaExterna.trim()) {
      validationErrors.consignatariaExterna = 'El nombre de la consignataria externa es obligatorio.';
    }

    if (formData.porcentajeDesbaste !== '') {
      const desbaste = Number(formData.porcentajeDesbaste);
      if (!isNaN(desbaste) && (desbaste < -8 || desbaste > 15)) {
        validationErrors.porcentajeDesbaste = 'El desbaste debe estar entre -8% y +15%.';
      }
    }

    if (formData.modalidadCircuito === 'PROPIA') {
      const comVend = Number(formData.comisionPorcentajeVendedor);
      const comComp = Number(formData.comisionPorcentajeComprador);
      if (comVend > 0 && comComp > 0) {
        validationErrors.modalidadCircuito = 'En operaciones propias, al menos una comisión debe ser 0%.';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    const payload: OperacionRequest = {
      fechaOperacion: formData.fechaOperacion.includes('T')
        ? formData.fechaOperacion
        : `${formData.fechaOperacion}T00:00:00`,
      modalidadCircuito: formData.modalidadCircuito,
      consignatariaExterna:
        formData.modalidadCircuito === 'CONSIGNATARIA_EXTERNA'
          ? formData.consignatariaExterna.trim() || null
          : null,
      compradorId: formData.compradorId,
      vendedorId: formData.vendedorId,
      categoria: formData.categoria,
      subcategoria: formData.subcategoria.trim() || null,
      kgNeto: kgNetoNum,
      kgOrigenBruto: formData.kgOrigenBruto !== '' ? Number(formData.kgOrigenBruto) : null,
      porcentajeDesbaste: formData.porcentajeDesbaste !== '' ? Number(formData.porcentajeDesbaste) : null,
      kgLlegadaReferencia: formData.kgLlegadaReferencia !== '' ? Number(formData.kgLlegadaReferencia) : null,
      precioKgFacturado: precioNum,
      montoExtraCobradoComprador:
        formData.montoExtraCobradoComprador !== '' ? Number(formData.montoExtraCobradoComprador) : null,
      modalidadPrecio: formData.modalidadPrecio,
      precioEsFinal: formData.precioEsFinal,
      comisionPorcentajeVendedor:
        formData.comisionPorcentajeVendedor !== '' ? Number(formData.comisionPorcentajeVendedor) : null,
      comisionPorcentajeComprador:
        formData.comisionPorcentajeComprador !== '' ? Number(formData.comisionPorcentajeComprador) : null,
      comisionTotalCobradaReferencia:
        formData.modalidadCircuito === 'CONSIGNATARIA_EXTERNA' && formData.comisionTotalCobradaReferencia !== ''
          ? Number(formData.comisionTotalCobradaReferencia)
          : null,
      porcentajeDocumentadoGanado:
        formData.porcentajeDocumentadoGanado !== '' ? Number(formData.porcentajeDocumentadoGanado) : null,
      porcentajeDocumentadoComisionVendedor:
        formData.porcentajeDocumentadoComisionVendedor !== ''
          ? Number(formData.porcentajeDocumentadoComisionVendedor)
          : null,
      porcentajeDocumentadoComisionComprador:
        formData.porcentajeDocumentadoComisionComprador !== ''
          ? Number(formData.porcentajeDocumentadoComisionComprador)
          : null,
      ivaGanadoMontoOverride:
        formData.ivaGanadoMontoOverride !== '' ? Number(formData.ivaGanadoMontoOverride) : null,
      ivaComisionVendedorOverride:
        formData.ivaComisionVendedorOverride !== '' ? Number(formData.ivaComisionVendedorOverride) : null,
      ivaComisionCompradorOverride:
        formData.ivaComisionCompradorOverride !== '' ? Number(formData.ivaComisionCompradorOverride) : null,
      conGarantia: formData.conGarantia,
      retencionesExternasMonto:
        formData.modalidadCircuito === 'CONSIGNATARIA_EXTERNA' && formData.retencionesExternasMonto !== ''
          ? Number(formData.retencionesExternasMonto)
          : null,
      condicionEntrega: (formData.condicionEntrega as CondicionEntrega) || null,
      fleteCargoDe: (formData.fleteCargoDe as FleteCargoDe) || null,
      fleteMonto: formData.fleteMonto !== '' ? Number(formData.fleteMonto) : null,
      formaPago: formData.formaPago.trim(),
      plazo: formData.plazo.trim() || null,
      raza: (formData.raza as Raza) || null,
      color: formData.color.trim() || null,
      puntuacion: formData.puntuacion.trim() || null,
      destino: formData.destino.trim() || null,
      cantidadMachos: formData.cantidadMachos !== '' ? Number(formData.cantidadMachos) : null,
      cantidadHembras: formData.cantidadHembras !== '' ? Number(formData.cantidadHembras) : null,
      terneros: formData.terneros,
      observaciones: formData.observaciones.trim() || null,
    };

    try {
      let result: OperacionResponse;
      if (mode === 'edit' && initialOperacion?.id) {
        result = await updateOperacion(initialOperacion.id, payload);
      } else {
        result = await createOperacion(payload);
      }
      onSuccess(result);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.data?.errores && typeof err.data.errores === 'object') {
          setErrors(err.data.errores as Record<string, string>);
        }
        if (err.data?.detail && typeof err.data.detail === 'string') {
          setGeneralError(err.data.detail);
        } else {
          setGeneralError('No se pudo guardar la operación. Reintentá en un momento.');
        }
      } else {
        setGeneralError('No se pudo guardar la operación. Reintentá en un momento.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSubmit();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Barra superior de Copiar Operacion */}
      {operaciones.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="copiarOpSelect" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Copiar de operación anterior:
            </label>
            <select
              id="copiarOpSelect"
              aria-label="Copiar de operación anterior"
              value={selectedOpToCopy}
              onChange={(e) => setSelectedOpToCopy(e.target.value)}
              className="flex-1 text-sm border border-gray-300 rounded-md p-2 bg-white"
            >
              <option value="">Seleccionar operación anterior...</option>
              {operaciones.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.fechaOperacion?.slice(0, 10)} - {op.compradorNombre ?? 'Comprador'} / {op.vendedorNombre ?? 'Vendedor'} ({op.categoria})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleCopiarOperacion}
            disabled={!selectedOpToCopy}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Copiar datos
          </button>
        </div>
      )}

      {/* Banner de error general RFC 7807 */}
      {generalError && (
        <div
          role="alert"
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal (2 columnas en desktop) */}
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-2 space-y-6 bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'edit' ? `Editar Operación ${initialOperacion?.id ?? ''}` : 'Nueva Operación'}
            </h2>
          </div>

          {/* Seccion 1: Datos Comerciales y Partes */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-900">Partes y Circuito Comercial</legend>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="fechaOperacion" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de operación *
                </label>
                <input
                  type="date"
                  id="fechaOperacion"
                  name="fechaOperacion"
                  aria-label="Fecha de operación"
                  value={formData.fechaOperacion}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label htmlFor="modalidadCircuito" className="block text-sm font-medium text-gray-700 mb-1">
                  Circuito *
                </label>
                <select
                  id="modalidadCircuito"
                  name="modalidadCircuito"
                  aria-label="Circuito"
                  value={formData.modalidadCircuito}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                >
                  <option value="DIRECTO">DIRECTO</option>
                  <option value="CONSIGNATARIA_EXTERNA">CONSIGNATARIA_EXTERNA</option>
                  <option value="PROPIA">PROPIA</option>
                </select>
                {errors.modalidadCircuito && (
                  <p className="mt-1 text-xs text-red-600">{errors.modalidadCircuito}</p>
                )}
              </div>

              {formData.modalidadCircuito === 'CONSIGNATARIA_EXTERNA' && (
                <div>
                  <label htmlFor="consignatariaExterna" className="block text-sm font-medium text-gray-700 mb-1">
                    Consignataria externa *
                  </label>
                  <input
                    type="text"
                    id="consignatariaExterna"
                    name="consignatariaExterna"
                    aria-label="Consignataria externa"
                    value={formData.consignatariaExterna}
                    onChange={handleChange}
                    className="w-full text-sm border border-gray-300 rounded-md p-2"
                  />
                  {errors.consignatariaExterna && (
                    <p className="mt-1 text-xs text-red-600">{errors.consignatariaExterna}</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="compradorId" className="block text-sm font-medium text-gray-700 mb-1">
                  Comprador *
                </label>
                <select
                  id="compradorId"
                  name="compradorId"
                  aria-label="Comprador"
                  value={formData.compradorId}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                >
                  <option value="">Seleccionar comprador...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombreRazonSocial}
                    </option>
                  ))}
                </select>
                {errors.compradorId && (
                  <p className="mt-1 text-xs text-red-600">{errors.compradorId}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="vendedorId" className="text-sm font-medium text-gray-700">
                    Vendedor *
                  </label>
                  {vendedorSeleccionado && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                      {condicionFiscalVendedor === 'RESPONSABLE_INSCRIPTO' ? 'Responsable Inscripto' : condicionFiscalVendedor}
                    </span>
                  )}
                </div>
                <select
                  id="vendedorId"
                  name="vendedorId"
                  aria-label="Vendedor"
                  value={formData.vendedorId}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                >
                  <option value="">Seleccionar vendedor...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombreRazonSocial}
                    </option>
                  ))}
                </select>
                {errors.vendedorId && (
                  <p className="mt-1 text-xs text-red-600">{errors.vendedorId}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Seccion 2: Hacienda y Pesos */}
          <fieldset className="space-y-4 pt-4 border-t border-gray-200">
            <legend className="text-lg font-semibold text-gray-900">Hacienda, Pesos y Desbaste</legend>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  aria-label="Categoría"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                >
                  <option value="FAENA">FAENA</option>
                  <option value="INVERNADA">INVERNADA</option>
                  <option value="REPRODUCCION">REPRODUCCION</option>
                </select>
              </div>

              <div>
                <label htmlFor="subcategoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategoría
                </label>
                <input
                  type="text"
                  id="subcategoria"
                  name="subcategoria"
                  aria-label="Subcategoría"
                  placeholder="ej. Novillitos, Vaquillonas"
                  value={formData.subcategoria}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label htmlFor="raza" className="block text-sm font-medium text-gray-700 mb-1">
                  Raza
                </label>
                <select
                  id="raza"
                  name="raza"
                  aria-label="Raza"
                  value={formData.raza}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                >
                  <option value="">Sin especificar</option>
                  <option value="BRANGUS">BRANGUS</option>
                  <option value="COLORADO">COLORADO</option>
                  <option value="NEGRO">NEGRO</option>
                  <option value="BRAFORD">BRAFORD</option>
                  <option value="DEFINIDO">DEFINIDO</option>
                  <option value="VARIOS">VARIOS</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <div>
                <label htmlFor="kgOrigenBruto" className="block text-xs font-medium text-gray-700 mb-1">
                  Kilos origen bruto
                </label>
                <input
                  type="number"
                  step="any"
                  id="kgOrigenBruto"
                  name="kgOrigenBruto"
                  aria-label="Kilos origen bruto"
                  value={formData.kgOrigenBruto}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                />
              </div>

              <div>
                <label htmlFor="porcentajeDesbaste" className="block text-xs font-medium text-gray-700 mb-1">
                  Porcentaje de desbaste (-8 a +15%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="-8"
                  max="15"
                  id="porcentajeDesbaste"
                  name="porcentajeDesbaste"
                  aria-label="Porcentaje de desbaste"
                  value={formData.porcentajeDesbaste}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                />
                {errors.porcentajeDesbaste && (
                  <p className="mt-1 text-xs text-red-600">{errors.porcentajeDesbaste}</p>
                )}
              </div>

              <div>
                <label htmlFor="kgNeto" className="block text-xs font-bold text-gray-900 mb-1">
                  Kilos netos *
                </label>
                <input
                  type="number"
                  step="any"
                  id="kgNeto"
                  name="kgNeto"
                  aria-label="Kilos netos"
                  value={formData.kgNeto}
                  onChange={handleChange}
                  className="w-full text-sm border-2 border-green-600 rounded-md p-2 bg-white font-semibold"
                />
                {errors.kgNeto && <p className="mt-1 text-xs text-red-600">{errors.kgNeto}</p>}
              </div>

              <div>
                <label htmlFor="kgLlegadaReferencia" className="block text-xs font-medium text-gray-700 mb-1">
                  Kilos de llegada referencia
                </label>
                <input
                  type="number"
                  step="any"
                  id="kgLlegadaReferencia"
                  name="kgLlegadaReferencia"
                  aria-label="Kilos de llegada referencia"
                  value={formData.kgLlegadaReferencia}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="cantidadMachos" className="block text-xs font-medium text-gray-700 mb-1">
                  Machos
                </label>
                <input
                  type="number"
                  id="cantidadMachos"
                  name="cantidadMachos"
                  aria-label="Cantidad de machos"
                  value={formData.cantidadMachos}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label htmlFor="cantidadHembras" className="block text-xs font-medium text-gray-700 mb-1">
                  Hembras
                </label>
                <input
                  type="number"
                  id="cantidadHembras"
                  name="cantidadHembras"
                  aria-label="Cantidad de hembras"
                  value={formData.cantidadHembras}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="terneros"
                    aria-label="Con terneros al pie"
                    checked={formData.terneros}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 rounded border-gray-300 mr-2"
                  />
                  Terneros al pie
                </label>
              </div>
              <div>
                <label htmlFor="destino" className="block text-xs font-medium text-gray-700 mb-1">
                  Destino
                </label>
                <input
                  type="text"
                  id="destino"
                  name="destino"
                  aria-label="Destino"
                  placeholder="ej. Faena, Campo"
                  value={formData.destino}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          </fieldset>

          {/* Seccion 3: Precios y Comisiones */}
          <fieldset className="space-y-4 pt-4 border-t border-gray-200">
            <legend className="text-lg font-semibold text-gray-900">Precio y Comisiones</legend>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="precioKgFacturado" className="block text-sm font-bold text-gray-900 mb-1">
                  Precio/Kg *
                </label>
                <input
                  type="number"
                  step="any"
                  id="precioKgFacturado"
                  name="precioKgFacturado"
                  aria-label="Precio por kilo facturado"
                  value={formData.precioKgFacturado}
                  onChange={handleChange}
                  className="w-full text-sm border-2 border-green-600 rounded-md p-2 font-semibold"
                />
                {errors.precioKgFacturado && (
                  <p className="mt-1 text-xs text-red-600">{errors.precioKgFacturado}</p>
                )}
              </div>

              <div>
                <label htmlFor="modalidadPrecio" className="block text-sm font-medium text-gray-700 mb-1">
                  Modalidad Precio
                </label>
                <select
                  id="modalidadPrecio"
                  name="modalidadPrecio"
                  aria-label="Modalidad del precio"
                  value={formData.modalidadPrecio}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                >
                  <option value="NETO">NETO (más IVA si corresponde)</option>
                  <option value="FINAL">FINAL (IVA incluido)</option>
                </select>
              </div>

              <div>
                <label htmlFor="montoExtraCobradoComprador" className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Extra Comprador
                </label>
                <input
                  type="number"
                  step="any"
                  id="montoExtraCobradoComprador"
                  name="montoExtraCobradoComprador"
                  aria-label="Monto extra cobrado al comprador"
                  value={formData.montoExtraCobradoComprador}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="comisionPorcentajeVendedor" className="block text-sm font-medium text-gray-700 mb-1">
                  Comisión Vendedor (% pactado)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="comisionPorcentajeVendedor"
                  name="comisionPorcentajeVendedor"
                  aria-label="Porcentaje de comisión al vendedor"
                  value={formData.comisionPorcentajeVendedor}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label htmlFor="comisionPorcentajeComprador" className="block text-sm font-medium text-gray-700 mb-1">
                  Comisión Comprador (% pactado)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="comisionPorcentajeComprador"
                  name="comisionPorcentajeComprador"
                  aria-label="Porcentaje de comisión al comprador"
                  value={formData.comisionPorcentajeComprador}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>

            {formData.modalidadCircuito === 'CONSIGNATARIA_EXTERNA' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50 p-4 rounded-md border border-amber-200">
                <div>
                  <label htmlFor="comisionTotalCobradaReferencia" className="block text-xs font-medium text-amber-900 mb-1">
                    Comisión Total Cobrada Referencia
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="comisionTotalCobradaReferencia"
                    name="comisionTotalCobradaReferencia"
                    aria-label="Comisión total cobrada referencia"
                    value={formData.comisionTotalCobradaReferencia}
                    onChange={handleChange}
                    className="w-full text-sm border border-amber-300 rounded-md p-2 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="retencionesExternasMonto" className="block text-xs font-medium text-amber-900 mb-1">
                    Retenciones Externas Monto
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="retencionesExternasMonto"
                    name="retencionesExternasMonto"
                    aria-label="Retenciones externas monto"
                    value={formData.retencionesExternasMonto}
                    onChange={handleChange}
                    className="w-full text-sm border border-amber-300 rounded-md p-2 bg-white"
                  />
                </div>
              </div>
            )}
          </fieldset>

          {/* Seccion 4: Pago y Entrega */}
          <fieldset className="space-y-4 pt-4 border-t border-gray-200">
            <legend className="text-lg font-semibold text-gray-900">Condiciones de Pago y Entrega</legend>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="formaPago" className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pago *
                </label>
                <input
                  type="text"
                  id="formaPago"
                  name="formaPago"
                  aria-label="Forma de pago"
                  placeholder="ej. 30/60 días, Contado"
                  value={formData.formaPago}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
                {errors.formaPago && <p className="mt-1 text-xs text-red-600">{errors.formaPago}</p>}
              </div>

              <div>
                <label htmlFor="plazo" className="block text-sm font-medium text-gray-700 mb-1">
                  Plazo (días)
                </label>
                <input
                  type="text"
                  id="plazo"
                  name="plazo"
                  aria-label="Plazo en días"
                  placeholder="ej. 30, 30-60"
                  value={formData.plazo}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="conGarantia"
                    aria-label="Operación con garantía"
                    checked={formData.conGarantia}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 rounded border-gray-300 mr-2"
                  />
                  Con garantía de la firma
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="condicionEntrega" className="block text-sm font-medium text-gray-700 mb-1">
                  Condición de Entrega
                </label>
                <select
                  id="condicionEntrega"
                  name="condicionEntrega"
                  aria-label="Condición de entrega"
                  value={formData.condicionEntrega}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                >
                  <option value="">Sin especificar</option>
                  <option value="A_RETIRAR_CAMPO">A RETIRAR CAMPO</option>
                  <option value="PUESTO_EN_PLANTA">PUESTO EN PLANTA</option>
                </select>
              </div>

              <div>
                <label htmlFor="fleteCargoDe" className="block text-sm font-medium text-gray-700 mb-1">
                  Flete a cargo de
                </label>
                <select
                  id="fleteCargoDe"
                  name="fleteCargoDe"
                  aria-label="Flete a cargo de"
                  value={formData.fleteCargoDe}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                >
                  <option value="">Sin flete</option>
                  <option value="COMPRADOR">COMPRADOR</option>
                  <option value="VENDEDOR">VENDEDOR</option>
                  <option value="NINGUNO">NINGUNO</option>
                </select>
              </div>

              <div>
                <label htmlFor="fleteMonto" className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Flete ($)
                </label>
                <input
                  type="number"
                  step="any"
                  id="fleteMonto"
                  name="fleteMonto"
                  aria-label="Monto de flete"
                  value={formData.fleteMonto}
                  onChange={handleChange}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          </fieldset>

          {/* Seccion 5: Configuracion Fiscal Avanzada (Colapsable) */}
          <details className="pt-4 border-t border-gray-200">
            <summary className="font-semibold text-gray-700 cursor-pointer text-sm py-2 hover:text-gray-900 select-none">
              Configuración Fiscal Avanzada (porcentajes declarados y overrides de IVA)
            </summary>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="porcentajeDocumentadoGanado" className="block text-xs font-medium text-gray-700 mb-1">
                    % Documentado Ganado
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="porcentajeDocumentadoGanado"
                    name="porcentajeDocumentadoGanado"
                    aria-label="Porcentaje documentado de ganado"
                    value={formData.porcentajeDocumentadoGanado}
                    onChange={handleChange}
                    className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="porcentajeDocumentadoComisionVendedor" className="block text-xs font-medium text-gray-700 mb-1">
                    % Doc. Comisión Vendedor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="porcentajeDocumentadoComisionVendedor"
                    name="porcentajeDocumentadoComisionVendedor"
                    aria-label="Porcentaje documentado comisión vendedor"
                    value={formData.porcentajeDocumentadoComisionVendedor}
                    onChange={handleChange}
                    className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="porcentajeDocumentadoComisionComprador" className="block text-xs font-medium text-gray-700 mb-1">
                    % Doc. Comisión Comprador
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="porcentajeDocumentadoComisionComprador"
                    name="porcentajeDocumentadoComisionComprador"
                    aria-label="Porcentaje documentado comisión comprador"
                    value={formData.porcentajeDocumentadoComisionComprador}
                    onChange={handleChange}
                    className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="ivaGanadoMontoOverride" className="block text-xs font-medium text-gray-700 mb-1">
                    Override IVA Ganado ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="ivaGanadoMontoOverride"
                    name="ivaGanadoMontoOverride"
                    aria-label="Override de IVA ganado"
                    placeholder="Automático"
                    value={formData.ivaGanadoMontoOverride}
                    onChange={handleChange}
                    className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="ivaComisionVendedorOverride" className="block text-xs font-medium text-gray-700 mb-1">
                    Override IVA Com. Vendedor ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="ivaComisionVendedorOverride"
                    name="ivaComisionVendedorOverride"
                    aria-label="Override de IVA comisión vendedor"
                    placeholder="Automático"
                    value={formData.ivaComisionVendedorOverride}
                    onChange={handleChange}
                    className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="ivaComisionCompradorOverride" className="block text-xs font-medium text-gray-700 mb-1">
                    Override IVA Com. Comprador ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="ivaComisionCompradorOverride"
                    name="ivaComisionCompradorOverride"
                    aria-label="Override de IVA comisión comprador"
                    placeholder="Automático"
                    value={formData.ivaComisionCompradorOverride}
                    onChange={handleChange}
                    className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Observaciones */}
          <div className="pt-4 border-t border-gray-200">
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              aria-label="Observaciones"
              rows={2}
              value={formData.observaciones}
              onChange={handleChange}
              className="w-full text-sm border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Botones de accion */}
          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-700 text-white rounded-md text-sm font-medium hover:bg-green-800 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting
                ? 'Guardando...'
                : mode === 'edit'
                ? 'Guardar cambios'
                : 'Guardar Operación'}
            </button>
          </div>
        </form>

        {/* Panel lateral sticky: Vista Previa de Liquidacion (Anexo II) */}
        <aside
          aria-label="Vista Previa de Liquidación"
          className="lg:col-span-1 bg-white p-6 rounded-lg border border-gray-200 space-y-4 self-start md:sticky top-4"
        >
          <div className="border-b border-gray-200 pb-3">
            <h3 className="text-lg font-bold text-gray-900">Vista Previa de Liquidación</h3>
            <p className="text-xs text-gray-500">Cálculo fiscal y financiero en tiempo real</p>
          </div>

          {calculoPreview ? (
            <div className="space-y-4 text-sm">
              {/* Capa 1 */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Capa 1: Valor Económico
                </h4>
                <div className="space-y-1 bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capital Ganado:</span>
                    <span className="font-semibold text-gray-900 font-mono">
                      {formatMoney(calculoPreview.subtotalGanado)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Comisión Vendedor:</span>
                    <span className="font-mono">{formatMoney(calculoPreview.comisionVendedorMonto)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Comisión Comprador:</span>
                    <span className="font-mono">{formatMoney(calculoPreview.comisionCompradorMonto)}</span>
                  </div>
                </div>
              </div>

              {/* Capa 2 */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Capa 2: Impuestos
                </h4>
                <div className="space-y-1 bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA Ganado:</span>
                    <span className="font-semibold text-gray-900 font-mono">
                      {formatMoney(calculoPreview.ivaGanado)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>IVA Comisión Vendedor (21%):</span>
                    <span className="font-mono">{formatMoney(calculoPreview.ivaComisionVendedorMonto)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>IVA Comisión Comprador (21%):</span>
                    <span className="font-mono">{formatMoney(calculoPreview.ivaComisionCompradorMonto)}</span>
                  </div>
                </div>
              </div>

              {/* Capa 3 */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Capa 3: Saldos Finales
                </h4>
                <div className="space-y-2 bg-green-50 p-3 rounded border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-green-900">Saldo Hacienda Partes:</span>
                    <span className="font-bold text-green-900 font-mono">
                      {formatMoney(calculoPreview.saldoHaciendaEntrePartes)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-green-200">
                    <span className="text-xs font-bold text-green-900">Comisión Firma:</span>
                    <span className="font-bold text-green-700 font-mono text-base">
                      {formatMoney(calculoPreview.saldoComisionFirma)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-green-800 pt-1">
                    <span>Total Cobrar Comprador:</span>
                    <span className="font-mono">{formatMoney(calculoPreview.totalACobrarComprador)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-green-800">
                    <span>Total Pagar Vendedor:</span>
                    <span className="font-mono">{formatMoney(calculoPreview.totalAPagarVendedor)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400 bg-gray-50 rounded border border-dashed border-gray-300">
              <p className="text-sm">Ingresá kilos netos y precio para ver la liquidación en vivo.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
