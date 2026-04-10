import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../RegisterForm';
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

describe('RegisterForm', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      register: mockRegister,
    });
  });

  it('renders all form fields', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/buy products \(buyer\)/i)).toBeInTheDocument();
    expect(screen.getByText(/sell products \(seller\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/last name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.type(passwordInput, '1234567');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({
      message: 'Success',
      data: { user_id: '123', email: 'test@example.com', email_verified: false },
    });

    render(<RegisterForm />);

    // Fill in form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');

    // Select buyer role (should be selected by default, but let's be explicit)
    const buyerRadio = screen.getByRole('radio', { name: /buy products \(buyer\)/i });
    await user.click(buyerRadio);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'buyer',
      });
    });
  });

  it('shows success message after registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({
      message: 'User registered successfully',
      data: { user_id: '123', email: 'test@example.com', email_verified: false },
    });

    render(<RegisterForm />);

    // Fill in and submit form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
      expect(screen.getByText(/please check your email/i)).toBeInTheDocument();
    });
  });

  it('redirects to login after successful registration', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    mockRegister.mockResolvedValue({
      message: 'User registered successfully',
      data: { user_id: '123', email: 'test@example.com', email_verified: false },
    });

    render(<RegisterForm />);

    // Fill in and submit form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });

    // Fast-forward timers
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/login'));
    });

    vi.useRealTimers();
  });

  it('shows error message on registration failure', async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValue(new Error('Email already exists'));

    render(<RegisterForm />);

    // Fill in and submit form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  it('allows selecting seller role', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({
      message: 'Success',
      data: { user_id: '123', email: 'seller@example.com', email_verified: false },
    });

    render(<RegisterForm />);

    // Select seller role
    const sellerRadio = screen.getByRole('radio', { name: /sell products \(seller\)/i });
    await user.click(sellerRadio);

    // Fill in and submit form
    await user.type(screen.getByLabelText(/first name/i), 'Jane');
    await user.type(screen.getByLabelText(/last name/i), 'Smith');
    await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'seller',
      });
    });
  });

  it('disables form during submission', async () => {
    const user = userEvent.setup();
    mockRegister.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));

    render(<RegisterForm />);

    // Fill in form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    // Check that inputs are disabled
    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toBeDisabled();
      expect(screen.getByLabelText(/last name/i)).toBeDisabled();
      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
      expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
      expect(submitButton).toHaveTextContent(/creating account/i);
    });
  });
});
