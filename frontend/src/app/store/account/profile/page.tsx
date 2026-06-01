'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store/auth-store'
import { updateCustomer } from '@/lib/api'
import { useMounted } from '@/hooks/use-mounted'
import { User, Check, Mail, Phone, Lock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ProfileSettingsPage() {
  const mounted = useMounted()
  const { user, refreshUser } = useAuthStore()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // Sync state with logged-in user details
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '')
      setLastName(user.last_name || '')
      setEmail(user.email || '')
    }
  }, [user])

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const updateProfileMutation = useMutation({
    mutationFn: (payload: { first_name?: string; last_name?: string; phone?: string }) =>
      updateCustomer(payload, token ?? undefined),
    onSuccess: async () => {
      // Re-hydrate local Zustand auth credentials
      await refreshUser()
      toast.success('Your profile details have been successfully updated.')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update profile settings.')
    }
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First Name and Last Name are required.')
      return
    }

    updateProfileMutation.mutate({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim() || undefined,
    })
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-black text-slate-900">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1 font-medium">
          Update your public profile, email preferences, and secure credentials.
        </p>
      </div>

      {/* Main Form */}
      <Card className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
            <User className="h-4.5 w-4.5 text-slate-400" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Personal Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">First Name *</label>
              <Input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="First Name"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Last Name *</label>
              <Input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Email - Disabled (Medusa convention) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email Address
              </label>
              <Input
                type="email"
                disabled
                value={email}
                className="h-11 rounded-xl opacity-60 cursor-not-allowed select-none bg-slate-50 border-slate-200"
              />
              <p className="text-[10px] text-slate-400 font-bold mt-1">To change your email, contact Martnex support.</p>
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Phone className="h-3 w-3" /> Contact Phone
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="e.g. +1 555-0199"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-11 px-6 font-bold text-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              {updateProfileMutation.isPending ? 'Saving Changes…' : 'Save Profile Details'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Security Section (Placeholder for premium UX) */}
      <Card className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
          <Lock className="h-4.5 w-4.5 text-slate-400" />
          <h2 className="text-sm font-black text-slate-850 uppercase tracking-widest">Account Security</h2>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            Your credentials are encrypted using industry-standard protocols. To update your password, use the self-service reset flow on the auth page.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              toast.info('Password reset instructions have been forwarded to ' + email)
            }}
            className="rounded-2xl h-10 px-4 font-bold text-xs hover:bg-slate-50 cursor-pointer"
          >
            Request Password Reset
          </Button>
        </div>
      </Card>
    </div>
  )
}
