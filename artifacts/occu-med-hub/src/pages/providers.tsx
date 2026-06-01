import React, { useMemo, useState } from "react";
import { useListProviders } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2, MapPin, Activity, CreditCard, ChevronRight, UploadCloud, SlidersHorizontal, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const ALL = "__all__";

type BillingFilter = "all" | "has_clues" | "no_clues";
type ServicesFilter = "all" | "has_services" | "no_services";
type SortKey = "name" | "state" | "source_desc" | "source_asc";

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function lower(value: unknown): string {
  return text(value).toLowerCase();
}

function hasBillingClues(provider: any): boolean {
  return Boolean(provider?.employerAccountClues || provider?.corporateBillingClues || provider?.tpaFriendlyClues);
}

function hasServices(provider: any): boolean {
  return text(provider?.servicesOffered).length > 0;
}

function confidencePercent(sourceCount: unknown): number {
  const count = Number(sourceCount || 0);
  if (count > 2) return 90;
  if (count > 0) return 60;
  return 30;
}

export default function Providers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState(ALL);
  const [verificationFilter, setVerificationFilter] = useState(ALL);
  const [billingFilter, setBillingFilter] = useState<BillingFilter>("all");
  const [servicesFilter, setServicesFilter] = useState<ServicesFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const { data: providers, isLoading } = useListProviders();

  const providerList = Array.isArray(providers) ? providers : [];

  const states = useMemo(() => Array.from(new Set(providerList.map((p) => text(p.state).toUpperCase()).filter(Boolean))).sort(), [providerList]);
  const verificationStatuses = useMemo(() => Array.from(new Set(providerList.map((p) => text(p.verificationStatus || "Unverified")).filter(Boolean))).sort(), [providerList]);

  const filteredProviders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return providerList
      .filter((p) => {
        const billing = hasBillingClues(p);
        const services = hasServices(p);

        const matchesSearch = !query || [
          p.clinicName,
          p.city,
          p.state,
          p.clinicType,
          p.servicesOffered,
          p.verificationStatus,
          p.employerAccountClues,
          p.corporateBillingClues,
          p.tpaFriendlyClues,
        ].some((value) => lower(value).includes(query));

        const matchesState = stateFilter === ALL || text(p.state).toUpperCase() === stateFilter;
        const matchesVerification = verificationFilter === ALL || text(p.verificationStatus || "Unverified") === verificationFilter;
        const matchesBilling = billingFilter === "all" || (billingFilter === "has_clues" ? billing : !billing);
        const matchesServices = servicesFilter === "all" || (servicesFilter === "has_services" ? services : !services);

        return matchesSearch && matchesState && matchesVerification && matchesBilling && matchesServices;
      })
      .sort((a, b) => {
        if (sortKey === "state") return text(a.state).localeCompare(text(b.state)) || text(a.clinicName).localeCompare(text(b.clinicName));
        if (sortKey === "source_desc") return Number(b.sourceCount || 0) - Number(a.sourceCount || 0);
        if (sortKey === "source_asc") return Number(a.sourceCount || 0) - Number(b.sourceCount || 0);
        return text(a.clinicName).localeCompare(text(b.clinicName));
      });
  }, [providerList, searchTerm, stateFilter, verificationFilter, billingFilter, servicesFilter, sortKey]);

  const filtersActive = Boolean(searchTerm.trim()) || stateFilter !== ALL || verificationFilter !== ALL || billingFilter !== "all" || servicesFilter !== "all" || sortKey !== "name";
  const verifiedCount = providerList.filter((p) => text(p.verificationStatus) === "Verified").length;
  const billingCount = providerList.filter(hasBillingClues).length;
  const servicesCount = providerList.filter(hasServices).length;

  const clearFilters = () => {
    setSearchTerm("");
    setStateFilter(ALL);
    setVerificationFilter(ALL);
    setBillingFilter("all");
    setServicesFilter("all");
    setSortKey("name");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight glow-text text-white">Provider Database</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl leading-relaxed">Verified facilities and intelligence profiles mapped from extracted evidence. Filter by location, services, or verification status.</p>
        </div>
        <Link href="/upload" className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/25 transition-colors">
          <UploadCloud className="h-4 w-4" /> Upload Intake
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <SummaryCard label="Total Providers" value={providerList.length} />
        <SummaryCard label="Visible Results" value={filteredProviders.length} />
        <SummaryCard label="Verified" value={verifiedCount} />
        <SummaryCard label="Billing Clues" value={billingCount} />
      </div>

      <Card className="glass-panel border-white/5 bg-black/30">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-30 pointer-events-none" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary z-10" />
            <Input placeholder="Search provider, city, state, services, status, or billing clues..." className="pl-10 h-12 bg-black/60 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary focus-visible:border-primary/50 rounded-xl relative z-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <Select value={stateFilter} onValueChange={setStateFilter}><SelectTrigger className="bg-black/40 border-white/10 text-white"><SelectValue placeholder="State" /></SelectTrigger><SelectContent className="bg-popover border-white/10 text-white"><SelectItem value={ALL}>All states</SelectItem>{states.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}><SelectTrigger className="bg-black/40 border-white/10 text-white"><SelectValue placeholder="Verification" /></SelectTrigger><SelectContent className="bg-popover border-white/10 text-white"><SelectItem value={ALL}>All statuses</SelectItem>{verificationStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select>
            <Select value={billingFilter} onValueChange={(value) => setBillingFilter(value as BillingFilter)}><SelectTrigger className="bg-black/40 border-white/10 text-white"><SelectValue placeholder="Billing" /></SelectTrigger><SelectContent className="bg-popover border-white/10 text-white"><SelectItem value="all">All billing</SelectItem><SelectItem value="has_clues">Has billing clues</SelectItem><SelectItem value="no_clues">No billing clues</SelectItem></SelectContent></Select>
            <Select value={servicesFilter} onValueChange={(value) => setServicesFilter(value as ServicesFilter)}><SelectTrigger className="bg-black/40 border-white/10 text-white"><SelectValue placeholder="Services" /></SelectTrigger><SelectContent className="bg-popover border-white/10 text-white"><SelectItem value="all">All services</SelectItem><SelectItem value="has_services">Has services</SelectItem><SelectItem value="no_services">No services</SelectItem></SelectContent></Select>
            <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}><SelectTrigger className="bg-black/40 border-white/10 text-white"><SelectValue placeholder="Sort" /></SelectTrigger><SelectContent className="bg-popover border-white/10 text-white"><SelectItem value="name">Sort by name</SelectItem><SelectItem value="state">Sort by state</SelectItem><SelectItem value="source_desc">Most sources</SelectItem><SelectItem value="source_asc">Fewest sources</SelectItem></SelectContent></Select>
            <Button type="button" variant="outline" onClick={clearFilters} disabled={!filtersActive} className="border-white/10 bg-black/30 text-muted-foreground hover:text-white hover:bg-white/10 disabled:opacity-40"><SlidersHorizontal className="h-4 w-4 mr-2" /> Clear</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="glass-panel border-white/5 bg-black/40"><CardContent className="p-6 flex items-center justify-between"><div className="flex gap-4 items-center"><Skeleton className="h-12 w-12 rounded-xl bg-white/5" /><div className="space-y-2"><Skeleton className="h-5 w-48 bg-white/5" /><Skeleton className="h-4 w-32 bg-white/5" /></div></div><div className="hidden md:flex gap-4"><Skeleton className="h-8 w-24 bg-white/5 rounded-full" /><Skeleton className="h-8 w-24 bg-white/5 rounded-full" /></div></CardContent></Card>
          ))
        ) : filteredProviders.length ? (
          filteredProviders.map(provider => {
            const billing = hasBillingClues(provider);
            const services = text(provider.servicesOffered).split(",").map((s) => s.trim()).filter(Boolean);
            const confidence = confidencePercent(provider.sourceCount);
            return (
              <Link key={provider.id} href={`/providers/${provider.id}`} className="block group">
                <Card className="glass-panel border-white/5 bg-black/40 hover:bg-black/60 hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-0 flex flex-col md:flex-row md:items-center">
                    <div className="p-6 flex-1 flex items-start gap-5 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:shadow-[0_0_15px_rgba(18,173,165,0.2)] transition-all"><Building2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3"><h3 className="text-lg font-bold text-white truncate group-hover:text-primary group-hover:glow-text transition-all tracking-wide">{provider.clinicName || `Provider #${provider.id}`}</h3>{text(provider.verificationStatus) === "Verified" && <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold shadow-[inset_0_0_10px_rgba(18,173,165,0.1)]"><ShieldCheck className="h-3 w-3 mr-1" /> Verified</Badge>}</div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground"><span className="flex items-center gap-1.5 bg-white/[0.03] px-2 py-1 rounded border border-white/[0.05]"><MapPin className="h-3.5 w-3.5 text-primary/70" /> {provider.city || "Unknown City"}, {provider.state || "--"}</span><span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-primary/70" /> {provider.clinicType || "General Clinic"}</span></div>
                      </div>
                    </div>

                    <div className="p-6 border-t md:border-t-0 md:border-l border-white/[0.05] flex-1 min-w-[300px] flex flex-col justify-center bg-white/[0.01]">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {services.length ? services.slice(0, 3).map((s, i) => <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-white/[0.06] border border-white/[0.1] px-2 py-1 rounded">{s}</span>) : <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 border border-white/5 px-2 py-1 rounded">No Services Extracted</span>}
                        {services.length > 3 && <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/10 border border-white/20 px-2 py-1 rounded">+{services.length - 3} More</span>}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        {billing && <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20"><CreditCard className="h-3 w-3" /> TPA / Corp Billing</div>}
                        <div className="flex items-center gap-2 text-muted-foreground ml-auto"><span className="uppercase tracking-widest text-[9px] font-sans font-bold">Confidence</span><div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden flex"><div className="h-full bg-primary shadow-[0_0_8px_rgba(18,173,165,0.8)]" style={{ width: `${confidence}%` }} /></div></div>
                      </div>
                    </div>

                    <div className="p-6 border-t md:border-t-0 md:border-l border-white/[0.05] flex items-center justify-between md:justify-end gap-4 shrink-0 bg-white/[0.02]"><div className="flex flex-col items-center justify-center"><span className="text-2xl font-bold text-white glow-text leading-none">{provider.sourceCount || 0}</span><span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Sources</span></div><div className="h-10 w-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(18,173,165,0.5)] transition-all"><ChevronRight className="h-5 w-5 text-white group-hover:translate-x-0.5 transition-transform" /></div></div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <Card className="glass-panel border-white/5 bg-black/40">
            <CardContent className="h-72 flex flex-col items-center justify-center text-center p-6">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold text-white tracking-wide">{providerList.length ? "No Matching Providers" : "No Providers Found"}</h3>
              <p className="text-muted-foreground mt-1 text-sm max-w-md">{providerList.length ? "Try clearing your search or filters." : "Upload intake evidence to discover and create provider records."}</p>
              <div className="flex items-center gap-3 mt-5">{providerList.length && filtersActive ? <Button type="button" variant="outline" onClick={clearFilters} className="border-white/10 bg-black/30 text-muted-foreground hover:text-white hover:bg-white/10">Clear filters</Button> : null}<Link href="/upload" className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"><UploadCloud className="h-4 w-4" /> Upload Intake</Link></div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return <Card className="glass-panel border-white/5 bg-black/30"><CardContent className="p-4"><div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</div><div className="text-2xl font-bold text-white glow-text mt-1">{value}</div></CardContent></Card>;
}
