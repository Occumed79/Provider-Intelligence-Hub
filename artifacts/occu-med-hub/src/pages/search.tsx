import React, { useState } from "react";
import { useSearch, getSearchQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon, Building2, FileText, ArrowRight, Fingerprint, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Search() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useSearch(
    { q: debouncedQuery }, 
    { query: { enabled: debouncedQuery.length > 2, queryKey: getSearchQueryKey({ q: debouncedQuery }) } }
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pt-8 pb-12">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-4 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]">
           <Activity className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight glow-text text-white">Global Database Search</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Deep search across all providers, ingested evidence, and extracted entities.</p>
        
        <div className="relative max-w-3xl mx-auto mt-8">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-30 pointer-events-none" />
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
          <Input 
            className="h-16 pl-16 pr-6 bg-black/60 border border-white/10 text-xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_30px_rgba(168,85,247,0.15)] focus-visible:ring-primary/50 focus-visible:border-primary placeholder:text-muted-foreground/40 rounded-2xl transition-all"
            placeholder="Search clinics, cities, services, or raw intelligence..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <AnimatePresence>
        {debouncedQuery.length > 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {isLoading ? (
              <div className="space-y-8">
                <Skeleton className="h-40 w-full bg-white/5 rounded-2xl" />
                <Skeleton className="h-40 w-full bg-white/5 rounded-2xl" />
              </div>
            ) : results ? (
              <>
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                   <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Search Results for <span className="text-white">"{debouncedQuery}"</span></h2>
                   <div className="text-xs font-bold bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                      {results.totalResults} Found
                   </div>
                </div>

                {/* Providers Section */}
                <div className="space-y-4 relative">
                  <div className="absolute -left-6 top-0 bottom-0 w-1 bg-primary/50 rounded-r shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                  <h3 className="text-lg font-bold flex items-center gap-3 text-white">
                    <Building2 className="h-5 w-5 text-primary" /> 
                    Provider Profiles 
                    <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-white/10">{results.providers?.length || 0}</span>
                  </h3>
                  
                  {results.providers?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.providers.map(provider => (
                        <Link key={provider.id} href={`/providers/${provider.id}`} className="block">
                          <Card className="glass-panel border-white/[0.05] bg-black/40 hover:bg-black/60 hover:border-primary/30 transition-all duration-300 group h-full">
                            <CardContent className="p-5 flex items-start justify-between">
                              <div className="min-w-0 pr-4">
                                <div className="font-bold text-white group-hover:text-primary group-hover:glow-text transition-colors text-lg truncate mb-1">{provider.clinicName}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span className="truncate">{provider.city}, {provider.state}</span>
                                  <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                                  <span className="truncate">{provider.clinicType || "Clinic"}</span>
                                </div>
                              </div>
                              <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all">
                                 <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground bg-white/[0.02] border border-white/[0.05] rounded-xl border-dashed">
                       No matching provider profiles found.
                    </div>
                  )}
                </div>

                {/* Evidence Section */}
                <div className="space-y-4 relative">
                  <div className="absolute -left-6 top-0 bottom-0 w-1 bg-primary/50 rounded-r shadow-[0_0_10px_rgba(230,180,0,0.5)]" />
                  <h3 className="text-lg font-bold flex items-center gap-3 text-white mt-12">
                    <FileText className="h-5 w-5 text-primary" /> 
                    Source Evidence 
                    <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-white/10">{results.evidenceFiles?.length || 0}</span>
                  </h3>
                  
                  {results.evidenceFiles?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.evidenceFiles.map(file => (
                        <Link key={file.id} href={`/evidence?file=${file.id}`} className="block">
                          <Card className="glass-panel border-white/[0.05] bg-black/40 hover:bg-black/60 hover:border-primary/30 transition-all duration-300 group h-full">
                            <CardContent className="p-5 flex items-start justify-between">
                              <div className="min-w-0 pr-4">
                                <div className="font-bold text-white group-hover:text-primary transition-colors text-base truncate mb-1">{file.originalFilename}</div>
                                <div className="text-xs text-muted-foreground flex flex-col gap-1 mt-2">
                                  <span className="uppercase tracking-wider font-bold text-[10px] bg-white/5 inline-block px-1.5 py-0.5 rounded border border-white/10 w-fit">{file.category || file.fileType}</span>
                                  {file.associatedProvider && <span className="truncate mt-1 text-white/60">Linked: {file.associatedProvider}</span>}
                                </div>
                              </div>
                              <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:shadow-[0_0_10px_rgba(230,180,0,0.4)] transition-all">
                                 <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground bg-white/[0.02] border border-white/[0.05] rounded-xl border-dashed">
                       No matching source documents found.
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}