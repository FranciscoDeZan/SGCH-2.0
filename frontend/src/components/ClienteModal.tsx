import React, { useState, useEffect } from 'react';
import type { Cliente } from '../types/cliente';
import axios from 'axios';

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: Cliente) => Promise<void>;
  clienteToEdit?: Cliente | null;
}

export const ClienteModal: React.FC<ClienteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clienteToEdit,
}) => {
  const [formData, setFormData] = useState<Cliente>({
    nombreRazonSocial: '',
    telefono: '',
    direccion: '',
    email: '',
    calificacion: undefined,
    tipoHacienda: '',
    formasPagoPreferidas: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clienteToEdit) {
      setFormData({
        ...clienteToEdit,
        email: clienteToEdit.email || '',
        tipoHacienda: clienteToEdit.tipoHacienda || '',
        formasPagoPreferidas: clienteToEdit.formasPagoPreferidas || '',
        observaciones: clienteToEdit.observaciones || '',
      });
    } else {
      setFormData({
        nombreRazonSocial: '',
        telefono: '',
        direccion: '',
        email: '',
        calificacion: undefined,
        tipoHacienda: '',
        formasPagoPreferidas: '',
        observaciones: '',
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [clienteToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? (name === 'calificacion' ? undefined : '') : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const problem = err.response.data;
        if (problem.errores && typeof problem.errores === 'object') {
          setErrors(problem.errores as Record<string, string>);
        } else if (problem.detail) {
          setGeneralError(problem.detail);
        } else {
          setGeneralError('Ocurrió un error al procesar la solicitud.');
        }
      } else {
        setGeneralError('Error de red o conexión.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800">
            {clienteToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {generalError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Nombre / Razón Social *
              </label>
              <input
                type="text"
                name="nombreRazonSocial"
                value={formData.nombreRazonSocial}
                onChange={handleChange}
                required
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                  errors.nombreRazonSocial
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Ej: Cabaña Los Ombúes S.A."
              />
              {errors.nombreRazonSocial && (
                <p className="mt-1 text-xs text-red-600">{errors.nombreRazonSocial}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Teléfono *
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                  errors.telefono
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Ej: 3415551234"
              />
              {errors.telefono && (
                <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="contacto@empresa.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Dirección / Localidad *
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                  errors.direccion
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Ej: Pergamino, Buenos Aires"
              />
              {errors.direccion && (
                <p className="mt-1 text-xs text-red-600">{errors.direccion}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Calificación
              </label>
              <select
                name="calificacion"
                value={formData.calificacion || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Sin Calificación</option>
                <option value="A">Categoría A (Alta confiabilidad)</option>
                <option value="B">Categoría B (Estándar)</option>
                <option value="C">Categoría C (Precaución)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Tipo de Hacienda
              </label>
              <input
                type="text"
                name="tipoHacienda"
                value={formData.tipoHacienda || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                placeholder="Ej: Invernada, Cría, Faena"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Formas de Pago Preferidas
              </label>
              <input
                type="text"
                name="formasPagoPreferidas"
                value={formData.formasPagoPreferidas || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                placeholder="Ej: Cheque 30/60 días, Contado"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                rows={2}
                value={formData.observaciones || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                placeholder="Detalles comerciales, preferencias operativas..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : clienteToEdit ? 'Guardar Cambios' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
