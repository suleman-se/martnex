'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getBackendUrl } from '@/lib/medusa-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle2, History } from 'lucide-react';

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
      <div className="p-8 bg-emerald-50 rounded-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 rounded-[2rem] bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black uppercase tracking-tight text-emerald-900">Email Sent</h3>
          <p className="text-sm font-medium text-emerald-700/80 leading-relaxed max-w-[240px]">
            {successMessage}
          </p>
        </div>
        <Button variant="outline" onClick={() => setSuccessMessage(null)} className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest">
          Try Different Email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className={`p-5 rounded-2xl border text-[11px] font-black uppercase tracking-wider animate-in fade-in duration-300 ${
          rateLimited
            ? 'bg-amber-50 border-amber-100 text-amber-900'
            : 'bg-red-50 border-red-100 text-red-900'
        }`}>
          <div className="flex items-center gap-3">
             <div className={`h-2 w-2 rounded-full animate-pulse shrink-0 ${rateLimited ? 'bg-amber-600' : 'bg-red-600'}`}></div>
             <p>{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Email</Label>
        <div className="relative group">
          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="your@email.com"
            disabled={isPending}
            autoComplete="email"
            className="h-14 pl-14 pr-6 bg-slate-100/50 border-none focus:ring-2 focus:ring-primary/10"
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
