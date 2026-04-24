'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/store/auth-store';
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client';
import { ProtectedRoute } from '@/components/shared/guards/protected-route';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

import { onboardingSchema, OnboardingFormData, STEP_TITLES, STEP_FIELDS } from '@/components/seller/onboarding/onboarding-schema';
import { StepBusinessInfo } from '@/components/seller/onboarding/step-business-info';
import { StepBusinessAddress } from '@/components/seller/onboarding/step-business-address';
import { StepTaxInfo } from '@/components/seller/onboarding/step-tax-info';
import { StepPayoutDetails } from '@/components/seller/onboarding/step-payout-details';

const TOTAL_STEPS = 4;

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      business_email: user?.email || '',
      payout_method: 'bank_transfer',
      business_address: { country: 'United States' },
    },
  });

  const payoutMethod = watch('payout_method');

  const nextStep = async () => {
    const isValid = await trigger(STEP_FIELDS[step] as any);
    if (isValid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setError(null);
    startTransition(async () => {
      try {
        const token = localStorage.getItem('access_token');
        const { refreshUser } = useAuthStore.getState();
        const headers = await buildStoreHeaders(token || undefined);

        const submissionData = { ...data };
        if (submissionData.payout_method === 'bank_transfer') delete (submissionData as any).paypal_email;
        else if (submissionData.payout_method === 'paypal') delete (submissionData as any).bank_details;

        const response = await fetch(`${getBackendUrl()}/store/sellers`, {
          method: 'POST',
          headers,
          body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || 'Failed to complete onboarding');
        }

        await refreshUser();
        router.push('/seller');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  };

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-6 py-12 md:py-24 font-sans animate-in fade-in duration-700">
        <div className="w-full max-w-2xl space-y-12">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-premium rotate-2 hover:rotate-0 transition-transform duration-500">
              M
            </div>
            <div className="space-y-3">
              <Badge variant="secondary" className="px-4 py-1 bg-slate-100 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 rounded-full border-none">
                Merchant Registration
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">Welcome to Martnex</h1>
              <p className="text-slate-500 max-w-md mx-auto text-lg font-medium leading-relaxed">
                Complete your business profile to start selling on our multi-vendor platform.
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="relative">
            <div className="absolute -inset-10 bg-slate-100/40 rounded-[3rem] -z-10 blur-3xl opacity-60"></div>
            <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[2.5rem] relative">
              {/* Progress bar */}
              <div className="h-1 w-full bg-slate-50">
                <div className="h-full bg-slate-900 transition-all duration-700" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
              </div>

              <CardHeader className="pt-10 pb-6 px-10">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Step {step} of {TOTAL_STEPS}</span>
                    <h2 className="text-xl font-bold text-slate-900">{STEP_TITLES[step]}</h2>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                      <div key={i} className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${i + 1 <= step ? 'bg-slate-900' : 'bg-slate-100'}`} />
                    ))}
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="px-10 pb-10 space-y-8">
                  {error && (
                    <div className="p-4 bg-red-50/50 border-l-4 border-red-500/50 rounded-r-xl animate-in slide-in-from-top-2 duration-300">
                      <p className="text-xs font-bold text-red-800">{error}</p>
                    </div>
                  )}
                  {step === 1 && <StepBusinessInfo register={register} errors={errors} />}
                  {step === 2 && <StepBusinessAddress register={register} errors={errors} />}
                  {step === 3 && <StepTaxInfo register={register} />}
                  {step === 4 && <StepPayoutDetails register={register} errors={errors} payoutMethod={payoutMethod} />}
                </CardContent>

                <CardFooter className="px-10 pb-10 flex flex-col sm:flex-row gap-4">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep((s) => s - 1)}
                      className="w-full sm:flex-1 h-14 font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      Back
                    </Button>
                  )}
                  {step < TOTAL_STEPS ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="w-full sm:flex-[2] h-14 bg-slate-900 text-white font-extrabold rounded-2xl shadow-premium hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                    >
                      Continue to Next Step
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full sm:flex-[2] h-14 bg-slate-900 text-white font-extrabold rounded-2xl shadow-premium hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                    >
                      {isPending ? 'Propagating Identity...' : 'Complete Registry Entry'}
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center space-y-4 px-8">
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] leading-relaxed max-w-sm">
              Secure merchant registration protocol enabled. 24/7 technical assistance for verified partners.
            </p>
            <div className="h-px w-12 bg-slate-200"></div>
            <p className="text-[10px] font-bold text-slate-300">MARTNEX DISTRIBUTED NETWORK</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
