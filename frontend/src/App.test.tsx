import { render, screen } from '@testing-library/react'
import App from './App'

test('renders app successfully', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
})
