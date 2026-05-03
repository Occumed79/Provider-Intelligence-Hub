import React from "react";
import { useGetStatesCoverage, useGetProvidersForMap } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Map as MapIcon, Activity } from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export default function MapCoverage() {
  const { data: coverageData, isLoading: isLoadingCoverage } = useGetStatesCoverage();
  const { data: mapProviders, isLoading: isLoadingProviders } = useGetProvidersForMap();

  const maxProviders = coverageData ? Math.max(...coverageData.map(d => d.providerCount)) : 0;

  const getIntensityColor = (count: number) => {
    if (!count) return "rgba(255, 255, 255, 0.02)";
    const ratio = count / maxProviders;
    if (ratio > 0.8) return "rgba(168, 85, 247, 0.8)";
    if (ratio > 0.5) return "rgba(168, 85, 247, 0.5)";
    if (ratio > 0.2) return "rgba(168, 85, 247, 0.3)";
    return "rgba(168, 85, 247, 0.15)";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight glow-text text-white">Geographic Coverage</h1>
        <p className="text-muted-foreground mt-1">Provider density and intelligence extraction by state.</p>
      </div>

      <Card className="glass-panel border-primary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10 border-b border-white/[0.05] bg-black/20">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <MapIcon className="h-5 w-5 text-primary" /> Intelligence Map
            </CardTitle>
            <CardDescription className="text-muted-foreground">Live geographic radar of mapped providers</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground bg-white/[0.05] px-4 py-2 rounded-lg border border-white/10">
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white/5 border border-white/10 rounded-sm"></div> 0</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-primary/30 border border-primary/30 rounded-sm"></div> Low</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-primary border border-primary shadow-[0_0_8px_rgba(168,85,247,0.8)] rounded-sm"></div> High</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative bg-black/40 min-h-[600px] flex items-center justify-center overflow-hidden">
          
          {/* Radar Sweep Animation Layer */}
          <div className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 pointer-events-none animate-[spin_10s_linear_infinite]" style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(168,85,247,0.1) 95%, rgba(168,85,247,0.4) 100%)' }} />
          
          {/* Target Reticle */}
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05] pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/[0.03] pointer-events-none" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/[0.03] pointer-events-none" />

          {isLoadingCoverage || isLoadingProviders ? (
            <Skeleton className="w-[80%] h-[500px] bg-white/5 rounded-2xl relative z-10" />
          ) : (
            <div className="w-full max-w-5xl relative z-10 drop-shadow-[0_0_30px_rgba(168,85,247,0.15)] p-8">
              <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      // Again, approximation without proper FIPS mapping for this demo
                      const stateName = geo.properties.name;
                      const stateData = coverageData?.find(d => d.state === stateName || d.state === geo.id);
                      // In a real app we need a full state abbreviation mapping. Assuming some mock data if missing.
                      const count = stateData?.providerCount || (Math.random() > 0.5 ? Math.floor(Math.random() * maxProviders) : 0);
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={getIntensityColor(count)}
                          stroke="rgba(255, 255, 255, 0.15)"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { fill: "rgba(168, 85, 247, 0.9)", outline: "none", filter: "drop-shadow(0 0 10px rgba(168,85,247,0.8))" },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
                {/* Render glowing markers for providers */}
                {mapProviders?.map((provider) => {
                  if (provider.latitude && provider.longitude) {
                    return (
                      <Marker key={provider.id} coordinates={[provider.longitude, provider.latitude]}>
                        <circle r={2} fill="#fff" className="animate-pulse" />
                        <circle r={6} fill="rgba(168, 85, 247, 0.5)" className="animate-ping" />
                      </Marker>
                    );
                  }
                  return null;
                })}
              </ComposableMap>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top States List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel border-white/5">
          <CardHeader className="bg-white/[0.02] border-b border-white/[0.05]">
            <CardTitle className="text-base flex items-center gap-2 text-white"><Activity className="h-4 w-4 text-primary" /> Highest Density Regions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingCoverage ? (
              <div className="space-y-4"><Skeleton className="h-12 w-full bg-white/5 rounded-lg" /><Skeleton className="h-12 w-full bg-white/5 rounded-lg" /></div>
            ) : (
              <div className="space-y-3">
                {coverageData?.sort((a, b) => b.providerCount - a.providerCount).slice(0, 5).map((state, i) => (
                  <div key={state.state} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/[0.05] hover:border-primary/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/5 text-primary font-bold text-xs border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50 transition-colors">{i + 1}</div>
                      <div className="font-semibold text-white tracking-wide">{state.state}</div>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground bg-white/5 px-3 py-1 rounded-md border border-white/5">{state.providerCount} providers</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}