import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders message with role="status" and aria-live="polite"', () => {
    const handleClose = vi.fn();
    render(<Toast message="Operación exitosa" onClose={handleClose} />);

    const alertElement = screen.getByRole('status');
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Operación exitosa')).toBeInTheDocument();
  });

  it('auto-dismisses after 3000ms', () => {
    const handleClose = vi.fn();
    render(<Toast message="Auto-dismiss test" onClose={handleClose} />);

    expect(handleClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(handleClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button (×) is clicked', () => {
    const handleClose = vi.fn();
    render(<Toast message="Click test" onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: 'Cerrar notificación' });
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).toHaveAttribute('type', 'button');

    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('clears timeout on unmount before 3000ms', () => {
    const handleClose = vi.fn();
    const { unmount } = render(<Toast message="Unmount test" onClose={handleClose} />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(handleClose).not.toHaveBeenCalled();

    unmount();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(handleClose).not.toHaveBeenCalled();
  });
});
