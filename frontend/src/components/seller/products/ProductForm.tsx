'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Save, 
  ChevronLeft,
  Info,
  Layers,
  Layout,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VariantBuilder } from './VariantBuilder';
import { ImageUpload } from './ImageUpload';
import { useProductCategories } from '@/hooks/use-product-categories';
import { Product } from '@/hooks/use-seller-products';

const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  metadata: z
    .object({
      file_id: z.string().optional(),
    })
    .passthrough()
    .nullable()
    .optional(),
});

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category_ids: z.array(z.string()).optional(),
  images: z.array(productImageSchema).optional(),
  pending_delete_file_ids: z.array(z.string()).optional(),
  options: z.array(z.object({
    title: z.string(),
    values: z.array(z.string())
  })).optional(),
  variants: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    prices: z.array(z.object({ amount: z.number(), currency_code: z.string() })),
    inventory_quantity: z.number(),
    sku: z.string().optional(),
    options: z.array(z.object({ title: z.string(), value: z.string() }))
  })).optional(),
  status: z.enum(['draft', 'proposed', 'published']),
});

type ProductFormData = z.infer<typeof productSchema>;

const DEFAULT_OPTION_TITLE = 'Default option';
const DEFAULT_OPTION_VALUE = 'Default option value';
const DEFAULT_VARIANT_TITLE = 'Default variant';

const emptySimpleVariant = {
  title: DEFAULT_VARIANT_TITLE,
  prices: [{ amount: 0, currency_code: 'usd' }],
  inventory_quantity: 0,
  options: [] as { title: string; value: string }[],
};

function hasMeaningfulOptions(options?: Array<{ title: string; values: string[] }>) {
  return Array.isArray(options)
    && options.some((option) => option.title.trim().length > 0 && option.values.some((value) => value.trim().length > 0));
}

function isSyntheticSimpleProduct(product?: Product) {
  if (!product || product.options?.length !== 1 || product.variants?.length !== 1) {
    return false;
  }

  const [option] = product.options;
  const [variant] = product.variants;
  const variantOption = variant.options?.[0] as
    | { title?: string; value?: string | { value?: string }; option?: { title?: string } }
    | undefined;
  const variantOptionTitle = variantOption?.title || variantOption?.option?.title;
  const variantOptionValue = typeof variantOption?.value === 'string'
    ? variantOption.value
    : variantOption?.value?.value;

  return option.title === DEFAULT_OPTION_TITLE
    && option.values?.length === 1
    && option.values[0]?.value === DEFAULT_OPTION_VALUE
    && variantOptionTitle === DEFAULT_OPTION_TITLE
    && variantOptionValue === DEFAULT_OPTION_VALUE;
}

function normalizeProductSubmission(data: ProductFormData): ProductFormData {
  if (hasMeaningfulOptions(data.options)) {
    return data;
  }

  const baseVariant = data.variants?.[0];
  if (!baseVariant) {
    return {
      ...data,
      options: [],
      variants: [],
    };
  }

  return {
    ...data,
    options: [{ title: DEFAULT_OPTION_TITLE, values: [DEFAULT_OPTION_VALUE] }],
    variants: [
      {
        ...baseVariant,
        title: DEFAULT_VARIANT_TITLE,
        options: [{ title: DEFAULT_OPTION_TITLE, value: DEFAULT_OPTION_VALUE }],
      },
    ],
  };
}

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

