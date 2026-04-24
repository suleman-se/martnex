'use client';

import { useAdminSellers } from '@/hooks/use-admin-sellers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-states/empty-state';
import {
  Search,
  Store,
  MapPin,
  Gavel,
  FileText,
  User,
  Check,
  AlertCircle,
} from 'lucide-react';

function parseAddress(addr: string) {
  try {
    return JSON.parse(addr);
  } catch {
    return { address_line_1: addr, city: '', state: '', postal_code: '' };
  }
}

export default function AdminSellersPage() {
  const {
    sellers,
    selectedSeller,
    setSelectedSellerId,
    isLoading,
    error,
    isProcessing,
    handleVerify,
    handleReject,
  } = useAdminSellers();

  const onReject = () => {
    if (!selectedSeller) return;
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    handleReject(selectedSeller.id, reason);
  };

  return (
    <div className="flex -m-10 h-screen overflow-hidden">
      {/* Left Panel: Pending Applications (40%) */}
      <section className="w-[40%] bg-background border-r border-border/10 flex flex-col h-full overflow-hidden">
        <div className="p-10 border-b border-border/5">
          <h3 className="text-2xl font-black tracking-tight text-primary">Pending Registry</h3>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-widest font-black text-[10px]">
            Reviewing {sellers.length} new merchant requests
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Table Headers */}
          <div className="grid grid-cols-12 px-10 py-4 bg-secondary text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground sticky top-0 z-10">
            <div className="col-span-12">Merchant Profile</div>
          </div>

          <div className="flex flex-col">
            {isLoading ? (
              <div className="p-10 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <EmptyState
                icon={AlertCircle}
                title="Connection Failed"
                description={error}
                className="p-10"
              />
            ) : sellers.length === 0 ? (
              <EmptyState
                icon={Check}
                title="Clean State"
                description="No pending verifications."
                className="p-10"
              />
            ) : (
              sellers.map((seller) => (
                <div
                  key={seller.id}
                  onClick={() => setSelectedSellerId(seller.id)}
                  className={`grid grid-cols-12 px-10 py-8 items-center transition-all cursor-pointer group relative ${
                    selectedSeller?.id === seller.id
                      ? 'bg-card shadow-premium'
                      : 'hover:bg-secondary/40'
                  }`}
                >
                  {selectedSeller?.id === seller.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                  )}
                  <div className="col-span-8 flex items-center gap-5">
                    <div className="w-12 h-12 bg-primary text-white flex items-center justify-center font-black text-sm rounded-xl shadow-lg shadow-primary/10">
                      {seller.business_name[0]}
                    </div>
                    <div>
                      <span className={`block text-base font-black tracking-tight transition-colors ${selectedSeller?.id === seller.id ? 'text-primary' : 'text-on-surface'}`}>
                        {seller.business_name}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Ref: {seller.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-4 text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">
                      {new Date(seller.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Right Panel: Detailed Preview (60%) */}
      <section className="w-[60%] bg-secondary/30 flex flex-col p-16 h-full overflow-y-auto">
        {selectedSeller ? (
          <div className="max-w-3xl w-full mx-auto space-y-16 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Profile Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 ring-1 ring-white/50">
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white text-4xl font-black">
                    {selectedSeller.business_name[0]}
                  </div>
                </div>
                <div>
                  <h2 className="text-5xl font-black tracking-tight text-primary leading-none mb-4">
                    {selectedSeller.business_name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-white/50 border-border/10 text-[10px] font-black uppercase tracking-widest p-1.5 h-auto">
                      Merchant Registry
                    </Badge>
                    <span className="w-1 h-1 bg-border rounded-full"></span>
                    <p className="text-muted-foreground text-sm font-bold">Pending Platform Access</p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-8 rounded-2xl space-y-1 w-56 shadow-premium border border-white/40">
                <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Registry Signal</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-black text-primary">94</p>
                  <p className="text-sm font-black text-primary opacity-30">/100</p>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest leading-none mt-0.5">Automated Clear</p>
                </div>
              </div>
            </div>

            {/* Bento Info Grid */}
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-card p-10 rounded-2xl space-y-8 shadow-premium border border-white/20">
                <div className="flex items-center gap-3 text-primary">
                  <Store className="w-5 h-5" />
                  <h4 className="font-black uppercase tracking-widest text-[11px]">Merchant Metadata</h4>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-black tracking-widest mb-1.5">Official Entity</p>
                    <p className="text-sm font-bold text-primary">{selectedSeller.business_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-black tracking-widest mb-1.5">Descriptor</p>
                    <p className="text-xs font-semibold text-primary leading-relaxed">{selectedSeller.business_description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-10 rounded-2xl space-y-8 shadow-premium border border-white/20">
                <div className="flex items-center gap-3 text-primary">
                  <Gavel className="w-5 h-5" />
                  <h4 className="font-black uppercase tracking-widest text-[11px]">Compliance & Key</h4>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-black tracking-widest mb-1.5">Fiscal Identifier (TIN/EIN)</p>
                    <p className="text-sm font-mono font-black text-primary">{selectedSeller.business_tax_id || 'NOT_PROVIDED'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-black tracking-widest mb-1.5">Registry Status</p>
                    <Badge className="bg-amber-100 text-amber-900 border-none font-bold text-[10px] uppercase tracking-widest px-2 shadow-none">
                      Awaiting Seal
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="col-span-2 bg-card p-10 rounded-2xl space-y-8 shadow-premium border border-white/20">
                <div className="flex items-center gap-3 text-primary">
                  <MapPin className="w-5 h-5" />
                  <h4 className="font-black uppercase tracking-widest text-[11px]">Physical Nexus</h4>
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <p className="text-lg font-black text-primary tracking-tight">
                      {parseAddress(selectedSeller.business_address).address_line_1}
                    </p>
                    <div className="flex gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                      <span>{parseAddress(selectedSeller.business_address).city}</span>
                      <span>•</span>
                      <span>{parseAddress(selectedSeller.business_address).state}</span>
                      <span>•</span>
                      <span>{parseAddress(selectedSeller.business_address).postal_code}</span>
                    </div>
                  </div>
                  <div className="w-64 h-32 rounded-xl bg-secondary flex items-center justify-center border border-border/10">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nexus Visual Mock</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Artifacts */}
            <div className="space-y-6">
              <h4 className="font-black uppercase tracking-widest text-[11px] text-muted-foreground px-2">Verification Artifacts</h4>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: FileText, label: 'Legal_Statutes.pdf' },
                  { icon: FileText, label: 'Inventory_Scan.xl' },
                  { icon: User, label: 'Identity_Photo.raw', dim: true },
                ].map(({ icon: Icon, label, dim }) => (
                  <div key={label} className={`bg-card p-5 rounded-xl flex items-center gap-4 border border-border/10 cursor-pointer hover:bg-secondary/20 transition-all group ${dim ? 'opacity-50' : ''}`}>
                    <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-primary">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-12 flex items-center justify-end gap-8 border-t border-border/10 pb-20">
              <button
                onClick={onReject}
                disabled={isProcessing}
                className="text-muted-foreground font-black text-[11px] uppercase tracking-[0.2em] hover:text-destructive transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              >
                Reject Application
              </button>
              <Button
                variant="premium"
                size="lg"
                onClick={() => handleVerify(selectedSeller.id)}
                disabled={isProcessing}
                className="px-16 h-16 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/20"
              >
                {isProcessing ? 'Enacting...' : 'Grant Registry Access'}
                <Check className="w-4 h-4 ml-3" />
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={AlertCircle}
            title="System Idle"
            description="Select an identity from the registry to begin verification."
            className="h-full"
          />
        )}
      </section>
    </div>
  );
}
