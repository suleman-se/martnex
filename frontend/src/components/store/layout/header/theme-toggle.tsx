'use client'

import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Load theme preference on mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('martnex_theme') as 'light' | 'dark' | null
    if (saved) {
      setTheme(saved)
      if (saved === 'dark') {
        document.documentElement.classList.add('dark')
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('martnex_theme', nextTheme)
    
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl border border-slate-100 shrink-0" />
  }

  return (
    <button
      onClick={toggleTheme}
      className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-150/40 hover:bg-slate-100/70 dark:bg-slate-800 dark:border-slate-700/60 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-all cursor-pointer relative overflow-hidden select-none shrink-0"
      title={theme === 'light' ? 'Switch to Midnight Dark Mode' : 'Switch to Light Mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon (Visible in dark mode, spins out on click) */}
        <Sun
          className={`h-4.5 w-4.5 transition-all duration-300 absolute ${
            theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
          }`}
        />
        
        {/* Moon Icon (Visible in light mode, spins out on click) */}
        <Moon
          className={`h-4.5 w-4.5 transition-all duration-300 absolute ${
            theme === 'light' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
          }`}
        />
      </div>
    </button>
  )
}
