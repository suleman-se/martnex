import React from 'react'
import Link from 'next/link'
import { fetchSellerById } from '@/lib/api'
import { ProductGrid } from '@/components/store/products/product-grid'
import { EmptyState } from '@/components/shared/empty-states/empty-state'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck,
  Mail,
  Package,
  Star,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  Calendar
} from 'lucide-react'

interface MerchantPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MerchantStorefrontPage({ params }: MerchantPageProps) {
  const resolvedParams = await params
  const { id } = resolvedParams

  try {
    const data = await fetchSellerById(id)

    if (!data || !data.seller) {
      return (
        <div className="py-12 max-w-2xl mx-auto">
          <EmptyState
            icon={AlertCircle}
            title="Merchant Profile Not Found"
            description="The requested seller profile does not exist or has been deactivated by the platform administrators."
            className="py-24 bg-white dark:bg-slate-100 border border-slate-100 dark:border-slate-150 rounded-3xl p-12 shadow-sm"
            action={
              <Button asChild className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-900 dark:text-white px-8 py-3 text-sm font-black uppercase tracking-widest cursor-pointer">
                <Link href="/store">Back to Store</Link>
              </Button>
            }
          />
        </div>
      )
    }

    const { seller, products } = data

    // Every figure on this page comes from the seller record or the live product
    // list. Ratings and sustainability scores are deliberately absent until a
    // real reviews system exists - inventing them would misrepresent the merchant.
    const activeListings = products.length
    const memberSince = new Date(seller.created_at).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    // Trust badges follow the seller's real verification_status - a pending
    // merchant must not be presented as verified.
    const isVerified = seller.verification_status === 'verified'
    const standingLabel = isVerified ? 'Verified' : 'Pending review'
    // Real aggregate from the review module. Absent until buyers actually review.
    const rating = seller.rating ?? { average: null, count: 0 }
    const hasRating = rating.average !== null && rating.count > 0

    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Store</span>
          </Link>
        </div>

        {/* Immersive Merchant Hero Header Card */}
        <div className="bg-white dark:bg-slate-100 border border-slate-100 dark:border-slate-150 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row items-start gap-6 min-w-0">
            {/* Merchant Avatar Initials */}
            <div className="h-20 w-20 rounded-2xl bg-slate-900 dark:bg-slate-50 flex items-center justify-center text-white dark:text-slate-900 font-black text-3xl border border-slate-100 dark:border-slate-200 shadow-premium shrink-0">
              {seller.business_name.charAt(0).toUpperCase()}
            </div>
            
            <div className="space-y-2.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-heading font-black tracking-tight text-slate-900 leading-none">
                  {seller.business_name}
                </h1>
                {isVerified && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30 border border-emerald-200/80 px-2 py-0.5 rounded shrink-0">
                    <ShieldCheck strokeWidth={2.5} className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Verified Partner</span>
                  </div>
                )}
              </div>

              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                Artisan Storefront
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs font-semibold text-slate-450">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <a href={`mailto:${seller.business_email}`} className="hover:underline truncate">
                    {seller.business_email}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Joined {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sourcing & Vendor Sustainability Ratings */}
          <div className="flex flex-col sm:flex-row gap-4 shrink-0 lg:max-w-md w-full lg:w-auto">
            <div className="flex-1 space-y-1 p-4 bg-slate-50 dark:bg-slate-50/5 border border-slate-100/50 dark:border-slate-150/30 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Package className="h-3.5 w-3.5 text-slate-500" /> Catalogue
              </span>
              <div>
                <span className="text-xl font-black text-slate-900 leading-none">{activeListings}</span>
                <p className="text-[9px] font-bold text-slate-450 mt-0.5">
                  Active {activeListings === 1 ? 'listing' : 'listings'}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-1 p-4 bg-slate-50 dark:bg-slate-50/5 border border-slate-100/50 dark:border-slate-150/30 rounded-2xl flex flex-col justify-between">
              {hasRating ? (
                <>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400" /> Seller Rating
                  </span>
                  <div>
                    <span className="text-xl font-black text-slate-900 leading-none">
                      {rating.average?.toFixed(1)} / 5
                    </span>
                    <p className="text-[9px] font-bold text-slate-450 mt-0.5">
                      From {rating.count} {rating.count === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <ShieldCheck
                      className={`h-3.5 w-3.5 ${isVerified ? 'text-emerald-500' : 'text-slate-400'}`}
                    />{' '}
                    Standing
                  </span>
                  <div>
                    <span className="text-xl font-black text-slate-900 leading-none">{standingLabel}</span>
                    <p className="text-[9px] font-bold text-slate-450 mt-0.5">Merchant since {memberSince}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Merchant summary. Sellers cannot yet supply their own copy during
            onboarding - when that field exists, render it here instead. Until
            then this stays factual rather than inventing a brand story. */}
        <div className="bg-slate-50/30 dark:bg-slate-50/2 border border-slate-100/50 dark:border-slate-150/20 rounded-3xl p-6 md:p-8 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-slate-400" />
            <span>About This Merchant</span>
          </h4>
          <p className="text-sm font-semibold text-slate-500 leading-relaxed max-w-4xl">
            {seller.business_name} has been {isVerified ? 'a verified merchant' : 'listed'} on Martnex since{' '}
            {memberSince}, with{' '}
            {activeListings} {activeListings === 1 ? 'product' : 'products'} currently listed. Reach
            them directly at{' '}
            <a href={`mailto:${seller.business_email}`} className="underline hover:text-slate-900">
              {seller.business_email}
            </a>
            .
          </p>
        </div>

        {/* Products Showcase Catalog Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-150/50 pb-4">
            <h2 className="text-lg font-heading font-black tracking-tight text-slate-900 uppercase">
              Artisan Catalog Showcase
            </h2>
            <span className="text-xs font-black text-slate-450 bg-slate-50 dark:bg-slate-50/5 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-150/30">
              {products.length} Product{products.length !== 1 ? 's' : ''} available
            </span>
          </div>

          <ProductGrid products={products} currencyCode="usd" />
        </div>
      </div>
    )
  } catch (err) {
    console.error('MerchantStorefrontPage load failed:', err)
    return (
      <div className="py-12 max-w-2xl mx-auto">
        <EmptyState
          icon={AlertCircle}
          title="Merchant Page Offline"
          description="We are currently unable to establish a secure database connection to display this merchant catalog profile."
          className="py-24 bg-white dark:bg-slate-100 border border-slate-100 dark:border-slate-150 rounded-3xl p-12 shadow-sm"
          action={
            <Button asChild className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-900 dark:text-white px-8 py-3 text-sm font-black uppercase tracking-widest cursor-pointer">
              <Link href="/store">Back to Store</Link>
            </Button>
          }
        />
      </div>
    )
  }
}
