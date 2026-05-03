import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, Activity, FileText, ExternalLink,
  RefreshCw, ChevronRight, Zap, BarChart3, Building2, Phone,
  Mail, ShieldCheck, Info, Target, TrendingUp, Users,
} from "lucide-react";

const KNOWN_SERVICES = [
  "Drug Testing", "DOT Physicals", "Physical Exams", "Chest X-Ray", "Audiometry",
  "Vision Testing", "Pulmonary Function", "Spirometry", "Stress Testing", "EKG",
  "Lab Work", "Urine Testing", "Hair Testing", "Breath Alcohol", "MRO Services",
  "Urgent Care", "Occupational Therapy", "Workers Comp", "Pre-Employment",
];

const US_STATES = [
  "AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN","KS","KY",
  "LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH",
  "OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY",
];

const DEPARTMENTS = ["Scheduling", "Finance", "HR", "Operations", "Executive", "Legal", "Clinical", "Other"];

const TIER_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; icon: React.ElementType; desc: string }> = {
  Critical: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.3)", label: "Critical Difficulty", icon: AlertTriangle, desc: "Extremely difficult — escalate immediately and budget 2–3× standard lead time." },
  Hard:     { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.3)", label: "High Difficulty",     icon: TrendingUp,    desc: "Significant challenges. Activate alternate fulfillment strategies in parallel." },
  Moderate: { color: "#eab308", bg: "rgba(234,179,8,0.08)",  border: "rgba(234,179,8,0.3)",  label: "Moderate Difficulty", icon: Target,        desc: "Some gaps but manageable with focused effort. Allow extra lead time." },
  Easy:     { color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.3)",  label: "Easy / Low Difficulty",icon: CheckCircle2, desc: "Good coverage for this area. Standard outreach should be sufficient." },
};

const CAT_COLORS: Record<string, string> = {
  Availability:  "#3b82f6",
  Reliability:   "#8b5cf6",
  Billing:       "#22c55e",
  Accessibility: "#06b6d4",
  Relationship:  "#f97316",
};

type Factor = { name: string; category: string; points: number; maxPoints: number; detail: string; description: string };
type Provider = { id: number; clinicName: string; clinicType: string | null; city: string | null; state: string | null; phone: string | null; email: string | null; verificationStatus: string; tpaFriendly: boolean; servicesOffered: string | null; sourceCount: string };
type DifficultyReport = {
  request: { state: string; city: string | null; service: string | null; requestedBy: string | null; department: string | null; notes: string | null };
  score: number; tier: string; totalProviders: number; verifiedProviders: number; flaggedProviders: number;
  tpaProviders: number; usableProviders: number; serviceMatch: number | null;
  factors: Factor[]; providers: Provider[];
  outreachSummary: { total: number; failed: number; agreements: number; responded: number };
  recommendations: string[]; generatedAt: string;
};

function ScoreGauge({ score, tier }: { score: number; tier: string }) {
  const arcLen   = Math.PI * 80;
  const filled   = (score / 100) * arcLen;
  const cfg      = TIER_CONFIG[tier] || TIER_CONFIG.Moderate;
  return (
    <svg viewBox="0 0 200 115" className="w-full max-w-[260px] mx-auto block">
      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="18" strokeLinecap="round" />
      <path
        d="M 20 100 A 80 80 0 0 1 180 100" fill="none"
        stroke={cfg.color} strokeWidth="18" strokeLinecap="round"
        strokeDasharray={`${filled.toFixed(1)} ${arcLen.toFixed(1)}`}
        style={{ transition: "stroke-dasharray 1.6s cubic-bezier(0.4,0,0.2,1), stroke 0.4s" }}
      />
      <text x="100" y="82" textAnchor="middle" fill={cfg.color} fontSize="48" fontWeight="900" fontFamily="-apple-system,sans-serif">{score}</text>
      <text x="100" y="103" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="700" fontFamily="-apple-system,sans-serif" letterSpacing="1">OUT OF 100</text>
    </svg>
  );
}

