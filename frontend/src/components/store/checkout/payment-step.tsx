'use client'

import { useState } from 'react'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CreditCard, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { useCheckout } from '@/hooks/use-checkout'
import { Button } from '@/components/ui/button'

// ─── Stripe singleton ─────────────────────────────────────────────────────────

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentProvider = 'stripe' | 'cod'

export interface PaymentStepProps {
  cartId: string
  cartTotal: number
  currencyCode: string
  onComplete: (orderId: string) => void
}

// ─── Inner component (uses Stripe hooks, must live inside <Elements>) ─────────

function PaymentStepInner({
  cartId,
  cartTotal,
  currencyCode,
  onComplete,
}: PaymentStepProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { initPayment, completeOrder } = useCheckout()

  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(
    stripePromise ? 'stripe' : 'cod'
  )
  const [isProcessing, setIsProcessing] = useState(false)

  const providers: { id: PaymentProvider; label: string; icon: React.ReactNode }[] = [
    ...(stripePromise
      ? [
          {
            id: 'stripe' as const,
            label: 'Credit / Debit Card',
            icon: <CreditCard className="h-4 w-4" />,
          },
        ]
      : []),
    {
      id: 'cod' as const,
      label: 'Cash on Delivery',
      icon: <Truck className="h-4 w-4" />,
    },
  ]

  async function handlePlaceOrder() {
    setIsProcessing(true)
    try {
      if (selectedProvider === 'stripe') {
        if (!stripe || !elements) throw new Error('Stripe not loaded')
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) throw new Error('Card element not found')

        const updatedCart = await initPayment.mutateAsync({
          cartId,
          providerId: 'pp_stripe_stripe',
        })

        const session = updatedCart.payment_collection?.payment_sessions?.find(
          (s) => s.provider_id === 'pp_stripe_stripe'
        )
        const clientSecret = session?.data?.client_secret as string | undefined
        if (!clientSecret) throw new Error('No Stripe client secret received')

        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        })
        if (error) throw new Error(error.message ?? 'Payment failed')
      } else {
        // COD — use system/manual provider
        await initPayment.mutateAsync({ cartId, providerId: 'pp_system_default' })
      }

      const { order_id } = await completeOrder.mutateAsync(cartId)
      onComplete(order_id)
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to place order')
      setIsProcessing(false)
    }
  }

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(cartTotal)

  return (
    <div className="space-y-5">
      {/* Provider selection */}
      <div className="space-y-2">
        {providers.map((p) => (
          <Button
            key={p.id}
            type="button"
            onClick={() => setSelectedProvider(p.id)}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-sm font-bold ${
              selectedProvider === p.id
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
            }`}
          >
            {p.icon}
            {p.label}
          </Button>
        ))}
      </div>

      {/* Stripe card entry */}
      {selectedProvider === 'stripe' && stripePromise && (
        <div className="px-4 py-3.5 bg-white border border-slate-200 rounded-xl">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '15px',
                  color: '#0f172a',
                  '::placeholder': { color: '#94a3b8' },
                  fontFamily: 'Inter, sans-serif',
                },
              },
            }}
          />
        </div>
      )}

      {/* COD note */}
      {selectedProvider === 'cod' && (
        <p className="text-sm text-slate-500 font-medium px-1">
          You will pay in cash when your order is delivered.
        </p>
      )}

      <Button
        onClick={handlePlaceOrder}
        disabled={isProcessing}
        className="w-full h-14 rounded-2xl bg-slate-900 text-sm font-black uppercase tracking-widest hover:bg-slate-800"
      >
        {isProcessing ? 'Processing…' : `Place Order · ${formattedTotal}`}
      </Button>
    </div>
  )
}

// ─── Public export — wraps with <Elements> if Stripe is configured ────────────

export function PaymentStep(props: PaymentStepProps) {
  if (!stripePromise) {
    return <PaymentStepInner {...props} />
  }
  return (
    <Elements stripe={stripePromise}>
      <PaymentStepInner {...props} />
    </Elements>
  )
}
