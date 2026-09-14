import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  FileDown,
  Globe2,
  MapPin,
  Share2,
  Sparkles,
  Stethoscope,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const DAY_MS = 86_400_000;
type RangeKey = "month" | "quarter" | "year" | "all";

type ProcurementRecord = {
  id: number;
  providerId?: number | null;
  providerName: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  serviceCategory?: string | null;
  stage: string;
  activatedAt?: string | null;
  createdAt?: string | null;
};

type Provider = {
  id: number;
  clinicName?: string | null;
  city?: string | null;
  state?: string | null;
  servicesOffered?: string | null;
  verificationStatus?: string | null;
};

async function api<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

function inRange(value: string | null | undefined, range: RangeKey) {
  if (range === "all") return true;
  if (!value) return false;
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return false;
  const days = range === "month" ? 30 : range === "quarter" ? 90 : 365;
  return Date.now() - time <= days * DAY_MS;
}

function rangeTitle(range: RangeKey) {
  if (range === "month") return "Last 30 Days";
  if (range === "quarter") return "Last 90 Days";
  if (range === "year") return "Last 12 Months";
  return "All Time";
}

function locationLabel(record: ProcurementRecord) {
  return [record.city, record.state, record.country].filter(Boolean).join(", ") || "Location not set";
}

function splitServices(value: unknown) {
  return String(value ?? "")
    .split(/[;,|\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ExpansionBrief() {
  const { toast } = useToast();
  const [range, setRange] = useState<RangeKey>("quarter");

  const { data: procurementData = [], isLoading: procurementLoading } = useQuery<ProcurementRecord[]>({
    queryKey: ["/api/procurement"],
    queryFn: () => api<ProcurementRecord[]>("/api/procurement"),
  });
  const { data: providerData = [], isLoading: providersLoading } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
    queryFn: () => api<Provider[]>("/api/providers"),
  });

  const procurement = Array.isArray(procurementData) ? procurementData : [];
  const providers = Array.isArray(providerData) ? providerData : [];
  const activated = useMemo(
    () => procurement
      .filter((record) => record.stage === "Activated / Live")
      .filter((record) => inRange(record.activatedAt, range))
      .sort((a, b) => new Date(b.activatedAt || 0).getTime() - new Date(a.activatedAt || 0).getTime()),
    [procurement, range],
  );

  const markets = useMemo(() => {
    const counts = new Map<string, number>();
    activated.forEach((record) => {
      const key = locationLabel(record);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [activated]);

  const serviceCounts = useMemo(() => {
    const counts = new Map<string, number>();
    activated.forEach((record) => splitServices(record.serviceCategory).forEach((service) => counts.set(service, (counts.get(service) || 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [activated]);

  const countries = useMemo(() => {
    const counts = new Map<string, number>();
    activated.forEach((record) => {
      const key = record.country || record.state || "Unspecified";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [activated]);

  const linkedProviders = new Set(activated.map((record) => record.providerId).filter(Boolean)).size;
  const pipelineOpen = procurement.filter((record) => !["Activated / Live", "Lost / Not Viable"].includes(record.stage)).length;
  const loading = procurementLoading || providersLoading;

  const summaryText = useMemo(() => {
    const marketList = markets.slice(0, 8).map(([name]) => name).join("; ");
    const serviceList = serviceCounts.slice(0, 8).map(([name]) => name).join(", ");
    return `Occu-Med Network Expansion Brief — ${rangeTitle(range)}\nActivated provider relationships: ${activated.length}\nNew/active markets: ${markets.length}\nOpen procurement pipeline: ${pipelineOpen}\nMarkets: ${marketList || "None yet"}\nServices: ${serviceList || "None yet"}`;
  }, [activated.length, markets, pipelineOpen, range, serviceCounts]);

  const copySummary = async () => {
    await navigator.clipboard.writeText(summaryText);
    toast({ title: "Expansion summary copied" });
  };

  return (
    <div className="space-y-6 pb-12 print:space-y-4">
      <style>{`@media print { aside, .print-hide { display:none !important; } main { overflow:visible !important; } body { background:#080a0c !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; } .print-card { break-inside:avoid; } }`}</style>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10"><Share2 className="h-5 w-5 text-primary" /></div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Network Expansion Brief</h1>
              <p className="mt-1 text-muted-foreground">Live, presentation-ready coverage growth from activated procurement records.</p>
            </div>
          </div>
        </div>
        <div className="print-hide flex flex-wrap gap-2">
          <div className="inline-flex rounded-xl border border-white/10 bg-black/30 p-1">
            {(["month", "quarter", "year", "all"] as RangeKey[]).map((item) => <button key={item} type="button" onClick={() => setRange(item)} className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider ${range === item ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}>{item}</button>)}
          </div>
          <Button variant="outline" onClick={copySummary} className="border-white/10"><Clipboard className="mr-2 h-4 w-4" />Copy Summary</Button>
          <Button onClick={() => window.print()} className="bg-primary text-primary-foreground"><FileDown className="mr-2 h-4 w-4" />Print / Save PDF</Button>
        </div>
      </div>

      <Card className="print-card glass-panel overflow-hidden border-primary/20 shadow-[0_20px_80px_rgba(0,0,0,.35)]">
        <CardContent className="relative p-7 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(18,173,165,.14),transparent_36%),radial-gradient(circle_at_92%_100%,rgba(230,180,0,.08),transparent_34%)]" />
          <div className="relative grid gap-8 xl:grid-cols-[1.3fr_.7fr] xl:items-end">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.24em] text-primary">Occu-Med Network Development</div>
              <div className="mt-3 text-4xl font-black tracking-tight text-white md:text-6xl">{activated.length ? `${activated.length} provider${activated.length === 1 ? "" : "s"} activated` : "Expansion pipeline active"}</div>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65">{activated.length ? `${markets.length} market${markets.length === 1 ? "" : "s"} added or expanded during ${rangeTitle(range).toLowerCase()}, backed by live procurement activation records.` : `No provider activations are recorded for ${rangeTitle(range).toLowerCase()} yet. Open procurement remains visible below.`}</p>
              <div className="mt-6 flex flex-wrap gap-2">{markets.slice(0, 8).map(([market]) => <Badge key={market} variant="outline" className="border-primary/20 bg-primary/[.06] text-primary"><MapPin className="mr-1 h-3 w-3" />{market}</Badge>)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <HeroMetric label="Activated" value={activated.length} icon={CheckCircle2} />
              <HeroMetric label="Markets" value={markets.length} icon={Globe2} />
              <HeroMetric label="Open Pipeline" value={pipelineOpen} icon={Target} />
              <HeroMetric label="Linked Providers" value={linkedProviders} icon={Building2} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="print-card glass-panel border-white/[.07]">
          <CardHeader className="border-b border-white/[.05]"><CardTitle className="flex items-center gap-2 text-white"><CalendarDays className="h-5 w-5 text-primary" />Recent Activations</CardTitle></CardHeader>
          <CardContent className="p-0">
            {activated.length ? activated.slice(0, 12).map((record, index) => <motion.div key={record.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .025 }} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/[.05] px-5 py-4 last:border-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary"><CheckCircle2 className="h-4 w-4" /></div>
              <div className="min-w-0"><div className="truncate text-sm font-semibold text-white">{record.providerName}</div><div className="mt-1 truncate text-[11px] text-muted-foreground">{locationLabel(record)}{record.serviceCategory ? ` · ${record.serviceCategory}` : ""}</div></div>
              <div className="text-right text-[10px] text-muted-foreground">{record.activatedAt ? new Date(record.activatedAt).toLocaleDateString() : "Activated"}</div>
            </motion.div>) : <div className="p-10 text-center text-sm text-muted-foreground">No activations in this period.</div>}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="print-card glass-panel border-white/[.07]">
            <CardHeader className="border-b border-white/[.05]"><CardTitle className="flex items-center gap-2 text-white"><Stethoscope className="h-5 w-5 text-primary" />Service Expansion</CardTitle></CardHeader>
            <CardContent className="space-y-3 p-5">
              {serviceCounts.length ? serviceCounts.map(([service, count], index) => {
                const max = Math.max(serviceCounts[0]?.[1] || 1, 1);
                return <div key={service}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="truncate text-white/80">{service}</span><span className="font-bold text-primary">{count}</span></div><div className="h-1.5 rounded-full bg-white/[.05]"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(8, (count / max) * 100)}%` }} transition={{ duration: .5, delay: index * .03 }} className="h-full rounded-full bg-primary" /></div></div>;
              }) : <div className="py-6 text-center text-sm text-muted-foreground">No activated service data yet.</div>}
            </CardContent>
          </Card>

          <Card className="print-card glass-panel border-white/[.07]">
            <CardHeader className="border-b border-white/[.05]"><CardTitle className="flex items-center gap-2 text-white"><Globe2 className="h-5 w-5 text-primary" />Geographic Footprint</CardTitle></CardHeader>
            <CardContent className="p-5"><div className="grid grid-cols-2 gap-2">{countries.slice(0, 12).map(([name, count]) => <div key={name} className="rounded-lg border border-white/[.06] bg-black/20 p-3"><div className="truncate text-xs font-semibold text-white">{name}</div><div className="mt-1 text-lg font-black text-primary">{count}</div></div>)}</div>{!countries.length && <div className="py-6 text-center text-sm text-muted-foreground">No geographic activation data yet.</div>}</CardContent>
          </Card>
        </div>
      </div>

      <Card className="print-hide glass-panel border-primary/15">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10"><Sparkles className="h-5 w-5 text-primary" /></div><div><div className="font-semibold text-white">Keep the brief live</div><p className="mt-1 text-xs text-muted-foreground">Move procurement records to Activated / Live and this report updates automatically.</p></div></div><div className="flex gap-2"><Link href="/procurement"><Button variant="outline" className="border-primary/20 text-primary">Procurement Command <ArrowRight className="ml-2 h-4 w-4" /></Button></Link><Link href="/network-development"><Button variant="outline" className="border-white/10">Network Hub</Button></Link></div></CardContent>
      </Card>

      {loading && <div className="text-center text-xs text-muted-foreground">Loading live expansion data…</div>}
      <div className="hidden print:block text-[9px] text-white/35">Generated from the live Occu-Med Network Development Hub · {new Date().toLocaleString()} · Total provider records: {providers.length}</div>
    </div>
  );
}

function HeroMetric({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return <div className="rounded-xl border border-white/[.08] bg-black/25 p-4"><div className="flex items-center justify-between gap-2"><div><div className="text-[9px] font-black uppercase tracking-[.14em] text-muted-foreground">{label}</div><div className="mt-1 text-2xl font-black text-white">{value}</div></div><Icon className="h-4 w-4 text-primary" /></div></div>;
}
