import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'
import * as client from './api/client'

vi.mock('./api/client')

test('renders app and client directory successfully', async () => {
  vi.mocked(client.getClientes).mockResolvedValue([
    {
      id: '1',
      nombreRazonSocial: 'Estancia La Ilusión',
      telefono: '3415551234',
      direccion: 'Ruta 11 Km 50',
      calificacion: 'A',
    },
  ])

  render(<App />)

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('SGCH v2')
  expect(screen.getByRole('button', { name: /nuevo cliente/i })).toBeInTheDocument()
  expect(await screen.findByText('Estancia La Ilusión')).toBeInTheDocument()
})
