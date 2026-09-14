import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileUp,
  Globe2,
  Mail,
  MapPin,
  Radar,
  Target,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NetworkVfxMap } from "@/components/network-development/vfx-map";

const DAY_MS = 86_400_000;
const STAGES = [
  "Need Identified",
  "Prospecting",
  "In Contact",
  "Evaluating",
  "Pricing Secured",
  "Agreement Pending",
  "Final Review",
  "Activated / Live",
  "Lost / Not Viable",
] as const;

type RangeKey = "week" | "month" | "quarter" | "all";
type Stage = (typeof STAGES)[number];

type Provider = {
  id: number;
  clinicName?: string | null;
  clinicType?: string | null;
  city?: string | null;
  state?: string | null;
  servicesOffered?: string | null;
  verificationStatus?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string | null;
};

type OutreachRecord = {
  id: number;
  providerId?: number | null;
  providerName?: string | null;
  status?: string | null;
  followUpDate?: string | null;
  createdAt?: string | null;
};

type ProcurementRecord = {
  id: number;
  providerId?: number | null;
  providerName: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  serviceCategory?: string | null;
  stage: Stage;
  owner?: string | null;
  waitingOn?: string | null;
  nextAction?: string | null;
  followUpDate?: string | null;
  activatedAt?: string | null;
  lostAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ProcurementSummary = { byStage: Record<string, number>; overdue: number };

async function api<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

function inRange(value: string | null | undefined, range: RangeKey) {
  if (range === "all") return true;
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return false;
  const days = range === "week" ? 7 : range === "month" ? 30 : 90;
  return Date.now() - timestamp <= days * DAY_MS;
}

function rangeLabel(range: RangeKey) {
  if (range === "week") return "this week";
  if (range === "month") return "this month";
  if (range === "quarter") return "this quarter";
  return "all time";
}

function place(record: ProcurementRecord) {
  return [record.city, record.state, record.country].filter(Boolean).join(", ") || "Location not set";
}

function dueLabel(value: string | null | undefined) {
  if (!value) return "No follow-up date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No follow-up date" : date.toLocaleDateString();
}

function serviceNames(value: unknown) {
  return String(value ?? "")
    .split(/[;,|\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export default function NetworkDevelopmentLive() {
  const [range, setRange] = useState<RangeKey>("month");

  const { data: providerData = [], isLoading: providersLoading } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
    queryFn: () => api<Provider[]>("/api/providers"),
  });
  const { data: outreachData = [], isLoading: outreachLoading } = useQuery<OutreachRecord[]>({
    queryKey: ["/api/outreach"],
    queryFn: () => api<OutreachRecord[]>("/api/outreach"),
  });
  const { data: procurementData = [], isLoading: procurementLoading } = useQuery<ProcurementRecord[]>({
    queryKey: ["/api/procurement"],
    queryFn: () => api<ProcurementRecord[]>("/api/procurement"),
  });
  const { data: summary } = useQuery<ProcurementSummary>({
    queryKey: ["/api/procurement/summary"],
    queryFn: () => api<ProcurementSummary>("/api/procurement/summary"),
  });

  const providers = Array.isArray(providerData) ? providerData : [];
  const outreach = Array.isArray(outreachData) ? outreachData : [];
  const procurement = Array.isArray(procurementData) ? procurementData : [];
  const loading = providersLoading || outreachLoading || procurementLoading;

  const periodProcurement = useMemo(
    () => procurement.filter((record) => inRange(record.createdAt, range) || inRange(record.activatedAt, range)),
    [procurement, range],
  );

  const activated = procurement.filter((record) => record.stage === "Activated / Live");
  const activatedInRange = activated.filter((record) => inRange(record.activatedAt, range));
  const activePipeline = procurement.filter((record) => !["Activated / Live", "Lost / Not Viable"].includes(record.stage));
  const pricingPlus = procurement.filter((record) => ["Pricing Secured", "Agreement Pending", "Final Review", "Activated / Live"].includes(record.stage));
  const activeOutreach = outreach.filter((record) => !["signed", "declined"].includes(String(record.status || "").toLowerCase()));

  const activatedProviderIds = useMemo(
    () => new Set(activatedInRange.map((record) => record.providerId).filter((id): id is number => Boolean(id))),
    [activatedInRange],
  );

  const newMarkets = new Set(activatedInRange.map(place).filter((value) => value !== "Location not set")).size;

  const urgent = useMemo(() => procurement
    .filter((record) => !["Activated / Live", "Lost / Not Viable"].includes(record.stage))
    .filter((record) => record.followUpDate && new Date(record.followUpDate).getTime() < Date.now())
    .sort((a, b) => new Date(a.followUpDate || 0).getTime() - new Date(b.followUpDate || 0).getTime())
    .slice(0, 6), [procurement]);

  const stageCounts = useMemo(() => {
    const counts = Object.fromEntries(STAGES.map((stage) => [stage, 0])) as Record<Stage, number>;
    procurement.forEach((record) => { if (record.stage in counts) counts[record.stage] += 1; });
    return counts;
  }, [procurement]);

  const serviceCounts = useMemo(() => {
    const counts = new Map<string, number>();
    activated.forEach((record) => {
      serviceNames(record.serviceCategory).forEach((service) => counts.set(service, (counts.get(service) || 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [activated]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 shadow-[0_0_28px_rgba(18,173,165,.13)]">
            <Radar className="h-5 w-5 text-primary" />
            <div className="absolute inset-0 animate-ping rounded-xl border border-primary/20 opacity-20" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Network Development Hub</h1>
            <p className="mt-1 text-muted-foreground">Live procurement, outreach, activation, and geographic expansion from the operating pipeline.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/procurement"><Button className="bg-primary text-primary-foreground hover:bg-primary/90"><Target className="mr-2 h-4 w-4" />Procurement Command</Button></Link>
          <div className="inline-flex rounded-xl border border-white/10 bg-black/30 p-1 backdrop-blur-xl">
            {(["week", "month", "quarter", "all"] as RangeKey[]).map((item) => (
              <button key={item} type="button" onClick={() => setRange(item)} className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider ${range === item ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}>{item}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric icon={Workflow} label="Active Pipeline" value={activePipeline.length} loading={loading} />
        <Metric icon={CircleDollarSign} label="Pricing+" value={pricingPlus.length} loading={loading} />
        <Metric icon={CheckCircle2} label="Activated" value={activatedInRange.length} loading={loading} highlight />
        <Metric icon={MapPin} label="New Markets" value={newMarkets} loading={loading} />
        <Metric icon={Clock3} label="Overdue" value={summary?.overdue ?? urgent.length} loading={loading} danger={(summary?.overdue ?? urgent.length) > 0} />
      </div>

      <Card className="glass-panel relative overflow-hidden border-primary/20 shadow-[0_20px_80px_rgba(0,0,0,.35)]">
        <CardHeader className="relative z-10 flex flex-row items-center justify-between border-b border-white/[0.05] bg-black/25">
          <div>
            <CardTitle className="flex items-center gap-2 text-white"><Globe2 className="h-5 w-5 text-primary" />Network Expansion Theater</CardTitle>
            <div className="mt-1 text-xs text-muted-foreground">Activated providers are the expansion signal. Procurement targets stay operational until they go live.</div>
          </div>
          <Badge variant="outline" className="hidden border-primary/25 bg-primary/10 text-primary md:inline-flex">{rangeLabel(range)}</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <NetworkVfxMap providers={providers} activeProviderIds={activatedProviderIds} rangeLabel={rangeLabel(range)} loading={loading} />
        </CardContent>
      </Card>

      <Card className="glass-panel overflow-hidden border-white/[0.07]">
        <CardHeader className="border-b border-white/[0.05] bg-white/[0.02]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-white"><Workflow className="h-5 w-5 text-primary" />Procurement Flow</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">The actual persisted pipeline — not inferred from provider verification status.</p>
            </div>
            <Link href="/procurement" className="text-xs font-bold text-primary hover:text-primary/80">Open board <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-9">
            {STAGES.map((stage, index) => (
              <motion.div key={stage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .03 }} className={`relative rounded-xl border p-3 ${stage === "Activated / Live" ? "border-lime-500/25 bg-lime-500/[0.06]" : stage === "Lost / Not Viable" ? "border-red-500/20 bg-red-500/[0.04]" : "border-white/[0.07] bg-black/25"}`}>
                <div className="text-2xl font-black text-white">{stageCounts[stage]}</div>
                <div className="mt-1 text-[9px] font-black uppercase tracking-[.12em] text-muted-foreground">{stage}</div>
                {index < STAGES.length - 1 && <div className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-2 bg-primary/30 xl:block" />}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="glass-panel overflow-hidden border-white/[0.07]">
          <CardHeader className="border-b border-white/[0.05] bg-black/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-white"><AlertTriangle className="h-5 w-5 text-amber-300" />Action Radar</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Overdue follow-ups that can stall provider activation.</p>
              </div>
              <Badge variant="outline" className={urgent.length ? "border-red-500/25 bg-red-500/10 text-red-300" : "border-lime-500/25 bg-lime-500/10 text-lime-300"}>{urgent.length} urgent</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {urgent.length ? urgent.map((record) => (
              <Link key={record.id} href="/procurement" className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/[0.05] px-5 py-4 transition-colors last:border-0 hover:bg-white/[0.025]">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{record.providerName}</div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">{record.nextAction || `Move ${record.stage} forward`} · {record.owner || "Unassigned"}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-wider text-red-300">Overdue</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">{dueLabel(record.followUpDate)}</div>
                </div>
              </Link>
            )) : <div className="p-10 text-center text-sm text-muted-foreground">No overdue procurement follow-ups.</div>}
          </CardContent>
        </Card>

        <Card className="glass-panel overflow-hidden border-white/[0.07]">
          <CardHeader className="border-b border-white/[0.05] bg-white/[0.02]">
            <CardTitle className="flex items-center gap-2 text-white"><TrendingUp className="h-5 w-5 text-primary" />Activated Service Footprint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {serviceCounts.length ? serviceCounts.map(([service, count], index) => {
              const max = Math.max(serviceCounts[0]?.[1] || 1, 1);
              return <div key={service}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="truncate text-white/85">{service}</span><span className="font-bold text-primary">{count}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(7, (count / max) * 100)}%` }} transition={{ duration: .5, delay: index * .04 }} className="h-full rounded-full bg-primary shadow-[0_0_12px_rgba(18,173,165,.3)]" /></div>
              </div>;
            }) : <div className="py-8 text-center text-sm text-muted-foreground">No activated service data yet.</div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionCard icon={Mail} title="Outreach Command" body={`${activeOutreach.length} active outreach records`} href="/outreach" cta="Work outreach" />
        <ActionCard icon={Target} title="Procurement Command" body={`${periodProcurement.length} pipeline records touched ${rangeLabel(range)}`} href="/procurement" cta="Move targets" />
        <ActionCard icon={FileUp} title="Document Intelligence" body="Drop pricing, agreements, provider documents, or copied source text." href="/upload" cta="Process documents" />
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, loading, highlight, danger }: { icon: React.ElementType; label: string; value: number; loading?: boolean; highlight?: boolean; danger?: boolean }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
    <div className={`glass-panel relative overflow-hidden rounded-xl border p-4 ${highlight ? "border-primary/25" : danger ? "border-red-500/25" : "border-white/[0.06]"}`}>
      <div className="relative flex items-center justify-between gap-3">
        <div><div className="text-[9px] font-black uppercase tracking-[.18em] text-muted-foreground">{label}</div><div className={`mt-1 text-2xl font-black ${highlight ? "text-primary" : danger ? "text-red-300" : "text-white"}`}>{loading ? "—" : value.toLocaleString()}</div></div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${highlight ? "border-primary/25 bg-primary/10 text-primary" : danger ? "border-red-500/25 bg-red-500/10 text-red-300" : "border-white/10 bg-white/[.035] text-white/65"}`}><Icon className="h-4 w-4" /></div>
      </div>
    </div>
  </motion.div>;
}

function ActionCard({ icon: Icon, title, body, href, cta }: { icon: React.ElementType; title: string; body: string; href: string; cta: string }) {
  return <Card className="glass-panel border-white/[0.07]"><CardContent className="p-5"><div className="flex items-start gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="font-semibold text-white">{title}</div><p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p><Link href={href} className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80">{cta}<ArrowRight className="h-3.5 w-3.5" /></Link></div></div></CardContent></Card>;
}
