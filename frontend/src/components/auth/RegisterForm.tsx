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
import { ShoppingBag, Store } from 'lucide-react';

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
  const registerAction = useAuthStore((state) => state.register);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'buyer',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await registerAction(data);
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?message=Account created. Please verify your email.');
        }, 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-lg text-[11px] font-black uppercase tracking-wider animate-in fade-in duration-300">
          <p className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-900 animate-pulse"></div>
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-[11px] font-black uppercase tracking-wider animate-in fade-in duration-500">
          <p className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-900 animate-pulse"></div>
            Account created successfully. Verifying...
          </p>
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-3">
          <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <label 
              className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all active:scale-95 border-2 ${
                selectedRole === 'buyer' 
                  ? 'bg-background border-primary text-primary shadow-sm' 
                  : 'bg-secondary border-transparent text-muted-foreground hover:bg-accent'
              }`}
            >
              <input
                type="radio"
                value="buyer"
                {...registerField('role')}
                className="hidden"
                disabled={isPending}
              />
              <ShoppingBag className={`w-6 h-6 mb-2 ${selectedRole === 'buyer' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-xs font-black uppercase tracking-wider">Buyer</span>
            </label>
            <label 
              className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all active:scale-95 border-2 ${
                selectedRole === 'seller' 
                  ? 'bg-background border-primary text-primary shadow-sm' 
                  : 'bg-secondary border-transparent text-muted-foreground hover:bg-accent'
              }`}
            >
              <input
                type="radio"
                value="seller"
                {...registerField('role')}
                className="hidden"
                disabled={isPending}
              />
              <Store className={`w-6 h-6 mb-2 ${selectedRole === 'seller' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-xs font-black uppercase tracking-wider">Seller</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</Label>
            <Input
              id="first_name"
              type="text"
              placeholder="John"
              {...registerField('first_name')}
              disabled={isPending}
              className="h-12"
            />
            {errors.first_name && (
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-destructive ml-1 mt-1.5">{errors.first_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</Label>
            <Input
              id="last_name"
              type="text"
              placeholder="Doe"
              {...registerField('last_name')}
              disabled={isPending}
              className="h-12"
            />
            {errors.last_name && (
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-destructive ml-1 mt-1.5">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email address</Label>
          <Input
            id="email"
            type="email"
            {...registerField('email')}
            placeholder="your@email.com"
            disabled={isPending}
            className="h-12"
          />
          {errors.email && (
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-destructive ml-1 mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
          <Input
            id="password"
            type="password"
            {...registerField('password')}
            placeholder="••••••••"
            disabled={isPending}
            className="h-12"
          />
          {errors.password ? (
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-destructive ml-1 mt-1.5">{errors.password.message}</p>
          ) : (
            <p className="text-[10px] text-muted-foreground font-bold tracking-tight ml-1 mt-1.5">Use at least 8 characters.</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="premium"
        size="lg"
        className="w-full h-14 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/5 mt-4"
        disabled={isPending || success}
      >
        {isPending ? 'Signing up...' : 'Create Account'}
      </Button>
    </form>
  );
}
