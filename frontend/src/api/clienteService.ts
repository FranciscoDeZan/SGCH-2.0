import axios from 'axios';
import type { Cliente } from '../types/cliente';

const API_URL = '/api/clientes';

export const getClientes = async (): Promise<Cliente[]> => {
  const response = await axios.get<Cliente[]>(API_URL);
  return response.data;
};

export const getClienteById = async (id: string): Promise<Cliente> => {
  const response = await axios.get<Cliente>(`${API_URL}/${id}`);
  return response.data;
};

export const createCliente = async (cliente: Cliente): Promise<Cliente> => {
  const response = await axios.post<Cliente>(API_URL, cliente);
  return response.data;
};

export const updateCliente = async (id: string, cliente: Cliente): Promise<Cliente> => {
  const response = await axios.put<Cliente>(`${API_URL}/${id}`, cliente);
  return response.data;
};

export const deleteCliente = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
