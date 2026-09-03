import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from '../ForgotPasswordForm';

vi.mock('@/lib/medusa-client', () => ({
  getBackendUrl: () => 'http://localhost:9001',
}));

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  const submitEmail = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/account email/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /request recovery link/i }));
  };

  it('renders the email input and submit button', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText(/account email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request recovery link/i })).toBeInTheDocument();
  });

  // NOTE: submitted empty rather than with a malformed address. The input is
  // `type="email"`, so a malformed value is rejected by native HTML5 validation
  // before the submit event fires and react-hook-form/zod never runs.
  it('shows a validation error when submitted empty', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.click(screen.getByRole('button', { name: /request recovery link/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('posts the request and shows the success panel', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Check your inbox for a recovery link.' }),
    } as Response);

    render(<ForgotPasswordForm />);
    await submitEmail(user);

    await waitFor(() => {
      expect(screen.getByText(/email sent/i)).toBeInTheDocument();
      expect(screen.getByText(/check your inbox for a recovery link/i)).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:9001/auth/forgot-password',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('lets the user go back and try a different email', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Check your inbox.' }),
    } as Response);

    render(<ForgotPasswordForm />);
    await submitEmail(user);
    await waitFor(() => expect(screen.getByText(/email sent/i)).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /try different email/i }));

    expect(screen.getByLabelText(/account email/i)).toBeInTheDocument();
  });

  it('warns and locks the button when rate limited (429)', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({}),
    } as Response);

    render(<ForgotPasswordForm />);
    await submitEmail(user);

    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
      expect(screen.getByText(/too many password reset requests/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /request recovery link/i })).toBeDisabled();
  });

  it('shows a failure panel when the request errors', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Something went wrong' }),
    } as Response);

    render(<ForgotPasswordForm />);
    await submitEmail(user);

    await waitFor(() => {
      expect(screen.getByText(/request failed/i)).toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
