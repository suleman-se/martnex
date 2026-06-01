'use client'

import { CheckCircle2, Plus } from 'lucide-react'
import { CustomerAddress, AddressInput } from '@/types/address'

interface SavedAddressSelectorProps {
  savedAddresses: CustomerAddress[]
  selectedSavedAddressId: string | null
  customerEmail: string
  onSelect: (addressValues: AddressInput, id: string | null) => void
}

export function SavedAddressSelector({
  savedAddresses,
  selectedSavedAddressId,
  customerEmail,
  onSelect,
}: SavedAddressSelectorProps) {
  return (
    <div className="mb-8">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
        Select a Saved Address
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-300">
        {savedAddresses.map((addr) => {
          const isSelected = selectedSavedAddressId === addr.id
          return (
            <button
              key={addr.id}
              type="button"
              onClick={() => {
                onSelect(
                  {
                    first_name: addr.first_name || '',
                    last_name: addr.last_name || '',
                    address_1: addr.address_1 || '',
                    address_2: addr.address_2 || '',
                    city: addr.city || '',
                    country_code: addr.country_code || '',
                    postal_code: addr.postal_code || '',
                    phone: addr.phone || '',
                    is_default_shipping: addr.is_default_shipping,
                    is_default_billing: addr.is_default_billing,
                  },
                  addr.id
                )
              }}
              className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'border-slate-900 ring-2 ring-slate-900/5 bg-slate-50/50'
                  : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-black text-slate-800">
                    {addr.first_name} {addr.last_name}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-slate-900 shrink-0 animate-in zoom-in-50 duration-150" />
                  )}
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-normal">
                  {addr.address_1}
                  {addr.address_2 && `, ${addr.address_2}`}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
                  {addr.city}, {addr.postal_code} · {addr.country_code?.toUpperCase()}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1 mt-3">
                {addr.is_default_shipping && (
                  <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Default Shipping
                  </span>
                )}
                {addr.is_default_billing && (
                  <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Default Billing
                  </span>
                )}
              </div>
            </button>
          )
        })}

        {/* Option for custom address */}
        <button
          type="button"
          onClick={() => {
            onSelect(
              {
                first_name: '',
                last_name: '',
                address_1: '',
                address_2: '',
                city: '',
                country_code: '',
                postal_code: '',
                phone: '',
              },
              null
            )
          }}
          className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-center items-center gap-2 min-h-[120px] group cursor-pointer ${
            selectedSavedAddressId === null
              ? 'border-slate-900 ring-2 ring-slate-900/5 bg-slate-50/50'
              : 'border-dashed border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50/30'
          }`}
        >
          <Plus className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          <span className="text-xs font-black text-slate-700">Use a new address</span>
        </button>
      </div>
    </div>
  )
}
