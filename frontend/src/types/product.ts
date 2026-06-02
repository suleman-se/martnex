export interface ProductImageValue {
  id?: string;
  url: string;
  metadata?: {
    file_id?: string;
    [key: string]: unknown;
  } | null;
}

export interface ProductVariantPrice {
  id?: string;
  amount: number;
  currency_code: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  prices: ProductVariantPrice[];
  options: { title: string; value: string; option_id?: string }[];
  inventory_quantity?: number;
  sku?: string;
}

export interface ProductOption {
  id: string;
  title: string;
  values: string[];
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  handle: string;
  parent_category_id?: string | null;
}

export interface StoreProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  thumbnail?: string;
  images: ProductImageValue[];
  variants: ProductVariant[];
  options: { id: string; title: string; values: { value: string }[] }[];
  collection?: { id: string; title: string };
  categories?: ProductCategory[];
  status?: 'draft' | 'proposed' | 'published' | 'rejected';
}

export interface SellerProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  thumbnail: string;
  images: ProductImageValue[];
  options: { title: string; values: { value: string }[] }[];
  variants: {
    id: string;
    title: string;
    prices: ProductVariantPrice[];
    inventory_quantity: number;
    sku?: string;
    options: { title: string; value: string }[];
  }[];
  categories: { id: string; name: string }[];
  status: 'draft' | 'proposed' | 'published' | 'rejected';
}
