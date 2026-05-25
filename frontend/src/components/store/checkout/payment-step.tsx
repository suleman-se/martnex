'use client'

import { useState } from 'react'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CreditCard, Truck, CheckCircle2, Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useCheckout } from '@/hooks/use-checkout'
import { useCart } from '@/hooks/use-cart'
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

function formatTotal(amount: number, currencyCode: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount)
}

function getActiveStepIndex(stepText: string): number {
  const text = stepText.toLowerCase()
  if (text.includes('shipping')) return 0
  if (text.includes('session') || text.includes('preparing')) return 1
  if (text.includes('confirming')) return 2
  if (text.includes('placing') || text.includes('order')) return 3
  return 0
}

// ─── Shared method selection card ─────────────────────────────────────────────

function MethodCard({
  label,
  description,
  icon,
  selected,
  disabled,
  onClick,
}: {
  label: string
  description: string
  icon: React.ReactNode
  selected: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 ${
        selected
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`shrink-0 ${selected ? 'text-white' : 'text-slate-400'}`}>
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold">{label}</span>
        <span className={`text-xs ${selected ? 'text-slate-300' : 'text-slate-400'}`}>
          {description}
        </span>
      </span>
      {selected && <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />}
    </button>
  )
}

// ─── Shared place-order button ────────────────────────────────────────────────

function PlaceOrderButton({
  isProcessing,
  processingStep,
  cartTotal,
  currencyCode,
  onClick,
}: {
  isProcessing: boolean
  processingStep: string
  cartTotal: number
  currencyCode: string
  onClick: () => void
}) {
  return (
    <Button
      onClick={onClick}
      disabled={isProcessing}
      className="w-full h-14 rounded-2xl bg-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-70 cursor-pointer shadow-sm"
    >
      Place Order · {formatTotal(cartTotal, currencyCode)}
    </Button>
  )
}

// ─── COD-only (no Stripe context needed) ─────────────────────────────────────

