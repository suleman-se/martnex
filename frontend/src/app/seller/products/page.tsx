'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useSellerProducts } from '@/hooks/use-seller-products';
import { ProductsTable } from '@/components/seller/products/ProductsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useMounted } from '@/hooks/use-mounted';

export default function SellerProductsPage() {
  const mounted = useMounted();
  const { products, isLoading, error, handleDelete, isProcessing, refetch } = useSellerProducts();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );
console.log('Filtered products:', products);
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await handleDelete(deleteId);
      toast.success('Product deleted successfully');
    } catch {
      toast.error('Failed to delete product. Please try again.');
    } finally {
      setDeleteId(null);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900">
              My Products
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Manage your inventory and product listings with precision.</p>
          </div>
          <Link href="/seller/products/new">
            <Button className="flex items-center gap-2.5 py-7 px-8 rounded-2xl text-sm font-black uppercase tracking-wider shadow-lg shadow-primary/25">
              <Plus className="w-5 h-5" />
              Add New Product
            </Button>
          </Link>
        </div>

         {/* Search & Filters  */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100/50 border-none rounded-[1.25rem] pl-14 pr-6 py-7 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium placeholder:text-slate-400"
            />
          </div>
          <Button
            variant="secondary"
            className="flex items-center gap-2.5 px-8 py-7 bg-white shadow-sm rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all h-auto"
            onClick={() => setSearch('')}
          >
            <Filter className="w-4 h-4" />
            {search ? 'Clear' : 'Filters'}
          </Button>
        </div>

         {/* Table or Loading  */}
        {isLoading ? (
          <div className="bg-white rounded-[2rem] p-32 flex items-center justify-center shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-[2rem] p-16 flex flex-col items-center justify-center gap-4 shadow-sm">
            <AlertTriangle className="w-10 h-10 text-red-400" />
            <p className="text-slate-600 font-semibold text-center">Failed to load products. Please try again.</p>
            <Button variant="secondary" onClick={() => refetch()} className="flex items-center gap-2 rounded-2xl px-6 py-4">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        ) : (
          <ProductsTable
            products={filtered}
            onDelete={(id) => setDeleteId(id)}
            isDeleting={isProcessing}
          />
        )}
         {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed from your catalog and all associated data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isProcessing}>
              {isProcessing ? 'Deleting…' : 'Delete Product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
  );
}

