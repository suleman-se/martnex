'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client';

export interface Product {
  id: string;
  title: string;
  description: string;
  handle: string;
  thumbnail: string;
  images: {
    id?: string;
    url: string;
    metadata?: {
      file_id?: string;
      [key: string]: unknown;
    } | null;
  }[];
  options: { title: string; values: { value: string }[] }[];
  variants: {
    id: string;
    title: string;
    prices: { amount: number; currency_code: string }[];
    inventory_quantity: number;
    sku?: string;
    options: { title: string; value: string }[];
  }[];
  categories: { id: string; name: string }[];
  status: 'draft' | 'proposed' | 'published' | 'rejected';
}

function normalizeProductMediaUrl(url?: string | null): string {
  if (!url) {
    return '';
  }

  const backendUrl = getBackendUrl();

  if (url.startsWith('/')) {
    return new URL(url, backendUrl).toString();
  }

  try {
    const parsedUrl = new URL(url);
    const backendOrigin = new URL(backendUrl).origin;

    if (parsedUrl.pathname.startsWith('/static/')) {
      return new URL(`${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`, backendOrigin).toString();
    }

    return parsedUrl.toString();
  } catch {
    return url;
  }
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    thumbnail: normalizeProductMediaUrl(product.thumbnail),
    images: Array.isArray(product.images)
      ? product.images.map((image) => ({
          ...image,
          url: normalizeProductMediaUrl(image.url),
        }))
      : [],
  };
}

async function fetchSellerProducts(): Promise<Product[]> {
  const token = localStorage.getItem('access_token');
  const headers = await buildStoreHeaders(token || undefined);
  const response = await fetch(`${getBackendUrl()}/store/sellers/me/products`, { headers });
  
  if (!response.ok) throw new Error('Failed to fetch products');
  const data = await response.json();
  const p = data.products;
  const products = Array.isArray(p) ? p : p ? [p] : [];
  return products.map((product: Product) => normalizeProduct(product));
}

async function fetchSellerProduct(id: string): Promise<Product> {
  const token = localStorage.getItem('access_token');
  const headers = await buildStoreHeaders(token || undefined);
  const response = await fetch(`${getBackendUrl()}/store/sellers/me/products/${id}`, { headers });
  
  if (!response.ok) throw new Error('Failed to fetch product');
  const data = await response.json();
  return normalizeProduct(data.product as Product);
}

async function createProduct(payload: any): Promise<Product> {
  const token = localStorage.getItem('access_token');
  const headers = await buildStoreHeaders(token || undefined);
  const response = await fetch(`${getBackendUrl()}/store/sellers/me/products`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) throw new Error('Failed to create product');
  const data = await response.json();
  return normalizeProduct(data.product as Product);
}

async function updateProduct({ id, ...payload }: { id: string } & any): Promise<Product> {
  const token = localStorage.getItem('access_token');
  const headers = await buildStoreHeaders(token || undefined);
  const response = await fetch(`${getBackendUrl()}/store/sellers/me/products/${id}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) throw new Error('Failed to update product');
  const data = await response.json();
  return normalizeProduct(data.product as Product);
}

async function deleteProduct(id: string): Promise<void> {
  const token = localStorage.getItem('access_token');
  const headers = await buildStoreHeaders(token || undefined);
  const response = await fetch(`${getBackendUrl()}/store/sellers/me/products/${id}`, {
    method: 'DELETE',
    headers,
  });
  
  if (!response.ok) throw new Error('Failed to delete product');
}

export function useSellerProducts() {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['sellerProducts'],
    queryFn: fetchSellerProducts,
    staleTime: 30 * 1000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: (updatedProduct) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['sellerProduct', updatedProduct.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: invalidate,
  });

  return {
    products,
    isLoading,
    error: error ? String(error) : null,
    handleCreate: createMutation.mutateAsync,
    handleUpdate: updateMutation.mutateAsync,
    handleDelete: deleteMutation.mutateAsync,
    isProcessing: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}

export function useSellerProduct(id: string) {
  return useQuery({
    queryKey: ['sellerProduct', id],
    queryFn: () => fetchSellerProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
