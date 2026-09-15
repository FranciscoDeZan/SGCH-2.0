import type { Cliente } from '../types/cliente';

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
 * Automatically prepends '/api' and includes default JSON headers.
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/api')
    ? endpoint
    : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

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
