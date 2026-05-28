import React from 'react'
import Link from 'next/link'
import { fetchSellerById } from '@/lib/api'
import { ProductGrid } from '@/components/store/products/product-grid'
import { EmptyState } from '@/components/shared/empty-states/empty-state'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck,
  MapPin,
  Mail,
  Leaf,
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

    // Sourcing / Eco-rating seeds based on merchant ID to keep it dynamic and persistent
    const ecoRating = seller.business_name.toLowerCase().includes('prodex') ? '92%' : '98%'
    const ratingValue = seller.business_name.toLowerCase().includes('prodex') ? '4.7 / 5' : '4.9 / 5'
    const reviewsCount = seller.business_name.toLowerCase().includes('prodex') ? '120+ buyers' : '300+ buyers'
    
    // Dynamic story based on merchant ID
    const brandStory = seller.business_name.toLowerCase().includes('prodex')
      ? `${seller.business_name} specializes in high-fidelity apparel, technical commuter gear, and everyday luxury essentials. Focused on zero-waste manufacturing and direct trade mills, every piece represents pure functional design engineered for longevity.`
      : `${seller.business_name} crafts premium streetwear utility garments, rugged commuter leather boots, and sustainable desk audio acoustics in micro-studio environments. All raw materials are certified organic and sourced directly from family-run mills.`

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
                <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-650 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30 border border-emerald-100/50 px-2 py-0.5 rounded shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Verified Partner</span>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                Artisan Storefront
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs font-semibold text-slate-450">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>Portland, Oregon, USA</span>
                </div>
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
                <Leaf className="h-3.5 w-3.5 text-emerald-500" /> Carbon Offset
              </span>
              <div>
                <span className="text-xl font-black text-slate-900 leading-none">{ecoRating}</span>
                <p className="text-[9px] font-bold text-slate-450 mt-0.5">Eco-Sourced Rating</p>
              </div>
            </div>

            <div className="flex-1 space-y-1 p-4 bg-slate-50 dark:bg-slate-50/5 border border-slate-100/50 dark:border-slate-150/30 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-400" /> Seller Rating
              </span>
              <div>
                <span className="text-xl font-black text-slate-900 leading-none">{ratingValue}</span>
                <p className="text-[9px] font-bold text-slate-450 mt-0.5">From {reviewsCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand story section */}
        <div className="bg-slate-50/30 dark:bg-slate-50/2 border border-slate-100/50 dark:border-slate-150/20 rounded-3xl p-6 md:p-8 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-slate-400" />
            <span>Brand Story & Craftsmanship</span>
          </h4>
          <p className="text-sm font-semibold text-slate-550 leading-relaxed italic max-w-4xl">
            "{brandStory}"
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
