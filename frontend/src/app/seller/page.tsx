'use client';

import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const stats = [
  { name: 'Total Revenue', value: '$12,450.00', icon: DollarSign, trend: '+12.5%', trendType: 'up' },
  { name: 'Active Orders', value: '24', icon: ShoppingBag, trend: '+4.2%', trendType: 'up' },
  { name: 'Store Visitors', value: '1,200', icon: Users, trend: '-2.1%', trendType: 'down' },
  { name: 'Conversion Rate', value: '3.2%', icon: TrendingUp, trend: '+0.5%', trendType: 'up' },
];

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="relative bg-white rounded-3xl p-8 hover:shadow-premium transition-all duration-500 group overflow-hidden shadow-sm">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-3.5 bg-blue-50 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-500">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-black ${
                stat.trendType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {stat.trend}
                {stat.trendType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest">{stat.name}</h3>
              <p className="text-3xl font-heading font-black text-slate-900 mt-2">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 min-h-[450px] shadow-sm flex flex-col hover:shadow-premium transition-all duration-500">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-heading font-black text-slate-900">Sales Performance</h3>
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/40"></span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 transform -rotate-6 group-hover:rotate-0 transition-transform duration-700">
              <TrendingUp className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-heading font-black text-slate-900">Analytics Pending</h3>
            <p className="text-sm font-medium text-slate-500 mt-3 max-w-sm leading-relaxed">
              Once you start processing orders, we will display your sales trends and revenue growth here with precision.
            </p>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-[2rem] p-10 shadow-sm flex flex-col h-full hover:shadow-premium transition-all duration-500">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-heading font-black text-slate-900">Recent Activity</h3>
            <span className="text-[10px] font-black text-primary bg-blue-50 px-3 py-1.5 rounded-full tracking-widest uppercase">Live Pulse</span>
          </div>
          
          <div className="space-y-10 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-5 group cursor-pointer">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/30 z-10 relative mt-1"></div>
                  {i < 4 && <div className="absolute top-4 left-1.5 w-[2px] h-12 bg-slate-100"></div>}
                </div>
                <div>
                  <p className="text-sm text-slate-800 font-bold group-hover:text-primary transition-colors leading-snug">
                    New order received #ORD-{Math.floor(Math.random() * 9000) + 1000}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-2 uppercase tracking-wide">{i * 2}h ago • $124.99</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="mt-10 w-full py-4 rounded-2xl bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-primary hover:text-white transition-all duration-300">
            View All History
          </button>
        </div>
      </div>
    </div>
  );
}