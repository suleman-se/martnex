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

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category_ids: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  options: z.array(z.object({
    title: z.string(),
    values: z.array(z.string())
  })).optional(),
  variants: z.array(z.object({
    title: z.string(),
    prices: z.array(z.object({ amount: z.number(), currency_code: z.string() })),
    inventory_quantity: z.number(),
    sku: z.string().optional(),
    options: z.array(z.object({ title: z.string(), value: z.string() }))
  })).optional(),
  status: z.enum(['draft', 'proposed', 'published']),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

export function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const { data: categories = [] } = useProductCategories();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      category_ids: initialData.categories?.map(c => c.id) || [],
      images: initialData.images?.map(i => i.url) || [],
      options: initialData.options?.map(o => ({ title: o.title, values: o.values.map(v => v.value) })) || [],
      variants: initialData.variants?.map(v => ({
        title: v.title,
        prices: v.prices.map(p => ({ amount: p.amount, currency_code: p.currency_code })),
        inventory_quantity: v.inventory_quantity,
        options: v.options
      })) || [],
      status: initialData.status as any || 'draft',
    } : {
      status: 'draft',
      images: [],
      options: [],
      variants: [],
      category_ids: [],
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
            <CardHeader className="bg-slate-50/50 px-10 py-8 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Info className="w-6 h-6 text-primary" />
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
                  className="bg-slate-50/50 border-none rounded-2xl h-14 px-6 text-lg font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-primary/10 transition-all"
                />
                {errors.title && <p className="text-xs font-bold text-rose-500 uppercase tracking-widest pl-2">{errors.title.message}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-400">Description</Label>
                <textarea 
                  id="description"
                  {...register('description')}
                  rows={6}
                  placeholder="Tell your customers what makes this product special..."
                  className="w-full bg-slate-50/50 border-none rounded-3xl p-6 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-premium overflow-hidden">
            <CardHeader className="bg-slate-50/50 px-10 py-8 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-black text-slate-900">Options & Variants</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sizes, colors, and stock</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <Controller
                name="variants"
                control={control}
                render={({ field }) => (
                  <VariantBuilder 
                    value={{ options: initialData?.options?.map(o => ({ id: Math.random().toString(), title: o.title, values: o.values.map(v => v.value) })) || [], variants: field.value as any || [] }}
                    onChange={(val) => {
                      setValue('options', val.options);
                      field.onChange(val.variants);
                    }}
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
            <CardHeader className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Layout className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-heading font-black text-slate-900">Status</h3>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-slate-50/50 border-none rounded-xl h-12 px-5 font-bold">
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
            <CardHeader className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Layout className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-heading font-black text-slate-900">Category</h3>
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
                    <SelectTrigger className="bg-slate-50/50 border-none rounded-xl h-12 px-5 font-bold">
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
            <CardHeader className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-heading font-black text-slate-900">Media</h3>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <Controller
                name="images"
                control={control}
                render={({ field }) => (
                  <ImageUpload value={field.value} onChange={field.onChange} />
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

