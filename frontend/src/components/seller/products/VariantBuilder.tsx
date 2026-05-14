'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Option {
  id: string;
  title: string;
  values: string[];
}

interface Variant {
  id?: string;
  title: string;
  options: Record<string, string>;
  price: number;
  inventory_quantity: number;
  sku: string;
}

interface VariantBuilderProps {
  value?: { options: Option[]; variants: any[] };
  onChange: (value: { options: any[]; variants: any[] }) => void;
}

function inferRemovedTitlesFromValue(value?: { options: Option[]; variants: any[] }): Set<string> {
  if (!value?.options?.length) {
    return new Set();
  }

  const normalizedOptions = value.options
    .map((option) => ({
      title: option.title,
      values: Array.isArray(option.values) ? option.values : [],
    }))
    .filter((option) => option.title && option.values.length > 0);

  if (!normalizedOptions.length) {
    return new Set();
  }

  const allTitles = new Set(
    generateCombinations(normalizedOptions as Option[]).map((combo) =>
      Object.values(combo).join(' / ')
    )
  );

  const visibleTitles = new Set(
    (value.variants || [])
      .map((variant: any) => variant?.title)
      .filter((title: unknown): title is string => typeof title === 'string' && title.length > 0)
  );

  return new Set(Array.from(allTitles).filter((title) => !visibleTitles.has(title)));
}

