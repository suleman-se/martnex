'use client';

import Image from 'next/image';

import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2,
  Package
} from 'lucide-react';

const products = [
  { id: '1', name: 'Premium Wireless Headphones', category: 'Electronics', price: '$299.00', stock: 45, status: 'Active', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
  { id: '2', name: 'Minimalist Wall Clock', category: 'Home Decor', price: '$49.00', stock: 12, status: 'Out of Stock', image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80' },
  { id: '3', name: 'Leather Travel Bag', category: 'Accessories', price: '$189.00', stock: 8, status: 'Draft', image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80' },
  { id: '4', name: 'Smart Fitness Tracker', category: 'Electronics', price: '$89.00', stock: 120, status: 'Active', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80' },
];

export default function SellerProductsPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900">
            My Products
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your inventory and product listings with precision.</p>
        </div>
        <button className="flex items-center gap-2.5 py-4 px-8 rounded-2xl text-sm font-black uppercase tracking-wider text-white bg-primary hover:scale-[1.02] transform transition-all shadow-lg shadow-primary/25 active:scale-95">
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search catalog..." 
            className="w-full bg-slate-100/50 border-none rounded-[1.25rem] pl-14 pr-6 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium placeholder:text-slate-400"
          />
        </div>
        <button className="flex items-center gap-2.5 px-8 py-4 bg-white shadow-sm rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
          <Filter className="w-4.5 h-4.5" />
          Filters
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-premium transition-all duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Product</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Price</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Stock</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 relative shadow-sm">
                        <Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                      </div>
                      <span className="font-bold text-slate-900 truncate max-w-[280px] tracking-tight text-base font-heading">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-semibold text-slate-500">{product.category}</td>
                  <td className="px-8 py-6 text-base font-black text-slate-900 tracking-tight font-heading">{product.price}</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">{product.stock}</td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      product.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                      product.status === 'Out of Stock' ? 'bg-rose-50 text-rose-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-primary transition-all active:scale-90" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-primary transition-all active:scale-90" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {products.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center px-6">
            <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 relative rotate-3 group-hover:rotate-0 transition-transform duration-700">
              <Package className="w-12 h-12 text-slate-300 relative z-10" />
            </div>
            <h3 className="text-3xl font-heading font-black text-slate-900">Your catalog is empty</h3>
            <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium leading-relaxed">
              Ready to grow your business? Add your first product and start reaching thousands of potential customers globally.
            </p>
            <button className="mt-12 flex items-center gap-3 py-5 px-12 rounded-[1.25rem] text-xs font-black uppercase tracking-widest text-white bg-primary hover:shadow-xl hover:shadow-primary/20 transition-all group active:scale-95">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Add First Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
