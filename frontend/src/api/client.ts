import type { Cliente } from '../types/cliente';
import type {
  OperacionResponse,
  OperacionRequest,
  OperacionFiltros,
} from '../types/operacion';
import type { CobroResponse, CobroRequest } from '../types/cobro';

export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;

  constructor(status: number, statusText: string, data?: any) {
    super(`API error: ${status} ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * Base API fetch wrapper using native fetch.
 * Automatically prepends '/api/v1' and includes default JSON headers.
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/api')
    ? endpoint
    : `/api/v1${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  const response = await fetch(normalizedEndpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(response.status, response.statusText, data);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : (undefined as T);
}

// Cliente API Helpers
export const getClientes = async (): Promise<Cliente[]> => {
  return apiFetch<Cliente[]>('/clientes');
};

export const getClienteById = async (id: string): Promise<Cliente> => {
  return apiFetch<Cliente>(`/clientes/${id}`);
};

export const createCliente = async (cliente: Cliente): Promise<Cliente> => {
  return apiFetch<Cliente>('/clientes', {
    method: 'POST',
    body: JSON.stringify(cliente),
  });
};

export const updateCliente = async (id: string, cliente: Cliente): Promise<Cliente> => {
  return apiFetch<Cliente>(`/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cliente),
  });
};

export const deleteCliente = async (id: string): Promise<void> => {
  await apiFetch<void>(`/clientes/${id}`, {
    method: 'DELETE',
  });
};

// Operaciones API Helpers
export const getOperaciones = async (filtros?: OperacionFiltros): Promise<OperacionResponse[]> => {
  const params = new URLSearchParams();

  if (filtros) {
    if (filtros.circuito) {
      params.append('circuito', filtros.circuito);
    }
    if (filtros.clienteId) {
      params.append('clienteId', filtros.clienteId);
    }
    if (filtros.estado) {
      params.append('estado', filtros.estado);
    }
    if (filtros.fechaDesde) {
      const fechaDesdeNorm = filtros.fechaDesde.includes('T')
        ? filtros.fechaDesde
        : `${filtros.fechaDesde}T00:00:00`;
      params.append('fechaDesde', fechaDesdeNorm);
    }
    if (filtros.fechaHasta) {
      const fechaHastaNorm = filtros.fechaHasta.includes('T')
        ? filtros.fechaHasta
        : `${filtros.fechaHasta}T23:59:59`;
      params.append('fechaHasta', fechaHastaNorm);
    }
  }

  const query = params.toString();
  const endpoint = query ? `/operaciones?${query}` : '/operaciones';
  return apiFetch<OperacionResponse[]>(endpoint);
};

export const getOperacionById = async (id: string): Promise<OperacionResponse> => {
  return apiFetch<OperacionResponse>(`/operaciones/${encodeURIComponent(id)}`);
};

export const createOperacion = async (operacion: OperacionRequest): Promise<OperacionResponse> => {
  return apiFetch<OperacionResponse>('/operaciones', {
    method: 'POST',
    body: JSON.stringify(operacion),
  });
};

export const updateOperacion = async (id: string, operacion: OperacionRequest): Promise<OperacionResponse> => {
  return apiFetch<OperacionResponse>(`/operaciones/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(operacion),
  });
};

// Cobros API Helpers
export const getCobrosByOperacion = async (operacionId: string): Promise<CobroResponse[]> => {
  return apiFetch<CobroResponse[]>(`/cobros?operacionId=${encodeURIComponent(operacionId)}`);
};

export const createCobro = async (cobro: CobroRequest): Promise<CobroResponse> => {
  return apiFetch<CobroResponse>('/cobros', {
    method: 'POST',
    body: JSON.stringify(cobro),
  });
};
