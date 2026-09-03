import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerifyEmailForm from '../VerifyEmailForm';
import { useAuthStore } from '@/lib/store/auth-store';

vi.mock('@/lib/store/auth-store', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/lib/medusa-client', () => ({
  getBackendUrl: () => 'http://localhost:9001',
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('VerifyEmailForm', () => {
  const mockRefreshUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    // Component destructures the whole store rather than using a selector.
    vi.mocked(useAuthStore).mockImplementation(((selector?: (s: unknown) => unknown) => {
      const state = { refreshUser: mockRefreshUser, isAuthenticated: false };
      return selector ? selector(state) : state;
    }) as unknown as typeof useAuthStore);
  });

  it('prompts to register again when no token is present', () => {
    render(<VerifyEmailForm />);

    expect(screen.getByText(/link missing/i)).toBeInTheDocument();
    expect(screen.getByText(/couldn't find a verification token/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register again/i })).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('verifies automatically when a token is supplied', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: 'verified' }),
    } as Response);

    render(<VerifyEmailForm token="valid-token" />);

    await waitFor(() => {
      expect(screen.getByText(/^verified$/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:9001/auth/verify-email',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'valid-token' }),
      })
    );
    expect(screen.getByText(/your account is active/i)).toBeInTheDocument();
  });

  it('redirects to login shortly after a successful verification', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    render(<VerifyEmailForm token="valid-token" />);

    // The component navigates after a 2s delay.
    await waitFor(
      () =>
        expect(mockPush).toHaveBeenCalledWith(
          '/login?message=Email verified successfully! You can now log in.'
        ),
      { timeout: 5000 }
    );
  });

  it('shows a failure state with a retry action when the token is rejected', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Token has expired' }),
    } as Response);

    render(<VerifyEmailForm token="bad-token" />);

    await waitFor(() => {
      expect(screen.getByText(/^failed$/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/token has expired/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry verification/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to login/i })).toBeInTheDocument();
  });

  it('retries verification when the retry button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Token has expired' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      } as Response);

    render(<VerifyEmailForm token="bad-token" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /retry verification/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    await user.click(screen.getByRole('button', { name: /retry verification/i }));

    await waitFor(() => {
      expect(screen.getByText(/^verified$/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
