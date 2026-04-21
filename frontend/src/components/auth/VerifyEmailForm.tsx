'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBackendUrl } from '@/lib/medusa-client';

const API_URL = getBackendUrl();

interface VerifyEmailFormProps {
  token?: string;
}

export default function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && status === 'idle') {
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

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?message=Email verified successfully! You can now log in.');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Verification failed');
      }
    });
  };

  if (!token) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-4 rounded-xl backdrop-blur-sm">
        <p className="font-semibold text-white">No verification token provided</p>
        <p className="text-sm mt-1">
          Please check your email for the verification link.
        </p>
        <Link
          href="/register"
          className="mt-4 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          ← Back to register
        </Link>
      </div>
    );
  }

  if (status === 'verifying') {
    return (
      <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-4 rounded-xl backdrop-blur-sm">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400 mr-3"></div>
          <p className="font-medium text-white">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-4 rounded-xl backdrop-blur-sm">
        <p className="font-semibold text-white">✓ Email verified successfully!</p>
        <p className="text-sm mt-1 text-emerald-400/80">
          Redirecting you to login...
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-4 rounded-xl backdrop-blur-sm">
          <p className="font-semibold text-white">Verification failed</p>
          <p className="text-sm mt-1">{error}</p>
          {error?.includes('expired') && (
            <p className="text-sm mt-2 text-red-400">
              Your verification link may have expired. Please request a new one.
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/register"
            className="flex-1 flex justify-center items-center py-3 px-4 border border-white/20 rounded-xl text-sm font-semibold text-slate-300 bg-slate-900/50 hover:bg-slate-800/50 hover:text-white transition-all shadow-inner"
          >
            Register again
          </Link>
          <Link
            href="/login"
            className="flex-1 flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
