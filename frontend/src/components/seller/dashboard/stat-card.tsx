import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

export interface StatData {
  name: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  trendType: 'up' | 'down';
}

interface StatCardProps {
  stat: StatData;
}

export function StatCard({ stat }: StatCardProps) {
  return (
    <div className="relative bg-white rounded-3xl p-8 hover:shadow-premium transition-all duration-500 group overflow-hidden shadow-sm">
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
  );
}
