'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useMounted } from '@/hooks/use-mounted'
import { useCart, clearStoredCartId } from '@/hooks/use-cart'
import { useCheckout } from '@/hooks/use-checkout'
import { AddressForm, type AddressFormValues } from '@/components/store/checkout/address-form'
import { PaymentStep } from '@/components/store/checkout/payment-step'

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'address' | 'payment'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CheckoutSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse space-y-4 py-6">
      <div className="h-6 bg-slate-100 rounded w-48" />
      <div className="bg-white rounded-3xl shadow-sm p-8 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const mounted = useMounted()
  const router = useRouter()
  const { cart, cartId, isLoading } = useCart()
  const { setAddress } = useCheckout()

  const [step, setStep] = useState<Step>('address')
  const [savedAddress, setSavedAddress] = useState<AddressFormValues | null>(null)

  if (!mounted) return null
  if (isLoading) return <CheckoutSkeleton />

  if (!cart || !cart.items?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-20 w-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Nothing to check out</h2>
        <p className="text-slate-500 font-medium mb-6">Your cart is empty.</p>
        <Link
          href="/store"
          className="text-sm font-bold text-slate-900 underline underline-offset-4"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  async function handleAddressSubmit(values: AddressFormValues) {
    if (!cartId) return
    try {
      await setAddress.mutateAsync({
        cartId,
        payload: {
          email: values.email,
          shipping_address: {
            first_name: values.first_name,
            last_name: values.last_name,
            address_1: values.address_1,
            address_2: values.address_2,
            city: values.city,
            country_code: values.country_code.toLowerCase(),
            postal_code: values.postal_code,
            phone: values.phone,
          },
        },
      })
      setSavedAddress(values)
      setStep('payment')
    } catch {
      toast.error('Failed to save address. Please try again.')
    }
  }

  function handleOrderComplete(orderId: string) {
    clearStoredCartId()
    router.push(`/store/orders/${orderId}`)
  }

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cart.currency_code.toUpperCase(),
    }).format(amount)

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-700">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-8">
        <Link href="/store/cart" className="hover:text-slate-700 transition-colors">
          Cart
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className={step === 'address' ? 'text-slate-900 font-bold' : ''}>Shipping</span>
        <ChevronRight className="h-4 w-4" />
        <span className={step === 'payment' ? 'text-slate-900 font-bold' : ''}>Payment</span>
      </div>

      {/* Main step card */}
      <div className="bg-white rounded-3xl shadow-sm p-8">
        {step === 'address' && (
          <>
            <h2 className="text-2xl font-heading font-black text-slate-900 mb-6">
              Shipping Information
            </h2>
            <AddressForm
              defaultValues={savedAddress ?? undefined}
              onSubmit={handleAddressSubmit}
              isLoading={setAddress.isPending}
            />
          </>
        )}

        {step === 'payment' && cartId && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-black text-slate-900">Payment</h2>
              <button
                onClick={() => setStep('address')}
                className="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
              >
                ← Edit address
              </button>
            </div>
            <PaymentStep
              cartId={cartId}
              cartTotal={cart.total}
              currencyCode={cart.currency_code}
              onComplete={handleOrderComplete}
            />
          </>
        )}
      </div>

      {/* Order summary sidebar */}
      <div className="mt-6 bg-white rounded-3xl shadow-sm p-6">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
          Order Summary ({cart.items.length} item{cart.items.length !== 1 ? 's' : ''})
        </h3>
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-12 w-12 rounded-xl object-cover bg-slate-50 shrink-0"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-slate-100 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
                <p className="text-xs text-slate-400">Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-black text-slate-900 shrink-0">{fmt(item.total)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-sm">
          {cart.shipping_total > 0 && (
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Shipping</span>
              <span>{fmt(cart.shipping_total)}</span>
            </div>
          )}
          {cart.tax_total > 0 && (
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Tax</span>
              <span>{fmt(cart.tax_total)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-slate-900 pt-1">
            <span>Total</span>
            <span>{fmt(cart.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
