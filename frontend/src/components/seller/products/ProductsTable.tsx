'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Eye, 
  Edit2, 
  Trash2, 
  Package,
  MoreVertical
} from 'lucide-react';
import { Product } from '@/hooks/use-seller-products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-states/empty-state';

interface ProductsTableProps {
  products: Product[];
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function ProductsTable({ products, onDelete, isDeleting }: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products yet"
        description="Ready to grow your business? Add your first product and start reaching thousands of potential customers."
        action={
          <Link href="/seller/products/new">
            <Button className="mt-4 rounded-2xl py-6 px-8">
              Add First Product
            </Button>
          </Link>
        }
        variant="card"
      />
    );
  }

  return (
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
            {products.map((product) => {
              // Get price and stock from first variant if available
              const firstVariant = product.variants?.[0];
              const price = firstVariant?.prices?.[0]?.amount != null
                ? `$${(Number(firstVariant.prices[0].amount) / 100).toFixed(2)}`
                : 'N/A';
              const stock = firstVariant?.inventory_quantity ?? 0;
              const category = product.categories?.[0]?.name ?? 'Uncategorized';

              return (
                <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 relative shadow-sm">
                        <Image 
                          src={product.thumbnail || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80'} 
                          alt={product.title} 
                          fill 
                          sizes="64px" 
                          className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                        />
                      </div>
                      <span className="font-bold text-slate-900 truncate max-w-[280px] tracking-tight text-base font-heading">
                        {product.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-semibold text-slate-500">
                    {category}
                  </td>
                  <td className="px-8 py-6 text-base font-black text-slate-900 tracking-tight font-heading">
                    {price}
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">
                    {stock}
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={product.status === 'published' ? 'default' : 'secondary'} className="uppercase tracking-widest text-[10px]">
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/seller/products/${product.id}`}>
                        <Button variant="secondary" size="icon" className="w-10 h-10 rounded-xl" title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/seller/products/${product.id}/edit`}>
                        <Button variant="secondary" size="icon" className="w-10 h-10 rounded-xl" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="w-10 h-10 rounded-xl hover:text-rose-500 hover:bg-rose-50" 
                        title="Delete"
                        onClick={() => onDelete(product.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
