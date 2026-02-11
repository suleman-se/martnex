'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token?: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('No reset token provided');
      return;
    }

    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            new_password: data.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || 'Password reset failed');
        }

        setSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?message=Password reset successful! You can now log in with your new password.');
        }, 3000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Password reset failed';

        if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
          setError('This reset link has expired or is invalid. Please request a new password reset.');
        } else {
          setError(errorMessage);
        }
      }
    });
  };

  if (!token) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
        <p className="font-medium">No reset token provided</p>
        <p className="text-sm mt-1">
          Please use the link from your password reset email.
        </p>
        <Link
          href="/forgot-password"
          className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="text-sm">{error}</p>
          {(error.includes('expired') || error.includes('invalid')) && (
            <Link
              href="/forgot-password"
              className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Request new reset link →
            </Link>
          )}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          <p className="font-medium">✓ Password reset successful!</p>
          <p className="text-sm mt-1">
            Redirecting you to login...
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* New Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isPending || success}
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isPending || success}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || success}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Resetting password...' : success ? 'Password reset!' : 'Reset password'}
      </button>
    </form>
  );
}
