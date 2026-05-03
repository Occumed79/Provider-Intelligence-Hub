import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { customFetch } from "@workspace/api-client-react";
import {
  UploadCloud, FileSpreadsheet, RefreshCw, ChevronDown, AlertTriangle,
  CheckCircle2, MapPin, Building2, Search, ArrowUpDown, Download,
  Activity, ShieldCheck, Zap, X,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type ParsedResult = {
  headers: string[];
  totalRows: number;
  detected: { state: number | null; city: number | null; date: number | null; notes: number | null; name: number | null };
  preview: Record<string, string>[];
  rows: Array<{ state: string; city: string | null; date: string | null; notes: string | null; name: string | null }>;
};

type LocationRow = {
  state: string; city: string | null; attempts: number;
  providers: number; verifiedProviders: number; outreachAttempts: number; gapScore: string;
};

type StateSummaryRow = {
  state: string; totalAttempts: number; providers: number; verifiedProviders: number; outreachAttempts: number;
};

type AnalysisResult = {
  locations: LocationRow[];
  stateSummary: StateSummaryRow[];
  totalRows: number;
  uniqueStates: number;
  uniqueLocations: number;
};

const GAP_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  Critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
  High:     { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)" },
  Medium:   { color: "#eab308", bg: "rgba(234,179,8,0.1)",  border: "rgba(234,179,8,0.3)"  },
  Low:      { color: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)"  },
};

function ColMapSelect({
  label, value, options, onChange,
}: { label: string; value: number | null; options: string[]; onChange: (v: number | null) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
      <select
        className="w-full h-9 bg-black/40 border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-primary/30"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      >
        <option value="">— not mapped —</option>
        {options.map((h, i) => <option key={i} value={i}>{h}</option>)}
      </select>
    </div>
  );
}

