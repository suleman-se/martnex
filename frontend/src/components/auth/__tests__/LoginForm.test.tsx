import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import { useAuthStore } from '@/lib/store/auth-store';

vi.mock('@/lib/store/auth-store', () => ({
  useAuthStore: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('LoginForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // The component reads the store through a selector, so the mock has to honour one.
    vi.mocked(useAuthStore).mockImplementation(((selector?: (s: unknown) => unknown) => {
      const state = { login: mockLogin };
      return selector ? selector(state) : state;
    }) as unknown as typeof useAuthStore);
  });

  const fillCredentials = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
  };

  it('renders email and password fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for an invalid submission', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('submits credentials and redirects to the dashboard', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginForm />);

    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('surfaces a verification notice when the email is unverified', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Please verify your email before signing in'));
    render(<LoginForm />);

    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/verification required/i)).toBeInTheDocument();
      expect(screen.getByText(/please verify your email/i)).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows the error message for invalid credentials', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    render(<LoginForm />);

    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/verification required/i)).not.toBeInTheDocument();
  });

  it('clears a previous error on resubmit', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    render(<LoginForm />);

    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument());

    mockLogin.mockResolvedValueOnce(undefined);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });
});
