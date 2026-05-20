'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getBackendUrl } from '@/lib/medusa-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldLabel } from '@/components/shared/forms/field-label';
import { AuthFeedbackPanel } from '@/components/shared/forms/auth-feedback-panel';
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
      <AuthFeedbackPanel
        variant="error"
        title="Invalid Link"
        message="This reset link is either invalid or has expired."
        icon={<AlertCircle className="h-8 w-8 text-red-600" />}
        action={
          <Button
            variant="outline"
            onClick={() => router.push('/forgot-password')}
            className="h-12 w-full rounded-xl border-red-200 text-[10px] font-black uppercase tracking-widest text-red-900 hover:bg-red-100"
          >
            Request New Link
          </Button>
        }
      />
    );
  }

  if (success) {
    return (
      <AuthFeedbackPanel
        variant="success"
        title="Success"
        message="Your password has been updated. Redirecting to the login portal..."
        icon={<CheckCircle2 className="h-8 w-8 text-emerald-600" />}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <AuthFeedbackPanel
          variant="error"
          title="Update Failed"
          message={error}
          icon={<AlertCircle className="h-8 w-8 text-red-600" />}
          className="items-start space-y-3 p-5 text-left"
        />
      )}

      <div className="space-y-5">
        <div className="space-y-2">
          <FieldLabel htmlFor="password" className="ml-1">New Secure Password</FieldLabel>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="••••••••"
              disabled={isPending}
              className="h-14 pl-14 pr-6"
            />
          </div>
          {errors.password && (
            <p className="text-[10px] font-black uppercase tracking-widest text-destructive ml-1 mt-1.5">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="confirmPassword">Confirm Identity</FieldLabel>
          <div className="relative group">
            <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              disabled={isPending}
              className="h-14 pl-14 pr-6"
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
