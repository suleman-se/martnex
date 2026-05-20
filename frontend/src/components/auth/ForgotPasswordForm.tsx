'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getBackendUrl } from '@/lib/medusa-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldLabel } from '@/components/shared/forms/field-label';
import { AuthFeedbackPanel } from '@/components/shared/forms/auth-feedback-panel';
import { Mail, CheckCircle2, History, AlertCircle } from 'lucide-react';

const API_URL = getBackendUrl();

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    setSuccessMessage(null);
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

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error || responseData.message || 'Request failed');
        }

        setSuccessMessage(responseData.message || 'Check your inbox for a recovery link to reset your password.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send reset email');
      }
    });
  };

  if (successMessage) {
    return (
      <AuthFeedbackPanel
        variant="success"
        title="Email Sent"
        message={successMessage}
        icon={<CheckCircle2 className="h-8 w-8 text-emerald-600" />}
        action={
          <Button
            variant="outline"
            onClick={() => setSuccessMessage(null)}
            className="h-12 w-full rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            Try Different Email
          </Button>
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <AuthFeedbackPanel
          variant={rateLimited ? 'warning' : 'error'}
          title={rateLimited ? 'Too Many Requests' : 'Request Failed'}
          message={error}
          icon={
            <AlertCircle className={`h-8 w-8 ${rateLimited ? 'text-amber-600' : 'text-red-600'}`} />
          }
          className="items-start space-y-3 p-5 text-left"
        />
      )}

      <div className="space-y-2">
        <FieldLabel htmlFor="email">Account Email</FieldLabel>
        <div className="relative group">
          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="your@email.com"
            disabled={isPending}
            autoComplete="email"
            className="h-14 pl-14 pr-6"
          />
        </div>
        {errors.email && (
          <p className="text-[10px] font-black uppercase tracking-widest text-destructive ml-1 mt-1.5">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="premium"
        size="lg"
        disabled={isPending || rateLimited}
        className="w-full h-14 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/5 mt-2"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <History className="w-4 h-4 animate-spin" />
            Requesting...
          </span>
        ) : 'Request Recovery Link'}
      </Button>
    </form>
  );
}
