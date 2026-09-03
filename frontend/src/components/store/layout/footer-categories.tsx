'use client'

import Link from 'next/link'
import { useProductCategories } from '@/hooks/use-product-categories'

/**
 * Footer catalogue links, driven by the categories that actually exist in the
 * store rather than a hardcoded list.
 */
export function FooterCategories() {
  const { data: categories, isLoading } = useProductCategories()

  return (
    <div className="space-y-4">
      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Shop Catalog</h4>
      <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
        <li>
          <Link href="/store" className="hover:text-slate-900 transition-colors">
            All Products
          </Link>
        </li>

        {isLoading && (
          <li aria-hidden="true">
            <span className="inline-block h-3 w-24 bg-slate-100 rounded animate-pulse align-middle" />
          </li>
        )}

        {(categories ?? []).slice(0, 4).map((category) => (
          <li key={category.id}>
            <Link
              href={`/store?category=${encodeURIComponent(category.handle)}`}
              className="hover:text-slate-900 transition-colors"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
