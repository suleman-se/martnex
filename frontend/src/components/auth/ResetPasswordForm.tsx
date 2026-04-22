'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getBackendUrl } from '@/lib/medusa-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const API_URL = getBackendUrl();

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
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
      setError('Invalid reset token');
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
          throw new Error(errorData.error || errorData.message || 'Reset failed');
        }

        setSuccess(true);
        setTimeout(() => {
          router.push('/login?message=Password reset successful. Please sign in.');
        }, 2500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reset password');
      }
    });
  };

  if (!token) {
    return (
      <div className="p-8 bg-red-50 rounded-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 rounded-[2rem] bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black uppercase tracking-tight text-red-900">Invalid Link</h3>
          <p className="text-sm font-medium text-red-700/80 leading-relaxed max-w-[240px]">
            This reset link is either invalid or has expired.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/forgot-password')} className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-red-200 text-red-900 hover:bg-red-100">
          Request New Link
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-8 bg-emerald-50 rounded-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 rounded-[2rem] bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black uppercase tracking-tight text-emerald-900">Success</h3>
          <p className="text-sm font-medium text-emerald-700/80 leading-relaxed max-w-[240px]">
            Your password has been updated. Redirecting to the login portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-5 bg-red-50 border border-red-100 rounded-2xl space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shrink-0"></div>
             <h3 className="text-[11px] font-black uppercase tracking-wider text-red-900">Update Failed</h3>
          </div>
          <p className="text-sm font-semibold text-red-700/80 leading-relaxed">{error}</p>
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" title="Use at least 8 characters" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Secure Password</Label>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="••••••••"
              disabled={isPending}
              className="h-14 pl-14 pr-6 bg-slate-100/50 border-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
          {errors.password && (
            <p className="text-[10px] font-black uppercase tracking-widest text-destructive ml-1 mt-1.5">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Identity</Label>
          <div className="relative group">
            <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              disabled={isPending}
              className="h-14 pl-14 pr-6 bg-slate-100/50 border-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-[10px] font-black uppercase tracking-widest text-destructive ml-1 mt-1.5">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="premium"
        size="lg"
        disabled={isPending}
        className="w-full h-14 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/5 mt-4"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Synchronizing...
          </span>
        ) : 'Reset Password'}
      </Button>
    </form>
  );
}
