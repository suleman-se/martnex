import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { StatCard, StatData } from './stat-card';

const defaultStats: StatData[] = [
  { name: 'Total Revenue', value: '$12,450.00', icon: DollarSign, trend: '+12.5%', trendType: 'up' },
  { name: 'Active Orders', value: '24', icon: ShoppingBag, trend: '+4.2%', trendType: 'up' },
  { name: 'Store Visitors', value: '1,200', icon: Users, trend: '-2.1%', trendType: 'down' },
  { name: 'Conversion Rate', value: '3.2%', icon: TrendingUp, trend: '+0.5%', trendType: 'up' },
];

interface StatsGridProps {
  stats?: StatData[];
}

export function StatsGrid({ stats = defaultStats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.name} stat={stat} />
      ))}
    </div>
  );
}
