'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'
import { useProduct, formatPrice, getDisplayPrice, type ProductVariant } from '@/hooks/use-products'
import { useRegions } from '@/hooks/use-regions'
import { useCart } from '@/hooks/use-cart'
import { VariantSelector } from '@/components/store/products/variant-selector'
import { toast } from 'sonner'

interface ProductDetailClientProps {
  handle: string
}

export default function ProductDetailClient({ handle }: ProductDetailClientProps) {
  const mounted = useMounted()
  const { data: product, isLoading } = useProduct(handle)
  const { defaultRegion } = useRegions()
  const { addItem } = useCart()

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const activeVariant = selectedVariant ?? product?.variants[0] ?? null
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
    if (!activeVariant || !defaultRegion) {
      toast.error('Unable to add to cart — please refresh the page.')
      return
    }
    try {
      await addItem.mutateAsync({
        variantId: activeVariant.id,
        quantity,
        regionId: defaultRegion.id,
      })
      toast.success(`${product?.title ?? 'Item'} added to cart!`, {
        action: { label: 'View Cart', onClick: () => (window.location.href = '/store/cart') },
      })
    } catch {
      toast.error('Failed to add item to cart. Please try again.')
    }
  }

  if (!mounted || isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div className="aspect-square bg-white rounded-3xl" />
        <div className="space-y-6 py-4">
          <div className="h-8 bg-slate-100 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
          <div className="h-12 bg-slate-100 rounded-2xl w-full mt-8" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Product not found</h2>
        <Link href="/store" className="text-sm font-bold text-slate-500 underline underline-offset-4 mt-2">
          Back to store
        </Link>
      </div>
    )
  }

  const images = product.images.length ? product.images : product.thumbnail ? [{ id: 'thumb', url: product.thumbnail }] : []

  return (
    <div className="animate-in fade-in duration-700">
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
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingCart className="h-16 w-16 text-slate-200" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-16 w-16 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-slate-900' : 'border-transparent hover:border-slate-300'
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
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
          <VariantSelector
            product={product}
            onVariantChange={(v) => {
              setSelectedVariant(v)
              setQuantity(1)
            }}
          />

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Qty</span>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-6 w-6 flex items-center justify-center text-slate-500 hover:text-slate-900 font-black text-lg leading-none"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-black text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="h-6 w-6 flex items-center justify-center text-slate-500 hover:text-slate-900 font-black text-lg leading-none"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={addItem.isPending || !activeVariant}
            className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-premium hover:shadow-2xl hover:-translate-y-0.5 duration-300"
          >
            {addItem.isPending ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            {addItem.isPending ? 'Adding…' : 'Add to Cart'}
          </button>

          {addItem.isSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
              <Check className="h-4 w-4" /> Added to cart
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
