'use client';

import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  MoreVertical,
  ChevronRight
} from 'lucide-react';

const orders = [
  { id: 'ORD-7241', date: 'Oct 12, 2026', customer: 'John Doe', total: '$345.00', status: 'Processing' },
  { id: 'ORD-7240', date: 'Oct 11, 2026', customer: 'Jane Smith', total: '$129.00', status: 'Shipped' },
  { id: 'ORD-7239', date: 'Oct 11, 2026', customer: 'Robert Brown', total: '$890.00', status: 'Delivered' },
  { id: 'ORD-7238', date: 'Oct 10, 2026', customer: 'Michael Wilson', total: '$56.50', status: 'Cancelled' },
];

export default function SellerOrdersPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900">
            Customer Orders
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Track and manage your sales and fulfillments with precision.</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending</p>
          <p className="text-4xl font-heading font-black text-slate-900 mt-2">12</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">In Transit</p>
          <p className="text-4xl font-heading font-black text-slate-900 mt-2">8</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Completed</p>
          <p className="text-4xl font-heading font-black text-slate-900 mt-2">156</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by order ID or customer..." 
            className="w-full bg-slate-100/50 border-none rounded-[1.25rem] pl-14 pr-6 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium placeholder:text-slate-400"
          />
        </div>
        <button className="flex items-center gap-2.5 px-8 py-4 bg-white shadow-sm rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
          <Filter className="w-4.5 h-4.5" />
          Filter Status
        </button>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-premium transition-all duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Order ID</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="font-heading font-black text-slate-900 tracking-tight">{order.id}</span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">{order.date}</td>
                  <td className="px-8 py-6 text-sm text-slate-900 font-bold">{order.customer}</td>
                  <td className="px-8 py-6 text-base font-black text-slate-900 tracking-tight font-heading">{order.total}</td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'Processing' ? 'bg-amber-50 text-amber-600' :
                      order.status === 'Shipped' ? 'bg-blue-50 text-primary' :
                      order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-primary transition-all active:scale-90 group-hover:translate-x-1">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center px-6">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-3xl font-heading font-black text-slate-900">No orders found</h3>
            <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium leading-relaxed">
              Your orders will show up here once customers start purchasing your products.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
