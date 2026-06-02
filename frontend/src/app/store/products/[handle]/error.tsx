'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled route error boundary:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-card border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4 max-w-xl mx-auto my-12 shadow-sm">
      <AlertCircle className="w-12 h-12 text-rose-500" />
      <h3 className="text-lg font-black text-slate-850 dark:text-slate-100 uppercase tracking-wider">Something went wrong!</h3>
      <p className="text-xs text-slate-400 font-semibold max-w-sm">We encountered an unexpected error while retrieving this page content.</p>
      <Button onClick={reset} className="rounded-2xl px-6 h-11 text-xs uppercase tracking-widest font-black mt-2">
        Retry Load
      </Button>
    </div>
  );
}
