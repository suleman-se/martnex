'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getBackendUrl } from '@/lib/medusa-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_URL = getBackendUrl();

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className={`p-4 rounded-lg border text-[11px] font-black uppercase tracking-wider animate-in fade-in duration-300 ${
          rateLimited
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-current animate-pulse shrink-0"></div>
             <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg space-y-2 animate-in fade-in duration-500">
          <p className="text-[11px] font-black uppercase tracking-wider">Email sent</p>
          <p className="text-[10px] font-bold opacity-80 leading-relaxed uppercase tracking-widest">
            Check your inbox for instructions to reset your password.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email address</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="your@email.com"
          disabled={isPending || success}
          autoComplete="email"
          className="h-14 px-6"
        />
        {errors.email && (
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-destructive ml-1 mt-1.5">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="premium"
        size="lg"
        disabled={isPending || success || rateLimited}
        className="w-full h-14 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/5"
      >
        {isPending ? 'Sending...' : success ? 'Sent' : 'Send reset link'}
      </Button>
    </form>
  );
}
