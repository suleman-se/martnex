import { TrendingUp } from 'lucide-react';

export function SalesChartPlaceholder() {
  return (
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
  );
}
