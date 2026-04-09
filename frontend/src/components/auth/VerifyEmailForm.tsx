'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

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
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
        <p className="font-medium">No verification token provided</p>
        <p className="text-sm mt-1">
          Please check your email for the verification link.
        </p>
        <Link
          href="/register"
          className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          ← Back to register
        </Link>
      </div>
    );
  }

  if (status === 'verifying') {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800 mr-3"></div>
          <p className="font-medium">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
        <p className="font-medium">✓ Email verified successfully!</p>
        <p className="text-sm mt-1">
          Redirecting you to login...
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Verification failed</p>
          <p className="text-sm mt-1">{error}</p>
          {error?.includes('expired') && (
            <p className="text-sm mt-2">
              Your verification link may have expired. Please request a new one.
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            href="/register"
            className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Register again
          </Link>
          <Link
            href="/login"
            className="flex-1 text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
