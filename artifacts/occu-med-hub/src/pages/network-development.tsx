import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleDot,
  FileUp,
  Globe2,
  Mail,
  MapPin,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const WORLD_GEO = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const DAY_MS = 24 * 60 * 60 * 1000;

type RangeKey = "week" | "month" | "quarter" | "all";
type Provider = {
  id: number;
  clinicName?: string | null;
  clinicType?: string | null;
  city?: string | null;
  state?: string | null;
  servicesOffered?: string | null;
  pricingNotes?: string | null;
  paymentRequirements?: string | null;
  netTermsClues?: string | null;
  verificationStatus?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type OutreachRecord = {
  id: number;
  providerId?: number | null;
  providerName?: string | null;
  providerCity?: string | null;
  providerState?: string | null;
  outreachType?: string | null;
  status?: string | null;
  sentAt?: string | null;
  receivedAt?: string | null;
  followUpDate?: string | null;
  createdAt?: string | null;
};

type ServiceCount = { name: string; count: number };

type ProcurementFilter = "all" | "new" | "verified" | "needs-review";

function safeText(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function isValidCoord(lat: unknown, lon: unknown) {
  const la = Number(lat);
  const lo = Number(lon);
  return Number.isFinite(la) && Number.isFinite(lo) && la >= -90 && la <= 90 && lo >= -180 && lo <= 180;
}

function rangeDays(range: RangeKey) {
  if (range === "week") return 7;
  if (range === "month") return 30;
  if (range === "quarter") return 90;
  return null;
}

function inRange(value: string | null | undefined, range: RangeKey) {
  if (range === "all") return true;
  if (!value) return false;
  const date = new Date(value).getTime();
  if (!Number.isFinite(date)) return false;
  const days = rangeDays(range);
  return days == null || Date.now() - date <= days * DAY_MS;
}

function isVerified(provider: Provider) {
  return safeText(provider.verificationStatus).toLowerCase() === "verified";
}

function hasPricing(provider: Provider) {
  return Boolean(safeText(provider.pricingNotes) || safeText(provider.paymentRequirements) || safeText(provider.netTermsClues));
}

function marketLabel(provider: Provider) {
  return [safeText(provider.city), safeText(provider.state)].filter(Boolean).join(", ") || "Location not set";
}

function serviceNames(value: unknown) {
  return String(value ?? "")
    .split(/[;,|\n]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1)
    .slice(0, 18);
}

function serviceBreakdown(providers: Provider[]): ServiceCount[] {
  const counts = new Map<string, number>();
  for (const provider of providers) {
    for (const raw of serviceNames(provider.servicesOffered)) {
      const key = raw.length > 42 ? `${raw.slice(0, 39)}…` : raw;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);
}

function weeklyTrend(providers: Provider[]) {
  const now = Date.now();
  const buckets = Array.from({ length: 12 }, (_, index) => ({ index, count: 0 }));
  for (const provider of providers) {
    if (!provider.createdAt) continue;
    const timestamp = new Date(provider.createdAt).getTime();
    if (!Number.isFinite(timestamp)) continue;
    const weeksAgo = Math.floor((now - timestamp) / (7 * DAY_MS));
    if (weeksAgo < 0 || weeksAgo > 11) continue;
    buckets[11 - weeksAgo].count += 1;
  }
  return buckets.map((bucket) => bucket.count);
}

function statusLabel(value: unknown) {
  const status = safeText(value, "Needs Review");
  return status.replaceAll("_", " ");
}

export default function NetworkDevelopment() {
  const [range, setRange] = useState<RangeKey>("month");
  const [providerSearch, setProviderSearch] = useState("");
  const [procurementFilter, setProcurementFilter] = useState<ProcurementFilter>("all");

  const { data: providerData, isLoading: providersLoading } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
    queryFn: () => customFetch("/api/providers"),
  });
  const { data: outreachData, isLoading: outreachLoading } = useQuery<OutreachRecord[]>({
    queryKey: ["/api/outreach"],
    queryFn: () => customFetch("/api/outreach"),
  });

  const providers = Array.isArray(providerData) ? providerData : [];
  const outreach = Array.isArray(outreachData) ? outreachData : [];

  const rangeProviders = useMemo(
    () => providers.filter((provider) => inRange(provider.createdAt, range)),
    [providers, range],
  );
  const rangeOutreach = useMemo(
    () => outreach.filter((record) => inRange(record.createdAt || record.sentAt, range)),
    [outreach, range],
  );
  const newProviderIds = useMemo(() => new Set(rangeProviders.map((provider) => provider.id)), [rangeProviders]);
  const mappedProviders = useMemo(
    () => providers.filter((provider) => isValidCoord(provider.latitude, provider.longitude)).slice(0, 1200),
    [providers],
  );
  const topServices = useMemo(() => serviceBreakdown(rangeProviders), [rangeProviders]);
  const trend = useMemo(() => weeklyTrend(providers), [providers]);

  const verifiedInRange = rangeProviders.filter(isVerified).length;
  const pricingKnown = rangeProviders.filter(hasPricing).length;
  const signedInRange = rangeOutreach.filter((record) => safeText(record.status).toLowerCase() === "signed").length;
  const activeOutreach = outreach.filter((record) => {
    const status = safeText(record.status).toLowerCase();
    return !["signed", "declined"].includes(status);
  }).length;
  const uniqueMarkets = new Set(rangeProviders.map(marketLabel).filter((market) => market !== "Location not set")).size;

  const filteredProviders = useMemo(() => {
    const query = providerSearch.trim().toLowerCase();
    return providers
      .filter((provider) => {
        if (procurementFilter === "new" && !newProviderIds.has(provider.id)) return false;
        if (procurementFilter === "verified" && !isVerified(provider)) return false;
        if (procurementFilter === "needs-review" && isVerified(provider)) return false;
        if (!query) return true;
        return [provider.clinicName, provider.city, provider.state, provider.servicesOffered, provider.verificationStatus]
          .some((value) => safeText(value).toLowerCase().includes(query));
      })
      .slice(0, 30);
  }, [providers, providerSearch, procurementFilter, newProviderIds]);

  const recentWins = useMemo(() => {
    const signed = outreach
      .filter((record) => safeText(record.status).toLowerCase() === "signed")
      .sort((a, b) => new Date(b.receivedAt || b.createdAt || 0).getTime() - new Date(a.receivedAt || a.createdAt || 0).getTime())
      .slice(0, 5);
    if (signed.length) return signed;
    return outreach
      .filter((record) => safeText(record.status).toLowerCase() === "received")
      .sort((a, b) => new Date(b.receivedAt || b.createdAt || 0).getTime() - new Date(a.receivedAt || a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [outreach]);

  const loading = providersLoading || outreachLoading;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Radar className="h-5 w-5 text-primary" />
              <div className="absolute inset-0 rounded-xl border border-primary/20 animate-ping opacity-30" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Network Development Hub</h1>
              <p className="mt-1 text-muted-foreground">Live expansion, provider procurement, and outreach momentum in one view.</p>
            </div>
          </div>
        </div>
        <div className="inline-flex self-start rounded-xl border border-white/10 bg-black/30 p-1 backdrop-blur-xl">
          {(["week", "month", "quarter", "all"] as RangeKey[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                range === item
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(18,173,165,0.28)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              }`}
            >
              {item === "quarter" ? "Quarter" : item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricCard icon={Building2} label="New Providers" value={rangeProviders.length} loading={loading} />
        <MetricCard icon={ShieldCheck} label="Verified" value={verifiedInRange} loading={loading} />
        <MetricCard icon={MapPin} label="New Markets" value={uniqueMarkets} loading={loading} />
        <MetricCard icon={Mail} label="Active Outreach" value={activeOutreach} loading={loading} />
        <MetricCard icon={CheckCircle2} label="Finalized" value={signedInRange} loading={loading} highlight />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_0.85fr]">
        <Card className="glass-panel relative overflow-hidden border-primary/20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(18,173,165,0.12),transparent_48%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
          <CardHeader className="relative z-10 flex flex-row items-center justify-between border-b border-white/[0.05] bg-black/20">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe2 className="h-5 w-5 text-primary" />
                Live Expansion Map
              </CardTitle>
              <div className="mt-1 text-xs text-muted-foreground">Existing network stays quiet; providers added in the selected period pulse.</div>
            </div>
            <div className="hidden items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:flex">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-white/45" /> Existing</span>
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(18,173,165,.9)]" /> New</span>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-0">
            <div className="relative min-h-[470px] overflow-hidden bg-black/20">
              <div className="absolute left-5 top-5 z-20 rounded-xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-xl">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Mapped Network</div>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-2xl font-black text-white">{mappedProviders.length}</span>
                  <span className="pb-1 text-xs text-primary">{mappedProviders.filter((p) => newProviderIds.has(p.id)).length} active pulses</span>
                </div>
              </div>
              <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: 145 }} width={900} height={460} className="h-full min-h-[470px] w-full">
                <Geographies geography={WORLD_GEO}>
                  {({ geographies }) => geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="rgba(255,255,255,0.035)"
                      stroke="rgba(255,255,255,0.085)"
                      strokeWidth={0.45}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: "rgba(18,173,165,0.08)" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))}
                </Geographies>
                {mappedProviders.map((provider) => {
                  const isNew = newProviderIds.has(provider.id);
                  return (
                    <Marker key={provider.id} coordinates={[Number(provider.longitude), Number(provider.latitude)]}>
                      <title>{safeText(provider.clinicName, `Provider #${provider.id}`)} — {marketLabel(provider)}</title>
                      {isNew && (
                        <motion.circle
                          r={4}
                          fill="transparent"
                          stroke="rgba(18,173,165,0.85)"
                          strokeWidth={1.2}
                          initial={{ r: 4, opacity: 0.85 }}
                          animate={{ r: [4, 14, 4], opacity: [0.85, 0, 0.85] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: (provider.id % 9) * 0.09 }}
                        />
                      )}
                      <circle
                        r={isNew ? 2.8 : 1.5}
                        fill={isNew ? "rgb(18,173,165)" : "rgba(255,255,255,0.42)"}
                        stroke={isNew ? "rgba(255,255,255,0.9)" : "transparent"}
                        strokeWidth={isNew ? 0.45 : 0}
                      />
                    </Marker>
                  );
                })}
              </ComposableMap>
              {!mappedProviders.length && !loading && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">No provider coordinates are available yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-panel overflow-hidden border-white/[0.07]">
            <CardHeader className="border-b border-white/[0.05] bg-white/[0.02]">
              <CardTitle className="flex items-center gap-2 text-base text-white"><TrendingUp className="h-4 w-4 text-primary" />12-Week Growth Pulse</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <GrowthSparkline values={trend} />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniMetric label="Pricing captured" value={pricingKnown} />
                <MiniMetric label="Outreach this period" value={rangeOutreach.length} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel overflow-hidden border-white/[0.07]">
            <CardHeader className="border-b border-white/[0.05] bg-white/[0.02]">
              <CardTitle className="flex items-center gap-2 text-base text-white"><Sparkles className="h-4 w-4 text-primary" />Service Expansion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              {topServices.length ? topServices.map((service, index) => {
                const max = Math.max(topServices[0]?.count ?? 1, 1);
                return (
                  <div key={`${service.name}-${index}`}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                      <span className="truncate text-white/85">{service.name}</span>
                      <span className="font-bold text-primary">{service.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(7, (service.count / max) * 100)}%` }}
                        transition={{ duration: 0.7, delay: index * 0.05 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary/35 to-primary shadow-[0_0_12px_rgba(18,173,165,.35)]"
                      />
                    </div>
                  </div>
                );
              }) : <div className="py-8 text-center text-sm text-muted-foreground">No service data in this period.</div>}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        <Card className="glass-panel overflow-hidden border-white/[0.07]">
          <CardHeader className="border-b border-white/[0.05] bg-black/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white"><Building2 className="h-5 w-5 text-primary" />Provider Procurement Tracker</CardTitle>
                <div className="mt-1 text-xs text-muted-foreground">Newest provider records, verification state, pricing signal, and services.</div>
              </div>
              <Link href="/providers" className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80">Open full database <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b border-white/[0.05] p-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={providerSearch} onChange={(event) => setProviderSearch(event.target.value)} placeholder="Search provider, market, or service…" className="bg-black/30 pl-9 text-white border-white/10" />
              </div>
              <div className="flex gap-1 rounded-lg border border-white/10 bg-black/30 p-1 overflow-x-auto">
                {([
                  ["all", "All"],
                  ["new", "New"],
                  ["verified", "Verified"],
                  ["needs-review", "Needs Review"],
                ] as Array<[ProcurementFilter, string]>).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setProcurementFilter(key)}
                    className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${procurementFilter === key ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {filteredProviders.map((provider) => (
                <Link key={provider.id} href={`/providers/${provider.id}`} className="group grid grid-cols-[minmax(0,1.4fr)_minmax(0,.85fr)_auto] gap-3 px-4 py-4 transition-colors hover:bg-white/[0.025] md:grid-cols-[minmax(0,1.3fr)_minmax(0,.75fr)_minmax(0,1.25fr)_auto]">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white group-hover:text-primary transition-colors">{safeText(provider.clinicName, `Provider #${provider.id}`)}</div>
                    <div className="mt-1 truncate text-[11px] text-muted-foreground">{safeText(provider.clinicType, "Provider")}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs text-white/80">{marketLabel(provider)}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : "No date"}</div>
                  </div>
                  <div className="hidden min-w-0 md:block">
                    <div className="truncate text-xs text-white/75">{serviceNames(provider.servicesOffered).slice(0, 2).join(" • ") || "Services not captured"}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{hasPricing(provider) ? "Pricing signal captured" : "Pricing not captured"}</div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {newProviderIds.has(provider.id) && <Badge variant="outline" className="hidden border-primary/25 bg-primary/10 text-[9px] uppercase text-primary sm:inline-flex">New</Badge>}
                    <Badge variant="outline" className={isVerified(provider) ? "border-lime-500/20 bg-lime-500/10 text-[9px] uppercase text-lime-300" : "border-white/10 bg-white/[0.03] text-[9px] uppercase text-muted-foreground"}>{statusLabel(provider.verificationStatus)}</Badge>
                  </div>
                </Link>
              ))}
              {!filteredProviders.length && <div className="p-10 text-center text-sm text-muted-foreground">No providers match this view.</div>}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-panel overflow-hidden border-primary/15">
            <CardHeader className="border-b border-white/[0.05] bg-primary/[0.025]">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base text-white"><Activity className="h-4 w-4 text-primary" />Outreach Momentum</CardTitle>
                <Link href="/outreach" className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80">Open tracker</Link>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <OutreachPipeline records={outreach} />
              <div className="mt-5 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Latest movement</div>
                {recentWins.length ? recentWins.map((record) => (
                  <div key={record.id} className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-black/20 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"><CircleDot className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-white">{safeText(record.providerName, "Provider outreach")}</div>
                      <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{[safeText(record.providerCity), safeText(record.providerState)].filter(Boolean).join(", ") || safeText(record.outreachType, "Outreach")}</div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary">{statusLabel(record.status)}</span>
                  </div>
                )) : <div className="rounded-lg border border-dashed border-white/10 p-5 text-center text-xs text-muted-foreground">No finalized or received outreach yet.</div>}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/[0.07]">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10"><FileUp className="h-5 w-5 text-primary" /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white">Document Intelligence</div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">The existing intake pipeline already accepts PDF, Excel, CSV, images, and text. Use it to feed provider evidence into this hub instead of creating a second upload system.</p>
                  <Link href="/upload"><Button variant="outline" size="sm" className="mt-4 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"><FileUp className="mr-2 h-4 w-4" />Drop & Process Documents</Button></Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, loading, highlight }: { icon: React.ElementType; label: string; value: number; loading: boolean; highlight?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className={`glass-panel relative overflow-hidden rounded-xl border p-4 ${highlight ? "border-primary/25" : "border-white/[0.06]"}`}>
        {highlight && <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />}
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
            <div className={`mt-1 text-2xl font-black ${highlight ? "text-primary" : "text-white"}`}>{loading ? "—" : value.toLocaleString()}</div>
          </div>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${highlight ? "border-primary/25 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.035] text-white/65"}`}><Icon className="h-4 w-4" /></div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-white/[0.06] bg-black/20 p-3"><div className="text-xl font-black text-white">{value}</div><div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div></div>;
}

function GrowthSparkline({ values }: { values: number[] }) {
  const width = 560;
  const height = 150;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => ({
    x: values.length === 1 ? width / 2 : (index / Math.max(values.length - 1, 1)) * width,
    y: height - 18 - (value / max) * (height - 36),
  }));
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const area = points.length ? `${path} L${width},${height} L0,${height} Z` : "";
  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full overflow-visible" role="img" aria-label="Providers added over the last twelve weeks">
        <defs>
          <linearGradient id="network-growth-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(18,173,165)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="rgb(18,173,165)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => <line key={ratio} x1="0" x2={width} y1={height * ratio} y2={height * ratio} stroke="rgba(255,255,255,0.055)" strokeWidth="1" />)}
        {area && <path d={area} fill="url(#network-growth-fill)" />}
        {path && <motion.path d={path} fill="none" stroke="rgb(18,173,165)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: "easeOut" }} />}
        {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={2.5} fill="rgb(18,173,165)" stroke="rgba(255,255,255,.8)" strokeWidth="0.8" />)}
      </svg>
      <div className="-mt-1 flex justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground"><span>12 weeks ago</span><span>Now</span></div>
    </div>
  );
}

function OutreachPipeline({ records }: { records: OutreachRecord[] }) {
  const stages = [
    { key: "draft", label: "Draft", icon: CircleDot },
    { key: "sent", label: "Sent", icon: Mail },
    { key: "received", label: "Received", icon: Activity },
    { key: "signed", label: "Signed", icon: CheckCircle2 },
  ];
  const counts = stages.map((stage) => records.filter((record) => safeText(record.status).toLowerCase() === stage.key).length);
  const max = Math.max(...counts, 1);
  return (
    <div className="grid grid-cols-4 gap-2">
      {stages.map((stage, index) => {
        const Icon = stage.icon;
        const count = counts[index];
        return (
          <div key={stage.key} className="relative rounded-lg border border-white/[0.06] bg-black/20 p-3 text-center">
            {index < stages.length - 1 && <div className="pointer-events-none absolute left-[68%] top-[25px] z-0 hidden h-px w-[65%] bg-gradient-to-r from-primary/30 to-white/[0.04] sm:block" />}
            <div className="relative z-10 mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-primary/20 bg-[#090b0d] text-primary"><Icon className="h-3.5 w-3.5" /></div>
            <div className="mt-2 text-lg font-black text-white">{count}</div>
            <div className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">{stage.label}</div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.04]"><motion.div initial={{ width: 0 }} animate={{ width: `${(count / max) * 100}%` }} className="h-full rounded-full bg-primary/70" /></div>
          </div>
        );
      })}
    </div>
  );
}
