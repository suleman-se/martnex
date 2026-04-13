'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9001';

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
            password: data.password,
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
      <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-4 rounded-xl backdrop-blur-sm">
        <p className="font-semibold text-white">No reset token provided</p>
        <p className="text-sm mt-1">
          Please use the link from your password reset email.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm">
          <p className="text-sm">{error}</p>
          {(error.includes('expired') || error.includes('invalid')) && (
            <Link
              href="/forgot-password"
              className="mt-3 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Request new reset link →
            </Link>
          )}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl backdrop-blur-sm">
          <p className="font-semibold text-white">✓ Password reset successful!</p>
          <p className="text-sm mt-1 text-emerald-400/80">
            Redirecting you to login...
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* New Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300">
            New Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="mt-2 block w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
            disabled={isPending || success}
            autoComplete="new-password"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.password.message}</p>
          )}
          <p className="mt-1.5 text-xs text-slate-500">Must be at least 8 characters</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className="mt-2 block w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
            disabled={isPending || success}
            autoComplete="new-password"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || success}
        className="w-full relative flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
      >
        {isPending ? 'Resetting password...' : success ? 'Password reset!' : 'Reset password'}
      </button>
    </form>
  );
}
