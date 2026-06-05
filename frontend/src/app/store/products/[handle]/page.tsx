import { fetchProductByHandle } from '@/lib/api'
import ProductDetailClient from './product-detail-client'
import { AlertCircle } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-states/empty-state'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ProductPageProps {
  params: Promise<{
    handle: string
  }>
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  
  try {
    const product = await fetchProductByHandle(resolvedParams.handle)

    if (!product) {
      return (
        <EmptyState
          icon={AlertCircle}
          title="Product Not Found"
          className="py-24 opacity-100 bg-white border border-slate-100 rounded-3xl p-12 shadow-sm"
          action={
            <Button asChild className="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-black uppercase tracking-widest hover:bg-slate-800">
              <Link href="/store">Back to Store</Link>
            </Button>
          }
        />
      )
    }

    return <ProductDetailClient product={product} />
  } catch (err) {
    console.error('ProductDetailPage fetch failed:', err)
    return (
      <div className="space-y-8 animate-in fade-in duration-700 max-w-2xl mx-auto py-12">
        <EmptyState
          icon={AlertCircle}
          title="Product Temporarily Offline"
          description="We are unable to connect to the store backend to fetch this product. Please check that the database and backend services are active."
          className="py-24 opacity-100 bg-white border border-slate-100 rounded-3xl p-12 shadow-sm"
          action={
            <Button asChild className="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-black uppercase tracking-widest hover:bg-slate-800">
              <Link href="/store">Back to Store</Link>
            </Button>
          }
        />
      </div>
    )
  }
}
