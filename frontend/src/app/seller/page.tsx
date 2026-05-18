'use client';

import { DollarSign, ShoppingBag, TrendingUp, BadgeDollarSign } from 'lucide-react';
import { StatsGrid } from '@/components/seller/dashboard/stats-grid';
import { SalesChartPlaceholder } from '@/components/seller/dashboard/sales-chart-placeholder';
import { ActivityFeed } from '@/components/seller/dashboard/activity-feed';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { formatCurrency } from '@/hooks/use-seller-orders';
import type { StatData } from '@/components/seller/dashboard/stats-grid';

export default function SellerOverviewPage() {
  const { stats, isLoading } = useDashboardStats();

  const statCards: StatData[] | undefined = stats
    ? [
        {
          name: 'Total Revenue',
          value: formatCurrency(stats.totalRevenue, stats.currencyCode),
          icon: DollarSign,
          trend: stats.totalRevenue > 0 ? '↑' : '—',
          trendType: 'up',
        },
        {
          name: 'Active Orders',
          value: String(stats.activeOrderCount),
          icon: ShoppingBag,
          trend: stats.activeOrderCount > 0 ? '↑' : '—',
          trendType: 'up',
        },
        {
          name: 'Approved Earnings',
          value: formatCurrency(stats.approvedEarnings, stats.currencyCode),
          icon: BadgeDollarSign,
          trend: stats.approvedEarnings > 0 ? '↑' : '—',
          trendType: 'up',
        },
        {
          name: 'Commissions',
          value: String(stats.totalCommissions),
          icon: TrendingUp,
          trend: stats.totalCommissions > 0 ? '↑' : '—',
          trendType: 'up',
        },
      ]
    : undefined;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="bg-white px-5 py-2.5 text-sm font-bold text-slate-600 rounded-2xl shadow-sm">
          All Time
        </div>
      </div>

      <StatsGrid stats={statCards} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SalesChartPlaceholder />
        <ActivityFeed orders={stats?.recentOrders} isLoading={isLoading} />
      </div>
    </div>
  );
}