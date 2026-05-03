import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { customFetch } from "@workspace/api-client-react";
import {
  FileText, ExternalLink, Activity, Building2, MapPin, AlertTriangle,
  CheckCircle2, TrendingUp, BarChart3, Mail, Users, ChevronRight, RefreshCw,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type DirectorReport = {
  month: string; period: string; generatedAt: string;
  difficultyReports: {
    total: number; byTier: Record<string, number>; avgScore: number | null;
    topStates: { state: string; count: number }[];
    byDepartment: { dept: string; count: number }[];
  };
  outreach: {
    total: number; sent: number; responded: number; failed: number; agreements: number;
    allTimeTotal: number; allTimeAgreements: number;
    topStates: { state: string; count: number }[];
  };
  providers: {
    total: number; verified: number; addedThisMonth: number;
    topStates: { state: string; count: number }[];
  };
  criticalRegions: {
    id: number; state: string; city: string | null; score: number; tier: string;
    service: string | null; department: string | null; generatedAt: string;
  }[];
  recommendations: string[];
  compareToPrevious?: {
    month: string;
    difficultyReports: number;
    outreach: number;
    avgScore: number | null;
    responseRate: number;
  } | null;
};

const TIER_COLOR: Record<string, string> = {
  Critical: "#ef4444", Hard: "#f97316", Moderate: "#eab308", Easy: "#22c55e",
};
const TIER_BG: Record<string, string> = {
  Critical: "rgba(239,68,68,0.1)", Hard: "rgba(249,115,22,0.1)", Moderate: "rgba(234,179,8,0.1)", Easy: "rgba(34,197,94,0.1)",
};

function getMostRecentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function MiniBar({ value, max, color = "#d4941a" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-6 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

export default function DirectorReport() {
  const [selectedMonth, setSelectedMonth] = useState(getMostRecentMonth());
  const [data, setData] = useState<DirectorReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result: DirectorReport = await customFetch(`/api/analytics/director-report?month=${selectedMonth}`);
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load report.");
    } finally {
      setIsLoading(false);
    }
  };

  const openPrintReport = () => {
    window.open(`${BASE}/api/analytics/director-report/print?month=${selectedMonth}`, "_blank");
  };

  const responseRate = data ? (data.outreach.total > 0 ? Math.round(((data.outreach.responded + data.outreach.agreements) / data.outreach.total) * 100) : 0) : 0;
  const verifiedPct  = data ? (data.providers.total > 0 ? Math.round((data.providers.verified / data.providers.total) * 100) : 0) : 0;
  const previous = data?.compareToPrevious ?? null;
  const maxStateCount = data ? Math.max(...data.difficultyReports.topStates.map((s) => s.count), 1) : 1;
  const maxOutreachState = data ? Math.max(...data.outreach.topStates.map((s) => s.count), 1) : 1;
  const maxProvState = data ? Math.max(...data.providers.topStates.map((s) => s.count), 1) : 1;

  // Generate month options (last 12 months)
  const monthOptions: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthOptions.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Director Monthly Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Full monthly summary of all network development activity — built for the Director of Network Management.
          </p>
        </div>
        {data && (
          <Button onClick={openPrintReport}
            className="flex-shrink-0 h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold border border-primary/50 shadow-[0_0_16px_rgba(230,180,0,0.25)] gap-2">
            <FileText className="h-4 w-4" />Open Printable Report<ExternalLink className="h-3 w-3 opacity-60" />
          </Button>
        )}
      </div>

      {/* Month picker + generate */}
      <Card className="glass-panel border-white/[0.06]">
        <CardContent className="p-5">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-1.5 flex-1 min-w-[180px]">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reporting Period</label>
              <select
                className="w-full h-11 bg-black/40 border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-primary/30"
                value={selectedMonth}
                onChange={(e) => { setSelectedMonth(e.target.value); setData(null); }}
              >
                {monthOptions.map((m) => <option key={m} value={m}>{formatMonth(m)}</option>)}
              </select>
            </div>
            <Button onClick={loadReport} disabled={isLoading}
              className="h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold border border-primary/50 shadow-[0_0_16px_rgba(230,180,0,0.25)] gap-2">
              {isLoading
                ? <><Activity className="h-4 w-4 animate-spin" />Loading…</>
                : <><BarChart3 className="h-4 w-4" />Generate Report</>}
            </Button>
            {data && (
              <Button variant="outline" onClick={() => setData(null)} className="h-11 px-5 border-white/10 text-muted-foreground hover:text-white gap-2">
                <RefreshCw className="h-3.5 w-3.5" />Clear
              </Button>
            )}
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mt-4">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />{error}
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {data && (
          <motion.div key="data" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">
            {/* Period badge */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
                {data.period}
              </span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Difficulty Searches", val: data.difficultyReports.total, icon: BarChart3, color: "text-primary" },
                { label: "Critical / Hard", val: (data.difficultyReports.byTier.Critical || 0) + (data.difficultyReports.byTier.Hard || 0), icon: AlertTriangle, color: "text-red-400" },
                { label: "Avg Score", val: data.difficultyReports.avgScore != null ? `${data.difficultyReports.avgScore}` : "—", icon: TrendingUp, color: "text-orange-400" },
                { label: "Outreach Attempts", val: data.outreach.total, icon: Mail, color: "text-blue-400" },
                { label: "Agreements", val: data.outreach.agreements, icon: CheckCircle2, color: "text-green-400" },
                { label: "New Providers", val: data.providers.addedThisMonth, icon: Building2, color: "text-purple-400" },
              ].map((k) => (
                <div key={k.label} className="glass-panel border border-white/[0.06] rounded-xl p-4 text-center">
                  <k.icon className={`h-4 w-4 ${k.color} mx-auto mb-2`} />
                  <div className={`text-2xl font-black ${k.color} leading-none`}>{k.val}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5 leading-tight">{k.label}</div>
                </div>
              ))}
            </div>

            {previous && (
              <Card className="glass-panel border-white/[0.06]">
                <CardHeader className="border-b border-white/[0.05] pb-4">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Month-over-Month Trend
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Compared to {previous.month}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Difficulty Searches", current: data.difficultyReports.total, previous: previous.difficultyReports, suffix: "searches" },
                    { label: "Outreach Attempts", current: data.outreach.total, previous: previous.outreach, suffix: "attempts" },
                    { label: "Avg Score", current: data.difficultyReports.avgScore ?? 0, previous: previous.avgScore ?? 0, suffix: "/100" },
                    { label: "Response Rate", current: responseRate, previous: previous.responseRate, suffix: "%" },
                  ].map((item) => {
                    const delta = item.current - item.previous;
                    const up = delta > 0;
                    return (
                      <div key={item.label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</div>
                        <div className="text-2xl font-black text-white mt-1">
                          {item.current}{item.suffix}
                        </div>
                        <div className={`text-xs font-bold mt-1 ${delta === 0 ? "text-muted-foreground" : up ? "text-green-400" : "text-red-400"}`}>
                          {delta === 0 ? "No change" : `${up ? "+" : ""}${delta}${item.suffix}`}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Provider Searches */}
            <Card className="glass-panel border-white/[0.06]">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />Provider Search Activity
                  </CardTitle>
                  <span className="text-[10px] text-muted-foreground">{data.difficultyReports.total} searches this period</span>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* By tier */}
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">By Difficulty Tier</div>
                    <div className="space-y-2">
                      {Object.entries(data.difficultyReports.byTier).map(([tier, count]) => (
                        <div key={tier} className="flex items-center gap-3">
                          <span className="text-[10px] font-bold w-16" style={{ color: TIER_COLOR[tier] }}>{tier}</span>
                          <div className="flex-1 h-2 bg-white/[0.07] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${data.difficultyReports.total > 0 ? (count / data.difficultyReports.total) * 100 : 0}%`, background: TIER_COLOR[tier] }} />
                          </div>
                          <span className="text-xs font-black w-6 text-right" style={{ color: TIER_COLOR[tier] }}>{count}</span>
                        </div>
                      ))}
                    </div>
                    {data.difficultyReports.avgScore != null && (
                      <div className="mt-4 p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Avg Score</div>
                        <div className="text-2xl font-black text-primary mt-0.5">{data.difficultyReports.avgScore}<span className="text-xs text-muted-foreground font-normal">/100</span></div>
                      </div>
                    )}
                  </div>

                  {/* Top states */}
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Top Searched States</div>
                    {data.difficultyReports.topStates.length > 0 ? (
                      <div className="space-y-2.5">
                        {data.difficultyReports.topStates.map((s) => (
                          <div key={s.state} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-white w-7">{s.state}</span>
                            <MiniBar value={s.count} max={maxStateCount} color="#d4941a" />
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-muted-foreground/50 italic">No searches this period</p>}
                  </div>

                  {/* By department */}
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">By Department</div>
                    {data.difficultyReports.byDepartment.length > 0 ? (
                      <div className="space-y-2.5">
                        {data.difficultyReports.byDepartment.map((d) => (
                          <div key={d.dept} className="flex items-center gap-3">
                            <span className="text-xs font-medium text-white flex-1 min-w-0 truncate">{d.dept}</span>
                            <span className="text-xs font-black text-primary w-6 text-right">{d.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-muted-foreground/50 italic">No department data</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Outreach + Network */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Outreach */}
              <Card className="glass-panel border-white/[0.06]">
                <CardHeader className="border-b border-white/[0.05] pb-4">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-400" />Outreach Campaign
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">{data.outreach.total} attempts this period</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Total", val: data.outreach.total, color: "text-white" },
                      { label: "Responded", val: data.outreach.responded + data.outreach.agreements, color: "text-green-400" },
                      { label: "Failed", val: data.outreach.failed, color: "text-red-400" },
                      { label: "Agreements", val: data.outreach.agreements, color: "text-primary" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 text-center">
                        <div className={`text-xl font-black ${s.color} leading-none`}>{s.val}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                    <div className="flex-1">
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Response Rate</div>
                      <div className="h-2 bg-white/[0.07] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${responseRate}%`, background: responseRate >= 40 ? "#22c55e" : responseRate >= 20 ? "#eab308" : "#ef4444" }} />
                      </div>
                    </div>
                    <span className="text-lg font-black text-white">{responseRate}%</span>
                  </div>

                  {data.outreach.topStates.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Top Outreach States</div>
                      <div className="space-y-2">
                        {data.outreach.topStates.map((s) => (
                          <div key={s.state} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-white w-7">{s.state}</span>
                            <MiniBar value={s.count} max={maxOutreachState} color="#3b82f6" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-muted-foreground/60 border-t border-white/[0.05] pt-3">
                    All-time: <span className="text-white font-bold">{data.outreach.allTimeTotal}</span> total attempts,{" "}
                    <span className="text-primary font-bold">{data.outreach.allTimeAgreements}</span> agreements (
                    {data.outreach.allTimeTotal > 0 ? Math.round((data.outreach.allTimeAgreements / data.outreach.allTimeTotal) * 100) : 0}% rate)
                  </div>
                </CardContent>
              </Card>

              {/* Provider Network */}
              <Card className="glass-panel border-white/[0.06]">
                <CardHeader className="border-b border-white/[0.05] pb-4">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-400" />Provider Network
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">{data.providers.addedThisMonth} added this period</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Total Providers", val: data.providers.total, color: "text-primary" },
                      { label: "Verified", val: data.providers.verified, color: "text-green-400" },
                      { label: "Added This Month", val: data.providers.addedThisMonth, color: "text-purple-400" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 text-center">
                        <div className={`text-xl font-black ${s.color} leading-none`}>{s.val}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1 leading-tight">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                    <div className="flex-1">
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Verified Rate</div>
                      <div className="h-2 bg-white/[0.07] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-green-500 transition-all duration-700" style={{ width: `${verifiedPct}%` }} />
                      </div>
                    </div>
                    <span className="text-lg font-black text-green-400">{verifiedPct}%</span>
                  </div>

                  {data.providers.topStates.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Top States by Providers</div>
                      <div className="space-y-2">
                        {data.providers.topStates.map((s) => (
                          <div key={s.state} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-white w-7">{s.state}</span>
                            <MiniBar value={s.count} max={maxProvState} color="#22c55e" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Critical Regions */}
            <Card className="glass-panel border-white/[0.06]">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />Critical &amp; High Difficulty Regions
                  </CardTitle>
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                    {data.criticalRegions.length} flagged
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {data.criticalRegions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.05]">
                          {["Region", "Tier", "Score", "Service", "Department", "Date"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.criticalRegions.map((cr, i) => (
                          <tr key={cr.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === data.criticalRegions.length - 1 ? "border-b-0" : ""}`}>
                            <td className="px-4 py-3">
                              <div className="text-sm font-bold text-white">{cr.state}{cr.city ? `, ${cr.city}` : ""}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded border"
                                style={{ color: TIER_COLOR[cr.tier], background: TIER_BG[cr.tier], borderColor: `${TIER_COLOR[cr.tier]}40` }}>
                                {cr.tier}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-base font-black" style={{ color: TIER_COLOR[cr.tier] }}>{cr.score}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{cr.service || "—"}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{cr.department || "—"}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {new Date(cr.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto" />
                    <p className="text-sm font-bold text-white">No critical regions this period</p>
                    <p className="text-xs text-muted-foreground">All searches scored Moderate or Easy — excellent network coverage.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="glass-panel border-white/[0.06]">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />Director Recommendations
                </CardTitle>
                <CardDescription className="text-xs mt-1">Data-driven action items for the Director of Network Management.</CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {data.recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.05] border-l-2 border-l-primary/50 rounded-r-xl pl-4 pr-4 py-3"
                  >
                    <span className="text-[11px] font-black text-primary flex-shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{rec}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Print CTA */}
            <div className="flex items-center gap-4 p-5 glass-panel border border-white/[0.06] rounded-xl">
              <div className="flex-1">
                <div className="text-sm font-bold text-white mb-0.5">Send this report to the Director of Network Management</div>
                <div className="text-xs text-muted-foreground">Full-page formatted report with KPI summary, tier breakdowns, outreach results, critical regions, and authorization sign-off lines — ready to print or save as PDF.</div>
              </div>
              <Button onClick={openPrintReport}
                className="flex-shrink-0 h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold border border-primary/50 shadow-[0_0_16px_rgba(230,180,0,0.25)] gap-2">
                <FileText className="h-4 w-4" />Open Full Report<ExternalLink className="h-3 w-3 opacity-60" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
