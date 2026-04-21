'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const loginAction = useAuthStore((state) => state.login);
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
        await loginAction(data.email, data.password);
        router.push('/dashboard');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        if (message.toLowerCase().includes('verify')) {
          setEmailNotVerified(true);
        }
        setError(message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className={`p-4 rounded-lg text-xs font-bold flex items-center gap-3 animate-in fade-in duration-300 ${
          lockedMinutes !== null
            ? 'bg-amber-50 text-amber-900 border border-amber-200'
            : emailNotVerified
            ? 'bg-secondary text-primary'
            : 'bg-red-50 text-red-900 border border-red-200'
        }`}>
          <div className="h-2 w-2 rounded-full bg-current animate-pulse shrink-0"></div>
          <div>
            {lockedMinutes !== null && <p className="font-black uppercase tracking-wider mb-0.5 text-[10px]">Account Locked</p>}
            {emailNotVerified && <p className="font-black uppercase tracking-wider mb-0.5 text-[10px]">Verification Required</p>}
            <p className="opacity-90 font-semibold">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="your@email.com"
            disabled={isPending}
            autoComplete="email"
            className="h-14 px-6"
          />
          {errors.email && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-destructive ml-1 mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="••••••••"
            disabled={isPending}
            autoComplete="current-password"
            className="h-14 px-6"
          />
          {errors.password && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-destructive ml-1 mt-1.5">{errors.password.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="premium"
        size="lg"
        className="w-full h-14 shadow-lg shadow-primary/5 font-black uppercase tracking-wider text-[11px]"
        disabled={isPending || lockedMinutes !== null}
      >
        {isPending ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
