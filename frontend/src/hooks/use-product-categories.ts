'use client';

import { useQuery } from '@tanstack/react-query';
import { getBackendUrl, buildStoreHeaders } from '@/lib/medusa-client';

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  handle: string;
  parent_category_id: string | null;
}

async function fetchProductCategories(): Promise<ProductCategory[]> {
  const headers = await buildStoreHeaders();
  const response = await fetch(`${getBackendUrl()}/store/product-categories`, { headers });
  
  if (!response.ok) throw new Error('Failed to fetch categories');
  const data = await response.json();
  return data.product_categories || [];
}

export function useProductCategories() {
  return useQuery({
    queryKey: ['productCategories'],
    queryFn: fetchProductCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes cache for taxonomy
  });
}
