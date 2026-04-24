import { UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingFormData } from './onboarding-schema';

interface StepTaxInfoProps {
  register: UseFormRegister<OnboardingFormData>;
}

export function StepTaxInfo({ register }: StepTaxInfoProps) {
  return (
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
  );
}
