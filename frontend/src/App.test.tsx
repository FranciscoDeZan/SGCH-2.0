import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

vi.mock('./api/client', () => ({
  apiFetch: vi.fn().mockResolvedValue([]),
}));

describe('App', () => {
  it('renders AppLayout and ClientesPage without crashing', () => {
    render(<App />);
    expect(screen.getByText('SGCH v2')).toBeInTheDocument();
  });
});
