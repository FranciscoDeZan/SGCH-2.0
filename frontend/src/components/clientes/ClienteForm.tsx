import React, { useState } from 'react';
import type { Cliente, CalificacionCliente } from '../../types/cliente';
import { apiFetch, ApiError } from '../../api/client';

export interface ClienteFormProps {
  onSuccess: (cliente: Cliente) => void;
  onCancel: () => void;
  initialData?: Cliente;
}

interface FormValues {
  nombreRazonSocial: string;
  telefono: string;
  direccion: string;
  email: string;
  latitud: string | number;
  longitud: string | number;
  calificacion: '' | 'A' | 'B' | 'C';
  tipoHacienda: string;
  formasPagoPreferidas: string;
  observaciones: string;
  fechaUltimaOperacion: string;
  fechaUltimoContacto: string;
}

export function ClienteForm({ onSuccess, onCancel, initialData }: ClienteFormProps) {
  const [formData, setFormData] = useState<FormValues>(() => ({
    nombreRazonSocial: initialData?.nombreRazonSocial ?? '',
    telefono: initialData?.telefono ?? '',
    direccion: initialData?.direccion ?? '',
    email: initialData?.email ?? '',
    latitud: initialData?.latitud != null ? initialData.latitud : '',
    longitud: initialData?.longitud != null ? initialData.longitud : '',
    calificacion: (initialData?.calificacion as '' | 'A' | 'B' | 'C') ?? '',
    tipoHacienda: initialData?.tipoHacienda ?? '',
    formasPagoPreferidas: initialData?.formasPagoPreferidas ?? '',
    observaciones: initialData?.observaciones ?? '',
    fechaUltimaOperacion: initialData?.fechaUltimaOperacion
      ? initialData.fechaUltimaOperacion.slice(0, 10)
      : '',
    fechaUltimoContacto: initialData?.fechaUltimoContacto
      ? initialData.fechaUltimoContacto.slice(0, 10)
      : '',
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const executeSubmit = async () => {
    const validationErrors: Record<string, string> = {};
    if (!formData.nombreRazonSocial.trim()) {
      validationErrors.nombreRazonSocial = 'El nombre o razón social es obligatorio.';
    }
    if (!formData.telefono.trim()) {
      validationErrors.telefono = 'El teléfono es obligatorio.';
    }
    if (!formData.direccion.trim()) {
      validationErrors.direccion = 'La dirección es obligatoria.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    const payload: Cliente = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      nombreRazonSocial: formData.nombreRazonSocial.trim(),
      telefono: formData.telefono.trim(),
      direccion: formData.direccion.trim(),
      email: formData.email.trim() || undefined,
      latitud:
        formData.latitud !== '' && formData.latitud != null && !isNaN(Number(formData.latitud))
          ? Number(formData.latitud)
          : null,
      longitud:
        formData.longitud !== '' && formData.longitud != null && !isNaN(Number(formData.longitud))
          ? Number(formData.longitud)
          : null,
      calificacion: (formData.calificacion as CalificacionCliente) || undefined,
      tipoHacienda: formData.tipoHacienda.trim() || undefined,
      formasPagoPreferidas: formData.formasPagoPreferidas.trim() || undefined,
      observaciones: formData.observaciones.trim() || undefined,
      fechaUltimaOperacion: formData.fechaUltimaOperacion || null,
      fechaUltimoContacto: formData.fechaUltimoContacto || null,
    };

    try {
      const endpoint = initialData?.id ? `/clientes/${initialData.id}` : '/clientes';
      const method = initialData?.id ? 'PUT' : 'POST';
      const result = await apiFetch<Cliente>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });
      onSuccess(result);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.data?.errores && typeof err.data.errores === 'object') {
          setErrors(err.data.errores as Record<string, string>);
        }
        if (err.data?.detail && typeof err.data.detail === 'string') {
          setGeneralError(err.data.detail);
        } else {
          setGeneralError('No se pudo guardar. Reintentá en un momento.');
        }
      } else {
        setGeneralError('No se pudo guardar. Reintentá en un momento.');
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
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {initialData?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
      </h2>

      {generalError && (
        <div
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{generalError}</span>
          </div>
          <button
            type="button"
            onClick={() => executeSubmit()}
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition cursor-pointer self-start sm:self-auto"
          >
            Reintentar
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Nombre / Razón Social */}
          <div className="sm:col-span-2">
            <label
              htmlFor="nombreRazonSocial"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Nombre / Razón Social *
            </label>
            <input
              id="nombreRazonSocial"
              type="text"
              name="nombreRazonSocial"
              value={formData.nombreRazonSocial}
              onChange={handleChange}
              placeholder="Ej: Agropecuaria Los Ombúes S.A."
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                errors.nombreRazonSocial
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600'
              }`}
            />
            {errors.nombreRazonSocial && (
              <p className="mt-1 text-xs text-red-600">{errors.nombreRazonSocial}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label
              htmlFor="telefono"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Teléfono *
            </label>
            <input
              id="telefono"
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ej: 3415551234"
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                errors.telefono
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600'
              }`}
            />
            {errors.telefono && <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contacto@campo.com"
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                errors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* Dirección */}
          <div className="sm:col-span-2">
            <label
              htmlFor="direccion"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Dirección *
            </label>
            <input
              id="direccion"
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ej: Ruta 9 Km 200, Pergamino"
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                errors.direccion
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600'
              }`}
            />
            {errors.direccion && <p className="mt-1 text-xs text-red-600">{errors.direccion}</p>}
          </div>

          {/* Latitud */}
          <div>
            <label
              htmlFor="latitud"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Latitud
            </label>
            <input
              id="latitud"
              type="number"
              step="any"
              name="latitud"
              value={formData.latitud}
              onChange={handleChange}
              placeholder="-32.95"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
            />
          </div>

          {/* Longitud */}
          <div>
            <label
              htmlFor="longitud"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Longitud
            </label>
            <input
              id="longitud"
              type="number"
              step="any"
              name="longitud"
              value={formData.longitud}
              onChange={handleChange}
              placeholder="-60.65"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
            />
          </div>

          {/* Calificación */}
          <div>
            <label
              htmlFor="calificacion"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Calificación
            </label>
            <select
              id="calificacion"
              name="calificacion"
              value={formData.calificacion}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
            >
              <option value="">Sin Calificación</option>
              <option value="A">Categoría A</option>
              <option value="B">Categoría B</option>
              <option value="C">Categoría C</option>
            </select>
          </div>

          {/* Tipo de Hacienda */}
          <div>
            <label
              htmlFor="tipoHacienda"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Tipo de Hacienda
            </label>
            <input
              id="tipoHacienda"
              type="text"
              name="tipoHacienda"
              value={formData.tipoHacienda}
              onChange={handleChange}
              placeholder="Ej: Invernada, Cría, Faena"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
            />
          </div>

          {/* Formas de Pago Preferidas */}
          <div className="sm:col-span-2">
            <label
              htmlFor="formasPagoPreferidas"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Formas de Pago Preferidas
            </label>
            <input
              id="formasPagoPreferidas"
              type="text"
              name="formasPagoPreferidas"
              value={formData.formasPagoPreferidas}
              onChange={handleChange}
              placeholder="Ej: Cheque 30/60 días, Transferencia"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
            />
          </div>

          {/* Observaciones */}
          <div className="sm:col-span-2">
            <label
              htmlFor="observaciones"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              rows={3}
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Detalles comerciales, preferencias operativas..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
            />
          </div>

          {/* Fecha de Última Operación */}
          <div>
            <label
              htmlFor="fechaUltimaOperacion"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Fecha de Última Operación
            </label>
            <input
              id="fechaUltimaOperacion"
              type="date"
              name="fechaUltimaOperacion"
              value={formData.fechaUltimaOperacion}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
            />
          </div>

          {/* Fecha de Último Contacto */}
          <div>
            <label
              htmlFor="fechaUltimoContacto"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Fecha de Último Contacto
            </label>
            <input
              id="fechaUltimoContacto"
              type="date"
              name="fechaUltimoContacto"
              value={formData.fechaUltimoContacto}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 focus:outline-none transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar Cliente
          </button>
        </div>
      </form>
    </div>
  );
}
