'use client';

import { AlertCircle, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VerificationBannersProps {
  isPending: boolean;
  isRejected: boolean;
  isSuspended: boolean;
}

export function VerificationBanners({ 
  isPending, 
  isRejected, 
  isSuspended 
}: VerificationBannersProps) {
  
  if (!isPending && !isRejected && !isSuspended) {
    return null;
  }

  return (
    <div className="px-10 mt-6 space-y-4">
      {isPending && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Profile Under Review</h4>
              <p className="text-xs font-medium text-amber-700 leading-relaxed max-w-lg">
                Welcome to the network! Your seller application is currently being processed by the Martnex Registry. 
                Listing capabilities will be enabled upon successful verification (estimate 24h).
              </p>
            </div>
          </div>
          <Button variant="outline" className="bg-white border-amber-200 text-amber-800 hover:bg-amber-100 rounded-xl px-6 font-bold text-xs gap-2 shrink-0">
            Check Guidelines <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      )}

      {isRejected && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-700 shrink-0">
              <X className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Application Rejected</h4>
              <p className="text-xs font-medium text-red-700 leading-relaxed max-w-lg">
                Unfortunately, your merchant profile did not meet our verification criteria at this time. 
                Please contact support or review our compliance documentation to resolve this.
              </p>
            </div>
          </div>
          <Button variant="destructive" className="bg-red-600 hover:bg-red-700 rounded-xl px-6 font-bold text-xs gap-2 shrink-0">
            Contact Support
          </Button>
        </div>
      )}

      {isSuspended && (
        <div className="p-5 bg-slate-900 border border-slate-700 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 animate-pulse">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="space-y-1 text-white">
              <h4 className="text-sm font-black text-white uppercase tracking-tight">Security Suspension</h4>
              <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-lg">
                This account's listing capabilities have been temporarily suspended due to a compliance breach or security investigation.
              </p>
            </div>
          </div>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl px-6 font-bold text-xs gap-2 shrink-0">
            Appeal Decision
          </Button>
        </div>
      )}
    </div>
  );
}