function CodOnlyPaymentStep({ cartId, cartTotal, currencyCode, onComplete }: PaymentStepProps) {
  const { cart } = useCart()
  const { initPayment, completeOrder, getShippingOptions, setShippingMethod } = useCheckout()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')

  async function ensureShipping() {
    // If shipping method is already selected, retain it
    if (cart?.shipping_methods?.length) {
      return
    }

    setProcessingStep('Setting up shipping…')
    const options = await getShippingOptions(cartId)
    if (!options.length) {
      throw new Error('No shipping options available. Please go back and edit your address.')
    }
    try {
      await setShippingMethod.mutateAsync({ cartId, optionId: options[0].id })
    } catch (err) {
      if (!/already|exists/i.test((err as Error).message ?? '')) throw err
    }
  }

  async function handlePlaceOrder() {
    setIsProcessing(true)
    try {
      await ensureShipping()

      setProcessingStep('Preparing payment…')
      await initPayment.mutateAsync({ cartId, providerId: 'pp_system_default' })

      setProcessingStep('Placing order…')
      const { order_id } = await completeOrder.mutateAsync(cartId)
      onComplete(order_id)
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to place order')
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  const activeStep = getActiveStepIndex(processingStep)
  const steps = [
    'Verifying Delivery Option',
    'Securing Checkout Session',
    'Preparing Cash on Delivery',
    'Securing Order Details',
  ]

  if (isProcessing) {
    return (
      <div className="py-10 text-center space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
          </div>
          <div>
            <h3 className="font-heading font-black text-slate-900 text-lg">
              Processing Order
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Please do not refresh or close this window
            </p>
          </div>
        </div>

        {/* Stepper */}
        <div className="max-w-md mx-auto space-y-4 px-6 border-l border-slate-100 ml-8 md:ml-20">
          {steps.map((label, idx) => {
            const isCompleted = idx < activeStep
            const isActive = idx === activeStep
            return (
              <div key={label} className="flex items-center gap-3 text-left animate-in slide-in-from-left duration-300">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center border text-[10px] font-black transition-all duration-300 shrink-0 ${
                    isCompleted
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : isActive
                      ? 'bg-slate-900 text-white border-slate-900 animate-pulse'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-xs font-bold transition-colors duration-300 ${
                    isActive ? 'text-slate-900' : isCompleted ? 'text-slate-500' : 'text-slate-300'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <MethodCard
        label="Cash on Delivery"
        description="Pay when your order arrives"
        icon={<Truck className="h-5 w-5" />}
        selected
        disabled={isProcessing}
        onClick={() => {}}
      />

      <div className="flex items-start gap-3 px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
        <Info className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Have the exact amount ready upon delivery. Our delivery partner will confirm the order details on arrival.
        </p>
      </div>

      <PlaceOrderButton
        isProcessing={isProcessing}
        processingStep={processingStep}
        cartTotal={cartTotal}
        currencyCode={currencyCode}
        onClick={handlePlaceOrder}
      />
    </div>
  )
}

// ─── Stripe-enabled (must be inside <Elements>) ───────────────────────────────

function PaymentStepWithStripe({ cartId, cartTotal, currencyCode, onComplete }: PaymentStepProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { cart } = useCart()
  const { initPayment, completeOrder, getShippingOptions, setShippingMethod } = useCheckout()

  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('stripe')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [isCardFocused, setIsCardFocused] = useState(false)

  async function ensureShipping() {
    // If shipping method is already selected, retain it
    if (cart?.shipping_methods?.length) {
      return
    }

    setProcessingStep('Setting up shipping…')
    const options = await getShippingOptions(cartId)
    if (!options.length) {
      throw new Error('No shipping options available. Please go back and edit your address.')
    }
    try {
      await setShippingMethod.mutateAsync({ cartId, optionId: options[0].id })
    } catch (err) {
      if (!/already|exists/i.test((err as Error).message ?? '')) throw err
    }
  }

  async function handlePlaceOrder() {
    setIsProcessing(true)
    setProcessingStep('Starting…')
    try {
      await ensureShipping()

      if (selectedProvider === 'cod') {
        setProcessingStep('Preparing payment…')
        await initPayment.mutateAsync({ cartId, providerId: 'pp_system_default' })
        setProcessingStep('Placing order…')
        const { order_id } = await completeOrder.mutateAsync(cartId)
        onComplete(order_id)
      } else {
        if (!stripe || !elements) throw new Error('Stripe not loaded')
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) throw new Error('Card element not found')

        setProcessingStep('Creating payment session…')
        const updatedCart = await initPayment.mutateAsync({
          cartId,
          providerId: 'pp_stripe_stripe',
        })

        const session = updatedCart.payment_collection?.payment_sessions?.find(
          (s) => s.provider_id === 'pp_stripe_stripe'
        )
        const clientSecret = session?.data?.client_secret as string | undefined
        if (!clientSecret) throw new Error('No Stripe client secret received')

        setProcessingStep('Confirming payment…')
        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        })
        if (error) throw new Error(error.message ?? 'Payment failed')

        setProcessingStep('Placing order…')
        const { order_id } = await completeOrder.mutateAsync(cartId)
        onComplete(order_id)
      }
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to place order')
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  const activeStep = getActiveStepIndex(processingStep)
  const steps = [
    'Verifying Delivery Option',
    'Securing Checkout Session',
    'Confirming Payment Protocol',
    'Securing Order Details',
  ]

  if (isProcessing) {
    return (
      <div className="py-10 text-center space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
          </div>
          <div>
            <h3 className="font-heading font-black text-slate-900 text-lg">
              Processing Order
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Please do not refresh or close this window
            </p>
          </div>
        </div>

        {/* Stepper */}
        <div className="max-w-md mx-auto space-y-4 px-6 border-l border-slate-100 ml-8 md:ml-20">
          {steps.map((label, idx) => {
            const isCompleted = idx < activeStep
            const isActive = idx === activeStep
            return (
              <div key={label} className="flex items-center gap-3 text-left animate-in slide-in-from-left duration-300">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center border text-[10px] font-black transition-all duration-300 shrink-0 ${
                    isCompleted
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : isActive
                      ? 'bg-slate-900 text-white border-slate-900 animate-pulse'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-xs font-bold transition-colors duration-300 ${
                    isActive ? 'text-slate-900' : isCompleted ? 'text-slate-500' : 'text-slate-300'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Method selection */}
      <div className="space-y-3">
        <MethodCard
          label="Credit / Debit Card"
          description="Visa, Mastercard, Amex"
          icon={<CreditCard className="h-5 w-5" />}
          selected={selectedProvider === 'stripe'}
          disabled={isProcessing}
          onClick={() => setSelectedProvider('stripe')}
        />
        <MethodCard
          label="Cash on Delivery"
          description="Pay when your order arrives"
          icon={<Truck className="h-5 w-5" />}
          selected={selectedProvider === 'cod'}
          disabled={isProcessing}
          onClick={() => setSelectedProvider('cod')}
        />
      </div>

      {/* Stripe card input */}
      {selectedProvider === 'stripe' && (
        <div
          className={`px-5 py-4 bg-white border rounded-2xl transition-all duration-300 space-y-2.5 ${
            isCardFocused
              ? 'border-slate-900 ring-2 ring-slate-900/5 shadow-sm'
              : 'border-slate-100 shadow-sm'
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Card Details
          </p>
          <CardElement
            onFocus={() => setIsCardFocused(true)}
            onBlur={() => setIsCardFocused(false)}
            options={{
              style: {
                base: {
                  fontSize: '14px',
                  color: '#1e293b',
                  '::placeholder': { color: '#94a3b8' },
                  fontFamily: 'Inter, system-ui, sans-serif',
                },
                invalid: {
                  color: '#ba1a1a',
                },
              },
            }}
          />
        </div>
      )}

      {/* COD info */}
      {selectedProvider === 'cod' && (
        <div className="flex items-start gap-3 px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
          <Info className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Have the exact amount ready upon delivery. Our delivery partner will confirm the order details on arrival.
          </p>
        </div>
      )}

      <PlaceOrderButton
        isProcessing={isProcessing}
        processingStep={processingStep}
        cartTotal={cartTotal}
        currencyCode={currencyCode}
        onClick={handlePlaceOrder}
      />
    </div>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────

export function PaymentStep(props: PaymentStepProps) {
  if (!stripePromise) {
    return <CodOnlyPaymentStep {...props} />
  }
  return (
    <Elements stripe={stripePromise}>
      <PaymentStepWithStripe {...props} />
    </Elements>
  )
}
