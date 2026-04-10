import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import { useAuthStore } from '@/lib/store/auth-store';

// Mock the auth store
vi.mock('@/lib/store/auth-store', () => ({
  useAuthStore: vi.fn(),
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LoginForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
    });
  });

  it('renders email and password fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('redirects to dashboard after successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows account locked error with minutes remaining', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('Too many failed login attempts. Please try again in 12 minutes.'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), 'locked@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/account locked/i)).toBeInTheDocument();
      expect(screen.getByText(/try again in 12 minutes/i)).toBeInTheDocument();
      expect(screen.getByText(/will automatically unlock in 12 minute/i)).toBeInTheDocument();
    });
  });

  it('disables submit button when account is locked', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('Too many failed login attempts. Please try again in 15 minutes.'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), 'locked@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /account locked/i });
      expect(submitButton).toBeDisabled();
    });
  });

  it('shows email not verified error', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('Please verify your email before logging in'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), 'unverified@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email not verified/i)).toBeInTheDocument();
      expect(screen.getByText(/please verify your email before logging in/i)).toBeInTheDocument();
    });
  });

  it('shows generic error for invalid credentials', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('Invalid email or password'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('disables form during submission', async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
      expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
      expect(submitButton).toHaveTextContent(/signing in/i);
    });
  });

  it('clears error when user starts typing again', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<LoginForm />);

    // First attempt - error
    await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // User tries again - mock success this time
    mockLogin.mockResolvedValue(undefined);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'correct@example.com');

    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.clear(passwordInput);
    await user.type(passwordInput, 'correctpassword');

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Error should be cleared and login should succeed
    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
