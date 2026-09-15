import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  apiFetch,
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} from './client';
import type { Cliente } from '../types/cliente';

describe('apiFetch & client service', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('apiFetch', () => {
    it('prepends /api to endpoint if missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ message: 'ok' })),
      });

      const result = await apiFetch<{ message: string }>('/clientes');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/clientes',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual({ message: 'ok' });
    });

    it('does not duplicate /api prefix if already present', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ status: 'healthy' })),
      });

      await apiFetch('/api/health');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/health',
        expect.anything()
      );
    });

    it('handles endpoint without leading slash', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify([])),
      });

      await apiFetch('clientes');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/clientes',
        expect.anything()
      );
    });

    it('merges custom headers with default headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({})),
      });

      await apiFetch('/custom', {
        headers: {
          'X-Custom-Header': 'custom-val',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/custom',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-val',
          }),
        })
      );
    });

    it('handles 204 No Content responses without parsing JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: () => Promise.resolve(''),
      });

      const result = await apiFetch<void>('/clientes/123', { method: 'DELETE' });

      expect(result).toBeUndefined();
    });

    it('throws an error if response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('Resource not found'),
      });

      await expect(apiFetch('/not-found')).rejects.toThrow('API error: 404 Not Found - Resource not found');
    });
  });

  describe('helper methods', () => {
    const mockCliente: Cliente = {
      id: '123',
      nombreRazonSocial: 'Estancia Don Pedro',
      telefono: '1123456789',
      direccion: 'Ruta 5 Km 100',
      calificacion: 'A',
    };

    it('getClientes calls GET /api/clientes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify([mockCliente])),
      });

      const clientes = await getClientes();

      expect(mockFetch).toHaveBeenCalledWith('/api/clientes', expect.anything());
      expect(clientes).toEqual([mockCliente]);
    });

    it('getClienteById calls GET /api/clientes/:id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockCliente)),
      });

      const cliente = await getClienteById('123');

      expect(mockFetch).toHaveBeenCalledWith('/api/clientes/123', expect.anything());
      expect(cliente).toEqual(mockCliente);
    });

    it('createCliente calls POST /api/clientes with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: () => Promise.resolve(JSON.stringify(mockCliente)),
      });

      const clienteToCreate: Cliente = {
        nombreRazonSocial: 'Estancia Don Pedro',
        telefono: '1123456789',
        direccion: 'Ruta 5 Km 100',
      };

      const result = await createCliente(clienteToCreate);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/clientes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(clienteToCreate),
        })
      );
      expect(result).toEqual(mockCliente);
    });

    it('updateCliente calls PUT /api/clientes/:id with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockCliente)),
      });

      const result = await updateCliente('123', mockCliente);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/clientes/123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(mockCliente),
        })
      );
      expect(result).toEqual(mockCliente);
    });

    it('deleteCliente calls DELETE /api/clientes/:id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: () => Promise.resolve(''),
      });

      await deleteCliente('123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/clientes/123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});
