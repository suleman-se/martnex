'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { CustomerAddress } from '@/types/address'

interface DeleteAddressDialogProps {
  deletingAddressId: string | null
  addresses: CustomerAddress[]
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteAddressDialog({
  deletingAddressId,
  addresses,
  onOpenChange,
  onConfirm,
}: DeleteAddressDialogProps) {
  const isOpen = !!deletingAddressId
  const target = deletingAddressId ? addresses.find((a) => a.id === deletingAddressId) : null

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-black text-slate-850 uppercase tracking-[0.1em]">
            Delete shipping destination?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs font-semibold text-slate-500 leading-relaxed">
            {(() => {
              if (!target) return null

              const isOnlyAddress = addresses.length === 1
              if (isOnlyAddress) {
                return (
                  <span className="text-rose-500 font-bold block mb-3 border-l-2 border-rose-500 pl-3">
                    ⚠️ Note: This is your only saved address (and is currently your default shipping and billing address). Deleting it will leave you with no saved addresses.
                  </span>
                )
              }

              if (target.is_default_shipping || target.is_default_billing) {
                const types = [
                  target.is_default_shipping && 'default shipping',
                  target.is_default_billing && 'default billing',
                ]
                  .filter((t): t is string => typeof t === 'string')
                  .join(' and ')

                const remaining = addresses.filter((a) => a.id !== deletingAddressId)
                const nextAddress = remaining[0]
                const nextAddressName = nextAddress
                  ? `${nextAddress.first_name || ''} ${nextAddress.last_name || ''} (${nextAddress.address_1 || ''})`
                  : 'your next remaining address'

                return (
                  <span className="text-rose-500 font-bold block mb-3 border-l-2 border-rose-500 pl-3">
                    ⚠️ Note: This is your {types} address. Deleting it will automatically promote <strong>{nextAddressName}</strong> to be your new default.
                  </span>
                )
              }
              return null
            })()}
            Are you sure you want to delete this address? This action is permanent and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
          <AlertDialogCancel className="rounded-2xl h-10 px-5 font-bold text-xs uppercase tracking-widest bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 cursor-pointer shadow-none">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-2xl h-10 px-5 font-black text-xs uppercase tracking-widest bg-rose-500 hover:bg-rose-600 text-white border-0 cursor-pointer"
          >
            Delete Address
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
