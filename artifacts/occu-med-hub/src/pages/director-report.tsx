import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { customFetch } from "@workspace/api-client-react";
import { FileText, ExternalLink, Activity, Building2, MapPin, AlertTriangle, CheckCircle2, TrendingUp, BarChart3, Mail, Users, RefreshCw } from "lucide-react";

type DirectorReport = {
  month?: string; period?: string; generatedAt?: string;
  difficultyReports?: { total?: number; byTier?: Record<string, number>; avgScore?: number | null; topStates?: { state: string; count: number }[]; byDepartment?: { dept: string; count: number }[] };
  outreach?: { total?: number; sent?: number; responded?: number; failed?: number; agreements?: number; allTimeTotal?: number; allTimeAgreements?: number; topStates?: { state: string; count: number }[] };
  providers?: { total?: number; verified?: number; addedThisMonth?: number; topStates?: { state: string; count: number }[] };
  criticalRegions?: { id: number; state: string; city: string | null; score: number; tier: string; service: string | null; department: string | null; generatedAt: string }[];
  recommendations?: string[];
  compareToPrevious?: { month: string; difficultyReports: number; outreach: number; avgScore: number | null; responseRate: number } | null;
};

const TIER_COLOR: Record<string, string> = { Critical: "#ef4444", Hard: "#fb7185", Moderate: "#14b8a6", Easy: "#84cc16" };
const TIER_BG: Record<string, string> = { Critical: "rgba(239,68,68,0.10)", Hard: "rgba(251,113,133,0.10)", Moderate: "rgba(20,184,166,0.10)", Easy: "rgba(132,204,22,0.10)" };
const PRIMARY = "#12ada5";

