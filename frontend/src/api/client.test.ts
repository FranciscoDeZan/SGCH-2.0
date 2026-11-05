import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  apiFetch,
  ApiError,
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  getOperaciones,
  getOperacionById,
  createOperacion,
  updateOperacion,
  getCobrosByOperacion,
  createCobro,
} from './client';
import type { Cliente } from '../types/cliente';
import type {
  OperacionResponse,
  OperacionRequest,
  OperacionFiltros,
} from '../types/operacion';
import type { CobroResponse, CobroRequest } from '../types/cobro';

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
    it('prepends /api/v1 to endpoint if missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ message: 'ok' })),
      });

      const result = await apiFetch<{ message: string }>('/clientes');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/clientes',
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
        '/api/v1/clientes',
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
        '/api/v1/custom',
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

    it('throws ApiError with status=400 and parsed JSON body on 400 response', async () => {
      const errorBody = { title: 'Bad Request', detail: 'Invalid data', errores: { telefono: 'Obligatorio' } };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve(errorBody),
      });

      try {
        await apiFetch('/invalid');
        expect.unreachable('Should have thrown ApiError');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiErr = err as ApiError;
        expect(apiErr.status).toBe(400);
        expect(apiErr.statusText).toBe('Bad Request');
        expect(apiErr.data).toEqual(errorBody);
      }
    });

    it('throws ApiError with status=404 and data=null on 404 response without body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.reject(new Error('No body')),
      });

      try {
        await apiFetch('/not-found');
        expect.unreachable('Should have thrown ApiError');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiErr = err as ApiError;
        expect(apiErr.status).toBe(404);
        expect(apiErr.data).toBeNull();
      }
    });

    it('throws ApiError with status=500 and data=null on 500 response with non-JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new SyntaxError('Unexpected token < in JSON')),
      });

      try {
        await apiFetch('/server-error');
        expect.unreachable('Should have thrown ApiError');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiErr = err as ApiError;
        expect(apiErr.status).toBe(500);
        expect(apiErr.data).toBeNull();
      }
    });

    it('resolves normal JSON on 200 OK without regression', async () => {
      const mockData = { message: 'success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockData)),
      });

      const res = await apiFetch('/test-ok');
      expect(res).toEqual(mockData);
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

    it('getClientes calls GET /api/v1/clientes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify([mockCliente])),
      });

      const clientes = await getClientes();

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/clientes', expect.anything());
      expect(clientes).toEqual([mockCliente]);
    });

    it('getClienteById calls GET /api/v1/clientes/:id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockCliente)),
      });

      const cliente = await getClienteById('123');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/clientes/123', expect.anything());
      expect(cliente).toEqual(mockCliente);
    });

    it('createCliente calls POST /api/v1/clientes with body', async () => {
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
        '/api/v1/clientes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(clienteToCreate),
        })
      );
      expect(result).toEqual(mockCliente);
    });

    it('updateCliente calls PUT /api/v1/clientes/:id with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockCliente)),
      });

      const result = await updateCliente('123', mockCliente);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/clientes/123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(mockCliente),
        })
      );
      expect(result).toEqual(mockCliente);
    });

    it('deleteCliente calls DELETE /api/v1/clientes/:id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: () => Promise.resolve(''),
      });

      await deleteCliente('123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/clientes/123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('operaciones & cobros helpers', () => {
    it('getOperaciones with query params calls GET /api/v1/operaciones?... and normalizes dates', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify([])),
      });

      const filtros: OperacionFiltros = {
        circuito: 'DIRECTO',
        clienteId: 'cliente-123',
        estado: 'PENDIENTE',
        fechaDesde: '2026-11-01',
        fechaHasta: '2026-11-05',
      };

      const result = await getOperaciones(filtros);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/operaciones?circuito=DIRECTO&clienteId=cliente-123&estado=PENDIENTE&fechaDesde=2026-11-01T00%3A00%3A00&fechaHasta=2026-11-05T23%3A59%3A59',
        expect.anything()
      );
      expect(result).toEqual([]);

      // Test without filters
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify([])),
      });

      await getOperaciones();
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/operaciones', expect.anything());
    });

    it('getOperacionById calls GET /api/v1/operaciones/:id', async () => {
      const mockOp = { id: 'op-123', subtotalGanado: 1000 } as unknown as OperacionResponse;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockOp)),
      });

      const result = await getOperacionById('op-123');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/operaciones/op-123', expect.anything());
      expect(result).toEqual(mockOp);
    });

    it('createOperacion calls POST /api/v1/operaciones with body', async () => {
      const mockOpReq: OperacionRequest = {
        fechaOperacion: '2026-11-04T10:00:00',
        modalidadCircuito: 'DIRECTO',
        compradorId: 'comp-1',
        vendedorId: 'vend-1',
        categoria: 'FAENA',
        kgNeto: 1000,
        precioKgFacturado: 500,
        modalidadPrecio: 'NETO',
        formaPago: 'CONTADO',
      };
      const mockOpRes = { id: 'op-created', ...mockOpReq } as unknown as OperacionResponse;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: () => Promise.resolve(JSON.stringify(mockOpRes)),
      });

      const result = await createOperacion(mockOpReq);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/operaciones',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockOpReq),
        })
      );
      expect(result).toEqual(mockOpRes);
    });

    it('updateOperacion calls PUT /api/v1/operaciones/:id with body', async () => {
      const mockOpReq: OperacionRequest = {
        fechaOperacion: '2026-11-04T10:00:00',
        modalidadCircuito: 'DIRECTO',
        compradorId: 'comp-1',
        vendedorId: 'vend-1',
        categoria: 'FAENA',
        kgNeto: 1200,
        precioKgFacturado: 550,
        modalidadPrecio: 'NETO',
        formaPago: 'CONTADO',
      };
      const mockOpRes = { id: 'op-123', ...mockOpReq } as unknown as OperacionResponse;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockOpRes)),
      });

      const result = await updateOperacion('op-123', mockOpReq);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/operaciones/op-123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(mockOpReq),
        })
      );
      expect(result).toEqual(mockOpRes);
    });

    it('getCobrosByOperacion and createCobro call /api/v1/cobros endpoints', async () => {
      const mockCobroRes = { id: 'cobro-1', operacionId: 'op-123', monto: 5000 } as unknown as CobroResponse;

      // getCobrosByOperacion
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify([mockCobroRes])),
      });

      const cobros = await getCobrosByOperacion('op-123');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/cobros?operacionId=op-123', expect.anything());
      expect(cobros).toEqual([mockCobroRes]);

      // createCobro
      const mockCobroReq: CobroRequest = {
        operacionId: 'op-123',
        clienteId: 'cli-1',
        tipoMovimiento: 'COBRO_COMPRADOR',
        fechaMovimiento: '2026-11-05',
        monto: 5000,
        medioPago: 'TRANSFERENCIA',
        documentado: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: () => Promise.resolve(JSON.stringify(mockCobroRes)),
      });

      const created = await createCobro(mockCobroReq);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/cobros',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockCobroReq),
        })
      );
      expect(created).toEqual(mockCobroRes);
    });
  });
});
