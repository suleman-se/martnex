import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingFormData } from './onboarding-schema';

interface StepBusinessAddressProps {
  register: UseFormRegister<OnboardingFormData>;
  errors: FieldErrors<OnboardingFormData>;
}

export function StepBusinessAddress({ register, errors }: StepBusinessAddressProps) {
  return (
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
          <Input id="city" {...register('business_address.city')} placeholder="San Francisco" className={`h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.business_address?.city ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`} />
          {errors.business_address?.city && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.business_address.city.message}</p>}
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="state" className="text-xs font-bold text-slate-500 ml-1">
            State / Province <span className="text-red-500">*</span>
          </Label>
          <Input id="state" {...register('business_address.state')} placeholder="California" className={`h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.business_address?.state ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`} />
          {errors.business_address?.state && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.business_address.state.message}</p>}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="postal_code" className="text-xs font-bold text-slate-500 ml-1">
            Postal Code <span className="text-red-500">*</span>
          </Label>
          <Input id="postal_code" {...register('business_address.postal_code')} placeholder="94105" className={`h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.business_address?.postal_code ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`} />
          {errors.business_address?.postal_code && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.business_address.postal_code.message}</p>}
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="country" className="text-xs font-bold text-slate-500 ml-1">
            Country <span className="text-red-500">*</span>
          </Label>
          <Input id="country" {...register('business_address.country')} placeholder="United States" className={`h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900/10 font-medium ${errors.business_address?.country ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''}`} />
          {errors.business_address?.country && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.business_address.country.message}</p>}
        </div>
      </div>
    </div>
  );
}
