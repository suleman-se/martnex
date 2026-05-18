'use client'

import { Banknote, RefreshCw, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'
import {
  useSellerPayouts,
  formatPayoutStatus,
  type SellerPayout,
  type PayoutStatus,
} from '@/hooks/use-seller-payouts'
import { formatCurrency } from '@/hooks/use-seller-orders'

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PayoutStatus }) {
  const label = formatPayoutStatus(status)
  const colorMap: Record<string, string> = {
    Requested:  'bg-amber-50 text-amber-600',
    'In Review': 'bg-purple-50 text-purple-600',
    Approved:   'bg-blue-50 text-primary',
    Processing: 'bg-indigo-50 text-indigo-600',
    Completed:  'bg-emerald-50 text-emerald-600',
    Failed:     'bg-rose-50 text-rose-600',
    Cancelled:  'bg-slate-50 text-slate-400',
  }
  return (
    <span className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${colorMap[label] ?? 'bg-slate-50 text-slate-500'}`}>
      {label}
    </span>
  )
}

// ─── Table skeleton ────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="divide-y divide-slate-50">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-8 py-6 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-32" />
          <div className="h-4 bg-slate-100 rounded w-24" />
          <div className="h-4 bg-slate-100 rounded w-20" />
          <div className="h-6 bg-slate-100 rounded-full w-20 ml-auto" />
        </div>
      ))}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SellerPayoutsPage() {
  const mounted = useMounted()
  const { payouts, stats, isLoading, refetch } = useSellerPayouts()

  if (!mounted) return null

  const pending = payouts.filter((p) =>
    ['requested', 'pending_review'].includes(p.status)
  ).length
  const completed = payouts.filter((p) => p.status === 'completed').length
  const currencyCode = payouts[0]?.currency_code ?? 'usd'

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900">
            Payouts
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Track your earnings withdrawals and payout request history.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-3 bg-white shadow-sm rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Banknote className="w-4.5 h-4.5 text-primary" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Requested</p>
          </div>
          <p className="text-4xl font-heading font-black text-slate-900">
            {isLoading ? (
              <span className="inline-block w-28 h-9 bg-slate-100 rounded animate-pulse" />
            ) : (
              formatCurrency(stats.totalRequested, currencyCode)
            )}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Review</p>
          </div>
          <p className="text-4xl font-heading font-black text-slate-900">
            {isLoading ? <span className="inline-block w-10 h-9 bg-slate-100 rounded animate-pulse" /> : pending}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Completed</p>
          </div>
          <p className="text-4xl font-heading font-black text-slate-900">
            {isLoading ? <span className="inline-block w-10 h-9 bg-slate-100 rounded animate-pulse" /> : completed}
          </p>
        </div>
      </div>

      {/* Payouts table */}
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-premium transition-all duration-700">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.15em]">
            Payout History
          </h2>
          <span className="text-xs font-bold text-slate-400">
            {isLoading ? '…' : `${stats.totalCount} total`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Commissions</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4}><TableSkeleton /></td>
                </tr>
              ) : (
                payouts.map((payout: SellerPayout) => (
                  <tr key={payout.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                      {new Date(payout.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-8 py-6 font-heading font-black text-slate-900 tracking-tight">
                      {formatCurrency(payout.amount, payout.currency_code)}
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                      {Array.isArray(payout.commission_ids) ? payout.commission_ids.length : 0} commission{payout.commission_ids?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={payout.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && payouts.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center px-6">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8">
              <AlertCircle className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-3xl font-heading font-black text-slate-900">No payouts yet</h3>
            <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium leading-relaxed">
              Payout requests will appear here once you have approved commissions from completed orders.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
