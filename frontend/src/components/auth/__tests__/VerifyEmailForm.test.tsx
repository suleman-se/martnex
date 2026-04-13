import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import VerifyEmailForm from '../VerifyEmailForm';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('VerifyEmailForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows warning when no token is provided', () => {
    render(<VerifyEmailForm />);

    expect(screen.getByText(/no verification token provided/i)).toBeInTheDocument();
    expect(screen.getByText(/please check your email/i)).toBeInTheDocument();
  });

  it('automatically verifies email when token is provided', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Email verified successfully' }),
    });

    render(<VerifyEmailForm token="valid-token-123" />);

    await waitFor(() => {
      expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:9001/api/auth/verify-email',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: 'valid-token-123' }),
        })
      );
    });
  });

  it('shows success message and redirects after verification', async () => {
    vi.useFakeTimers();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Email verified successfully' }),
    });

    render(<VerifyEmailForm token="valid-token-123" />);

    await waitFor(() => {
      expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/redirecting you to login/i)).toBeInTheDocument();
    });

    // Fast-forward timers
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/login'));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('Email verified successfully'));
    });

    vi.useRealTimers();
  });

  it('shows error message for expired token', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Token has expired' }),
    });

    render(<VerifyEmailForm token="expired-token" />);

    await waitFor(() => {
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
      expect(screen.getByText(/token has expired/i)).toBeInTheDocument();
      expect(screen.getByText(/verification link may have expired/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /register again/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to login/i })).toBeInTheDocument();
  });

  it('shows error message for invalid token', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid token' }),
    });

    render(<VerifyEmailForm token="invalid-token" />);

    await waitFor(() => {
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid token/i)).toBeInTheDocument();
    });
  });

  it('handles network errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<VerifyEmailForm token="some-token" />);

    await waitFor(() => {
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
