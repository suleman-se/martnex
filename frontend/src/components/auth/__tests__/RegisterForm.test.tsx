import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../RegisterForm';
import { useAuthStore } from '@/lib/store/auth-store';

vi.mock('@/lib/store/auth-store', () => ({
  useAuthStore: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('RegisterForm', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockImplementation(((selector?: (s: unknown) => unknown) => {
      const state = { register: mockRegister };
      return selector ? selector(state) : state;
    }) as unknown as typeof useAuthStore);
  });

  const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
  };

  it('renders all form fields', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('defaults to the buyer role and allows switching to seller', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const buyer = screen.getByRole('radio', { name: /buyer/i });
    const seller = screen.getByRole('radio', { name: /seller/i });

    expect(buyer).toBeChecked();

    await user.click(seller);
    await waitFor(() => expect(seller).toBeChecked());
    expect(buyer).not.toBeChecked();
  });

  // NOTE: submitted empty rather than with a malformed address — the email input is
  // `type="email"`, so native HTML5 validation blocks submit before zod ever runs.
  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('submits the form with the collected data', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(undefined);
    render(<RegisterForm />);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'buyer',
      });
    }, { timeout: 3000 });
  });

  it('redirects to login after a successful registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(undefined);
    render(<RegisterForm />);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(
      () => expect(screen.getByText(/account created successfully/i)).toBeInTheDocument(),
      { timeout: 3000 }
    );
    // The component waits 3s before navigating.
    await waitFor(
      () =>
        expect(mockPush).toHaveBeenCalledWith(
          '/login?message=Account created. Please verify your email.'
        ),
      { timeout: 5000 }
    );
  });

  it('shows an error message when registration fails', async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce(new Error('Email already registered'));
    render(<RegisterForm />);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    // Assert on this component's own state rather than on mockPush: the preceding
    // redirect test leaves a 3s timer that can fire across the test boundary.
    expect(screen.queryByText(/account created successfully/i)).not.toBeInTheDocument();
  });
});
