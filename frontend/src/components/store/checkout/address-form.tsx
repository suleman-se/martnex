'use client'

import { useForm } from 'react-hook-form'
import type { CartAddress } from '@/hooks/use-cart'

export interface AddressFormValues {
  email: string
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  country_code: string
  postal_code: string
  phone?: string
}

interface AddressFormProps {
  defaultValues?: Partial<AddressFormValues>
  onSubmit: (values: AddressFormValues) => void
  isLoading?: boolean
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black uppercase tracking-widest text-slate-400">
        {label}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  )
}

const inputClass =
  'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all'

export function AddressForm({ defaultValues, onSubmit, isLoading = false }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Email" error={errors.email?.message}>
        <input
          {...register('email', { required: 'Email is required' })}
          type="email"
          placeholder="you@example.com"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" error={errors.first_name?.message}>
          <input
            {...register('first_name', { required: 'Required' })}
            placeholder="Jane"
            className={inputClass}
          />
        </Field>
        <Field label="Last Name" error={errors.last_name?.message}>
          <input
            {...register('last_name', { required: 'Required' })}
            placeholder="Smith"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Address" error={errors.address_1?.message}>
        <input
          {...register('address_1', { required: 'Address is required' })}
          placeholder="123 Main St"
          className={inputClass}
        />
      </Field>

      <Field label="Apartment, suite, etc. (optional)">
        <input {...register('address_2')} placeholder="Apt 4B" className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="City" error={errors.city?.message}>
          <input
            {...register('city', { required: 'City is required' })}
            placeholder="New York"
            className={inputClass}
          />
        </Field>
        <Field label="Postal Code" error={errors.postal_code?.message}>
          <input
            {...register('postal_code', { required: 'Postal code is required' })}
            placeholder="10001"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Country Code" error={errors.country_code?.message}>
          <input
            {...register('country_code', {
              required: 'Required',
              minLength: { value: 2, message: 'Use ISO code (e.g. US)' },
              maxLength: { value: 2, message: 'Use ISO code (e.g. US)' },
            })}
            placeholder="US"
            maxLength={2}
            className={`${inputClass} uppercase`}
          />
        </Field>
        <Field label="Phone (optional)">
          <input {...register('phone')} placeholder="+1 555 000 0000" className={inputClass} />
        </Field>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-premium hover:shadow-2xl hover:-translate-y-0.5 duration-300"
      >
        {isLoading ? 'Saving…' : 'Continue to Payment'}
      </button>
    </form>
  )
}
