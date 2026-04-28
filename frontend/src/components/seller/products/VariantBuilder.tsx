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
  title: string;
  options: Record<string, string>;
  price: number;
  inventory_quantity: number;
  sku: string;
}

interface VariantBuilderProps {
  value?: { options: Option[]; variants: Variant[] };
  onChange: (value: { options: any[]; variants: any[] }) => void;
}

export function VariantBuilder({ value, onChange }: VariantBuilderProps) {
  const [options, setOptions] = useState<Option[]>(value?.options || []);
  const [variants, setVariants] = useState<Variant[]>(value?.variants || []);

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

  const notifyParent = React.useCallback((currentOptions: Option[], currentVariants: Variant[]) => {
    onChange({
      options: currentOptions.map(o => ({ title: o.title, values: o.values })),
      variants: currentVariants.map(v => ({
        title: v.title,
        prices: [{ amount: v.price, currency_code: 'usd' }],
        inventory_quantity: v.inventory_quantity,
        sku: v.sku,
        options: Object.entries(v.options).map(([title, value]) => ({ title, value }))
      }))
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Single effect: rebuild variant matrix when options change, then notify parent
  useEffect(() => {
    if (options.length === 0 || options.every(o => o.values.length === 0)) {
      setVariants([]);
      notifyParent(options, []);
      return;
    }

    const combinations = generateCombinations(options.filter(o => o.values.length > 0));

    const newVariants = combinations.map(combo => {
      const title = Object.values(combo).join(' / ');
      const existing = variants.find(v => v.title === title);
      return {
        title,
        options: combo,
        price: existing?.price ?? 0,
        inventory_quantity: existing?.inventory_quantity ?? 0,
        sku: existing?.sku ?? '',
      };
    });

    setVariants(newVariants);
    notifyParent(options, newVariants);
  // variants intentionally excluded — preserving existing row data without triggering on manual edits
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, notifyParent]);

  const updateVariant = useCallback((idx: number, field: keyof Pick<Variant, 'price' | 'inventory_quantity' | 'sku'>, value: number | string) => {
    setVariants(prev => {
      const updated = prev.map((v, i) => i === idx ? { ...v, [field]: value } : v);
      notifyParent(options, updated);
      return updated;
    });
  }, [options, notifyParent]);

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
            <div key={option.id} className="p-6 bg-slate-50 rounded-2xl relative group">
              <button 
                type="button"
                onClick={() => removeOption(option.id)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Option Name</Label>
                  <Input 
                    placeholder="e.g. Size, Color" 
                    value={option.title}
                    onChange={(e) => updateOptionTitle(option.id, e.target.value)}
                    className="bg-white border-slate-200 rounded-xl"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Values</Label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((val) => (
                      <span key={val} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600">
                        {val}
                        <button type="button" onClick={() => removeValue(option.id, val)} className="text-slate-300 hover:text-slate-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input 
                      className="bg-transparent border-none focus:outline-none text-sm font-bold placeholder:text-slate-300 min-w-[120px]"
                      placeholder="Add value + Enter"
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
          <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Variant Matrix</Label>
          <div className="overflow-hidden border border-slate-100 rounded-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Variant</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Price (USD)</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">SKU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {variants.map((variant, idx) => (
                  <tr key={variant.title}>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">{variant.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Input 
                        type="number" 
                        value={variant.price || ''} 
                        onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                        className="h-10 w-24 rounded-lg bg-slate-50/50"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input 
                        type="number" 
                        value={variant.inventory_quantity || ''} 
                        onChange={(e) => updateVariant(idx, 'inventory_quantity', Number(e.target.value))}
                        className="h-10 w-24 rounded-lg bg-slate-50/50"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input 
                        value={variant.sku} 
                        onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                        placeholder="Optional"
                        className="h-10 rounded-lg bg-slate-50/50"
                      />
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
