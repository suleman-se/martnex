'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/auth-store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lockedMinutes, setLockedMinutes] = useState<number | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLockedMinutes(null);
    setEmailNotVerified(false);

    startTransition(async () => {
      try {
        await login(data.email, data.password);

        // Redirect to dashboard after successful login
        router.push('/dashboard');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';

        // Parse account locked error
        if (errorMessage.includes('Account locked') || errorMessage.includes('try again in')) {
          const match = errorMessage.match(/try again in (\d+) minutes/);
          if (match) {
            setLockedMinutes(parseInt(match[1]));
          }
          setError(errorMessage);
        }
        // Parse email not verified error
        else if (errorMessage.includes('verify your email') || errorMessage.includes('Email not verified')) {
          setEmailNotVerified(true);
          setError('Please verify your email before logging in. Check your inbox for the verification link.');
        }
        // General errors
        else {
          setError(errorMessage);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {error && (
        <div className={`px-4 py-3 rounded border ${
          lockedMinutes !== null
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
            : emailNotVerified
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex">
            <div>
              {lockedMinutes !== null && (
                <p className="font-medium">Account Locked</p>
              )}
              {emailNotVerified && (
                <p className="font-medium">Email Not Verified</p>
              )}
              <p className="text-sm">{error}</p>
              {lockedMinutes !== null && (
                <p className="text-xs mt-1">
                  Your account will automatically unlock in {lockedMinutes} minute{lockedMinutes !== 1 ? 's' : ''}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isPending}
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isPending}
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || lockedMinutes !== null}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Signing in...' : lockedMinutes !== null ? 'Account Locked' : 'Sign in'}
      </button>
    </form>
  );
}
