'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSellerProducts } from '@/hooks/use-seller-products';
import { ProductForm } from '@/components/seller/products/ProductForm';

export default function NewProductPage() {
  const router = useRouter();
  const { handleCreate, isProcessing } = useSellerProducts();

  const onSubmit = async (data: any) => {
    try {
      await handleCreate(data);
      toast.success('Product created successfully');
      router.push('/seller/products');
    } catch {
      toast.error('Failed to create product. Please try again.');
    }
  };

  return <ProductForm onSubmit={onSubmit} isLoading={isProcessing} />;
}
