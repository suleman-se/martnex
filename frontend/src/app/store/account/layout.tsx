'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  ShoppingBag,
  MapPin,
  Settings,
  LogOut,
  LayoutDashboard
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { FullPageSpinner } from '@/components/shared/loading/full-page-spinner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AccountNavProps {
  activePath: string
  onSignOut: () => void
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, _hasHydrated, logout, user } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !_hasHydrated) return
    if (!isAuthenticated) {
      router.push('/store')
    }
  }, [mounted, _hasHydrated, isAuthenticated, router])

  if (!mounted || !_hasHydrated) {
    return <FullPageSpinner />
  }

  if (!isAuthenticated) {
    return <FullPageSpinner />
  }

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/store/account',
      icon: LayoutDashboard,
    },
    {
      label: 'Order History',
      href: '/store/account/orders',
      icon: ShoppingBag,
    },
    {
      label: 'Saved Addresses',
      href: '/store/account/addresses',
      icon: MapPin,
    },
    {
      label: 'Profile Settings',
      href: '/store/account/profile',
      icon: Settings,
    },
  ]

  const handleSignOut = async () => {
    await logout()
    router.push('/store')
  }

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-500 min-h-[70vh] flex flex-col md:flex-row gap-8 py-4">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white/50 backdrop-blur-md border border-slate-100 rounded-3xl p-6 h-fit shadow-sm space-y-6">
        <div className="flex items-center gap-3 px-2 pb-4 border-b border-slate-100">
          <div className="h-10 w-10 bg-slate-900 px-2.5 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 truncate max-w-[150px]">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : 'Buyer Account'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate max-w-[150px]">
              {user?.email || 'Martnex Hub'}
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0 text-rose-550 dark:text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Swipeable Tabs Navigation - Mobile */}
      <div className="block md:hidden overflow-x-auto scrollbar-none border border-slate-100 bg-white/50 backdrop-blur-md rounded-2xl p-2 shrink-0 mb-2">
        <nav className="flex items-center gap-1.5 min-w-max">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0 text-rose-550 dark:text-rose-400" />
            <span>Out</span>
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <main className="flex-1 bg-white/40 backdrop-blur-sm border border-slate-100/80 rounded-3xl p-6 md:p-8 min-h-[500px] shadow-sm flex flex-col justify-start">
        {children}
      </main>
    </div>
  )
}
