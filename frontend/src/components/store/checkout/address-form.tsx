'use client'

import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface AddressFormValues {
  email?: string
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  country_code: string
  postal_code: string
  phone: string
}

interface AddressFormProps {
  defaultValues?: Partial<AddressFormValues>
  onSubmit: (values: AddressFormValues) => void
  isLoading?: boolean
  allowedCountryCodes?: string[]
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
      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  )
}

export function AddressForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  allowedCountryCodes = [],
}: AddressFormProps) {
  const countryOptions = (allowedCountryCodes.length
    ? allowedCountryCodes
    : defaultValues?.country_code
      ? [defaultValues.country_code]
      : []
  ).map((code) => code.toLowerCase())

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Email (optional)" error={errors.email?.message}>
        <Input
          {...register('email', {
            validate: (value) => {
              if (!value) return true
              const valid = /^\S+@\S+\.\S+$/.test(value)
              return valid || 'Enter a valid email address'
            },
          })}
          type="email"
          placeholder="you@example.com"
          className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus-visible:ring-slate-900/10"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" error={errors.first_name?.message}>
          <Input
            {...register('first_name', { required: 'Required' })}
            placeholder="Jane"
            className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus-visible:ring-slate-900/10"
          />
        </Field>
        <Field label="Last Name" error={errors.last_name?.message}>
          <Input
            {...register('last_name', { required: 'Required' })}
            placeholder="Smith"
            className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus-visible:ring-slate-900/10"
          />
        </Field>
      </div>

      <Field label="Address" error={errors.address_1?.message}>
        <Input
          {...register('address_1', { required: 'Address is required' })}
          placeholder="123 Main St"
          className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus-visible:ring-slate-900/10"
        />
      </Field>

      <Field label="Apartment, suite, etc. (optional)">
        <Input
          {...register('address_2')}
          placeholder="Apt 4B"
          className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus-visible:ring-slate-900/10"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="City" error={errors.city?.message}>
          <Input
            {...register('city', { required: 'City is required' })}
            placeholder="New York"
            className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus-visible:ring-slate-900/10"
          />
        </Field>
        <Field label="Postal Code" error={errors.postal_code?.message}>
          <Input
            {...register('postal_code', { required: 'Postal code is required' })}
            placeholder="10001"
            className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus-visible:ring-slate-900/10"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Country Code" error={errors.country_code?.message}>
          <Controller
            control={control}
            name="country_code"
            rules={{ required: 'Please select a country' }}
            render={({ field }) => (
              <Select
                value={field.value?.toLowerCase() || ''}
                onValueChange={field.onChange}
                disabled={!countryOptions.length}
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 focus:ring-slate-900/10">
                  <SelectValue
                    placeholder={countryOptions.length ? 'Select country' : 'No countries available'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <Input
            {...register('phone', { required: 'Phone number is required' })}
            placeholder="+1 555 000 0000"
            className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus-visible:ring-slate-900/10"
          />
        </Field>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 rounded-2xl bg-slate-900 text-sm font-black uppercase tracking-widest hover:bg-slate-800"
      >
        {isLoading ? 'Saving…' : 'Continue to Payment'}
      </Button>
    </form>
  )
}
