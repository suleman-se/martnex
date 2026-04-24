import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingFormData } from './onboarding-schema';

interface StepPayoutDetailsProps {
  register: UseFormRegister<OnboardingFormData>;
  errors: FieldErrors<OnboardingFormData>;
  payoutMethod: string | undefined;
}

export function StepPayoutDetails({ register, errors, payoutMethod }: StepPayoutDetailsProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-4">
        <Label className="text-xs font-bold text-slate-500 ml-1">Preferred Payout Method</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['bank_transfer', 'paypal'] as const).map((method) => (
            <label
              key={method}
              className={`flex flex-col gap-3 p-5 border-none rounded-3xl cursor-pointer transition-all duration-300 ${
                payoutMethod === method
                  ? 'bg-slate-900 text-white shadow-premium ring-4 ring-slate-900/5'
                  : 'bg-slate-50/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <input type="radio" value={method} {...register('payout_method')} className="hidden" />
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
          {[
            { id: 'account_holder', label: 'Account Holder', field: 'bank_details.account_holder' as const },
            { id: 'bank_name', label: 'Bank Name', field: 'bank_details.bank_name' as const },
            { id: 'account_number', label: 'Account Number', field: 'bank_details.account_number' as const },
            { id: 'routing_number', label: 'Routing Code', field: 'bank_details.routing_number' as const },
          ].map(({ id, label, field }) => (
            <div key={id} className="space-y-2.5">
              <Label htmlFor={id} className="text-xs font-bold text-slate-500 ml-1">
                {label} <span className="text-red-500">*</span>
              </Label>
              <Input
                id={id}
                {...register(field)}
                className="h-11 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium"
              />
            </div>
          ))}
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
  );
}
