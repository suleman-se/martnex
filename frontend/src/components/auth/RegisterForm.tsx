'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/auth-store';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['buyer', 'seller']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'buyer',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const result = await register(data);
        setSuccess(true);

        // Show success message for 2 seconds, then redirect to login
        setTimeout(() => {
          router.push('/login?message=Please check your email to verify your account');
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl backdrop-blur-sm text-sm">
          Registration successful! Please check your email to verify your account.
        </div>
      )}

      <div className="space-y-4">
        {/* First Name */}
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-slate-300">
            First Name
          </label>
          <input
            id="first_name"
            type="text"
            {...registerField('first_name')}
            className="mt-2 block w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
            disabled={isPending}
          />
          {errors.first_name && (
            <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.first_name.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-slate-300">
            Last Name
          </label>
          <input
            id="last_name"
            type="text"
            {...registerField('last_name')}
            className="mt-2 block w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
            disabled={isPending}
          />
          {errors.last_name && (
            <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.last_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...registerField('email')}
            className="mt-2 block w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
            disabled={isPending}
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
            {...registerField('password')}
            className="mt-2 block w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
            disabled={isPending}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.password.message}</p>
          )}
          <p className="mt-1.5 text-xs text-slate-500">Must be at least 8 characters</p>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            I want to
          </label>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-white/10 rounded-xl bg-slate-950/30 hover:bg-slate-950/50 cursor-pointer transition-colors">
              <input
                type="radio"
                value="buyer"
                {...registerField('role')}
                className="h-4 w-4 text-cyan-500 focus:ring-cyan-500/50 border-white/20 bg-slate-900"
                disabled={isPending}
              />
              <span className="ml-3 text-sm text-slate-300 font-medium">
                Buy products (Buyer)
              </span>
            </label>
            <label className="flex items-center p-3 border border-white/10 rounded-xl bg-slate-950/30 hover:bg-slate-950/50 cursor-pointer transition-colors">
              <input
                type="radio"
                value="seller"
                {...registerField('role')}
                className="h-4 w-4 text-cyan-500 focus:ring-cyan-500/50 border-white/20 bg-slate-900"
                disabled={isPending}
              />
              <span className="ml-3 text-sm text-slate-300 font-medium">
                Sell products (Seller)
              </span>
            </label>
          </div>
          {errors.role && (
            <p className="mt-2 text-sm text-red-400 font-medium">{errors.role.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || success}
        className="w-full relative flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
      >
        {isPending ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}
