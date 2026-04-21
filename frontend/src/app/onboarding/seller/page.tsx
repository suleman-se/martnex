'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/auth-store';
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const onboardingSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  business_email: z.string().email('Invalid business email address'),
  business_phone: z.string().min(10, 'Invalid phone number').optional().or(z.literal('')),
  business_address: z.object({
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State/Province is required'),
    postal_code: z.string().min(4, 'Postal code is required'),
    country: z.string().min(2, 'Country is required'),
  }),
  tax_id: z.string().min(5, 'Tax ID must be at least 5 characters').optional().or(z.literal('')),
  payout_method: z.enum(['bank_transfer', 'paypal', 'stripe']).optional(),
  bank_details: z.object({
    account_holder: z.string().min(2, 'Account holder name is required'),
    account_number: z.string().min(8, 'Account number is required'),
    routing_number: z.string().min(5, 'Routing/Sort code is required'),
    bank_name: z.string().min(2, 'Bank name is required'),
  }).optional(),
  paypal_email: z.string().email('Invalid PayPal email').optional().or(z.literal('')),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      business_email: user?.email || '',
      payout_method: 'bank_transfer',
      business_address: {
        country: 'United States',
      }
    },
  });

  const payoutMethod = watch('payout_method');

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['business_name', 'business_email', 'business_phone'];
    if (step === 2) fieldsToValidate = ['business_address.address', 'business_address.city', 'business_address.state', 'business_address.postal_code', 'business_address.country'];
    if (step === 3) fieldsToValidate = ['tax_id'];
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setError(null);
    startTransition(async () => {
      try {
        const token = localStorage.getItem('access_token');
        const { refreshUser } = useAuthStore.getState();
        const headers = await buildStoreHeaders(token || undefined);
        
        // Ensure payout details are cleaned up based on method
        const submissionData = { ...data };
        if (submissionData.payout_method === 'bank_transfer') {
          delete (submissionData as any).paypal_email;
        } else if (submissionData.payout_method === 'paypal') {
          delete (submissionData as any).bank_details;
        }

        const response = await fetch(`${getBackendUrl()}/store/sellers`, {
          method: 'POST',
          headers,
          body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || 'Failed to complete onboarding');
        }

        // Refresh user state to reflect seller status if needed
        await refreshUser();
        
        // Redirect to seller dashboard
        router.push('/seller');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-6 py-12 md:py-24 font-sans animate-in fade-in duration-700">
      <div className="w-full max-w-2xl space-y-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-premium rotate-2 hover:rotate-0 transition-transform duration-500">
            M
          </div>
          
          <div className="space-y-3">
            <Badge variant="secondary" className="px-4 py-1 bg-slate-100 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 rounded-full border-none">
              Merchant Registration
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Welcome to Martnex
            </h1>
            <p className="text-slate-500 max-w-md mx-auto text-lg font-medium leading-relaxed">
              Complete your business profile to start selling on our multi-vendor platform.
            </p>
          </div>
        </div>

        <div className="relative">
          {/* Decorative ambient glow */}
          <div className="absolute -inset-10 bg-slate-100/40 rounded-[3rem] -z-10 blur-3xl opacity-60"></div>
          
          <Card className="border-none shadow-premium bg-white overflow-hidden rounded-[2.5rem] relative">
            {/* Step Progress Line */}
            <div className="h-1 w-full bg-slate-50">
              <div 
                className="h-full bg-slate-900 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)" 
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
            
            <CardHeader className="pt-10 pb-6 px-10">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Step {step} of 4</span>
                  <h2 className="text-xl font-bold text-slate-900">
                    {step === 1 && "Business Information"}
                    {step === 2 && "Business Address"}
                    {step === 3 && "Tax & Identification"}
                    {step === 4 && "Payout Details"}
                  </h2>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((s) => (
                    <div 
                      key={s} 
                      className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${s <= step ? 'bg-slate-900' : 'bg-slate-100'}`} 
                    />
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

                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid gap-6 sm:grid-cols-2">
                       <div className="space-y-2.5">
                        <Label htmlFor="business_name" className="text-xs font-bold text-slate-500 ml-1">
                          Business Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="business_name"
                          {...register('business_name')}
                          placeholder="Acme Tech Solutions"
                          className={`h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 placeholder:text-slate-300 font-medium ${errors.business_name ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`}
                        />
                        {errors.business_name && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.business_name.message}</p>}
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="business_email" className="text-xs font-bold text-slate-500 ml-1">
                          Business Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="business_email"
                          {...register('business_email')}
                          placeholder="support@acme.com"
                          className={`h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 placeholder:text-slate-300 font-medium ${errors.business_email ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`}
                        />
                        {errors.business_email && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.business_email.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="business_phone" className="text-xs font-bold text-slate-500 ml-1">Business Phone (Optional)</Label>
                      <Input
                        id="business_phone"
                        {...register('business_phone')}
                        placeholder="+1 (555) 000-0000"
                        className="h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 placeholder:text-slate-300 font-medium"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-2.5">
                      <Label htmlFor="address" className="text-xs font-bold text-slate-500 ml-1">
                        Street Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        {...register('business_address.address')}
                        placeholder="123 Innovation Drive"
                        className={`h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.business_address?.address ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`}
                      />
                      {errors.business_address?.address && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.business_address.address.message}</p>}
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2.5">
                        <Label htmlFor="city" className="text-xs font-bold text-slate-500 ml-1">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="city" 
                          {...register('business_address.city')} 
                          placeholder="San Francisco" 
                          className={`h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.business_address?.city ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                        />
                        {errors.business_address?.city && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.business_address.city.message}</p>}
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="state" className="text-xs font-bold text-slate-500 ml-1">
                          State / Province <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="state" 
                          {...register('business_address.state')} 
                          placeholder="California" 
                          className={`h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.business_address?.state ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                        />
                        {errors.business_address?.state && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.business_address.state.message}</p>}
                      </div>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                       <div className="space-y-2.5">
                        <Label htmlFor="postal_code" className="text-xs font-bold text-slate-500 ml-1">
                          Postal Code <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="postal_code" 
                          {...register('business_address.postal_code')} 
                          placeholder="94105" 
                          className={`h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.business_address?.postal_code ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                        />
                        {errors.business_address?.postal_code && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.business_address.postal_code.message}</p>}
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="country" className="text-xs font-bold text-slate-500 ml-1">
                          Country <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="country" 
                          {...register('business_address.country')} 
                          placeholder="United States" 
                          className={`h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.business_address?.country ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                        />
                        {errors.business_address?.country && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.business_address.country.message}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-2.5">
                      <Label htmlFor="tax_id" className="text-xs font-bold text-slate-500 ml-1">Tax ID / VAT / EIN (Optional)</Label>
                      <Input
                        id="tax_id"
                        {...register('tax_id')}
                        placeholder="Enter business tax identifier"
                        className="h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 placeholder:text-slate-300 font-medium"
                      />
                    </div>
                    
                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <div className="h-24 w-24 border-8 border-white rounded-full"></div>
                      </div>
                      <div className="flex gap-4 relative z-10">
                        <div className="h-6 w-6 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">!</div>
                        <div className="space-y-2">
                           <h4 className="text-sm font-bold">Verification Protocol</h4>
                           <p className="text-xs leading-relaxed text-slate-300 font-medium">
                             All sellers are scrutinized by our compliance engine. Expect a verified status update via the registry within 24-48 business hours.
                           </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-4">
                      <Label className="text-xs font-bold text-slate-500 ml-1">Preferred Payout Method</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['bank_transfer', 'paypal'].map((method) => (
                          <label 
                            key={method}
                            className={`flex flex-col gap-3 p-5 border-none rounded-3xl cursor-pointer transition-all duration-300 ${
                              payoutMethod === method 
                                ? 'bg-slate-900 text-white shadow-premium ring-4 ring-slate-900/5' 
                                : 'bg-slate-50/80 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="radio"
                              value={method}
                              {...register('payout_method')}
                              className="hidden"
                            />
                            <div className="flex justify-between items-center">
                               <span className="text-sm font-extrabold capitalize">{method.replace('_', ' ')}</span>
                               {payoutMethod === method && <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse"></div>}
                            </div>
                            <span className="text-[10px] font-medium opacity-60">
                              {method === 'bank_transfer' ? 'Direct settlement to banking registry' : 'Instant digital wallet transfer'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {payoutMethod === 'bank_transfer' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="space-y-2.5">
                          <Label htmlFor="account_holder" className="text-xs font-bold text-slate-500 ml-1">
                            Account Holder <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            id="account_holder" 
                            {...register('bank_details.account_holder')} 
                            className={`h-11 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.bank_details?.account_holder ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                          />
                          {errors.bank_details?.account_holder && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.bank_details.account_holder.message}</p>}
                        </div>
                        <div className="space-y-2.5">
                          <Label htmlFor="bank_name" className="text-xs font-bold text-slate-500 ml-1">
                            Bank Name <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            id="bank_name" 
                            {...register('bank_details.bank_name')} 
                            className={`h-11 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.bank_details?.bank_name ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                          />
                          {errors.bank_details?.bank_name && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.bank_details.bank_name.message}</p>}
                        </div>
                        <div className="space-y-2.5">
                          <Label htmlFor="account_number" className="text-xs font-bold text-slate-500 ml-1">
                            Account Number <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            id="account_number" 
                            {...register('bank_details.account_number')} 
                            className={`h-11 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.bank_details?.account_number ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                          />
                          {errors.bank_details?.account_number && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.bank_details.account_number.message}</p>}
                        </div>
                        <div className="space-y-2.5">
                          <Label htmlFor="routing_number" className="text-xs font-bold text-slate-500 ml-1">
                            Routing Code <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            id="routing_number" 
                            {...register('bank_details.routing_number')} 
                            className={`h-11 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.bank_details?.routing_number ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                          />
                          {errors.bank_details?.routing_number && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.bank_details.routing_number.message}</p>}
                        </div>
                      </div>
                    )}

                    {payoutMethod === 'paypal' && (
                      <div className="space-y-2.5 animate-in fade-in zoom-in-95 duration-500">
                        <Label htmlFor="paypal_email" className="text-xs font-bold text-slate-500 ml-1">
                          PayPal Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="paypal_email"
                          {...register('paypal_email')}
                          placeholder="paypal@acme.com"
                          className={`h-11 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.paypal_email ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`}
                        />
                        {errors.paypal_email && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.paypal_email.message}</p>}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="px-10 pb-10 flex flex-col sm:flex-row gap-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(step - 1)}
                    className="w-full sm:flex-1 h-14 font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    Back
                  </Button>
                )}
                {step < 4 ? (
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
        
        <div className="flex flex-col items-center space-y-4 px-8">
           <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] leading-relaxed max-w-sm">
             Secure merchant registration protocol enabled. 24/7 technical assistance for verified partners.
           </p>
           <div className="h-px w-12 bg-slate-200"></div>
           <p className="text-[10px] font-bold text-slate-300">MARTNEX DISTRIBUTED NETWORK</p>
        </div>
      </div>
    </div>
  );
}
