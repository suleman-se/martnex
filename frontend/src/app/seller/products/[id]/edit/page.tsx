'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSellerProducts, useSellerProduct } from '@/hooks/use-seller-products';
import { ProductForm } from '@/components/seller/products/ProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const { data: product, isLoading: isFetching } = useSellerProduct(id);
  const { handleUpdate, isProcessing } = useSellerProducts();

  const onSubmit = async (data: any) => {
    try {
      await handleUpdate({ id, ...data });
      toast.success('Product updated successfully');
      router.push('/seller/products');
    } catch {
      toast.error('Failed to update product. Please try again.');
    }
  };

  return (
    <>
      {isFetching ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
        </div>
      ) : !product ? (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Product Not Found</h2>
          <p className="text-slate-500 font-medium">The product you are trying to edit does not exist or you don&apos;t have access.</p>
          <button
            onClick={() => router.push('/seller/products')}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            Back to Catalog
          </button>
        </div>
      ) : (
        <ProductForm initialData={product} onSubmit={onSubmit} isLoading={isProcessing} />
      )}
    </>
  );
}

