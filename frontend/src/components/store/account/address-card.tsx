'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home, CheckCircle2, Edit2, Trash2 } from 'lucide-react'

import { CustomerAddress } from '@/types/address'

interface AddressCardProps {
  address: CustomerAddress
  isFirst?: boolean
  onEdit: (address: CustomerAddress) => void
  onDeleteClick: (id: string) => void
}

export function AddressCard({
  address,
  isFirst = false,
  onEdit,
  onDeleteClick,
}: AddressCardProps) {
  return (
    <Card
      className={`rounded-3xl border p-6 bg-white shadow-sm relative flex flex-col justify-between group ${
        isFirst
          ? 'border-slate-900/10 ring-1 ring-slate-900/5'
          : 'border-slate-100 hover:border-slate-205'
      }`}
    >
      {/* Upper Details */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-slate-400" />
            <p className="text-xs font-black text-slate-800">
              {[address.first_name, address.last_name].filter(Boolean).join(' ')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {address.is_default_shipping && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <CheckCircle2 className="h-3 w-3" />
                Shipping
              </span>
            )}
            {address.is_default_billing && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <CheckCircle2 className="h-3 w-3" />
                Billing
              </span>
            )}
          </div>
        </div>

        <p className="text-sm font-semibold text-slate-650">{address.address_1}</p>
        {address.address_2 && (
          <p className="text-sm font-semibold text-slate-400">{address.address_2}</p>
        )}
        <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
          {address.city}, {address.postal_code} · {address.country_code?.toUpperCase()}
        </p>
        {address.phone && (
          <p className="text-[10px] text-slate-400 font-semibold mt-2">
            Phone: <span className="text-slate-500">{address.phone}</span>
          </p>
        )}
      </div>

      {/* Operations */}
      <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
        <Button
          onClick={() => onEdit(address)}
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-900 border border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center gap-1"
        >
          <Edit2 className="h-3 w-3" />
          Edit
        </Button>
        <Button
          onClick={() => onDeleteClick(address.id)}
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg text-[10px] font-bold text-rose-500 hover:text-rose-600 border border-rose-600 hover:border-rose-50 hover:bg-rose-50 cursor-pointer flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </Button>
      </div>
    </Card>
  )
}
