import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from '../ForgotPasswordForm';

// Mock fetch
global.fetch = vi.fn();

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email input and submit button', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('submits form with valid email', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Reset link sent' }),
    });

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:9001/api/auth/forgot-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );
    });
  });

  it('shows success message after sending reset link', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Reset link sent' }),
    });

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(screen.getByText(/if an account with that email exists/i)).toBeInTheDocument();
      expect(screen.getByText(/reset link will expire in 15 minutes/i)).toBeInTheDocument();
    });
  });

  it('handles rate limiting (429 status)', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      status: 429,
      ok: false,
      json: async () => ({ error: 'Too many requests' }),
    });

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/too many password reset requests/i)).toBeInTheDocument();
      expect(screen.getByText(/you can request a password reset up to 3 times per hour/i)).toBeInTheDocument();
    });
  });

  it('disables input and button after successful submission', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
      expect(screen.getByRole('button', { name: /email sent/i })).toBeDisabled();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();
    });
  });
});
