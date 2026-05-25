'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface StorePaginationProps {
  totalCount: number
  pageSize: number
  offset: number
}

export function StorePagination({ totalCount, pageSize, offset }: StorePaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] = useTransition()

  const totalPages = Math.ceil(totalCount / pageSize)
  const currentPage = Math.floor(offset / pageSize) + 1

  if (totalPages <= 1) return null

  function handlePageChange(newOffset: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (newOffset > 0) {
      params.set('offset', String(newOffset))
    } else {
      params.delete('offset')
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button
        onClick={() => handlePageChange(Math.max(0, offset - pageSize))}
        disabled={currentPage === 1 || isPending}
        variant="outline"
        className="rounded-xl border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50"
      >
        Previous
      </Button>
      <span className="text-sm font-medium text-slate-500 px-2">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => handlePageChange(offset + pageSize)}
        disabled={currentPage >= totalPages || isPending}
        variant="outline"
        className="rounded-xl border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50"
      >
        Next
      </Button>
    </div>
  )
}
