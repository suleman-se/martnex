'use client'

import React, { useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchInputProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onClose: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  setFocusedIndex: (idx: number) => void
}

export function SearchInput({
  searchQuery,
  setSearchQuery,
  onClose,
  onKeyDown,
  setFocusedIndex,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus search input on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative h-14 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 gap-3 shrink-0">
      <Search className="h-5 w-5 text-slate-400" />
      <input
        ref={inputRef}
        type="search"
        placeholder="Type to search premium products..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          setFocusedIndex(-1)
        }}
        onKeyDown={onKeyDown}
        className="w-full h-full text-slate-800 placeholder-slate-400 focus:outline-none text-base border-none bg-transparent"
      />
      <div className="flex items-center gap-2 shrink-0 select-none">
        <span className="hidden md:inline-block border border-slate-200 bg-slate-50 text-slate-450 text-[10px] px-1.5 py-0.5 rounded font-mono shadow-sm">
          ESC
        </span>
        <Button
        variant='ghost'
          onClick={onClose}
          className='p-0.5 h-auto border-0 bg-slate-50 text-slate-450'
          title="Close Search"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
