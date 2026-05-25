import {
  useGetDashboardStats,
  useGetRecentUploads,
  useGetDashboardActivity,
  useGetStatesCoverage,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, FileText, Building2, AlertTriangle, ArrowUpRight, Upload } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

function asArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function asObject<T extends Record<string, any> = Record<string, any>>(value: unknown): T {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : ({} as T);
}

function formatDate(value: unknown): string {
  const date = new Date(String(value ?? ""));
  return Number.isNaN(date.getTime()) ? "Unknown date" : format(date, "MMM d, h:mm a");
}

export default function Dashboard() {
  const { data: statsData, isLoading: isLoadingStats } = useGetDashboardStats();
  const { data: recentUploadsData, isLoading: isLoadingUploads } = useGetRecentUploads();
  const { data: activitiesData, isLoading: isLoadingActivity } = useGetDashboardActivity();
  const { data: coverageData, isLoading: isLoadingCoverage } = useGetStatesCoverage();

  const stats = asObject(statsData);
  const recentUploads = asArray<any>(recentUploadsData);
  const activities = asArray<any>(activitiesData);
  const stateCoverage = asArray<any>(coverageData);

  const apiReturnedNonJson =
    (!isLoadingUploads && recentUploadsData && !Array.isArray(recentUploadsData)) ||
    (!isLoadingActivity && activitiesData && !Array.isArray(activitiesData)) ||
    (!isLoadingCoverage && coverageData && !Array.isArray(coverageData));

  return (
    <div className="space-y-6">
      {apiReturnedNonJson && (
        <Card className="glass-panel border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-sm text-amber-200">
            The static site is online, but live API data is not available from this Cloudflare Pages deployment yet. Showing empty dashboard sections instead of crashing.
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight glow-text text-white">Command Center</h1>
          <p className="text-muted-foreground mt-1">Intelligence overview for Occu-Med operations.</p>
        </div>
        <Link href="/upload" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] border border-primary/50">
          <Upload className="h-4 w-4" />
          New Intake
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="glass-panel lg:col-span-3 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-4 left-6 z-10 pointer-events-none">
            <h2 className="text-lg font-bold text-white tracking-widest uppercase">National Operations</h2>
            <p className="text-xs text-muted-foreground">Provider Density Scan</p>
          </div>
          <CardContent className="p-2 h-full relative">
            {isLoadingCoverage ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="w-[80%] h-[300px] bg-white/5 rounded-2xl" />
              </div>
            ) : (
              <ComposableMap projection="geoAlbersUsa" className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const stateCode = geo.properties.name;
                      const stateData = stateCoverage.find((d) => d?.state === stateCode || d?.state === geo.id);
                      const isCovered = Boolean(stateData);

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={isCovered ? "rgba(230, 155, 0, 0.38)" : "rgba(255, 255, 255, 0.02)"}
                          stroke="rgba(255, 200, 0, 0.15)"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { fill: "rgba(230, 180, 0, 0.65)", outline: "none", filter: "drop-shadow(0 0 10px rgba(230,180,0,1))" },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
            )}
            <div className="absolute bottom-4 right-6 flex items-center gap-4 text-xs text-muted-foreground bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/5" /> No Data</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary/40 shadow-[0_0_5px_rgba(230,180,0,0.5)]" /> Tracked</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <StatCard
            title="Total Evidence"
            value={stats.totalEvidenceFiles}
            icon={FileText}
            isLoading={isLoadingStats}
            trend="+12% from last week"
            trendUp={true}
          />
          <StatCard
            title="Providers Tracked"
            value={stats.totalProviders}
            icon={Building2}
            isLoading={isLoadingStats}
            trend="+5% from last week"
            trendUp={true}
          />
          <StatCard
            title="Needs Review"
            value={stats.providersNeedingReview}
            icon={AlertTriangle}
            isLoading={isLoadingStats}
            alert={typeof stats.providersNeedingReview === "number" && stats.providersNeedingReview > 10}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-panel lg:col-span-2 flex flex-col">
          <CardHeader className="border-b border-white/[0.05] pb-4 bg-white/[0.01]">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Recent Intake</span>
              <Link href="/evidence" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-normal bg-primary/10 px-2 py-1 rounded-md transition-colors hover:bg-primary/20">View all <ArrowUpRight className="h-3 w-3" /></Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto max-h-[400px]">
            {isLoadingUploads ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-lg" />)}
              </div>
            ) : recentUploads.length ? (
              <div className="divide-y divide-white/[0.05]">
                {recentUploads.map((upload, index) => (
                  <div key={upload?.id ?? index} className="p-4 hover:bg-white/[0.04] transition-colors flex items-center justify-between group">
                    <div className="flex items-start gap-4 overflow-hidden">
                      <div className="h-10 w-10 rounded-lg bg-black/40 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors">
                        <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-white truncate group-hover:text-primary/90 transition-colors">{upload?.originalFilename ?? "Untitled upload"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{formatDate(upload?.uploadDate)}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="truncate">{upload?.associatedProvider || "Unknown Provider"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center">
                      <StatusBadge status={upload?.processingStatus} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <FileText className="h-8 w-8 mb-2 opacity-30" />
                <p>No recent uploads found.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel flex flex-col">
          <CardHeader className="border-b border-white/[0.05] pb-4 bg-white/[0.01]">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Operations Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-auto max-h-[400px]">
            {isLoadingActivity ? (
              <div className="space-y-6 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-3 w-3 rounded-full mt-1.5 bg-white/10 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full bg-white/5 rounded" />
                      <Skeleton className="h-3 w-1/2 bg-white/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-primary/50 before:via-white/10 before:to-transparent mt-2">
                {activities.map((activity, index) => (
                  <div key={activity?.id ?? index} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border-2 border-background bg-primary shadow-[0_0_8px_rgba(230,180,0,0.7)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 mt-1.5" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] ml-4 md:ml-0 group-hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-white capitalize tracking-wide">{activity?.type ?? "Activity"}</span>
                        <time className="text-[10px] text-muted-foreground/70">{formatDate(activity?.createdAt)}</time>
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">{activity?.description ?? "No description available."}</div>
                      {activity?.entityName && <div className="text-xs text-slate-300 mt-2 font-medium bg-white/[0.05] border border-white/[0.08] inline-block px-2 py-1 rounded">{activity.entityName}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No recent activity.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, isLoading, trend, trendUp, alert, subtitle }: any) {
  return (
    <Card className="glass-panel overflow-hidden relative group h-full flex flex-col justify-center">
      <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
        <Icon className="h-32 w-32 text-primary" />
      </div>
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        {isLoading ? (
          <Skeleton className="h-10 w-24 bg-white/5 rounded-lg" />
        ) : (
          <div className="flex items-baseline gap-2">
            <div className={`text-4xl font-bold tracking-tight ${alert ? "text-orange-400 drop-shadow-[0_0_15px_rgba(228,114,0,0.5)]" : "text-white glow-text"}`}>
              {value !== undefined && value !== null ? value : "0"}
            </div>
            {subtitle && <div className="text-xs text-muted-foreground font-medium">{subtitle}</div>}
          </div>
        )}
        {trend && (
          <div className="mt-3 flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${trendUp ? "bg-amber-400 shadow-[0_0_5px_rgba(230,180,0,0.8)]" : "bg-orange-400 shadow-[0_0_5px_rgba(228,114,0,0.8)]"}`} />
            <p className={`text-xs font-medium ${trendUp ? "text-amber-400" : "text-orange-400"}`}>
              {trend}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const safeStatus = status || "Unknown";
  let colorClass = "bg-white/[0.05] text-muted-foreground border-white/10";
  let glowClass = "";

  if (safeStatus.includes("Extracted") || safeStatus.includes("Mapped") || safeStatus.includes("Approved")) {
    colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    glowClass = "shadow-[inset_0_0_10px_rgba(230,180,0,0.1),0_0_5px_rgba(230,180,0,0.2)]";
  } else if (safeStatus.includes("Processing")) {
    colorClass = "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
    glowClass = "shadow-[inset_0_0_10px_rgba(230,204,0,0.1),0_0_5px_rgba(230,204,0,0.2)]";
  } else if (safeStatus.includes("Review") || safeStatus.includes("Pending")) {
    colorClass = "bg-primary/10 text-primary border-primary/30";
    glowClass = "shadow-[inset_0_0_10px_rgba(230,180,0,0.1),0_0_5px_rgba(230,180,0,0.2)]";
  } else if (safeStatus.includes("Failed") || safeStatus.includes("Duplicate")) {
    colorClass = "bg-orange-500/10 text-orange-400 border-orange-500/30";
    glowClass = "shadow-[inset_0_0_10px_rgba(228,114,0,0.1),0_0_5px_rgba(228,114,0,0.2)]";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border backdrop-blur-sm ${colorClass} ${glowClass}`}>
      {safeStatus}
    </span>
  );
}
