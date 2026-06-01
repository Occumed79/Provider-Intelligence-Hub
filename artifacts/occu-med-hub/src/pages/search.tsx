import React, { useState } from "react";
import { useSearch, getSearchQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Building2, FileText, ArrowRight, Activity, X, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

type ResultType = "all" | "providers" | "evidence";

const suggestions = ["Concentra", "Dental", "Fee schedule", "TPA billing", "California", "Sterling"];

function safeText(value: unknown, fallback = "Unknown") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [resultType, setResultType] = useState<ResultType>("all");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useSearch(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length > 2, queryKey: getSearchQueryKey({ q: debouncedQuery }) } }
  );

  const providers = Array.isArray(results?.providers) ? results.providers : [];
  const evidenceFiles = Array.isArray(results?.evidenceFiles) ? results.evidenceFiles : [];
  const showProviders = resultType === "all" || resultType === "providers";
  const showEvidence = resultType === "all" || resultType === "evidence";
  const visibleCount = (showProviders ? providers.length : 0) + (showEvidence ? evidenceFiles.length : 0);
  const hasQuery = debouncedQuery.length > 2;

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    setResultType("all");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pt-8 pb-12">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-4 shadow-[inset_0_0_20px_rgba(18,173,165,0.1)]">
          <Activity className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(18,173,165,0.8)]" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight glow-text text-white">Global Database Search</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Deep search across providers, ingested evidence, and extracted entities.</p>

        <div className="relative max-w-3xl mx-auto mt-8">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-30 pointer-events-none" />
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary drop-shadow-[0_0_5px_rgba(18,173,165,0.5)]" />
          <Input
            className="h-16 pl-16 pr-14 bg-black/60 border border-white/10 text-xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_30px_rgba(18,173,165,0.15)] focus-visible:ring-primary/50 focus-visible:border-primary placeholder:text-muted-foreground/40 rounded-2xl transition-all"
            placeholder="Search clinics, cities, services, or raw intelligence..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" onClick={clearSearch} className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-1.5 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {suggestions.map((item) => (
            <button key={item} type="button" onClick={() => setQuery(item)} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10 transition-colors">
              <Sparkles className="h-3 w-3" /> {item}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-xl border border-white/10 bg-black/40 p-1">
          {([
            ["all", "All"],
            ["providers", "Providers"],
            ["evidence", "Evidence"],
          ] as [ResultType, string][]).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setResultType(value)} className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${resultType === value ? "bg-primary/20 text-white border border-primary/30" : "text-muted-foreground hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {!query.trim() && (
        <Card className="glass-panel border-white/[0.05] bg-black/30">
          <CardContent className="p-8 text-center text-muted-foreground">
            <SearchIcon className="h-10 w-10 mx-auto mb-4 text-primary/60" />
            <h2 className="text-lg font-bold text-white mb-2">Start with a clinic, service, city, state, or billing term.</h2>
            <p className="text-sm">Search results will include matching provider profiles and source evidence from the database.</p>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {hasQuery && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
            {isLoading ? (
              <div className="space-y-8"><Skeleton className="h-40 w-full bg-white/5 rounded-2xl" /><Skeleton className="h-40 w-full bg-white/5 rounded-2xl" /></div>
            ) : results ? (
              <>
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Search Results for <span className="text-white">&quot;{debouncedQuery}&quot;</span></h2>
                  <div className="text-xs font-bold bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30 shadow-[0_0_10px_rgba(18,173,165,0.2)]">{visibleCount} Visible</div>
                </div>

                {visibleCount === 0 && (
                  <Card className="glass-panel border-white/[0.05] bg-black/30">
                    <CardContent className="p-10 text-center text-muted-foreground">
                      <SearchIcon className="h-10 w-10 mx-auto mb-4 text-primary/50" />
                      <h3 className="text-lg font-bold text-white mb-2">No results found</h3>
                      <p className="text-sm mb-4">No {resultType === "all" ? "provider or evidence" : resultType} records matched this search.</p>
                      <Button type="button" variant="outline" onClick={clearSearch} className="border-white/10 bg-black/30 text-muted-foreground hover:text-white hover:bg-white/10">Clear search</Button>
                    </CardContent>
                  </Card>
                )}

                {showProviders && (
                  <ResultSection title="Provider Profiles" count={providers.length} icon={<Building2 className="h-5 w-5 text-primary" />}>
                    {providers.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{providers.map((provider) => <Link key={provider.id} href={`/providers/${provider.id}`} className="block"><Card className="glass-panel border-white/[0.05] bg-black/40 hover:bg-black/60 hover:border-primary/30 transition-all duration-300 group h-full"><CardContent className="p-5 flex items-start justify-between"><div className="min-w-0 pr-4"><div className="font-bold text-white group-hover:text-primary group-hover:glow-text transition-colors text-lg truncate mb-1">{safeText(provider.clinicName, `Provider #${provider.id}`)}</div><div className="text-sm text-muted-foreground flex items-center gap-2"><span className="truncate">{safeText(provider.city, "Unknown City")}, {safeText(provider.state, "--")}</span><span className="w-1 h-1 rounded-full bg-white/20 shrink-0" /><span className="truncate">{safeText(provider.clinicType, "Clinic")}</span></div></div><ResultArrow /></CardContent></Card></Link>)}</div> : <EmptyMini message="No matching provider profiles found." />}
                  </ResultSection>
                )}

                {showEvidence && (
                  <ResultSection title="Source Evidence" count={evidenceFiles.length} icon={<FileText className="h-5 w-5 text-primary" />}>
                    {evidenceFiles.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{evidenceFiles.map((file) => <Link key={file.id} href={`/evidence?file=${file.id}`} className="block"><Card className="glass-panel border-white/[0.05] bg-black/40 hover:bg-black/60 hover:border-primary/30 transition-all duration-300 group h-full"><CardContent className="p-5 flex items-start justify-between"><div className="min-w-0 pr-4"><div className="font-bold text-white group-hover:text-primary transition-colors text-base truncate mb-1">{safeText(file.originalFilename, `Evidence #${file.id}`)}</div><div className="text-xs text-muted-foreground flex flex-col gap-1 mt-2"><span className="uppercase tracking-wider font-bold text-[10px] bg-white/5 inline-block px-1.5 py-0.5 rounded border border-white/10 w-fit">{safeText(file.category || file.fileType, "Evidence")}</span>{file.associatedProvider && <span className="truncate mt-1 text-white/60">Linked: {file.associatedProvider}</span>}</div></div><ResultArrow /></CardContent></Card></Link>)}</div> : <EmptyMini message="No matching source documents found." />}
                  </ResultSection>
                )}
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultSection({ title, count, icon, children }: { title: string; count: number; icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="space-y-4 relative"><div className="absolute -left-6 top-0 bottom-0 w-1 bg-primary/50 rounded-r shadow-[0_0_10px_rgba(18,173,165,0.5)]" /><h3 className="text-lg font-bold flex items-center gap-3 text-white mt-8">{icon}{title}<span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-white/10">{count}</span></h3>{children}</div>;
}

function ResultArrow() {
  return <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:shadow-[0_0_10px_rgba(18,173,165,0.4)] transition-all"><ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" /></div>;
}

function EmptyMini({ message }: { message: string }) {
  return <div className="p-8 text-center text-muted-foreground bg-white/[0.02] border border-white/[0.05] rounded-xl border-dashed">{message}</div>;
}