function FactorCard({ factor }: { factor: Factor }) {
  const [tip, setTip] = useState(false);
  const pct      = factor.maxPoints > 0 ? (factor.points / factor.maxPoints) * 100 : 0;
  const barColor = pct >= 70 ? "#ef4444" : pct >= 40 ? "#f97316" : pct > 0 ? "#eab308" : "#22c55e";
  const catColor = CAT_COLORS[factor.category] || "#888";

  return (
    <div className="glass-panel border border-white/[0.06] rounded-xl p-4 space-y-2.5 relative">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catColor }} />
          <span className="text-xs font-bold text-white leading-tight">{factor.name}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs font-900" style={{ color: barColor, fontWeight: 800 }}>{factor.points}</span>
          <span className="text-[10px] text-muted-foreground">/{factor.maxPoints}</span>
          <button onClick={() => setTip((v) => !v)} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors ml-0.5">
            <Info className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: barColor, boxShadow: pct > 0 ? `0 0 6px ${barColor}60` : "none" }}
        />
      </div>

      <AnimatePresence>
        {tip && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="text-[10px] text-muted-foreground leading-relaxed overflow-hidden">
            {factor.description}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted-foreground leading-tight flex-1">{factor.detail}</span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: catColor, background: `${catColor}15`, border: `1px solid ${catColor}30` }}>
          {factor.category}
        </span>
      </div>
    </div>
  );
}

const inputCls = "h-10 bg-black/40 border-white/10 text-white text-sm placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 rounded-lg";
const selectCls = "w-full h-10 rounded-lg bg-black/40 border border-white/10 text-sm text-white px-3 focus:outline-none focus:ring-1 focus:ring-primary/30";

