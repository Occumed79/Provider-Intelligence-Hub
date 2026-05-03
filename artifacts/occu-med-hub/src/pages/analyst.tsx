import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useListProviders } from "@workspace/api-client-react";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Download,
  Search,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Filter,
  Globe,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  Activity,
  Network,
  Layers,
  FileText,
  ExternalLink,
  Package2,
  Truck,
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

type ServiceEntry = { name: string; count: number };
type ServiceMatrix = {
  services: string[];
  providers: Array<{
    id: number;
    clinicName: string;
    city: string | null;
    state: string | null;
    verificationStatus: string;
    tpaFriendly: boolean;
    services: Record<string, boolean>;
  }>;
};
type CoverageGaps = {
  services: string[];
  states: string[];
  gaps: Array<Record<string, number> & { state: string }>;
  serviceSummary: Array<{ service: string; statesCovered: number; totalStates: number; gapStates: number }>;
};

type SupplyVendor = {
  name: string;
  openOrders: number;
  lastDelivery: string;
  nextETA: string;
  stockStatus: "On Track" | "Watch" | "Delayed";
  clinicCount: number;
};

type SupplyLine = {
  item: string;
  unit: string;
  qtySent: number;
  qtyReceived: number;
  shipDate: string;
  clinicName: string;
  clinicAddress: string;
  tracking: string;
  carrier: "FedEx" | "Local";
  section: string;
};

type ClinicNews = {
  clinic: string;
  city: string;
  state: string;
  headline: string;
  type: "Opening" | "Closing" | "Expansion" | "Relocation" | "Leadership";
  date: string;
  notes: string;
};

const KNOWN_SERVICES = [
  "Drug Testing", "DOT Physicals", "Physical Exams", "Chest X-Ray", "Audiometry",
  "Vision Testing", "Pulmonary Function", "Spirometry", "Stress Testing", "EKG",
  "Lab Work", "Urine Testing", "Hair Testing", "Breath Alcohol", "MRO Services",
  "Urgent Care", "Occupational Therapy", "Workers Comp", "Pre-Employment",
];

