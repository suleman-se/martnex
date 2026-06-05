'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { StoreProduct } from '@/lib/api'
import { getDisplayPrice, formatPrice } from '@/lib/api'
import { useCart } from '@/hooks/use-cart'
import { useRegions } from '@/hooks/use-regions'
import { toast } from 'sonner'
import { ProductCardMedia } from './product-card-media'
import { ProductCardDetails } from './product-card-details'
import { QuickAddVariantSelector } from './quick-add-variant-selector'

interface ProductCardProps {
  product: StoreProduct
  currencyCode?: string
}

export function ProductCard({ product, currencyCode = 'usd' }: ProductCardProps) {
  const price = getDisplayPrice(product, currencyCode)
  const { defaultRegion } = useRegions()
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showMobileSelector, setShowMobileSelector] = useState(false)
  const [isAddingVariantId, setIsAddingVariantId] = useState<string | null>(null)

  const hasMultipleVariants = product.variants.length > 1
  const secondaryImage = product.images?.[1]?.url
  const priceFormatted = price != null ? formatPrice(price, currencyCode) : '—'

  const getVariantPrice = (variant: typeof product.variants[0]) => {
    const priceObj = variant.prices.find(
      (p) => p.currency_code.toLowerCase() === currencyCode.toLowerCase()
    )
    return priceObj ? priceObj.amount : (variant.prices[0]?.amount ?? null)
  }

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (hasMultipleVariants) {
      // Toggle slide-up variant selector inside the card on mobile/click
      setShowMobileSelector((prev) => !prev)
      return
    }

    const firstVariant = product.variants[0]
    if (!firstVariant) return

    setIsAdding(true)
    try {
      await addItem.mutateAsync({
        variantId: firstVariant.id,
        quantity: 1,
        regionId: defaultRegion?.id,
      })
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 2000)
    } catch {
      toast.error('Failed to add item to cart. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  async function handleVariantAdd(e: React.MouseEvent, variantId: string) {
    e.preventDefault()
    e.stopPropagation()

    setIsAdding(true)
    setIsAddingVariantId(variantId)
    try {
      await addItem.mutateAsync({
        variantId,
        quantity: 1,
        regionId: defaultRegion?.id,
      })
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 2000)
      setShowMobileSelector(false)
    } catch {
      toast.error('Failed to add item to cart. Please try again.')
    } finally {
      setIsAdding(false)
      setIsAddingVariantId(null)
    }
  }

  return (
    <Link
      href={`/store/products/${product.handle}`}
      className="group bg-white rounded-3xl shadow-sm hover:shadow-premium overflow-hidden transition-all duration-500 hover:-translate-y-1 flex flex-col relative h-full"
    >
      <ProductCardMedia
        thumbnail={product.thumbnail}
        secondaryImage={secondaryImage}
        title={product.title}
        categoryName={product.categories?.[0]?.name}
        isAdding={isAdding}
        isSuccess={isSuccess}
        isAddingVariantId={isAddingVariantId}
        hasMultipleVariants={hasMultipleVariants}
        showMobileSelector={showMobileSelector}
        priceFormatted={priceFormatted}
        onQuickAdd={handleQuickAdd}
      >
        <QuickAddVariantSelector
          productTitle={product.title}
          variants={product.variants}
          currencyCode={currencyCode}
          isAdding={isAdding}
          isAddingVariantId={isAddingVariantId}
          showMobileSelector={showMobileSelector}
          setShowMobileSelector={setShowMobileSelector}
          getVariantPrice={getVariantPrice}
          handleVariantAdd={handleVariantAdd}
        />
      </ProductCardMedia>
      <ProductCardDetails
        title={product.title}
        description={product.description}
        priceFormatted={priceFormatted}
        variantsCount={product.variants.length}
      />
    </Link>
  )
}
