import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingFormData } from './onboarding-schema';

interface StepBusinessInfoProps {
  register: UseFormRegister<OnboardingFormData>;
  errors: FieldErrors<OnboardingFormData>;
}

export function StepBusinessInfo({ register, errors }: StepBusinessInfoProps) {
  return (
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
  );
}
