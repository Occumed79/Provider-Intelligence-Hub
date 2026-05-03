import React, { useState } from "react";
import { useListProviders } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, MapPin, ShieldCheck, ShieldAlert, Activity, CreditCard, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function Providers() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: providers, isLoading } = useListProviders();

  const filteredProviders = providers?.filter(p => 
    p.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.city && p.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.state && p.state.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight glow-text text-white">Provider Database</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl leading-relaxed">Verified facilities and intelligence profiles mapped from extracted evidence. Filter by location, services, or verification status.</p>
        </div>
        <div className="relative w-full md:w-80">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-50 pointer-events-none" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          <Input 
            placeholder="Search provider intelligence..." 
            className="pl-10 h-12 bg-black/60 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary focus-visible:border-primary/50 rounded-xl relative z-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="glass-panel border-white/5 bg-black/40">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48 bg-white/5" />
                    <Skeleton className="h-4 w-32 bg-white/5" />
                  </div>
                </div>
                <div className="hidden md:flex gap-4">
                  <Skeleton className="h-8 w-24 bg-white/5 rounded-full" />
                  <Skeleton className="h-8 w-24 bg-white/5 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredProviders?.length ? (
          filteredProviders.map(provider => (
            <Link key={provider.id} href={`/providers/${provider.id}`} className="block group">
              <Card className="glass-panel border-white/5 bg-black/40 hover:bg-black/60 hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-0 flex flex-col md:flex-row md:items-center">
                  
                  {/* Left Identity Column */}
                  <div className="p-6 flex-1 flex items-start gap-5 min-w-0">
                    <div className="h-12 w-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:shadow-[0_0_15px_rgba(230,180,0,0.2)] transition-all">
                      <Building2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white truncate group-hover:text-primary group-hover:glow-text transition-all tracking-wide">{provider.clinicName}</h3>
                        {provider.verificationStatus === "Verified" && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold shadow-[inset_0_0_10px_rgba(230,180,0,0.1)]">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-white/[0.03] px-2 py-1 rounded border border-white/[0.05]"><MapPin className="h-3.5 w-3.5 text-primary/70" /> {provider.city}, {provider.state}</span>
                        <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-primary/70" /> {provider.clinicType || "General Clinic"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Intelligence Column */}
                  <div className="p-6 border-t md:border-t-0 md:border-l border-white/[0.05] flex-1 min-w-[300px] flex flex-col justify-center bg-white/[0.01]">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {provider.servicesOffered ? (
                        provider.servicesOffered.split(',').slice(0, 3).map((s, i) => (
                          <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-white/[0.06] border border-white/[0.1] px-2 py-1 rounded">
                            {s.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 border border-white/5 px-2 py-1 rounded">No Services Extracted</span>
                      )}
                      {provider.servicesOffered && provider.servicesOffered.split(',').length > 3 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/10 border border-white/20 px-2 py-1 rounded">
                          +{provider.servicesOffered.split(',').length - 3} More
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs font-mono">
                      {(provider.employerAccountClues || provider.corporateBillingClues || provider.tpaFriendlyClues) && (
                        <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                          <CreditCard className="h-3 w-3" /> TPA / Corp Billing
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground ml-auto">
                        <span className="uppercase tracking-widest text-[9px] font-sans font-bold">Confidence</span>
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                          <div className={`h-full ${provider.sourceCount > 2 ? 'bg-amber-400 shadow-[0_0_8px_rgba(230,180,0,1)] w-[90%]' : provider.sourceCount > 0 ? 'bg-primary shadow-[0_0_8px_rgba(230,155,0,1)] w-[60%]' : 'bg-orange-600 shadow-[0_0_8px_rgba(228,114,0,1)] w-[30%]'}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Column */}
                  <div className="p-6 border-t md:border-t-0 md:border-l border-white/[0.05] flex items-center justify-between md:justify-end gap-4 shrink-0 bg-white/[0.02]">
                     <div className="flex flex-col items-center justify-center">
                       <span className="text-2xl font-bold text-white glow-text leading-none">{provider.sourceCount}</span>
                       <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Sources</span>
                     </div>
                     <div className="h-10 w-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(230,180,0,0.5)] transition-all">
                        <ChevronRight className="h-5 w-5 text-white group-hover:translate-x-0.5 transition-transform" />
                     </div>
                  </div>

                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="glass-panel border-white/5 bg-black/40">
            <CardContent className="h-64 flex flex-col items-center justify-center text-center p-6">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold text-white tracking-wide">No Providers Found</h3>
              <p className="text-muted-foreground mt-1 text-sm max-w-md">Try adjusting your search criteria or ingest more evidence to discover new providers.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}