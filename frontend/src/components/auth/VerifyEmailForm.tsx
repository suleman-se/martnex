'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBackendUrl } from '@/lib/medusa-client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const API_URL = getBackendUrl();

interface VerifyEmailFormProps {
  token?: string;
}

export default function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const verifyInitiated = useRef(false);

  useEffect(() => {
    if (token && status === 'idle' && !verifyInitiated.current) {
      verifyInitiated.current = true;
      verifyEmail(token);
    }
  }, [token, status]);

  const verifyEmail = async (verificationToken: string) => {
    setStatus('verifying');
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`${API_URL}/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: verificationToken }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || data.message || 'Verification failed');
        }

        setStatus('success');

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login?message=Email verified successfully! You can now log in.');
        }, 2500);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Verification failed');
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
          <h3 className="text-lg font-black uppercase tracking-tight text-red-900">Link Missing</h3>
          <p className="text-sm font-medium text-red-700/80 max-w-[240px] leading-relaxed">
            We couldn&apos;t find a verification token. Please check your inbox for a valid link.
          </p>
        </div>
        <Button variant="outline" asChild className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-red-200 text-red-900 hover:bg-red-100">
          <Link href="/register">Register Again</Link>
        </Button>
      </div>
    );
  }

  if (status === 'verifying') {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-[2rem] bg-slate-100 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          Authenticating Identity
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="p-8 bg-emerald-50 rounded-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 rounded-[2rem] bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black uppercase tracking-tight text-emerald-900">Verified</h3>
          <p className="text-sm font-medium text-emerald-700/80 max-w-[240px] leading-relaxed">
            Your account is active. Redirecting you to the portal shortly...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="p-8 bg-red-50 rounded-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 rounded-[2rem] bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black uppercase tracking-tight text-red-900">Failed</h3>
            <p className="text-sm font-medium text-red-700/80 leading-relaxed max-w-[240px]">
              {error || 'The verification link is invalid or has already been used.'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <Button variant="premium" size="lg" className="h-14 font-black uppercase tracking-widest text-[11px]" onClick={() => verifyEmail(token)}>
            Retry Verification
          </Button>
          <Button variant="secondary" asChild className="h-14 font-black uppercase tracking-widest text-[11px] bg-slate-100">
            <Link href="/login">Return to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
