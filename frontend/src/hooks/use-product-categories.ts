'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProductCategories } from '@/lib/api';
import type { ProductCategory } from '@/lib/api';

export type { ProductCategory };

export function useProductCategories() {
  return useQuery({
    queryKey: ['productCategories'],
    queryFn: fetchProductCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes cache for taxonomy
  });
}

