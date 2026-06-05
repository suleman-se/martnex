'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { CustomerAddress, AddressInput } from '@/types/address'

interface CustomerProfile {
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  addresses?: CustomerAddress[]
}

interface AddressEditorCardProps {
  customer: CustomerProfile | undefined
  addresses: CustomerAddress[]
  editingAddressId: string | null
  onSave: (payload: AddressInput) => void
  onCancel: () => void
  isPending: boolean
}

export function AddressEditorCard({
  customer,
  addresses,
  editingAddressId,
  onSave,
  onCancel,
  isPending,
}: AddressEditorCardProps) {
  // Form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [countryCode, setCountryCode] = useState('us')
  const [phone, setPhone] = useState('')
  const [isDefaultShipping, setIsDefaultShipping] = useState(false)
  const [isDefaultBilling, setIsDefaultBilling] = useState(false)

  const editingAddress = editingAddressId ? addresses.find((a) => a.id === editingAddressId) : null
  const otherShippingDefaults = addresses.filter((a) => a.id !== editingAddressId && a.is_default_shipping)
  const otherBillingDefaults = addresses.filter((a) => a.id !== editingAddressId && a.is_default_billing)

  const isOnlyDefaultShipping = editingAddress?.is_default_shipping && otherShippingDefaults.length === 0
  const isOnlyDefaultBilling = editingAddress?.is_default_billing && otherBillingDefaults.length === 0

  const isShippingDisabled = editingAddressId ? (!!isOnlyDefaultShipping || addresses.length <= 1) : false
  const isBillingDisabled = editingAddressId ? (!!isOnlyDefaultBilling || addresses.length <= 1) : false

  // Populate form on load/mode shift
  useEffect(() => {
    if (editingAddressId && editingAddress) {
      setFirstName(editingAddress.first_name || '')
      setLastName(editingAddress.last_name || '')
      setAddress1(editingAddress.address_1 || '')
      setAddress2(editingAddress.address_2 || '')
      setCity(editingAddress.city || '')
      setPostalCode(editingAddress.postal_code || '')
      setCountryCode(editingAddress.country_code || 'us')
      setPhone(editingAddress.phone || '')
      setIsDefaultShipping(editingAddress.is_default_shipping || false)
      setIsDefaultBilling(editingAddress.is_default_billing || false)
    } else {
      setFirstName(customer?.first_name || '')
      setLastName(customer?.last_name || '')
      setAddress1('')
      setAddress2('')
      setCity('')
      setPostalCode('')
      setCountryCode('us')
      setPhone('')
      setIsDefaultShipping(false)
      setIsDefaultBilling(false)
    }
  }, [editingAddressId, editingAddress, customer])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!firstName || !lastName || !address1 || !city || !postalCode) {
      toast.error('Please fill in all required fields.')
      return
    }

    const isFirstAddress = addresses.length === 0
    const payload: AddressInput = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      address_1: address1.trim(),
      address_2: address2.trim() || undefined,
      city: city.trim(),
      country_code: countryCode.toLowerCase().trim(),
      postal_code: postalCode.trim(),
      phone: phone.trim() || undefined,
      is_default_shipping: isFirstAddress ? true : isDefaultShipping,
      is_default_billing: isFirstAddress ? true : isDefaultBilling,
    }

    onSave(payload)
  }

  return (
    <Card className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
        <h2 className="text-base font-black text-slate-850 uppercase tracking-[0.15em]">
          {editingAddressId ? 'Edit Shipping Destination' : 'Add New Shipping Destination'}
        </h2>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full border border-slate-100 hover:bg-slate-50 cursor-pointer"
        >
          <X className="h-4 w-4 text-slate-400" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">First Name *</label>
            <Input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-11 rounded-xl"
              placeholder="e.g. John"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Last Name *</label>
            <Input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-11 rounded-xl"
              placeholder="e.g. Doe"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Street Address *</label>
            <Input
              type="text"
              required
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className="h-11 rounded-xl"
              placeholder="e.g. 123 Artisan Highway"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Apartment, Suite, etc. (Optional)</label>
            <Input
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              className="h-11 rounded-xl"
              placeholder="e.g. Apt 4B"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">City *</label>
            <Input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-11 rounded-xl"
              placeholder="e.g. New York"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Postal Code *</label>
            <Input
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="h-11 rounded-xl"
              placeholder="e.g. 10001"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Country Code (2 Letters) *</label>
            <Input
              type="text"
              required
              maxLength={2}
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="h-11 rounded-xl uppercase"
              placeholder="e.g. US"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Phone Number (Optional)</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 rounded-xl"
              placeholder="e.g. +1 555-0199"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-1.5 pb-2">
          <label className={`flex items-center gap-2.5 select-none ${isShippingDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={isDefaultShipping}
              disabled={isShippingDisabled}
              onChange={(e) => setIsDefaultShipping(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-slate-200 text-slate-900 focus:ring-slate-900/30 disabled:opacity-50"
            />
            <span className="text-xs font-bold text-slate-650 dark:text-slate-400">
              Default Shipping {isShippingDisabled && editingAddressId && '(Required - Only default)'}
            </span>
          </label>

          <label className={`flex items-center gap-2.5 select-none ${isBillingDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={isDefaultBilling}
              disabled={isBillingDisabled}
              onChange={(e) => setIsDefaultBilling(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-slate-200 text-slate-900 focus:ring-slate-900/30 disabled:opacity-50"
            />
            <span className="text-xs font-bold text-slate-650 dark:text-slate-400">
              Default Billing {isBillingDisabled && editingAddressId && '(Required - Only default)'}
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3.5 pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-11 px-6 font-bold text-xs cursor-pointer disabled:opacity-50"
          >
            {editingAddressId ? 'Save Changes' : 'Add Destination'}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="rounded-2xl h-11 px-6 font-bold text-xs hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
