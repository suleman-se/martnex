'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw, Sparkles, Ruler } from 'lucide-react'
import { formatPrice, getDisplayPrice, type StoreProduct, type ProductVariant } from '@/lib/api'
import { useRegions } from '@/hooks/use-regions'
import { useCart } from '@/hooks/use-cart'
import { VariantSelector } from '@/components/store/products/variant-selector'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { QuantityStepper } from '@/components/shared/controls/quantity-stepper'
import { Eyebrow } from '@/components/shared/typography/eyebrow'

interface ProductDetailClientProps {
  product: StoreProduct
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { defaultRegion } = useRegions()
  const { addItem } = useCart()

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isChangingImage, setIsChangingImage] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [openTab, setOpenTab] = useState<string | null>(null)

  const changeImage = (index: number) => {
    if (index === selectedImage) return
    setIsChangingImage(true)
    setTimeout(() => {
      setSelectedImage(index)
      setIsChangingImage(false)
    }, 150)
  }

  const toggleTab = (tab: string) => {
    setOpenTab(openTab === tab ? null : tab)
  }

  const activeVariant = selectedVariant ?? product.variants[0] ?? null
  const currencyCode = defaultRegion?.currency_code ?? 'usd'

  const variantPrice =
    activeVariant?.prices.find(
      (p) => p.currency_code.toLowerCase() === currencyCode.toLowerCase()
    )?.amount ?? null

  const displayPrice =
    variantPrice != null
      ? formatPrice(variantPrice, currencyCode)
      : product
        ? getDisplayPrice(product, currencyCode) != null
          ? formatPrice(getDisplayPrice(product, currencyCode)!, currencyCode)
          : '—'
        : '—'

  async function handleAddToCart() {
    if (!activeVariant) {
      toast.error('Unable to add to cart — please refresh the page.')
      return
    }
    try {
      await addItem.mutateAsync({
        variantId: activeVariant.id,
        quantity,
        regionId: defaultRegion?.id,
      })
    } catch {
      toast.error('Failed to add item to cart. Please try again.')
    }
  }

  const images = product.images.length
    ? product.images
    : product.thumbnail
      ? [{ id: 'thumb', url: product.thumbnail }]
      : []

  return (
    <div className="animate-in fade-in duration-700 pb-28 md:pb-8">
      <Link
        href="/store"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-slate-700 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-sm">
            {images[selectedImage] ? (
              <Image
                src={images[selectedImage].url}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-cover transition-all duration-205 ${isChangingImage ? 'opacity-40 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
                  }`}
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingCart className="h-16 w-16 text-slate-200" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => changeImage(i)}
                  className={`relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${selectedImage === i
                    ? 'border-slate-900 shadow-md ring-2 ring-slate-900/10'
                    : 'border-transparent hover:border-slate-350 bg-slate-50'
                    }`}
                >
                  <Image src={img.url} alt={`${product.title} ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-6 py-2">
          {product.categories?.[0] && (
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-450">
              {product.categories[0].name}
            </span>
          )}
          <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 leading-tight">
            {product.title}
          </h1>

          <p className="text-3xl font-black text-slate-900">{displayPrice}</p>

          {product.description && (
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Variant selector */}
          <div id="variant-selector-section" className="scroll-mt-24">
            <VariantSelector
              product={product}
              onVariantChange={(v) => {
                setSelectedVariant(v)
                setQuantity(1)
              }}
            />
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <Eyebrow>Qty</Eyebrow>
            <QuantityStepper
              value={quantity}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
              onIncrease={() => setQuantity((q) => q + 1)}
              disableDecrease={quantity <= 1}
              className="border-slate-200 bg-white px-3 py-1.5"
              valueClassName="w-6 text-sm"
            />
          </div>

          {/* Add to cart */}
          <Button
            onClick={handleAddToCart}
            disabled={addItem.isPending || !activeVariant}
            className="h-14 w-full rounded-2xl bg-slate-900 text-sm font-black uppercase tracking-widest hover:bg-slate-800 gap-2 cursor-pointer transition-all duration-300 hover:shadow-premium active:scale-[0.99]"
          >
            {addItem.isPending ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShoppingCart strokeWidth={2.5} className="h-4 w-4" />
            )}
            {addItem.isPending ? 'Adding…' : 'Add to Cart'}
          </Button>

          {/* Trust Badges Row */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 mt-2">
            <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <span className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 shrink-0">
                <ShieldCheck strokeWidth={2.5} className="h-4 w-4" />
              </span>
              <span className="text-[9px] font-black text-slate-800 uppercase tracking-wider leading-none">Secure Payment</span>
              <span className="text-[8px] font-bold text-slate-450 mt-1">SSL Encrypted</span>
            </div>

            <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <span className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 shrink-0">
                <Truck strokeWidth={2.5} className="h-4 w-4" />
              </span>
              <span className="text-[9px] font-black text-slate-800 uppercase tracking-wider leading-none">Free Shipping</span>
              <span className="text-[8px] font-bold text-slate-450 mt-1">Orders over $150</span>
            </div>

            <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <span className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center overflow-visible justify-center mb-1.5 shrink-0">
                <RotateCcw strokeWidth={2.5} className="h-4 w-4" />
              </span>
              <span className="text-[9px] font-black text-slate-800 uppercase tracking-wider leading-none">Easy Returns</span>
              <span className="text-[8px] font-bold text-slate-450 mt-1">30-Day Policy</span>
            </div>
          </div>

          {/* Premium Shipping, Sourcing, & Fit Accordions */}
          <div className="border-t border-slate-100 pt-6 mt-2 space-y-3">
            {[
              {
                id: 'shipping',
                title: 'Shipping & Carbon-Neutral Returns',
                icon: <Truck strokeWidth={2} className="h-4 w-4 text-slate-450" />,
                content: 'Enjoy free carbon-neutral standard delivery on all orders above $150. Delivery is typically completed within 3-5 business days. Express shipping options are available at checkout. If your purchase isn’t quite right, you can return or exchange eligible products within 30 days of delivery.'
              },
              {
                id: 'sourcing',
                title: 'Premium Craftsmanship & Sourcing',
                icon: <Sparkles strokeWidth={2} className="h-4 w-4 text-slate-450" />,
                content: 'Ethically crafted in partnership with independent premium mills. Every piece uses sustainably sourced fibers, high-density stitching, and eco-friendly dye processes. Designed for ultimate structural durability, structural integrity, and exceptional tactile comfort.'
              },
              {
                id: 'fit',
                title: 'Detailed Fit Guidelines',
                icon: <Ruler strokeWidth={2} className="h-4 w-4 text-slate-450" />,
                content: 'This product fits true-to-size. For an oversized modern drape or streetwear silhouette, we suggest ordering one size larger than your standard measurement. Model is 6\'1" wearing size Medium.'
              }
            ].map((tab) => {
              const isOpen = openTab === tab.id
              return (
                <div key={tab.id} className="border border-slate-100/80 rounded-2xl overflow-hidden bg-slate-50/20 hover:bg-slate-50/40 transition-colors">
                  <button
                    onClick={() => toggleTab(tab.id)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-[10px] text-slate-800 hover:text-slate-900 uppercase tracking-widest transition-colors select-none cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {tab.icon}
                      <span>{tab.title}</span>
                    </div>
                    <span className={`text-slate-400 transition-transform duration-300 font-extrabold text-sm ${isOpen ? 'rotate-45' : ''}`}>
                      ＋
                    </span>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-40 border-t border-slate-100 opacity-100 p-4 bg-white' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {tab.content}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Purchase CTA Bar for Mobile */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 shadow-premium md:hidden animate-in slide-in-from-bottom duration-300 pb-safe">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 shadow-sm">
              {images[0] ? (
                <Image
                  src={images[0].url}
                  alt={product.title}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <ShoppingCart className="h-4 w-4 text-slate-350 absolute inset-0 m-auto" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-900 truncate leading-none">
                {product.title}
              </h4>
              <div className="flex items-center gap-1.5 mt-1 min-w-0">
                <span className="text-xs font-black text-slate-950">
                  {displayPrice}
                </span>
                {product.variants.length > 1 && activeVariant && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-bold text-slate-450 truncate">
                      {activeVariant.title}
                    </span>
                    <button
                      onClick={() => document.getElementById('variant-selector-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                      className="text-[10px] font-black text-slate-900 hover:text-slate-700 underline cursor-pointer shrink-0"
                    >
                      Change
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={addItem.isPending || !activeVariant}
            className="h-11 px-5 rounded-xl bg-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-800 shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            {addItem.isPending ? (
              <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShoppingCart strokeWidth={2.5} className="h-3.5 w-3.5" />
            )}
            {addItem.isPending ? 'Adding…' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  )
}
