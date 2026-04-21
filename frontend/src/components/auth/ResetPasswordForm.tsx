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
        }, 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reset password');
      }
    });
  };

  if (!token) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
        <p>Invalid or expired reset link. Please request a new one.</p>
        <Button 
          variant="link" 
          onClick={() => router.push('/forgot-password')}
          className="mt-2 text-red-900 font-bold p-0"
        >
          Request reset link &rarr;
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-lg text-[11px] font-black uppercase tracking-wider animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-red-900 animate-pulse shrink-0"></div>
             <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg space-y-2 animate-in fade-in duration-500">
          <p className="text-[11px] font-black uppercase tracking-wider text-emerald-900">Password updated</p>
          <p className="text-[10px] font-bold opacity-80 leading-relaxed uppercase tracking-widest">
            Your password has been changed successfully. Redirecting to login...
          </p>
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" title="Use at least 8 characters" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="••••••••"
            disabled={isPending || success}
            className="h-14 px-6"
          />
          {errors.password && (
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-destructive ml-1 mt-1.5">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            placeholder="••••••••"
            disabled={isPending || success}
            className="h-14 px-6"
          />
          {errors.confirmPassword && (
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-destructive ml-1 mt-1.5">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="premium"
        size="lg"
        disabled={isPending || success}
        className="w-full h-14 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/5 mt-4"
      >
        {isPending ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  );
}
