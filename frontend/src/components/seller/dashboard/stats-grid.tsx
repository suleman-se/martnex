import { TrendingUp, ShoppingBag, DollarSign, BadgeDollarSign } from 'lucide-react';
import { StatCard, StatData } from './stat-card';

interface StatsGridProps {
  stats?: StatData[]
  isLoading?: boolean
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
        <div className="w-14 h-6 bg-slate-100 rounded-full" />
      </div>
      <div className="h-3 bg-slate-100 rounded w-1/2 mb-3" />
      <div className="h-8 bg-slate-100 rounded w-2/3" />
    </div>
  )
}

export { type StatData }

export function StatsGrid({ stats, isLoading = false }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const displayStats: StatData[] = stats ?? [
    { name: 'Total Revenue', value: '$0.00', icon: DollarSign, trend: '—', trendType: 'up' },
    { name: 'Active Orders', value: '0', icon: ShoppingBag, trend: '—', trendType: 'up' },
    { name: 'Approved Earnings', value: '$0.00', icon: BadgeDollarSign, trend: '—', trendType: 'up' },
    { name: 'Commissions', value: '0', icon: TrendingUp, trend: '—', trendType: 'up' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayStats.map((stat) => (
        <StatCard key={stat.name} stat={stat} />
      ))}
    </div>
  );
}
