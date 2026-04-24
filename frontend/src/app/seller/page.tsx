'use client';

import { StatsGrid } from '@/components/seller/dashboard/stats-grid';
import { SalesChartPlaceholder } from '@/components/seller/dashboard/sales-chart-placeholder';
import { ActivityFeed } from '@/components/seller/dashboard/activity-feed';

export default function SellerOverviewPage() {
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
          Last 30 Days
        </div>
      </div>

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SalesChartPlaceholder />
        <ActivityFeed />
      </div>
    </div>
  );
}