export default function Analyst() {
  const [activeTab, setActiveTab] = useState("service-search");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [stateFilter, setStateFilter] = useState("");
  const [verifyFilter, setVerifyFilter] = useState("");
  const [tpaOnly, setTpaOnly] = useState(false);
  const [textSearch, setTextSearch] = useState("");
  const [matrixSearch, setMatrixSearch] = useState("");
  const [exportState, setExportState] = useState("");
  const [exportService, setExportService] = useState("");
  const [exportVerify, setExportVerify] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [supplySearch, setSupplySearch] = useState("");
  const [supplyForm, setSupplyForm] = useState({
    clinicName: "",
    clinicAddress: "",
    section: "",
    item: "",
    unit: "",
    qtySent: "",
    qtyReceived: "",
    shipDate: "",
    tracking: "",
    carrier: "FedEx",
    vendor: "Labcorp",
  });
  const [newsSearch, setNewsSearch] = useState("");

  const { data: allProviders, isLoading: loadingProviders } = useListProviders();

  const { data: services, isLoading: loadingServices } = useQuery<ServiceEntry[]>({
    queryKey: ["/api/analytics/services"],
    queryFn: () => customFetch("/api/analytics/services"),
  });

  const { data: matrix, isLoading: loadingMatrix } = useQuery<ServiceMatrix>({
    queryKey: ["/api/analytics/service-matrix"],
    queryFn: () => customFetch("/api/analytics/service-matrix"),
    enabled: activeTab === "service-matrix",
  });

  const { data: gaps, isLoading: loadingGaps } = useQuery<CoverageGaps>({
    queryKey: ["/api/analytics/coverage-gaps"],
    queryFn: () => customFetch("/api/analytics/coverage-gaps"),
    enabled: activeTab === "coverage-gaps",
  });

  const supplyVendors: SupplyVendor[] = [
    { name: "Labcorp", openOrders: 14, lastDelivery: "May 1", nextETA: "May 6", stockStatus: "Watch", clinicCount: 22 },
    { name: "CRL", openOrders: 9, lastDelivery: "Apr 29", nextETA: "May 5", stockStatus: "On Track", clinicCount: 17 },
  ];

  const [supplyLines, setSupplyLines] = useState<SupplyLine[]>([
    { item: "KAB Reqs", unit: "packs", qtySent: 24, qtyReceived: 22, shipDate: "2026-05-01", clinicName: "Northside Occ Med", clinicAddress: "1200 Main St, Dallas, TX", tracking: "4490 1234 5678", carrier: "FedEx", section: "Requests" },
    { item: "COCs", unit: "booklets", qtySent: 40, qtyReceived: 40, shipDate: "2026-05-02", clinicName: "Northside Occ Med", clinicAddress: "1200 Main St, Dallas, TX", tracking: "4490 1234 8899", carrier: "FedEx", section: "Forms" },
    { item: "Blood Collection Tubes", unit: "cases", qtySent: 8, qtyReceived: 8, shipDate: "2026-05-01", clinicName: "Riverbend Clinic", clinicAddress: "44 River Rd, Tampa, FL", tracking: "CRL-77821", carrier: "Local", section: "Specimen" },
    { item: "Heavy Metal Testing Tubes", unit: "boxes", qtySent: 12, qtyReceived: 11, shipDate: "2026-05-03", clinicName: "Riverbend Clinic", clinicAddress: "44 River Rd, Tampa, FL", tracking: "4490 2345 0021", carrier: "FedEx", section: "Toxicology" },
    { item: "QFT Tubes", unit: "kits", qtySent: 16, qtyReceived: 14, shipDate: "2026-05-03", clinicName: "Lakeside Health", clinicAddress: "89 Lake Ave, Phoenix, AZ", tracking: "4490 2345 7781", carrier: "FedEx", section: "Immunology" },
    { item: "Split Urine Specimen Collectors", unit: "units", qtySent: 30, qtyReceived: 29, shipDate: "2026-05-02", clinicName: "Lakeside Health", clinicAddress: "89 Lake Ave, Phoenix, AZ", tracking: "4490 2345 9911", carrier: "FedEx", section: "Urine" },
  ]);
  const clinicNews: ClinicNews[] = [
    { clinic: "Northside Occ Med", city: "Dallas", state: "TX", headline: "Opened new satellite draw site", type: "Opening", date: "2026-05-02", notes: "Expanded same-day testing capacity for employer walk-ins." },
    { clinic: "Riverbend Clinic", city: "Tampa", state: "FL", headline: "Added onsite heavy metal collection lane", type: "Expansion", date: "2026-05-01", notes: "Requested higher tube volume and extra courier pickups." },
    { clinic: "Lakeside Health", city: "Phoenix", state: "AZ", headline: "Closed evening hours at one location", type: "Closing", date: "2026-04-30", notes: "May shift some collections to nearby partner sites." },
    { clinic: "Metro Occupational", city: "Columbus", state: "OH", headline: "New medical director announced", type: "Leadership", date: "2026-05-03", notes: "Potential contracting and referral changes expected." },
    { clinic: "Westgate Wellness", city: "Orlando", state: "FL", headline: "Relocating to larger office park suite", type: "Relocation", date: "2026-05-01", notes: "Clinic address update pending with vendor and payor contacts." },
  ];

  const toggleService = (svc: string) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc],
    );
  };

  const filteredProviders = useMemo(() => {
    if (!allProviders) return [];
    return allProviders.filter((p) => {
      if (textSearch && !p.clinicName.toLowerCase().includes(textSearch.toLowerCase()) &&
        !(p.city?.toLowerCase().includes(textSearch.toLowerCase())) &&
        !(p.state?.toLowerCase().includes(textSearch.toLowerCase()))) return false;
      if (stateFilter && p.state?.toUpperCase() !== stateFilter.toUpperCase()) return false;
      if (verifyFilter && p.verificationStatus !== verifyFilter) return false;
      if (tpaOnly && !(p.tpaFriendlyClues || p.employerAccountClues || p.corporateBillingClues)) return false;
      if (selectedServices.length > 0) {
        const provSvcs = (p.servicesOffered || "").toLowerCase();
        const match = selectedServices.every((s) => provSvcs.includes(s.toLowerCase()));
        if (!match) return false;
      }
      return true;
    });
  }, [allProviders, textSearch, stateFilter, verifyFilter, tpaOnly, selectedServices]);

  const allStates = useMemo(() => {
    if (!allProviders) return [];
    return Array.from(new Set(allProviders.map((p) => p.state).filter(Boolean))).sort() as string[];
  }, [allProviders]);

  const networkStats = useMemo(() => {
    if (!allProviders) return null;
    const verified = allProviders.filter((p) => p.verificationStatus === "Verified").length;
    const tpa = allProviders.filter((p) => p.tpaFriendlyClues || p.employerAccountClues || p.corporateBillingClues).length;
    const mapped = allProviders.filter((p) => p.latitude || p.longitude).length;
    const states = new Set(allProviders.map((p) => p.state).filter(Boolean)).size;
    const multiSource = allProviders.filter((p) => (p.sourceCount as number) > 1).length;
    return { total: allProviders.length, verified, tpa, mapped, states, multiSource };
  }, [allProviders]);

  const filteredMatrix = useMemo(() => {
    if (!matrix) return matrix;
    if (!matrixSearch) return matrix;
    return {
      ...matrix,
      providers: matrix.providers.filter(
        (p) =>
          p.clinicName.toLowerCase().includes(matrixSearch.toLowerCase()) ||
          (p.state?.toLowerCase().includes(matrixSearch.toLowerCase())),
      ),
    };
  }, [matrix, matrixSearch]);

  const handleGenerateReport = () => {
    const params = new URLSearchParams();
    if (exportState) params.set("state", exportState);
    if (exportService) params.set("service", exportService);
    if (exportVerify) params.set("verificationStatus", exportVerify);
    const url = `/api/analytics/report${params.toString() ? "?" + params.toString() : ""}`;
    window.open(url, "_blank");
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (exportState) params.set("state", exportState);
      if (exportService) params.set("service", exportService);
      if (exportVerify) params.set("verificationStatus", exportVerify);
      const url = `/api/analytics/export${params.toString() ? "?" + params.toString() : ""}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `occu-med-providers-${Date.now()}.csv`;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  const topServices = services?.slice(0, 18) || [];
  const displayServices = topServices.length > 0 ? topServices : KNOWN_SERVICES.slice(0, 16).map(s => ({ name: s.toUpperCase(), count: 0 }));
  const filteredSupplies = supplyVendors.filter((v) => v.name.toLowerCase().includes(supplySearch.toLowerCase()));
  const filteredClinicNews = clinicNews.filter((n) =>
    [n.clinic, n.city, n.state, n.headline, n.notes].join(" ").toLowerCase().includes(newsSearch.toLowerCase()),
  );
  const supplyTotals = supplyLines.reduce((acc, line) => {
    acc.sent += line.qtySent;
    acc.received += line.qtyReceived;
    acc.pending += Math.max(line.qtySent - line.qtyReceived, 0);
    return acc;
  }, { sent: 0, received: 0, pending: 0 });
  const addSupplyLine = () => {
    if (!supplyForm.item || !supplyForm.clinicName || !supplyForm.shipDate) return;
    setSupplyLines((prev) => [
      {
        item: supplyForm.item,
        unit: supplyForm.unit || "units",
        qtySent: Number(supplyForm.qtySent || 0),
        qtyReceived: Number(supplyForm.qtyReceived || 0),
        shipDate: supplyForm.shipDate,
        clinicName: supplyForm.clinicName,
        clinicAddress: supplyForm.clinicAddress,
        tracking: supplyForm.tracking || "—",
        carrier: supplyForm.carrier as "FedEx" | "Local",
        section: supplyForm.section || "General",
      },
      ...prev,
    ]);
    setSupplyForm({ clinicName: "", clinicAddress: "", section: "", item: "", unit: "", qtySent: "", qtyReceived: "", shipDate: "", tracking: "", carrier: "FedEx", vendor: "Labcorp" });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Network className="h-8 w-8 text-primary drop-shadow-[0_0_12px_rgba(230,180,0,0.6)]" />
            Analyst Tools
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-2xl leading-relaxed">
            Advanced network analysis suite. Service-filtered search, provider-service matrix, coverage gap detection, and bulk export.
          </p>
        </div>
        {networkStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-panel px-4 py-3 rounded-xl border-white/[0.08] text-center">
              <div className="text-xl font-bold text-white">{networkStats.total}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Providers</div>
            </div>
            <div className="glass-panel px-4 py-3 rounded-xl border-white/[0.08] text-center">
              <div className="text-xl font-bold text-amber-400">{networkStats.verified}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Verified</div>
            </div>
            <div className="glass-panel px-4 py-3 rounded-xl border-white/[0.08] text-center">
              <div className="text-xl font-bold text-white">{networkStats.states}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">States</div>
            </div>
            <div className="glass-panel px-4 py-3 rounded-xl border-white/[0.08] text-center">
              <div className="text-xl font-bold text-primary">{networkStats.tpa}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">TPA / Corp</div>
            </div>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-black/40 border border-white/[0.08] p-1 rounded-xl h-auto flex flex-wrap gap-1">
          <TabsTrigger value="service-search" className="data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold rounded-lg px-4 py-2 text-sm text-muted-foreground">
            <Search className="h-3.5 w-3.5 mr-2" />Service Search
          </TabsTrigger>
          <TabsTrigger value="service-matrix" className="data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold rounded-lg px-4 py-2 text-sm text-muted-foreground">
            <Layers className="h-3.5 w-3.5 mr-2" />Service Matrix
          </TabsTrigger>
          <TabsTrigger value="coverage-gaps" className="data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold rounded-lg px-4 py-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 mr-2" />Coverage Gaps
          </TabsTrigger>
          <TabsTrigger value="network-report" className="data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold rounded-lg px-4 py-2 text-sm text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5 mr-2" />Network Report
          </TabsTrigger>
          <TabsTrigger value="export" className="data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold rounded-lg px-4 py-2 text-sm text-muted-foreground">
            <Download className="h-3.5 w-3.5 mr-2" />Export
          </TabsTrigger>
          <TabsTrigger value="supplies" className="data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold rounded-lg px-4 py-2 text-sm text-muted-foreground">
            <Package2 className="h-3.5 w-3.5 mr-2" />Lab Supplies
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Service Search ── */}
        <TabsContent value="service-search" className="space-y-5">
          <Card className="glass-panel border-white/[0.06]">
            <CardHeader className="pb-4 border-b border-white/[0.05]">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Filter className="h-4 w-4 text-primary" /> Filter Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Clinic name, city, state…" className="pl-9 bg-black/40 border-white/10 text-white h-10" value={textSearch} onChange={(e) => setTextSearch(e.target.value)} />
                </div>
                <select
                  className="h-10 rounded-lg bg-black/40 border border-white/10 text-sm text-white px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                >
                  <option value="">All States</option>
                  {allStates.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  className="h-10 rounded-lg bg-black/40 border border-white/10 text-sm text-white px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={verifyFilter}
                  onChange={(e) => setVerifyFilter(e.target.value)}
                >
                  <option value="">Any Verification</option>
                  <option value="Verified">Verified</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Flagged">Flagged</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Filter by Service</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTpaOnly(!tpaOnly)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wider transition-all ${tpaOnly ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-white/[0.03] text-muted-foreground border-white/10 hover:border-white/20"}`}
                    >
                      <CreditCard className="h-3 w-3 inline mr-1.5" />TPA / Corp Only
                    </button>
                    {selectedServices.length > 0 && (
                      <button onClick={() => setSelectedServices([])} className="text-xs text-muted-foreground hover:text-white underline underline-offset-2">Clear all</button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {loadingServices
                    ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-7 w-24 rounded-full bg-white/5" />)
                    : displayServices.map((svc) => {
                        const active = selectedServices.includes(svc.name);
                        return (
                          <button
                            key={svc.name}
                            onClick={() => toggleService(svc.name)}
                            className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${active ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_rgba(230,180,0,0.2)]" : "bg-white/[0.04] text-slate-400 border-white/[0.1] hover:bg-white/[0.08] hover:text-white hover:border-white/20"}`}
                          >
                            {svc.name}{svc.count > 0 && <span className="ml-1.5 opacity-50 text-[9px]">{svc.count}</span>}
                          </button>
                        );
                      })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <span className="text-white font-bold">{filteredProviders.length}</span> providers match
              {selectedServices.length > 0 && <span className="ml-1 text-primary">· {selectedServices.length} service filter{selectedServices.length > 1 ? "s" : ""} active</span>}
            </span>
          </div>

          <div className="grid gap-3">
            {loadingProviders
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />)
              : filteredProviders.length > 0
              ? filteredProviders.map((provider) => (
                  <motion.div key={provider.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <Link href={`/providers/${provider.id}`} className="block group">
                      <Card className="glass-panel border-white/[0.05] bg-black/40 hover:bg-black/60 hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                              <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-white group-hover:text-primary transition-colors truncate">{provider.clinicName}</span>
                                {provider.verificationStatus === "Verified" && <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[9px] uppercase tracking-widest px-1.5 shrink-0">Verified</Badge>}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{provider.city}, {provider.state}</span>
                                {(provider.tpaFriendlyClues || provider.employerAccountClues) && (
                                  <span className="flex items-center gap-1 text-amber-400/80"><CreditCard className="h-3 w-3" />TPA Friendly</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="hidden md:flex flex-wrap gap-1.5 max-w-[300px]">
                              {provider.servicesOffered?.split(",").slice(0, 4).map((s, i) => {
                                const svcName = s.trim().toUpperCase();
                                const isMatch = selectedServices.includes(svcName);
                                return (
                                  <span key={i} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${isMatch ? "text-primary bg-primary/10 border-primary/30" : "text-slate-400 bg-white/[0.04] border-white/[0.08]"}`}>
                                    {s.trim()}
                                  </span>
                                );
                              })}
                              {(provider.servicesOffered?.split(",").length || 0) > 4 && (
                                <span className="text-[10px] text-muted-foreground border border-white/10 px-2 py-0.5 rounded bg-white/[0.02]">+{provider.servicesOffered!.split(",").length - 4} more</span>
                              )}
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              : (
                <Card className="glass-panel border-white/5 bg-black/30">
                  <CardContent className="h-48 flex flex-col items-center justify-center text-center">
                    <Search className="h-10 w-10 text-muted-foreground/20 mb-3" />
                    <p className="text-muted-foreground font-medium">No providers match the selected filters.</p>
                    <p className="text-muted-foreground/60 text-sm mt-1">Try removing some service filters or adjusting the state filter.</p>
                  </CardContent>
                </Card>
              )}
          </div>
        </TabsContent>

        <TabsContent value="network-report" className="space-y-5">
          <Card className="glass-panel border-white/[0.06]">
            <CardHeader className="border-b border-white/[0.05] pb-4 flex flex-row items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />Clinic Business Decisions
                </CardTitle>
                <CardDescription className="text-xs mt-1 text-muted-foreground">
                  Opens, closures, relocations, and leadership changes that affect network planning.
                </CardDescription>
              </div>
              <Input value={newsSearch} onChange={(e) => setNewsSearch(e.target.value)} placeholder="Search clinic news…" className="w-full sm:w-64 bg-black/40 border-white/10 text-white h-9" />
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Openings", value: clinicNews.filter((n) => n.type === "Opening").length },
                  { label: "Closings", value: clinicNews.filter((n) => n.type === "Closing").length },
                  { label: "Expansions", value: clinicNews.filter((n) => n.type === "Expansion").length },
                  { label: "Relocations", value: clinicNews.filter((n) => n.type === "Relocation").length },
                ].map((k) => (
                  <div key={k.label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 text-center">
                    <div className="text-2xl font-black text-primary">{k.value}</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {filteredClinicNews.map((n) => (
                  <div key={`${n.clinic}-${n.date}`} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="text-sm font-bold text-white">{n.clinic}</div>
                        <div className="text-xs text-muted-foreground">{n.city}, {n.state} · {n.date}</div>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20">{n.type}</Badge>
                    </div>
                    <div className="mt-3 text-sm text-white font-medium">{n.headline}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{n.notes}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplies" className="space-y-5">
          <Card className="glass-panel border-white/[0.06]">
            <CardHeader className="border-b border-white/[0.05] pb-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />Clinic Supply Tracker
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs mt-1">
                    Track lab supply flow from Labcorp and CRL to support clinic replenishment.
                  </CardDescription>
                </div>
                <Input
                  value={supplySearch}
                  onChange={(e) => setSupplySearch(e.target.value)}
                  placeholder="Search vendor…"
                  className="w-full sm:w-64 bg-black/40 border-white/10 text-white h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                  <div className="text-2xl font-black text-primary">{supplyTotals.sent}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Total Sent</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                  <div className="text-2xl font-black text-white">{supplyTotals.received}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Total Received</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                  <div className="text-2xl font-black text-orange-400">{supplyTotals.pending}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Pending</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Input placeholder="Clinic name" value={supplyForm.clinicName} onChange={(e) => setSupplyForm((p) => ({ ...p, clinicName: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
                <Input placeholder="Clinic address" value={supplyForm.clinicAddress} onChange={(e) => setSupplyForm((p) => ({ ...p, clinicAddress: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
                <Input placeholder="Section (Requests, COCs, Specimen…)" value={supplyForm.section} onChange={(e) => setSupplyForm((p) => ({ ...p, section: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
                <Input placeholder="Item" value={supplyForm.item} onChange={(e) => setSupplyForm((p) => ({ ...p, item: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
                <Input placeholder="Unit" value={supplyForm.unit} onChange={(e) => setSupplyForm((p) => ({ ...p, unit: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
                <Input type="date" value={supplyForm.shipDate} onChange={(e) => setSupplyForm((p) => ({ ...p, shipDate: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
                <Input placeholder="Qty sent" value={supplyForm.qtySent} onChange={(e) => setSupplyForm((p) => ({ ...p, qtySent: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
                <Input placeholder="Qty received" value={supplyForm.qtyReceived} onChange={(e) => setSupplyForm((p) => ({ ...p, qtyReceived: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
                <Input placeholder="Tracking number" value={supplyForm.tracking} onChange={(e) => setSupplyForm((p) => ({ ...p, tracking: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
                <select value={supplyForm.carrier} onChange={(e) => setSupplyForm((p) => ({ ...p, carrier: e.target.value }))} className="h-10 rounded-lg bg-black/40 border border-white/10 text-sm text-white px-3">
                  <option value="FedEx">FedEx</option>
                  <option value="Local">Local</option>
                </select>
                <select value={supplyForm.vendor} onChange={(e) => setSupplyForm((p) => ({ ...p, vendor: e.target.value }))} className="h-10 rounded-lg bg-black/40 border border-white/10 text-sm text-white px-3">
                  <option value="Labcorp">Labcorp</option>
                  <option value="CRL">CRL</option>
                </select>
                <div className="flex items-end">
                  <Button onClick={addSupplyLine} className="w-full bg-primary text-black hover:bg-primary/90">Add shipment</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSupplies.map((vendor) => (
                  <div key={vendor.name} className="glass-panel border border-white/[0.06] rounded-xl p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-bold text-white">{vendor.name}</div>
                        <div className="text-xs text-muted-foreground">Clinics served: {vendor.clinicCount}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                        vendor.stockStatus === "On Track"
                          ? "text-green-400 bg-green-500/10 border-green-500/20"
                          : vendor.stockStatus === "Watch"
                            ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                            : "text-red-400 bg-red-500/10 border-red-500/20"
                      }`}>
                        {vendor.stockStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 text-center">
                        <div className="text-2xl font-black text-primary">{vendor.openOrders}</div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Open Orders</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 text-center">
                        <div className="text-sm font-bold text-white">{vendor.lastDelivery}</div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Last Delivery</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 text-center">
                        <div className="text-sm font-bold text-white">{vendor.nextETA}</div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Next ETA</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">Shipment Log</div>
                    <div className="text-xs text-muted-foreground">FedEx tracking, item counts, clinic info, dates, and section tags</div>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                  <table className="w-full text-xs">
                    <thead className="bg-white/[0.03]">
                      <tr className="text-left text-muted-foreground uppercase tracking-wider">
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Clinic</th>
                        <th className="px-3 py-2">Address</th>
                        <th className="px-3 py-2">Section</th>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2">Sent</th>
                        <th className="px-3 py-2">Received</th>
                        <th className="px-3 py-2">Carrier</th>
                        <th className="px-3 py-2">Tracking</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplyLines.map((line, idx) => (
                        <tr key={`${line.item}-${idx}`} className="border-t border-white/[0.05]">
                          <td className="px-3 py-2 text-white">{line.shipDate}</td>
                          <td className="px-3 py-2 text-white">{line.clinicName}</td>
                          <td className="px-3 py-2 text-muted-foreground">{line.clinicAddress}</td>
                          <td className="px-3 py-2"><Badge className="bg-white/5 text-white border-white/10">{line.section}</Badge></td>
                          <td className="px-3 py-2 text-white">{line.item} <span className="text-muted-foreground">({line.unit})</span></td>
                          <td className="px-3 py-2 text-primary font-bold">{line.qtySent}</td>
                          <td className="px-3 py-2 text-green-400 font-bold">{line.qtyReceived}</td>
                          <td className="px-3 py-2 text-white">{line.carrier}</td>
                          <td className="px-3 py-2 text-muted-foreground">{line.tracking}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: Service Matrix ── */}
        <TabsContent value="service-matrix" className="space-y-5">
          <Card className="glass-panel border-white/[0.06]">
            <CardHeader className="pb-4 border-b border-white/[0.05] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-white flex items-center gap-2"><Layers className="h-4 w-4 text-primary" />Provider × Service Matrix</CardTitle>
                <CardDescription className="text-muted-foreground text-xs mt-1">Which providers offer which services — checkmarks confirm extracted intelligence.</CardDescription>
              </div>
              <div className="relative shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Filter providers…" className="pl-8 h-8 w-48 bg-black/40 border-white/10 text-white text-sm" value={matrixSearch} onChange={(e) => setMatrixSearch(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingMatrix ? (
                <div className="p-8 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full bg-white/5 rounded" />)}</div>
              ) : filteredMatrix ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                        <th className="text-left px-4 py-3 text-muted-foreground font-bold uppercase tracking-wider min-w-[200px] sticky left-0 bg-black/60 backdrop-blur-sm z-10">Provider</th>
                        <th className="px-2 py-3 text-muted-foreground font-bold uppercase tracking-wider text-center min-w-[60px]">State</th>
                        {filteredMatrix.services.map((svc) => (
                          <th key={svc} className="px-2 py-3 font-bold tracking-wider text-muted-foreground/70 text-center min-w-[80px]">
                            <div className="writing-mode-vertical transform -rotate-45 origin-left translate-y-6 text-[9px] whitespace-nowrap">{svc}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMatrix.providers.map((p, idx) => (
                        <tr key={p.id} className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group ${idx % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                          <td className="px-4 py-2.5 sticky left-0 bg-inherit backdrop-blur-sm z-10">
                            <Link href={`/providers/${p.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                              <div>
                                <div className="font-semibold text-white group-hover:text-primary transition-colors truncate max-w-[180px]">{p.clinicName}</div>
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                  {p.verificationStatus === "Verified" && <ShieldCheck className="h-3 w-3 text-amber-400" />}
                                  {p.tpaFriendly && <CreditCard className="h-3 w-3 text-amber-400/60" />}
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-2 py-2.5 text-center text-muted-foreground font-mono text-[10px]">{p.state || "—"}</td>
                          {filteredMatrix.services.map((svc) => (
                            <td key={svc} className="px-2 py-2.5 text-center">
                              {p.services[svc]
                                ? <CheckCircle2 className="h-4 w-4 text-amber-400 mx-auto drop-shadow-[0_0_4px_rgba(230,180,0,0.5)]" />
                                : <div className="h-4 w-4 mx-auto rounded-sm border border-white/[0.06] bg-white/[0.02]" />}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredMatrix.providers.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">No providers match your search.</div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">Failed to load matrix.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: Coverage Gaps ── */}
        <TabsContent value="coverage-gaps" className="space-y-5">
          {loadingGaps ? (
            <div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl bg-white/5" />)}</div>
          ) : gaps ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-panel border-white/[0.06]">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-white">{gaps.services.length}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Unique Services</div>
                  </CardContent>
                </Card>
                <Card className="glass-panel border-white/[0.06]">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-white">{gaps.states.length}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">States in Network</div>
                  </CardContent>
                </Card>
                <Card className="glass-panel border-white/[0.06]">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-400">{gaps.serviceSummary.filter(s => s.gapStates > 0).length}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Services with Gaps</div>
                  </CardContent>
                </Card>
                <Card className="glass-panel border-white/[0.06]">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-amber-400">{gaps.serviceSummary.filter(s => s.statesCovered === gaps.states.length).length}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Full Coverage Services</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-panel border-white/[0.06]">
                <CardHeader className="border-b border-white/[0.05] pb-4">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />Gap Analysis by Service
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">Services sorted by most uncovered states. Identifies where your network is weakest.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/[0.04]">
                    {gaps.serviceSummary.map((s) => {
                      const pct = (s.statesCovered / s.totalStates) * 100;
                      const color = pct >= 80 ? "bg-amber-400" : pct >= 50 ? "bg-yellow-500" : pct >= 20 ? "bg-orange-500" : "bg-red-500/70";
                      return (
                        <div key={s.service} className="px-5 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                          <div className="w-48 shrink-0">
                            <div className="text-sm font-semibold text-white truncate">{s.service}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{s.statesCovered}/{s.totalStates} states</div>
                          </div>
                          <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                          </div>
                          <div className="w-16 text-right shrink-0">
                            <span className={`text-sm font-bold ${pct >= 80 ? "text-amber-400" : pct >= 50 ? "text-yellow-400" : pct >= 20 ? "text-orange-400" : "text-red-400"}`}>{Math.round(pct)}%</span>
                          </div>
                          {s.gapStates > 0 && (
                            <div className="shrink-0">
                              <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-bold">{s.gapStates} gap{s.gapStates > 1 ? "s" : ""}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {gaps.states.length > 0 && gaps.services.length > 0 && (
                <Card className="glass-panel border-white/[0.06]">
                  <CardHeader className="border-b border-white/[0.05] pb-4">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />State × Service Heatmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="text-[10px] w-full">
                        <thead>
                          <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                            <th className="px-4 py-2.5 text-left text-muted-foreground font-bold uppercase tracking-wider sticky left-0 bg-black/60 backdrop-blur-sm z-10 min-w-[60px]">State</th>
                            {gaps.services.map((svc) => (
                              <th key={svc} className="px-2 py-2.5 text-muted-foreground font-bold text-center min-w-[70px]">
                                <div className="transform -rotate-45 origin-left translate-y-5 whitespace-nowrap tracking-wider">{svc}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {gaps.gaps.map((row, idx) => (
                            <tr key={row.state} className={`border-b border-white/[0.03] ${idx % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                              <td className="px-4 py-2 font-bold text-white sticky left-0 bg-inherit backdrop-blur-sm z-10">{row.state}</td>
                              {gaps.services.map((svc) => {
                                const count = row[svc] as number;
                                return (
                                  <td key={svc} className="px-2 py-2 text-center">
                                    <div className={`inline-flex items-center justify-center h-6 w-8 rounded text-[9px] font-bold mx-auto ${count > 2 ? "bg-amber-500/30 text-amber-300" : count > 0 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/10 text-red-400/60"}`}>
                                      {count > 0 ? count : "—"}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </TabsContent>

        {/* ── TAB 4: Network Report ── */}
        <TabsContent value="network-report" className="space-y-5">
          {networkStats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Total Providers", value: networkStats.total, icon: Building2, color: "text-white" },
                { label: "Verified", value: networkStats.verified, icon: ShieldCheck, color: "text-amber-400" },
                { label: "TPA / Corp Billing Ready", value: networkStats.tpa, icon: CreditCard, color: "text-amber-300" },
                { label: "Geo-Mapped", value: networkStats.mapped, icon: MapPin, color: "text-white" },
                { label: "States Covered", value: networkStats.states, icon: Globe, color: "text-white" },
                { label: "Multi-Source Confirmed", value: networkStats.multiSource, icon: Activity, color: "text-amber-400" },
              ].map((stat) => (
                <Card key={stat.label} className="glass-panel border-white/[0.06] overflow-hidden relative group">
                  <div className="absolute -right-3 -top-3 opacity-5 group-hover:opacity-10 transition-opacity">
                    <stat.icon className="h-20 w-20 text-primary" />
                  </div>
                  <CardContent className="p-5 relative z-10">
                    <stat.icon className="h-5 w-5 text-primary mb-3 drop-shadow-[0_0_6px_rgba(230,180,0,0.5)]" />
                    <div className={`text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</div>
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-2">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {services && services.length > 0 && (
            <Card className="glass-panel border-white/[0.06]">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />Top Services Extracted
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Services ranked by number of providers offering them.</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  {services.slice(0, 12).map((svc, idx) => {
                    const maxCount = services[0]?.count || 1;
                    const pct = (svc.count / maxCount) * 100;
                    return (
                      <div key={svc.name} className="flex items-center gap-3">
                        <div className="w-5 text-right text-[10px] text-muted-foreground/50 font-mono shrink-0">{idx + 1}</div>
                        <div className="w-44 shrink-0 text-sm font-medium text-white truncate">{svc.name}</div>
                        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full shadow-[0_0_6px_rgba(230,180,0,0.4)]" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-10 text-right text-xs font-bold text-muted-foreground shrink-0">{svc.count}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {allProviders && (
            <Card className="glass-panel border-white/[0.06]">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />High-Value Leads
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Providers with employer account, corporate billing, or TPA intelligence signals.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/[0.04]">
                  {allProviders.filter(p => p.tpaFriendlyClues || p.employerAccountClues || p.corporateBillingClues).slice(0, 8).map((p) => (
                    <Link key={p.id} href={`/providers/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors group">
                      <div>
                        <div className="font-semibold text-white group-hover:text-primary transition-colors text-sm">{p.clinicName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{p.city}, {p.state}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.tpaFriendlyClues && <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">TPA</span>}
                        {p.corporateBillingClues && <span className="text-[10px] font-bold bg-white/[0.05] text-slate-300 border border-white/[0.1] px-2 py-0.5 rounded uppercase tracking-wider">Corp</span>}
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                  {allProviders.filter(p => p.tpaFriendlyClues || p.employerAccountClues || p.corporateBillingClues).length === 0 && (
                    <div className="py-8 text-center text-muted-foreground text-sm">No high-value leads detected yet. Ingest more evidence to identify TPA-friendly providers.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── TAB 5: Export ── */}
        <TabsContent value="export" className="space-y-5">
          <Card className="glass-panel border-white/[0.06]">
            <CardHeader className="border-b border-white/[0.05] pb-4">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />Export Provider Data
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs mt-1">Download filtered provider intelligence as CSV. Includes all extracted fields, services, billing signals, and metadata.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filter by State</label>
                  <select className="w-full h-10 rounded-lg bg-black/40 border border-white/10 text-sm text-white px-3 focus:outline-none focus:ring-1 focus:ring-primary" value={exportState} onChange={(e) => setExportState(e.target.value)}>
                    <option value="">All States</option>
                    {allStates.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filter by Service</label>
                  <select className="w-full h-10 rounded-lg bg-black/40 border border-white/10 text-sm text-white px-3 focus:outline-none focus:ring-1 focus:ring-primary" value={exportService} onChange={(e) => setExportService(e.target.value)}>
                    <option value="">All Services</option>
                    {(services || []).map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Verification Status</label>
                  <select className="w-full h-10 rounded-lg bg-black/40 border border-white/10 text-sm text-white px-3 focus:outline-none focus:ring-1 focus:ring-primary" value={exportVerify} onChange={(e) => setExportVerify(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="Verified">Verified Only</option>
                    <option value="Needs Review">Needs Review</option>
                    <option value="Flagged">Flagged</option>
                  </select>
                </div>
              </div>

              <div className="bg-black/30 border border-white/[0.07] rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Fields Included in Export</div>
                <div className="flex flex-wrap gap-2">
                  {["ID", "Clinic Name", "Type", "Address", "City", "State", "ZIP", "Phone", "Fax", "Email", "Website", "Contact", "Services", "Pricing Notes", "Employer Account Clues", "Corporate Billing", "Net Terms", "Accepts Outside Forms", "TPA Friendly", "Payment Requirements", "Verification Status", "Source Count", "Notes", "Latitude", "Longitude"].map((f) => (
                    <span key={f} className="text-[10px] font-bold text-slate-400 bg-white/[0.04] border border-white/[0.07] px-2 py-1 rounded">{f}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_20px_rgba(230,180,0,0.3)] border border-primary/50 hover:shadow-[0_0_30px_rgba(230,180,0,0.5)] transition-all"
                >
                  {isExporting
                    ? <><Activity className="h-4 w-4 mr-2 animate-spin" />Generating CSV…</>
                    : <><Download className="h-4 w-4 mr-2" />Download CSV{exportState || exportService || exportVerify ? " (Filtered)" : " (All Providers)"}</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── PDF / HTML Report ── */}
          <Card className="glass-panel border-white/[0.06]">
            <CardHeader className="border-b border-white/[0.05] pb-4">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />Generate Provider Directory Report
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs mt-1">
                Opens a formatted, print-ready HTML report in a new tab. Use your browser's Print (Ctrl+P) to save as PDF. Shares the same filters set above.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {[
                  { icon: "📋", label: "Cover page", desc: "Date, filters, summary stats" },
                  { icon: "🏥", label: "Provider cards", desc: "Full contact & service details per provider" },
                  { icon: "🖨️", label: "Print-ready", desc: "Clean layout optimised for PDF / print" },
                ].map((f) => (
                  <div key={f.label} className="flex items-start gap-3 p-3 bg-white/[0.03] border border-white/[0.07] rounded-xl">
                    <span className="text-lg leading-none">{f.icon}</span>
                    <div>
                      <div className="font-bold text-white text-xs mb-0.5">{f.label}</div>
                      <div className="text-muted-foreground text-[10px]">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {(exportState || exportService || exportVerify) && (
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider mr-1">Active filters:</span>
                  {exportState && <span className="bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 rounded font-bold">State: {exportState}</span>}
                  {exportService && <span className="bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 rounded font-bold">Service: {exportService}</span>}
                  {exportVerify && <span className="bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 rounded font-bold">Status: {exportVerify}</span>}
                </div>
              )}

              <Button
                onClick={handleGenerateReport}
                className="h-12 px-8 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold border border-white/[0.12] hover:border-primary/40 transition-all group"
              >
                <FileText className="h-4 w-4 mr-2 text-primary group-hover:drop-shadow-[0_0_6px_rgba(230,180,0,0.7)] transition-all" />
                Open Report in New Tab
                <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-50" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
