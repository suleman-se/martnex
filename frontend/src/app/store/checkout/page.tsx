'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ChevronRight, ChevronDown, ChevronUp, CheckCircle2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useMounted } from '@/hooks/use-mounted'
import { useCart, clearStoredCartId } from '@/hooks/use-cart'
import { useCheckout } from '@/hooks/use-checkout'
import { AddressForm, type AddressFormValues } from '@/components/store/checkout/address-form'
import { ShippingSelector } from '@/components/store/checkout/shipping-selector'
import { PaymentStep } from '@/components/store/checkout/payment-step'
import { EmptyState } from '@/components/shared/empty-states/empty-state'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/shared/typography/eyebrow'
import { useQuery } from '@tanstack/react-query'
import { fetchMe } from '@/lib/api'
import { SavedAddressSelector } from '@/components/store/checkout/saved-address-selector'
import { CustomerAddress } from '@/types/address'

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'address' | 'shipping' | 'payment'

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
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)

  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null)
  const [hasPrepopulated, setHasPrepopulated] = useState(false)

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const { data: customerData } = useQuery({
    queryKey: ['checkout-customer-profile'],
    queryFn: () => fetchMe(token ?? undefined),
    enabled: mounted && !!token,
  })
  const savedAddresses: CustomerAddress[] = customerData?.customer?.addresses || []

  useEffect(() => {
    if (customerData?.customer && !savedAddress && !hasPrepopulated) {
      const defaultShipping = (customerData.customer.addresses as CustomerAddress[] | undefined)?.find(
        (a: CustomerAddress) => a.is_default_shipping
      ) || (customerData.customer.addresses as CustomerAddress[] | undefined)?.[0]
        
      if (defaultShipping) {
        const initialAddress: AddressFormValues = {
          email: customerData.customer.email || '',
          first_name: defaultShipping.first_name || '',
          last_name: defaultShipping.last_name || '',
          address_1: defaultShipping.address_1 || '',
          address_2: defaultShipping.address_2 || '',
          city: defaultShipping.city || '',
          country_code: defaultShipping.country_code || '',
          postal_code: defaultShipping.postal_code || '',
          phone: defaultShipping.phone || '',
        }
        setSavedAddress(initialAddress)
        setSelectedSavedAddressId(defaultShipping.id)
        setHasPrepopulated(true)
      } else if (customerData.customer.email) {
        setSavedAddress({
          email: customerData.customer.email,
          first_name: '',
          last_name: '',
          address_1: '',
          address_2: '',
          city: '',
          country_code: '',
          postal_code: '',
          phone: '',
        })
        setHasPrepopulated(true)
      }
    }
  }, [customerData, savedAddress, hasPrepopulated])

  if (!mounted) return null
  if (isLoading) return <CheckoutSkeleton />

  if (!cart || !cart.items?.length) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nothing To Check Out"
        description="Your cart is empty."
        className="py-24 opacity-100"
        action={
          <Button asChild variant="link" className="text-sm font-bold text-slate-900">
            <Link href="/store">Continue Shopping</Link>
          </Button>
        }
      />
    )
  }

  async function handleAddressSubmit(values: AddressFormValues) {
    if (!cartId) return
    try {
      await setAddress.mutateAsync({
        cartId,
        payload: {
          email: values.email?.trim() || undefined,
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
      setStep('shipping')
    } catch (err) {
      toast.error((err as Error).message || 'Failed to save address. Please try again.')
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
    <div className="max-w-2xl mx-auto animate-in fade-in duration-700 pb-20 md:pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-6">
        <Link href="/store/cart" className="hover:text-slate-700 transition-colors">
          Cart
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className={step === 'address' ? 'text-slate-900 font-bold' : ''}>Address</span>
        <ChevronRight className="h-4 w-4" />
        <span className={step === 'shipping' ? 'text-slate-900 font-bold' : ''}>Delivery</span>
        <ChevronRight className="h-4 w-4" />
        <span className={step === 'payment' ? 'text-slate-900 font-bold' : ''}>Payment</span>
      </div>

      {/* Collapsible Order Summary Accordion for Mobile */}
      <div className="block md:hidden mb-6 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
        <button
          onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
          className="w-full flex items-center justify-between p-4 font-bold text-slate-850 text-xs hover:bg-slate-100/50 transition-colors animate-in"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-slate-500" />
            <span>{isSummaryExpanded ? 'Hide Order Summary' : 'Show Order Summary'}</span>
            {isSummaryExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </div>
          <span className="font-black text-slate-900">{fmt(cart.total)}</span>
        </button>

        {isSummaryExpanded && (
          <div className="p-4 border-t border-slate-100 bg-white space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="h-10 w-10 rounded-xl object-cover bg-slate-50 shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-slate-100 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-450">Qty {item.quantity}</p>
                  </div>
                  <p className="text-xs font-black text-slate-900 shrink-0">
                    {fmt(Number.isFinite(item.total) ? item.total : item.unit_price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
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
              <div className="flex justify-between font-black text-slate-900 pt-1 text-sm">
                <span>Total</span>
                <span>{fmt(cart.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main step card */}
      <Card className="rounded-3xl border-none bg-white p-8 shadow-sm">
        {step === 'address' && (
          <>
            <h2 className="text-2xl font-heading font-black text-slate-900 mb-6">
              Shipping Information
            </h2>

            {savedAddresses.length > 0 && (
              <SavedAddressSelector
                savedAddresses={savedAddresses}
                selectedSavedAddressId={selectedSavedAddressId}
                customerEmail={customerData?.customer?.email || ''}
                onSelect={(addressValues, id) => {
                  setSelectedSavedAddressId(id)
                  setSavedAddress({
                    email: customerData?.customer?.email || '',
                    first_name: addressValues.first_name,
                    last_name: addressValues.last_name,
                    address_1: addressValues.address_1,
                    address_2: addressValues.address_2,
                    city: addressValues.city,
                    country_code: addressValues.country_code,
                    postal_code: addressValues.postal_code,
                    phone: addressValues.phone || '',
                  })
                }}
              />
            )}

            <AddressForm
              defaultValues={savedAddress ?? undefined}
              onSubmit={handleAddressSubmit}
              isLoading={setAddress.isPending}
              allowedCountryCodes={(cart.region?.countries ?? [])
                .map((country) => country.iso_2?.toLowerCase())
                .filter(Boolean)}
            />
          </>
        )}

        {step === 'shipping' && cartId && (
          <>
            <h2 className="text-2xl font-heading font-black text-slate-900 mb-6">
              Delivery Method
            </h2>
            <ShippingSelector
              cartId={cartId}
              onComplete={() => setStep('payment')}
              onBack={() => setStep('address')}
            />
          </>
        )}

        {step === 'payment' && cartId && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-black text-slate-900">Payment</h2>
              <Button
                onClick={() => setStep('shipping')}
                variant="ghost"
                className="h-auto p-0 text-sm font-bold text-slate-400 hover:bg-transparent hover:text-slate-700"
              >
                ← Back to delivery
              </Button>
            </div>
            <PaymentStep
              cartId={cartId}
              cartTotal={cart.total}
              currencyCode={cart.currency_code}
              onComplete={handleOrderComplete}
            />
          </>
        )}
      </Card>

      {/* Order summary sidebar */}
      <Card className="mt-6 rounded-3xl border-none bg-white p-6 shadow-sm hidden md:block">
        <Eyebrow className="mb-4 text-[11px] tracking-[0.2em]">
          Order Summary ({cart.items.length} item{cart.items.length !== 1 ? 's' : ''})
        </Eyebrow>
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
              <p className="text-sm font-black text-slate-900 shrink-0">
                {fmt(Number.isFinite(item.total) ? item.total : item.unit_price * item.quantity)}
              </p>
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
      </Card>
    </div>
  )
}