export default function ProviderDifficulty() {
  const [form, setForm] = useState({ state: "", city: "", service: "", requestedBy: "", department: "", notes: "" });
  const [data, setData] = useState<DifficultyReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gaugeScore, setGaugeScore] = useState(0);

  useEffect(() => {
    if (data) { const t = setTimeout(() => setGaugeScore(data.score), 200); return () => clearTimeout(t); }
    setGaugeScore(0);
  }, [data]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleAnalyze = async () => {
    if (!form.state) return;
    setIsAnalyzing(true); setError(null); setData(null);
    try {
      const p = new URLSearchParams({ state: form.state });
      if (form.city)        p.set("city", form.city);
      if (form.service)     p.set("service", form.service);
      if (form.requestedBy) p.set("requestedBy", form.requestedBy);
      if (form.department)  p.set("department", form.department);
      if (form.notes)       p.set("notes", form.notes);
      const res  = await fetch(`/api/analytics/difficulty-report?${p.toString()}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate report.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrint = () => {
    if (!data) return;
    const p = new URLSearchParams({ state: form.state });
    if (form.city)        p.set("city", form.city);
    if (form.service)     p.set("service", form.service);
    if (form.requestedBy) p.set("requestedBy", form.requestedBy);
    if (form.department)  p.set("department", form.department);
    if (form.notes)       p.set("notes", form.notes);
    window.open(`/api/analytics/difficulty-report/print?${p.toString()}`, "_blank");
  };

  const tier = data ? (TIER_CONFIG[data.tier] || TIER_CONFIG.Moderate) : null;
  const TierIcon = tier?.icon || AlertTriangle;

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/20">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight glow-text">Provider Finder Difficulty Score</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            10-factor analysis — generate a scored assessment to justify search complexity to Scheduling or Finance.
          </p>
        </div>
        {data && (
          <Button onClick={handlePrint} variant="outline"
            className="border-white/10 text-white hover:bg-white/[0.06] hover:border-primary/30 gap-2 flex-shrink-0">
            <FileText className="h-4 w-4 text-primary" />
            Export PDF Report
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Button>
        )}
      </div>

      {/* ── Request Form ── */}
      <Card className="glass-panel border-white/[0.06]">
        <CardHeader className="border-b border-white/[0.05] pb-4">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Provider Search Request
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Enter the request details — the more specific, the more accurate the difficulty score.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">State <span className="text-red-400">*</span></label>
              <select className={selectCls} value={form.state} onChange={set("state")}>
                <option value="">Select State…</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">City / Metro (optional)</label>
              <Input className={inputCls} placeholder="e.g. Houston" value={form.city} onChange={set("city")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Service Required (optional)</label>
              <select className={selectCls} value={form.service} onChange={set("service")}>
                <option value="">Any Service</option>
                {KNOWN_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Requested By</label>
              <Input className={inputCls} placeholder="e.g. Sarah Mitchell" value={form.requestedBy} onChange={set("requestedBy")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Department</label>
              <select className={selectCls} value={form.department} onChange={set("department")}>
                <option value="">Select Department…</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Case Notes (optional)</label>
            <textarea
              className="w-full min-h-[72px] rounded-lg bg-black/40 border border-white/10 text-sm text-white px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50 resize-none"
              placeholder="Any context about the request, employee location, urgency, special requirements…"
              value={form.notes} onChange={set("notes")}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={!form.state || isAnalyzing}
              className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_20px_rgba(230,180,0,0.3)] border border-primary/50 hover:shadow-[0_0_30px_rgba(230,180,0,0.5)] transition-all disabled:opacity-50"
            >
              {isAnalyzing
                ? <><Activity className="h-4 w-4 mr-2 animate-spin" />Analyzing…</>
                : <><Zap className="h-4 w-4 mr-2" />Analyze Difficulty</>}
            </Button>
            {data && (
              <Button variant="outline" onClick={() => { setData(null); setGaugeScore(0); }}
                className="h-12 px-5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/[0.06]">
                <RefreshCw className="h-4 w-4 mr-2" />Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Results ── */}
      <AnimatePresence>
        {data && (
          <motion.div key="results" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="space-y-5">

            {/* Score Hero */}
            <Card className="glass-panel border-white/[0.06] overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
                {/* Gauge */}
                <div className="p-6 flex flex-col items-center justify-center gap-4">
                  <ScoreGauge score={gaugeScore} tier={data.tier} />
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold"
                    style={{ color: tier!.color, background: tier!.bg, borderColor: tier!.border }}
                  >
                    <TierIcon className="h-4 w-4" />
                    {tier!.label}
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center leading-relaxed max-w-[220px]">
                    {tier!.desc}
                  </p>
                </div>

                {/* Stats grid */}
                <div className="p-6 flex flex-col justify-between gap-6">
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Area Summary</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Total Providers", val: data.totalProviders, icon: Building2 },
                        { label: "Usable Providers", val: data.usableProviders, icon: Users },
                        { label: "Verified", val: data.verifiedProviders, icon: ShieldCheck },
                        { label: "TPA / Corp Ready", val: data.tpaProviders, icon: CheckCircle2 },
                      ].map((s) => (
                        <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                          <s.icon className="h-3.5 w-3.5 text-primary mx-auto mb-1.5" />
                          <div className="text-2xl font-black text-primary leading-none">{s.val}</div>
                          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {data.serviceMatch != null && (
                    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                      <Target className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">{data.serviceMatch} provider{data.serviceMatch !== 1 ? "s" : ""} offer "{data.request.service}"</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">in {data.request.city ? `${data.request.city}, ` : ""}{data.request.state}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap text-[10px]">
                    <span className="text-muted-foreground font-bold uppercase tracking-wider">Region:</span>
                    <span className="text-white font-bold">{data.request.state}{data.request.city ? `, ${data.request.city}` : ""}</span>
                    {data.request.service && <><span className="text-muted-foreground/40">·</span><span className="text-primary font-bold">{data.request.service}</span></>}
                    {data.request.requestedBy && <><span className="text-muted-foreground/40">·</span><span className="text-muted-foreground">By: {data.request.requestedBy}</span></>}
                    {data.request.department && <span className="bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-bold">{data.request.department}</span>}
                  </div>
                </div>
              </div>
            </Card>

            {/* Factor Breakdown */}
            <Card className="glass-panel border-white/[0.06]">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Difficulty Factor Breakdown
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Each factor contributes weighted points to the overall score — higher bar = more difficulty in that dimension.
                  <span className="ml-2 text-muted-foreground/60">Click the ⓘ icon for factor descriptions.</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                {/* Category legend */}
                <div className="flex flex-wrap gap-3 mb-5">
                  {Object.entries(CAT_COLORS).map(([cat, color]) => (
                    <div key={cat} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                      {cat}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.factors.map((f) => <FactorCard key={f.name} factor={f} />)}
                </div>
              </CardContent>
            </Card>

            {/* Outreach Summary */}
            <Card className="glass-panel border-white/[0.06]">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Outreach History for Region
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Total Attempts",    val: data.outreachSummary.total,     color: "text-white" },
                    { label: "Responded",         val: data.outreachSummary.responded, color: "text-green-400" },
                    { label: "Failed / No Reply", val: data.outreachSummary.failed,    color: "text-red-400" },
                    { label: "Agreements",        val: data.outreachSummary.agreements,color: "text-primary" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
                      <div className={`text-3xl font-black ${s.color} leading-none`}>{s.val}</div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-2">{s.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Available Providers */}
            {data.providers.length > 0 && (
              <Card className="glass-panel border-white/[0.06]">
                <CardHeader className="border-b border-white/[0.05] pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Available Provider Pool
                    </CardTitle>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      {data.providers.length} record{data.providers.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.05]">
                          {["Clinic", "Location", "Phone", "Email", "Status", "TPA"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.providers.map((p, i) => {
                          const sc = p.verificationStatus === "Verified" ? "text-green-400" : p.verificationStatus === "Flagged" ? "text-red-400" : "text-yellow-400";
                          return (
                            <tr key={p.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === data.providers.length - 1 ? "border-b-0" : ""}`}>
                              <td className="px-4 py-3">
                                <div className="text-sm font-bold text-white leading-tight">{p.clinicName}</div>
                                {p.clinicType && <div className="text-[10px] text-muted-foreground mt-0.5">{p.clinicType}</div>}
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{[p.city, p.state].filter(Boolean).join(", ") || "—"}</td>
                              <td className="px-4 py-3">
                                {p.phone ? <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3 text-primary/60" />{p.phone}</div> : <span className="text-muted-foreground/30 text-xs">—</span>}
                              </td>
                              <td className="px-4 py-3">
                                {p.email ? <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3 text-primary/60" />{p.email}</div> : <span className="text-muted-foreground/30 text-xs">—</span>}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-bold uppercase ${sc}`}>{p.verificationStatus}</span>
                              </td>
                              <td className="px-4 py-3">
                                {p.tpaFriendly
                                  ? <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded">✓ TPA</span>
                                  : <span className="text-muted-foreground/30 text-xs">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card className="glass-panel border-white/[0.06]">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  Recommendations &amp; Action Items
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Data-driven actions to address the difficulty factors identified above.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {data.recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.05] border-l-2 rounded-r-xl pl-4 pr-4 py-3"
                    style={{ borderLeftColor: tier!.color }}
                  >
                    <span className="text-[11px] font-black flex-shrink-0 mt-0.5" style={{ color: tier!.color }}>{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{rec}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Print CTA */}
            <div className="flex items-center gap-4 p-5 glass-panel border border-white/[0.06] rounded-xl">
              <div className="flex-1">
                <div className="text-sm font-bold text-white mb-0.5">Send this report to Scheduling or Finance</div>
                <div className="text-xs text-muted-foreground">Opens a professionally formatted PDF-ready document with the full difficulty breakdown, provider pool, and sign-off lines.</div>
              </div>
              <Button onClick={handlePrint} className="flex-shrink-0 h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold border border-primary/50 shadow-[0_0_16px_rgba(230,180,0,0.25)] gap-2">
                <FileText className="h-4 w-4" />
                Open Printable Report
                <ExternalLink className="h-3 w-3 opacity-60" />
              </Button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
