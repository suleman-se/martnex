'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchMe, addCustomerAddress, updateCustomerAddress, deleteCustomerAddress } from '@/lib/api'
import { useMounted } from '@/hooks/use-mounted'
import { MapPin, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { AddressCard } from '@/components/store/account/address-card'
import { CustomerAddress, AddressInput } from '@/types/address'
import { AddressEditorCard } from '@/components/store/account/address-editor-card'
import { DeleteAddressDialog } from '@/components/store/account/delete-address-dialog'

export default function SavedAddressesPage() {
  const mounted = useMounted()
  const queryClient = useQueryClient()

  const [isEditing, setIsEditing] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const { data, isLoading } = useQuery({
    queryKey: ['customer-addresses-profile'],
    queryFn: () => fetchMe(token ?? undefined),
    enabled: mounted && !!token,
  })

  const addAddressMutation = useMutation({
    mutationFn: (newAddress: AddressInput) => addCustomerAddress(newAddress, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses-profile'] })
      toast.success('Shipping address added successfully.')
      resetForm()
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add address. Please try again.')
    }
  })

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, address }: { id: string; address: Partial<AddressInput> }) =>
      updateCustomerAddress(id, address, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses-profile'] })
      toast.success('Shipping address updated successfully.')
      resetForm()
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update address. Please try again.')
    }
  })

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const targetAddress = addresses.find((a) => a.id === id)
      const remaining = addresses.filter((a) => a.id !== id)
      
      await deleteCustomerAddress(id, token ?? undefined)
      
      if (targetAddress && remaining.length > 0) {
        const needsShippingPromote = targetAddress.is_default_shipping
        const needsBillingPromote = targetAddress.is_default_billing
        
        if (needsShippingPromote || needsBillingPromote) {
          const firstRemaining = remaining[0]
          await updateCustomerAddress(
            firstRemaining.id,
            {
              is_default_shipping: needsShippingPromote ? true : firstRemaining.is_default_shipping,
              is_default_billing: needsBillingPromote ? true : firstRemaining.is_default_billing,
            },
            token ?? undefined
          )
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses-profile'] })
      toast.success('Address deleted successfully.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete address.')
    }
  })

  if (!mounted) return null

  const customer = data?.customer
  const addresses: CustomerAddress[] = customer?.addresses || []

  function resetForm() {
    setIsEditing(false)
    setEditingAddressId(null)
  }

  function handleEditClick(addr: CustomerAddress) {
    setIsEditing(true)
    setEditingAddressId(addr.id)
  }

  function handleAddClick() {
    setIsEditing(true)
    setEditingAddressId(null)
  }

  function handleSave(payload: AddressInput) {
    if (editingAddressId) {
      updateAddressMutation.mutate({ id: editingAddressId, address: payload })
    } else {
      addAddressMutation.mutate(payload)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-black text-slate-900">
            Saved Addresses
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Manage your saved delivery destinations for a quick and seamless checkout experience.
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={handleAddClick}
            className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-10 px-4 font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        )}
      </div>

      {/* Form Area (Add / Edit) */}
      {isEditing && (
        <AddressEditorCard
          customer={customer}
          addresses={addresses}
          editingAddressId={editingAddressId}
          onSave={handleSave}
          onCancel={resetForm}
          isPending={addAddressMutation.isPending || updateAddressMutation.isPending}
        />
      )}

      {/* Address Cards List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="h-44 w-full bg-slate-50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <Card className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-slate-400 font-medium">
          <MapPin className="h-12 w-12 text-slate-350 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-700">No Addresses Saved</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            You don't have any saved delivery destinations. Add one now to checkout faster on future purchases.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr, index) => {
            const isFirst = index === 0
            return (
              <AddressCard
                key={addr.id}
                address={addr}
                isFirst={isFirst}
                onEdit={handleEditClick}
                onDeleteClick={(id) => setDeletingAddressId(id)}
              />
            )
          })}
        </div>
      )}

      <DeleteAddressDialog
        deletingAddressId={deletingAddressId}
        addresses={addresses}
        onOpenChange={(open) => !open && setDeletingAddressId(null)}
        onConfirm={() => {
          if (deletingAddressId) {
            deleteAddressMutation.mutate(deletingAddressId)
            setDeletingAddressId(null)
          }
        }}
      />
    </div>
  )
}
