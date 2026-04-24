export function ActivityFeed() {
  return (
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
  );
}