function getMostRecentMonth(): string { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function formatMonth(ym: string): string { const [y, m] = ym.split("-"); const date = new Date(Number(y), Number(m) - 1, 1); return Number.isNaN(date.getTime()) ? ym : date.toLocaleDateString("en-US", { month: "long", year: "numeric" }); }
function n(value: unknown) { return Number.isFinite(Number(value)) ? Number(value) : 0; }
function list<T>(value: T[] | undefined | null): T[] { return Array.isArray(value) ? value : []; }
function maxCount(items: { count: number }[] | undefined) { return Math.max(...list(items).map((s) => n(s.count)), 1); }
function apiUrl(path: string) { return path.startsWith("/") ? path : `/${path}`; }

function MiniBar({ value, max, color = PRIMARY }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return <div className="flex items-center gap-2 min-w-0"><div className="flex-1 h-1.5 bg-white/[0.07] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} /></div><span className="text-xs font-bold w-6 text-right" style={{ color }}>{value}</span></div>;
}

export default function DirectorReport() {
  const [selectedMonth, setSelectedMonth] = useState(getMostRecentMonth());
  const [data, setData] = useState<DirectorReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async () => {
    setIsLoading(true); setError(null);
    try { const result: DirectorReport = await customFetch(`/api/analytics/director-report?month=${selectedMonth}`); setData(result || {}); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to load report."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadReport(); }, [selectedMonth]);
  const openPrintReport = () => window.open(apiUrl(`/api/analytics/director-report/print?month=${selectedMonth}`), "_blank");

  const difficulty = data?.difficultyReports ?? {};
  const outreach = data?.outreach ?? {};
  const providers = data?.providers ?? {};
  const criticalRegions = list(data?.criticalRegions);
  const recommendations = list(data?.recommendations);
  const responseRate = n(outreach.total) > 0 ? Math.round(((n(outreach.responded) + n(outreach.agreements)) / n(outreach.total)) * 100) : 0;
  const verifiedPct = n(providers.total) > 0 ? Math.round((n(providers.verified) / n(providers.total)) * 100) : 0;
  const previous = data?.compareToPrevious ?? null;
  const maxStateCount = maxCount(difficulty.topStates);
  const maxOutreachState = maxCount(outreach.topStates);
  const maxProvState = maxCount(providers.topStates);
  const monthOptions = Array.from({ length: 12 }, (_, i) => { const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap"><div><h1 className="text-2xl font-black text-white tracking-tight">Director Monthly Report</h1><p className="text-sm text-muted-foreground mt-1">Monthly summary of network development activity, provider-search difficulty, outreach, and coverage gaps.</p></div>{data && <Button onClick={openPrintReport} className="flex-shrink-0 h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold border border-primary/50 shadow-[0_0_16px_rgba(18,173,165,0.25)] gap-2"><FileText className="h-4 w-4" />Open Printable Report<ExternalLink className="h-3 w-3 opacity-60" /></Button>}</div>
      <Card className="glass-panel border-white/[0.06]"><CardContent className="p-5"><div className="flex items-end gap-4 flex-wrap"><div className="space-y-1.5 flex-1 min-w-[180px]"><label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reporting Period</label><select className="w-full h-11 bg-black/40 border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-primary/30" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setData(null); }}>{monthOptions.map((m) => <option key={m} value={m}>{formatMonth(m)}</option>)}</select></div><Button onClick={loadReport} disabled={isLoading} className="h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold border border-primary/50 shadow-[0_0_16px_rgba(18,173,165,0.25)] gap-2">{isLoading ? <><Activity className="h-4 w-4 animate-spin" />Loading…</> : <><BarChart3 className="h-4 w-4" />Refresh Report</>}</Button>{data && <Button variant="outline" onClick={() => setData(null)} className="h-11 px-5 border-white/10 text-muted-foreground hover:text-white gap-2"><RefreshCw className="h-3.5 w-3.5" />Clear</Button>}</div>{error && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mt-4"><AlertTriangle className="h-4 w-4 flex-shrink-0" />{error}</div>}</CardContent></Card>
      <AnimatePresence>{data && <motion.div key="data" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5"><div className="flex items-center gap-3"><div className="h-px flex-1 bg-white/[0.06]" /><span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">{data.period || formatMonth(selectedMonth)}</span><div className="h-px flex-1 bg-white/[0.06]" /></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">{[{ label: "Difficulty Searches", val: n(difficulty.total), icon: BarChart3, color: "text-primary" }, { label: "Critical / Hard", val: n(difficulty.byTier?.Critical) + n(difficulty.byTier?.Hard), icon: AlertTriangle, color: "text-red-400" }, { label: "Avg Score", val: difficulty.avgScore != null ? `${difficulty.avgScore}` : "—", icon: TrendingUp, color: "text-teal-300" }, { label: "Outreach Attempts", val: n(outreach.total), icon: Mail, color: "text-primary" }, { label: "Agreements", val: n(outreach.agreements), icon: CheckCircle2, color: "text-lime-300" }, { label: "New Providers", val: n(providers.addedThisMonth), icon: Building2, color: "text-teal-300" }].map((k) => <div key={k.label} className="glass-panel border border-white/[0.06] rounded-xl p-4 text-center"><k.icon className={`h-4 w-4 ${k.color} mx-auto mb-2`} /><div className={`text-2xl font-black ${k.color} leading-none`}>{k.val}</div><div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 leading-tight">{k.label}</div></div>)}</div>
        {previous && <Card className="glass-panel border-white/[0.06]"><CardHeader className="border-b border-white/[0.05] pb-4"><CardTitle className="text-base text-white flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Month-over-Month Trend</CardTitle><CardDescription className="text-xs mt-1">Compared to {previous.month}</CardDescription></CardHeader><CardContent className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-3">{[{ label: "Difficulty Searches", current: n(difficulty.total), previous: n(previous.difficultyReports), suffix: " searches" }, { label: "Outreach Attempts", current: n(outreach.total), previous: n(previous.outreach), suffix: " attempts" }, { label: "Avg Score", current: n(difficulty.avgScore), previous: n(previous.avgScore), suffix: "/100" }, { label: "Response Rate", current: responseRate, previous: n(previous.responseRate), suffix: "%" }].map((item) => { const delta = item.current - item.previous; const up = delta > 0; return <div key={item.label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4"><div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</div><div className="text-2xl font-black text-white mt-1">{item.current}{item.suffix}</div><div className={`text-xs font-bold mt-1 ${delta === 0 ? "text-muted-foreground" : up ? "text-lime-300" : "text-red-400"}`}>{delta === 0 ? "No change" : `${up ? "+" : ""}${delta}${item.suffix}`}</div></div>; })}</CardContent></Card>}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5"><ReportCard title="Provider Search Activity" icon={<BarChart3 className="h-4 w-4 text-primary" />} note={`${n(difficulty.total)} searches this period`}><SectionTitle>By Difficulty Tier</SectionTitle>{Object.entries(difficulty.byTier || {}).length ? <div className="space-y-2">{Object.entries(difficulty.byTier || {}).map(([tier, count]) => <div key={tier} className="flex items-center gap-3"><span className="text-[10px] font-bold w-16" style={{ color: TIER_COLOR[tier] || PRIMARY }}>{tier}</span><div className="flex-1 h-2 bg-white/[0.07] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, n(count) * 10)}%`, background: TIER_COLOR[tier] || PRIMARY }} /></div><span className="text-xs text-white font-bold">{count}</span></div>)}</div> : <EmptyLine>No difficulty tiers found.</EmptyLine>}<SectionTitle className="mt-5">Top Search States</SectionTitle>{list(difficulty.topStates).length ? <div className="space-y-2">{list(difficulty.topStates).slice(0, 6).map((s) => <MiniBar key={s.state} value={n(s.count)} max={maxStateCount} />)}</div> : <EmptyLine>No state activity found.</EmptyLine>}</ReportCard>
        <ReportCard title="Outreach Performance" icon={<Mail className="h-4 w-4 text-primary" />} note={`${responseRate}% response rate`}><div className="grid grid-cols-2 gap-3"><Metric label="Sent" value={n(outreach.sent)} /><Metric label="Responded" value={n(outreach.responded)} /><Metric label="Agreements" value={n(outreach.agreements)} green /><Metric label="Failed" value={n(outreach.failed)} red /></div><SectionTitle className="mt-5">Top Outreach States</SectionTitle>{list(outreach.topStates).length ? <div className="space-y-2">{list(outreach.topStates).slice(0, 6).map((s) => <MiniBar key={s.state} value={n(s.count)} max={maxOutreachState} />)}</div> : <EmptyLine>No outreach state activity found.</EmptyLine>}</ReportCard>
        <ReportCard title="Provider Database" icon={<Users className="h-4 w-4 text-primary" />} note={`${verifiedPct}% verified`}><div className="grid grid-cols-3 gap-3"><Metric label="Total" value={n(providers.total)} /><Metric label="Verified" value={n(providers.verified)} green /><Metric label="Added" value={n(providers.addedThisMonth)} /></div><SectionTitle className="mt-5">Top Provider States</SectionTitle>{list(providers.topStates).length ? <div className="space-y-2">{list(providers.topStates).slice(0, 6).map((s) => <MiniBar key={s.state} value={n(s.count)} max={maxProvState} />)}</div> : <EmptyLine>No provider state data found.</EmptyLine>}</ReportCard>
        <ReportCard title="Critical Regions" icon={<MapPin className="h-4 w-4 text-red-400" />} note={`${criticalRegions.length} listed`}><div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">{criticalRegions.length ? criticalRegions.slice(0, 8).map((r) => <div key={r.id} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3"><div className="flex justify-between gap-3"><div className="text-sm font-bold text-white">{r.city ? `${r.city}, ` : ""}{r.state || "Unknown"}</div><span className="text-xs font-bold" style={{ color: TIER_COLOR[r.tier] || PRIMARY }}>{r.tier} · {r.score}</span></div><div className="text-xs text-muted-foreground mt-1">{r.service || "Service not listed"}{r.department ? ` · ${r.department}` : ""}</div></div>) : <EmptyLine>No critical regions listed for this month.</EmptyLine>}</div></ReportCard></div>
        <Card className="glass-panel border-white/[0.06]"><CardHeader className="border-b border-white/[0.05] pb-4"><CardTitle className="text-base text-white flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />Recommendations</CardTitle></CardHeader><CardContent className="p-5 space-y-2">{recommendations.length ? recommendations.map((rec, idx) => <div key={idx} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 text-sm text-white leading-relaxed">{rec}</div>) : <EmptyLine>No recommendations generated for this reporting period.</EmptyLine>}</CardContent></Card>
      </motion.div>}</AnimatePresence>
    </div>
  );
}

function ReportCard({ title, icon, note, children }: { title: string; icon: React.ReactNode; note: string; children: React.ReactNode }) { return <Card className="glass-panel border-white/[0.06]"><CardHeader className="border-b border-white/[0.05] pb-4"><div className="flex items-center justify-between"><CardTitle className="text-base text-white flex items-center gap-2">{icon}{title}</CardTitle><span className="text-[10px] text-muted-foreground">{note}</span></div></CardHeader><CardContent className="p-5">{children}</CardContent></Card>; }
function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <div className={`text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 ${className}`}>{children}</div>; }
function Metric({ label, value, green, red }: { label: string; value: number; green?: boolean; red?: boolean }) { return <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 text-center"><div className={`text-2xl font-black ${red ? "text-red-400" : green ? "text-lime-300" : "text-primary"}`}>{value}</div><div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div></div>; }
function EmptyLine({ children }: { children: React.ReactNode }) { return <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-4 text-center text-sm text-muted-foreground">{children}</div>; }
