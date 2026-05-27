import { SkeletonDetail } from '@/components/shared/skeletons'

export default function ProductDetailLoading() {
  return (
    <div className="animate-in fade-in duration-500 pb-16">
      <SkeletonDetail />
    </div>
  )
}
