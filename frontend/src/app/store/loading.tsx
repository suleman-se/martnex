import { SkeletonGrid } from '@/components/shared/skeletons'

export default function StoreLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Title Shimmer */}
        <div className="h-10 w-48 bg-slate-100 animate-pulse rounded-xl" />
        {/* Search Input Shimmer */}
        <div className="h-11 w-full sm:w-72 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
      
      {/* Category Chips Shimmer */}
      <div className="flex flex-wrap gap-2 pt-1">
        <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-full" />
        <div className="h-7 w-20 bg-slate-100 animate-pulse rounded-full" />
        <div className="h-7 w-22 bg-slate-100 animate-pulse rounded-full" />
        <div className="h-7 w-20 bg-slate-100 animate-pulse rounded-full" />
      </div>
      
      {/* Product Grid Skeleton */}
      <SkeletonGrid count={8} className="pt-4" />
    </div>
  )
}