export function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const { data: categories = [] } = useProductCategories();
  const usesSyntheticSimpleProduct = isSyntheticSimpleProduct(initialData);
  const initialOptions = usesSyntheticSimpleProduct
    ? []
    : initialData?.options?.map((option) => ({
        title: option.title,
        values: option.values.map((value) => value.value),
      })) || [];
  const initialVariants = initialData?.variants?.map((variant) => ({
    id: variant.id,
    title: variant.title,
    prices: variant.prices?.length
      ? variant.prices.map((price) => ({ amount: price.amount, currency_code: price.currency_code }))
      : [{ amount: (variant as any).calculated_price?.calculated_amount ?? 0, currency_code: 'usd' }],
    inventory_quantity: variant.inventory_quantity,
    sku: variant.sku || undefined,
    options: usesSyntheticSimpleProduct
      ? []
      : variant.options
          .map((opt: any) => ({
            title: opt.title || opt.option?.title || '',
            value: typeof opt.value === 'string' ? opt.value : opt.value?.value || '',
          }))
          .filter((opt: any) => opt.title),
  })) || [];

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      category_ids: initialData.categories?.map(c => c.id) || [],
      images: initialData.images || [],
      pending_delete_file_ids: [],
      options: initialOptions,
      variants: initialVariants,
      status: initialData.status as any || 'draft',
    } : {
      status: 'draft',
      images: [],
      pending_delete_file_ids: [],
      options: [],
      variants: [],
      category_ids: [],
    },
  });

  const queueImageDelete = (fileId: string) => {
    const pendingDeleteFileIds = getValues('pending_delete_file_ids') || [];

    if (pendingDeleteFileIds.includes(fileId)) {
      return;
    }

    setValue('pending_delete_file_ids', [...pendingDeleteFileIds, fileId], {
      shouldDirty: true,
    });
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(normalizeProductSubmission(data)))} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page header — back + title only, no submit button here */}
      <div className="flex items-center gap-4">
        <Link href="/seller/products">
          <Button variant="secondary" size="icon" className="w-12 h-12 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
            <ChevronLeft className="w-6 h-6 text-slate-400" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-slate-900">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-slate-500 font-medium">Define your product details and variants.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <Card className="rounded-[2.5rem] border-none shadow-premium overflow-hidden">
            <CardHeader className="bg-secondary px-10 py-7 border-b border-border/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border/20">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-black text-slate-900">General Information</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Title and description</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-slate-400">Product Title</Label>
                <Input 
                  id="title"
                  {...register('title')}
                  placeholder="e.g. Premium Wireless Headphones"
                  className="bg-input border border-border rounded-xl h-12 px-4 font-semibold placeholder:text-muted-foreground transition-all"
                />
                {errors.title && <p className="text-xs font-bold text-rose-500 uppercase tracking-widest pl-2">{errors.title.message}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-400">Description</Label>
                <textarea 
                  id="description"
                  {...register('description')}
                  rows={5}
                  placeholder="Tell your customers what makes this product special..."
                  className="w-full bg-input border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:bg-card transition-all font-medium resize-none"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Pricing & Inventory — only for simple products (no variants) */}
          <Controller
            name="options"
            control={control}
            render={({ field: optionsField }) => {
              const hasVariants = hasMeaningfulOptions(optionsField.value as Array<{ title: string; values: string[] }> | undefined);
              if (hasVariants) return <></>;

              return (
                <Card className="rounded-[2.5rem] border-none shadow-premium overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardHeader className="bg-secondary px-10 py-7 border-b border-border/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border/20">
                        <Tag className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-heading font-black text-slate-900">Pricing & Inventory</h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Base product details</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Price (USD)</Label>
                        <Controller
                          name="variants"
                          control={control}
                          render={({ field: variantsField }) => (
                            <Input 
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={variantsField.value?.[0]?.prices?.[0]?.amount ?? ''}
                              onChange={(e) => {
                                const val = Math.max(0, parseFloat(e.target.value) || 0);
                                const current = variantsField.value?.[0] || emptySimpleVariant;
                                variantsField.onChange([{
                                  ...current,
                                  prices: [{ amount: val, currency_code: 'usd' }],
                                  inventory_quantity: current.inventory_quantity ?? 0,
                                }]);
                              }}
                              className="bg-input border border-border rounded-xl h-12 px-4 font-semibold"
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Inventory Quantity</Label>
                        <Controller
                          name="variants"
                          control={control}
                          render={({ field: variantsField }) => (
                            <Input 
                              type="number"
                              min="0"
                              step="1"
                              placeholder="0"
                              value={variantsField.value?.[0]?.inventory_quantity ?? ''}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                const current = variantsField.value?.[0] || emptySimpleVariant;
                                variantsField.onChange([{
                                  ...current,
                                  prices: current.prices || [{ amount: 0, currency_code: 'usd' }],
                                  inventory_quantity: val,
                                }]);
                              }}
                              className="bg-input border border-border rounded-xl h-12 px-4 font-semibold"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }}
          />

          <Card className="rounded-[2.5rem] border-none shadow-premium overflow-hidden">
            <CardHeader className="bg-secondary px-10 py-7 border-b border-border/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border/20">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-black text-slate-900">Options & Variants</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sizes, colors, and stock</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <Controller
                name="options"
                control={control}
                render={({ field: optionsField }) => (
                  <Controller
                    name="variants"
                    control={control}
                    render={({ field: variantsField }) => (
                      <VariantBuilder
                        value={{
                          options: (optionsField.value as any[])?.length
                            ? (optionsField.value as any[]).map((o: any) => ({
                                id: o.id ?? Math.random().toString(),
                                title: o.title,
                                values: o.values,
                              }))
                            : [],
                          variants: variantsField.value as any || [],
                        }}
                        onChange={(val) => {
                          optionsField.onChange(val.options);
                          variantsField.onChange(val.variants);
                        }}
                      />
                    )}
                  />
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — order: Status+Save → Category → Media */}
        <div className="space-y-10 lg:sticky lg:top-6 lg:self-start">
          {/* 1. Status + Save */}
          <Card className="rounded-[2.5rem] border-none shadow-premium overflow-hidden">
            <CardHeader className="bg-secondary px-7 py-5 border-b border-border/20">
              <div className="flex items-center gap-3">
                <Layout className="w-5 h-5 text-primary" />
                <h3 className="text-base font-heading font-black text-slate-900">Status</h3>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-input border border-border rounded-xl h-12 px-4 font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="draft" className="font-bold py-3">Draft</SelectItem>
                      <SelectItem value="published" className="font-bold py-3">Published</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl py-6 gap-3 shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-sm"
              >
                <Save className="w-5 h-5" />
                {isLoading ? 'Saving…' : initialData ? 'Update Product' : 'Save Product'}
              </Button>
            </CardContent>
          </Card>

          {/* 2. Category */}
          <Card className="rounded-[2.5rem] border-none shadow-premium overflow-hidden">
            <CardHeader className="bg-secondary px-7 py-5 border-b border-border/20">
              <div className="flex items-center gap-3">
                <Layout className="w-5 h-5 text-primary" />
                <h3 className="text-base font-heading font-black text-slate-900">Category</h3>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-3">
              <Controller
                name="category_ids"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={(val) => field.onChange([val])} 
                    value={field.value?.[0]}
                  >
                    <SelectTrigger className="bg-input border border-border rounded-xl h-12 px-4 font-semibold">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="font-bold py-3">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </CardContent>
          </Card>

          {/* 3. Media */}
          <Card className="rounded-[2.5rem] border-none shadow-premium overflow-hidden">
            <CardHeader className="bg-secondary px-7 py-5 border-b border-border/20">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="text-base font-heading font-black text-slate-900">Media</h3>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <Controller
                name="images"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    onQueueDelete={queueImageDelete}
                  />
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

