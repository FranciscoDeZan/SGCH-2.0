import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  it('renders header and children', () => {
    render(<AppLayout><div>Test Child</div></AppLayout>);
    expect(screen.getByText('SGCH v2')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });
});
