'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import type { StoreProduct } from '@/hooks/use-products'
import { getDisplayPrice, formatPrice } from '@/hooks/use-products'

interface ProductCardProps {
  product: StoreProduct
  currencyCode?: string
}

export function ProductCard({ product, currencyCode = 'usd' }: ProductCardProps) {
  const price = getDisplayPrice(product, currencyCode)

  return (
    <Link
      href={`/store/products/${product.handle}`}
      className="group bg-white rounded-3xl shadow-sm hover:shadow-premium overflow-hidden transition-all duration-500 hover:-translate-y-1 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-slate-200" />
          </div>
        )}
        {product.categories?.[0] && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
            {product.categories[0].name}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-slate-700 transition-colors">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-base font-black text-slate-900">
            {price != null ? formatPrice(price, currencyCode) : '—'}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}