export default function SearchMapping() {
  const [stage, setStage] = useState<"upload" | "mapping" | "analyzing" | "results">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [colMap, setColMap] = useState<{ state: number | null; city: number | null }>({ state: null, city: null });
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState<"attempts" | "providers" | "gap">("attempts");
  const [activeTab, setActiveTab] = useState<"locations" | "states">("states");
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext ?? "")) {
      setError("Please upload a CSV, XLSX, or XLS file.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const data: ParsedResult = await customFetch("/api/analytics/search-map/parse", { method: "POST", body: fd });
      setParsed(data);
      setColMap({ state: data.detected.state, city: data.detected.city });
      setStage("mapping");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to parse file. Please check the format.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleAnalyze = async () => {
    if (!parsed || colMap.state == null) return;
    setIsLoading(true);
    setError(null);
    setStage("analyzing");
    try {
      const rows = parsed.rows.map((r) => ({
        state: r.state,
        city: r.city,
      }));
      const data: AnalysisResult = await customFetch("/api/analytics/search-map/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      setResults(data);
      setStage("results");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
      setStage("mapping");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStage("upload");
    setParsed(null);
    setResults(null);
    setError(null);
    setFilterText("");
  };

  const exportCSV = () => {
    if (!results) return;
    const headers = ["State", "City", "Attempts", "Providers in DB", "Verified Providers", "Outreach Attempts", "Gap Score"];
    const rows = results.locations.map((l) =>
      [l.state, l.city || "", l.attempts, l.providers, l.verifiedProviders, l.outreachAttempts, l.gapScore].join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `search-location-mapping-${Date.now()}.csv`;
    a.click();
  };

  const filteredLocations = (results?.locations ?? [])
    .filter((l) => {
      if (!filterText) return true;
      const q = filterText.toLowerCase();
      return l.state.toLowerCase().includes(q) || (l.city || "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "attempts") return b.attempts - a.attempts;
      if (sortBy === "providers") return b.providers - a.providers;
      const gapOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (gapOrder[b.gapScore as keyof typeof gapOrder] || 0) - (gapOrder[a.gapScore as keyof typeof gapOrder] || 0);
    });

  const filteredStates = (results?.stateSummary ?? []).filter((s) => {
    if (!filterText) return true;
    return s.state.toLowerCase().includes(filterText.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Search Attempt Mapper</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a CSV or Excel file of past provider search requests to map location frequency and cross-reference with your provider database.
          </p>
        </div>
        {stage !== "upload" && (
          <Button variant="outline" onClick={reset} className="border-white/10 text-muted-foreground hover:text-white gap-2 flex-shrink-0">
            <RefreshCw className="h-3.5 w-3.5" />New Upload
          </Button>
        )}
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
        {(["upload", "mapping", "results"] as const).map((s, i) => {
          const done  = (stage === "mapping" && i < 1) || (stage === "results" && i < 2) || (stage === "analyzing" && i < 2);
          const active = stage === s || (stage === "analyzing" && s === "mapping");
          return (
            <React.Fragment key={s}>
              {i > 0 && <div className={`flex-1 h-px ${done ? "bg-primary/60" : "bg-white/10"}`} />}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${active ? "bg-primary/15 text-primary border border-primary/30" : done ? "text-primary/60" : "text-muted-foreground/40"}`}>
                {done ? <CheckCircle2 className="h-3 w-3" /> : <span className="w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px]" style={{ borderColor: "currentColor" }}>{i + 1}</span>}
                {s === "upload" ? "Upload File" : s === "mapping" ? "Map Columns" : "Results"}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Stage: Upload ── */}
      <AnimatePresence mode="wait">
        {stage === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${isDragging ? "border-primary/70 bg-primary/[0.06]" : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"}`}
            >
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
              <AnimatePresence>
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Activity className="h-10 w-10 text-primary mx-auto mb-4 animate-spin" />
                    <p className="text-sm font-bold text-white">Parsing file…</p>
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <UploadCloud className={`h-12 w-12 mx-auto mb-4 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground/40"}`} />
                    <p className="text-base font-bold text-white mb-1">Drop your file here, or click to browse</p>
                    <p className="text-sm text-muted-foreground mb-6">Supports CSV, XLSX, and XLS — up to 25 MB</p>
                    <div className="inline-flex items-center gap-3 text-[10px] text-muted-foreground/60">
                      <FileSpreadsheet className="h-3.5 w-3.5" />.csv
                      <FileSpreadsheet className="h-3.5 w-3.5" />.xlsx
                      <FileSpreadsheet className="h-3.5 w-3.5" />.xls
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Format hint */}
            <Card className="glass-panel border-white/[0.06] mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white">What should my file look like?</CardTitle>
                <CardDescription className="text-xs">The system auto-detects column names. Any spreadsheet with state/location data works.</CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-white/[0.04]">
                        {["State", "City", "Date Requested", "Employee Name", "Notes"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left font-bold text-primary">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["TX", "Houston", "2026-04-12", "J. Williams", "DOT Physical needed"],
                        ["CA", "Los Angeles", "2026-04-14", "M. Torres", "Pre-employment drug screen"],
                        ["TX", "Austin", "2026-04-15", "R. Johnson", "Workers comp follow-up"],
                        ["FL", "Miami", "2026-04-18", "K. Davis", "Audiometry test"],
                      ].map((row, i) => (
                        <tr key={i} className="border-t border-white/[0.04]">
                          {row.map((cell, j) => <td key={j} className="px-4 py-2 text-muted-foreground">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-muted-foreground/50 mt-3">Column names don't need to match exactly — the system recognizes common variations like "ST", "Location", "Province", etc.</p>
              </CardContent>
            </Card>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mt-4">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />{error}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Stage: Column Mapping ── */}
        {(stage === "mapping" || stage === "analyzing") && parsed && (
          <motion.div key="mapping" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
            <Card className="glass-panel border-white/[0.06]">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-primary" />
                      File Parsed — Map Your Columns
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {parsed.totalRows.toLocaleString()} data rows detected across {parsed.headers.length} columns. Confirm which columns hold location data.
                    </CardDescription>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                    {parsed.totalRows.toLocaleString()} rows
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColMapSelect label="State Column *" value={colMap.state} options={parsed.headers} onChange={(v) => setColMap((c) => ({ ...c, state: v }))} />
                  <ColMapSelect label="City Column (optional)" value={colMap.city} options={parsed.headers} onChange={(v) => setColMap((c) => ({ ...c, city: v }))} />
                </div>
                {colMap.state == null && (
                  <div className="flex items-center gap-2 text-yellow-400 text-xs bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />State column is required to run the analysis.
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />{error}
                  </div>
                )}
                <Button onClick={handleAnalyze} disabled={colMap.state == null || isLoading}
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_20px_rgba(230,180,0,0.3)] border border-primary/50 gap-2">
                  {isLoading ? <><Activity className="h-4 w-4 animate-spin" />Analyzing…</> : <><Zap className="h-4 w-4" />Analyze Locations</>}
                </Button>
              </CardContent>
            </Card>

            {/* Preview table */}
            <Card className="glass-panel border-white/[0.06]">
              <CardHeader className="border-b border-white/[0.05] pb-3">
                <CardTitle className="text-sm text-white">Data Preview (first 6 rows)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.05]">
                        {parsed.headers.map((h, i) => (
                          <th key={i} className="px-4 py-2.5 text-left font-bold text-muted-foreground whitespace-nowrap">
                            <span className="flex items-center gap-1.5">
                              {i === colMap.state ? <span className="text-[8px] bg-primary/20 text-primary border border-primary/30 px-1 rounded">STATE</span> : i === colMap.city ? <span className="text-[8px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1 rounded">CITY</span> : null}
                              {h}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.preview.map((row, i) => (
                        <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                          {parsed.headers.map((h, j) => (
                            <td key={j} className="px-4 py-2 text-muted-foreground whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis">{row[h] || "—"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Stage: Results ── */}
        {stage === "results" && results && (
          <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Summary bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Rows Processed", val: results.totalRows.toLocaleString(), icon: FileSpreadsheet, color: "text-primary" },
                { label: "Unique States",         val: results.uniqueStates,               icon: MapPin,          color: "text-blue-400" },
                { label: "Unique Locations",      val: results.uniqueLocations,            icon: Building2,       color: "text-purple-400" },
                { label: "Coverage Gaps",         val: results.locations.filter((l) => l.gapScore === "Critical" || l.gapScore === "High").length, icon: AlertTriangle, color: "text-red-400" },
              ].map((s) => (
                <div key={s.label} className="glass-panel border border-white/[0.06] rounded-xl p-4 text-center">
                  <s.icon className={`h-4 w-4 ${s.color} mx-auto mb-2`} />
                  <div className={`text-2xl font-black ${s.color} leading-none`}>{s.val}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[180px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <input
                  className="w-full h-9 bg-black/40 border border-white/10 text-white text-sm rounded-lg pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/40"
                  placeholder="Filter by state or city…"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
                {filterText && <button onClick={() => setFilterText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-white"><X className="h-3.5 w-3.5" /></button>}
              </div>
              <div className="flex items-center gap-1 bg-black/30 border border-white/[0.07] rounded-lg p-1">
                {(["states", "locations"] as const).map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === t ? "bg-white/[0.08] text-white" : "text-muted-foreground hover:text-white"}`}>
                    {t === "states" ? "By State" : "By Location"}
                  </button>
                ))}
              </div>
              {activeTab === "locations" && (
                <div className="flex items-center gap-1 bg-black/30 border border-white/[0.07] rounded-lg p-1">
                  <ArrowUpDown className="h-3 w-3 text-muted-foreground/50 ml-2" />
                  {([["attempts", "Attempts"], ["providers", "Providers"], ["gap", "Gap"]] as const).map(([val, lbl]) => (
                    <button key={val} onClick={() => setSortBy(val)}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === val ? "bg-white/[0.08] text-white" : "text-muted-foreground hover:text-white"}`}>
                      {lbl}
                    </button>
                  ))}
                </div>
              )}
              <Button variant="outline" onClick={exportCSV} className="border-white/10 text-muted-foreground hover:text-white gap-2 h-9 text-xs">
                <Download className="h-3.5 w-3.5" />Export CSV
              </Button>
            </div>

            {/* State view */}
            {activeTab === "states" && (
              <Card className="glass-panel border-white/[0.06]">
                <CardHeader className="border-b border-white/[0.05] pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />State Summary
                    </CardTitle>
                    <span className="text-[10px] text-muted-foreground">{filteredStates.length} state{filteredStates.length !== 1 ? "s" : ""}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.05]">
                          {["State", "Total Attempts", "Providers in DB", "Verified", "Outreach Attempts", "Coverage"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStates.map((s, i) => {
                          const maxAttempts = results.stateSummary[0]?.totalAttempts || 1;
                          const pct = (s.totalAttempts / maxAttempts) * 100;
                          const hasGap = s.totalAttempts >= 2 && s.providers < 2;
                          return (
                            <tr key={s.state} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === filteredStates.length - 1 ? "border-b-0" : ""}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {hasGap && <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />}
                                  <span className="text-sm font-bold text-white">{s.state}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-black text-primary w-8">{s.totalAttempts}</span>
                                  <div className="flex-1 max-w-[100px] h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-sm font-bold ${s.providers === 0 ? "text-red-400" : s.providers < 3 ? "text-yellow-400" : "text-green-400"}`}>{s.providers}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <ShieldCheck className="h-3 w-3 text-primary/60" />
                                  <span className="text-sm text-muted-foreground">{s.verifiedProviders}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">{s.outreachAttempts}</td>
                              <td className="px-4 py-3">
                                {s.providers === 0 ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={GAP_CONFIG.Critical}>No Coverage</span>
                                ) : s.providers < s.totalAttempts ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={GAP_CONFIG.Medium}>Partial</span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={GAP_CONFIG.Low}>Covered</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredStates.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground text-sm">No states match your filter.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location view */}
            {activeTab === "locations" && (
              <Card className="glass-panel border-white/[0.06]">
                <CardHeader className="border-b border-white/[0.05] pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />Location Frequency
                    </CardTitle>
                    <span className="text-[10px] text-muted-foreground">{filteredLocations.length} location{filteredLocations.length !== 1 ? "s" : ""}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.05]">
                          {["State", "City", "Attempts", "Providers in DB", "Verified", "Gap Score"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLocations.map((loc, i) => {
                          const gc = GAP_CONFIG[loc.gapScore] || GAP_CONFIG.Low;
                          return (
                            <tr key={`${loc.state}::${loc.city}`} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === filteredLocations.length - 1 ? "border-b-0" : ""}`}>
                              <td className="px-4 py-3 text-sm font-bold text-white">{loc.state}</td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">{loc.city || <span className="text-muted-foreground/30 italic text-xs">statewide</span>}</td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-black text-primary">{loc.attempts}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-sm font-bold ${loc.providers === 0 ? "text-red-400" : loc.providers < 3 ? "text-yellow-400" : "text-green-400"}`}>{loc.providers}</span>
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">{loc.verifiedProviders}</td>
                              <td className="px-4 py-3">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: gc.color, background: gc.bg, borderColor: gc.border }}>{loc.gapScore}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredLocations.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground text-sm">No locations match your filter.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Critical gaps callout */}
            {results.locations.some((l) => l.gapScore === "Critical") && (
              <div className="flex items-start gap-3 p-4 bg-red-500/[0.08] border border-red-500/20 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-red-400 mb-1">Critical Coverage Gaps Detected</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {results.locations.filter((l) => l.gapScore === "Critical").map((l) => `${l.state}${l.city ? ` (${l.city})` : ""}`).join(", ")} — these regions have been searched multiple times but have no providers in the database. Initiate sourcing campaigns immediately.
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