export function VariantBuilder({ value, onChange }: VariantBuilderProps) {
  const [options, setOptions] = useState<Option[]>(value?.options || []);
  const [removedTitles, setRemovedTitles] = useState<Set<string>>(() => inferRemovedTitlesFromValue(value));
  const [variants, setVariants] = useState<Variant[]>(() => {
    if (!value?.variants) return [];
    return value.variants.map((v: any) => ({
      id: v.id,
      title: v.title,
      options: v.options?.reduce((acc: any, curr: any) => {
        const title = curr.title || curr.option?.title || '';
        const value = typeof curr.value === 'string' ? curr.value : curr.value?.value || '';
        if (title) acc[title] = value;
        return acc;
      }, {}) || {},
      price: v.prices?.[0]?.amount ?? v.calculated_price?.calculated_amount ?? v.price ?? 0,
      inventory_quantity: v.inventory_quantity ?? 0,
      sku: v.sku ?? '',
    }));
  });

  // Keep refs to latest values so effects can read them without being in deps
  const variantsRef = React.useRef(variants);
  React.useEffect(() => { variantsRef.current = variants; }, [variants]);

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const addOption = () => {
    setOptions([...options, { id: Math.random().toString(36).substr(2, 9), title: '', values: [] }]);
  };

  const removeOption = (id: string) => {
    setOptions(options.filter(o => o.id !== id));
  };

  const updateOptionTitle = (id: string, title: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, title } : o));
  };

  const addValue = (id: string, val: string) => {
    if (!val) return;
    setOptions(options.map(o => {
      if (o.id === id && !o.values.includes(val)) {
        return { ...o, values: [...o.values, val] };
      }
      return o;
    }));
  };

  const removeValue = (id: string, val: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, values: o.values.filter(v => v !== val) } : o));
  };

  // Stable notify — uses ref so it never changes identity and doesn't need to
  // be in any effect's dependency array.
  const notifyParent = React.useCallback((currentOptions: Option[], currentVariants: Variant[]) => {
    onChangeRef.current({
      options: currentOptions.map(o => ({ title: o.title, values: o.values })),
      variants: currentVariants.map(v => {
        const trimmedSku = v.sku?.trim();
        return {
          ...(v.id ? { id: v.id } : {}),
          title: v.title,
          prices: [{ amount: v.price, currency_code: 'usd' }],
          inventory_quantity: v.inventory_quantity,
          ...(trimmedSku ? { sku: trimmedSku } : {}),
          options: Object.entries(v.options).map(([title, value]) => ({ title, value }))
        };
      })
    });
  }, []); // stable — reads onChange via ref

  // Rebuild variant matrix only when options structure or removed-titles change.
  // Reads variants via ref to avoid running on every price/inventory keystroke.
  useEffect(() => {
    if (options.length === 0 || options.every(o => o.values.length === 0)) {
      if (variantsRef.current.length > 0) {
        setVariants([]);
        notifyParent(options, []);
      }
      return;
    }

    const combinations = generateCombinations(options.filter(o => o.values.length > 0));

    const newVariants = combinations
      .map(combo => {
        const title = Object.values(combo).join(' / ');

        if (removedTitles.has(title)) return null;

        const existing = variantsRef.current.find(v => v.title === title);
        return {
          id: existing?.id,
          title,
          options: combo,
          price: existing?.price ?? 0,
          inventory_quantity: existing?.inventory_quantity ?? 0,
          sku: existing?.sku ?? '',
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null) as Variant[];

    const titlesChanged = newVariants.length !== variantsRef.current.length ||
                          newVariants.some((v, i) => v.title !== variantsRef.current[i]?.title);

    if (titlesChanged) {
      setVariants(newVariants);
      notifyParent(options, newVariants);
    }
  }, [options, notifyParent, removedTitles]); // variants intentionally excluded — read via ref

  const updateVariant = (idx: number, field: keyof Pick<Variant, 'price' | 'inventory_quantity' | 'sku'>, value: number | string) => {
    const updated = variants.map((v, i) => i === idx ? { ...v, [field]: value } : v);
    setVariants(updated);
    notifyParent(options, updated);
  };

  const removeVariant = (title: string) => {
    setRemovedTitles(prev => new Set(prev).add(title));
    const updated = variants.filter(v => v.title !== title);
    setVariants(updated);
    notifyParent(options, updated);
  };

  const restoreAll = () => {
    setRemovedTitles(new Set());
    // The useEffect will naturally re-generate the full matrix in the next render cycle
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Options</Label>
          <Button type="button" variant="secondary" size="sm" onClick={addOption} className="rounded-xl h-9 px-4 gap-2">
            <Plus className="w-4 h-4" />
            Add Option
          </Button>
        </div>

        {options.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
              <Plus className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1">No options added yet</p>
            <p className="text-xs text-slate-400">Add options like Size or Color to generate variant combinations automatically.</p>
          </div>
        )}
          {options.map((option) => (
              <div key={option.id} className="p-5 bg-secondary rounded-2xl relative group">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(option.id)}
                className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Option Name</Label>
                  <Input 
                    placeholder="e.g. Size, Color" 
                    value={option.title}
                    onChange={(e) => updateOptionTitle(option.id, e.target.value)}
                    className="bg-white border border-border rounded-xl h-11 font-semibold"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Values</Label>
                  <div className="flex flex-wrap gap-2 min-h-11 items-center p-1 bg-white border border-border rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 focus-within:bg-card transition-all">
                    {option.values.map((val) => (
                      <span key={val} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary border border-border/30 rounded-lg text-sm font-semibold text-foreground">
                        {val}
                        <Button type="button" variant="ghost" onClick={() => removeValue(option.id, val)} className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent rounded-sm flex-none">
                          <X className="w-3 h-3" />
                        </Button>
                      </span>
                    ))}
                    <input 
                      className="bg-transparent border-none outline-none text-sm font-semibold placeholder:text-muted-foreground min-w-28 flex-1"
                      placeholder="Type a value, press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addValue(option.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {variants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Variant Matrix</Label>
            {removedTitles.size > 0 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setRemovedTitles(new Set())}
                className="text-xs font-bold text-slate-400 hover:text-primary hover:bg-primary/5 h-8 px-3 rounded-lg"
              >
                Restore All
              </Button>
            )}
          </div>

          {removedTitles.size > 0 && (
            <div className="flex flex-wrap gap-2 p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-full mb-1">Hidden Variants (Click to restore)</span>
              {Array.from(removedTitles).map(title => (
                <Button
                  key={title}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newRemoved = new Set(removedTitles);
                    newRemoved.delete(title);
                    setRemovedTitles(newRemoved);
                  }}
                  className="gap-1.5 text-xs text-slate-400 hover:text-primary"
                >
                  <Plus className="w-3 h-3" />
                  {title}
                </Button>
              ))}
            </div>
          )}

          <div className="overflow-hidden border border-border/30 rounded-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary">
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Variant</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price (USD)</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inventory</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">SKU</th>
                  <th className="px-5 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {variants.map((variant, idx) => (
                  <tr key={variant.title} className="group/row hover:bg-secondary/40 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold text-foreground">{variant.title}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">$</span>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={variant.price ?? ''} 
                          onChange={(e) => {
                            const val = Math.max(0, parseFloat(e.target.value) || 0);
                            updateVariant(idx, 'price', val);
                          }}
                          className="h-9 pl-7 pr-2 rounded-lg bg-input border border-border font-semibold"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Input 
                        type="number" 
                        min="0"
                        step="1"
                        value={variant.inventory_quantity ?? ''} 
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          updateVariant(idx, 'inventory_quantity', val);
                        }}
                        className="h-9 w-24 rounded-lg bg-input border border-border font-semibold"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <Input 
                        value={variant.sku} 
                        onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                        placeholder="e.g. SKU-001"
                        className="h-9 w-full rounded-lg bg-input border border-border font-medium"
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(variant.title)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function generateCombinations(options: Option[]): Record<string, string>[] {
  if (options.length === 0) return [];
  
  const generate = (optionIndex: number): Record<string, string>[] => {
    if (optionIndex === options.length - 1) {
      return options[optionIndex].values.map(val => ({ [options[optionIndex].title]: val }));
    }
    
    const results: Record<string, string>[] = [];
    const rest = generate(optionIndex + 1);
    
    for (const val of options[optionIndex].values) {
      for (const combination of rest) {
        results.push({ [options[optionIndex].title]: val, ...combination });
      }
    }
    
    return results;
  };
  
  return generate(0);
}
