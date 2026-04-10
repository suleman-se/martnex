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
        <div className={`px-4 py-3 rounded-xl border backdrop-blur-sm ${
          lockedMinutes !== null
            ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
            : emailNotVerified
            ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          <div className="flex">
            <div>
              {lockedMinutes !== null && (
                <p className="font-semibold text-white">Account Locked</p>
              )}
              {emailNotVerified && (
                <p className="font-semibold text-white">Email Not Verified</p>
              )}
              <p className="text-sm mt-1">{error}</p>
              {lockedMinutes !== null && (
                <p className="text-xs mt-2 text-yellow-500/70">
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
          <label htmlFor="email" className="block text-sm font-medium text-slate-300">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="mt-2 block w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
            disabled={isPending}
            autoComplete="email"
            placeholder="alex.thompson@email.com"
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="mt-2 block w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
            disabled={isPending}
            autoComplete="current-password"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.password.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || lockedMinutes !== null}
        className="w-full relative flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
      >
        {isPending ? 'Authenticating...' : lockedMinutes !== null ? 'Account Locked' : 'Sign in'}
      </button>
    </form>
  );
}
