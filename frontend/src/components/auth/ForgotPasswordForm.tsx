'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setSuccess(false);
    setRateLimited(false);

    startTransition(async () => {
      try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.status === 429) {
          setRateLimited(true);
          setError('Too many password reset requests. Please try again later.');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || 'Request failed');
        }

        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send reset email');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {error && (
        <div className={`px-4 py-3 rounded-xl border backdrop-blur-sm ${
          rateLimited
            ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          <p className="text-sm">{error}</p>
          {rateLimited && (
            <p className="text-xs mt-2 text-yellow-500/70">
              You can request a password reset up to 3 times per hour.
            </p>
          )}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl backdrop-blur-sm">
          <p className="font-semibold text-white">Check your email</p>
          <p className="text-sm mt-1">
            If an account with that email exists, we've sent password reset instructions.
          </p>
          <p className="text-xs mt-2 text-emerald-500/70">
            The reset link will expire in 15 minutes.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="mt-2 block w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
          disabled={isPending || success}
          autoComplete="email"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || success || rateLimited}
        className="w-full relative flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
      >
        {isPending ? 'Sending...' : success ? 'Email sent' : 'Send reset link'}
      </button>
    </form>
  );
}
