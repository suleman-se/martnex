'use client'

import { useQuery } from '@tanstack/react-query'
import { buildStoreHeaders, medusa } from '@/lib/medusa-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoreRegion {
  id: string
  name: string
  currency_code: string
  countries: { iso_2: string; display_name: string }[]
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function fetchRegions(): Promise<StoreRegion[]> {
  const headers = await buildStoreHeaders()
  const data = await medusa.store.region.list({}, headers)
  return (data.regions as unknown as StoreRegion[]) ?? []
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRegions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['store-regions'],
    queryFn: fetchRegions,
    staleTime: 5 * 60_000,
  })

  return {
    regions: data ?? [],
    defaultRegion: data?.[0] ?? null,
    isLoading,
    error,
  }
}
