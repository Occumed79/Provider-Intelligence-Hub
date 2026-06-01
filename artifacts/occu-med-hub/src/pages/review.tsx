import React from "react";
import { useListReviewItems, useGetReviewCounts, useUpdateReviewItem, getListReviewItemsQueryKey, getGetReviewCountsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Clock, ListChecks, Fingerprint, Search, PlayCircle, ExternalLink, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

const REVIEW_STATUSES = [
  { value: "pending", label: "Pending", activeClass: "bg-primary/20 text-white border border-primary/30" },
  { value: "in_progress", label: "In Progress", activeClass: "bg-teal-500/20 text-teal-100 border border-teal-500/30" },
  { value: "approved", label: "Approved", activeClass: "bg-lime-500/20 text-lime-100 border border-lime-500/30" },
  { value: "rejected", label: "Rejected", activeClass: "bg-red-500/20 text-red-100 border border-red-500/30" },
];

type SortKey = "newest" | "oldest" | "priority";

function safeText(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Failed to update review item.";
}

function priorityRank(priority: unknown) {
  const value = safeText(priority).toLowerCase();
  if (value === "high") return 3;
  if (value === "medium") return 2;
  if (value === "low") return 1;
  return 0;
}

function formatSafeDate(value: unknown) {
  const date = new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? "Unknown date" : format(date, "MMM d, yyyy HH:mm");
}

export default function ReviewQueue() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: counts, isLoading: countsLoading } = useGetReviewCounts();
  const [activeStatus, setActiveStatus] = React.useState("pending");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("priority");
  const { data: items, isLoading: itemsLoading } = useListReviewItems({ status: activeStatus });
  const updateItem = useUpdateReviewItem();

  const itemList = Array.isArray(items) ? items : [];
  const filteredItems = itemList
    .filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || [item.providerName, item.providerId, item.evidenceFileId, item.issueType, item.description, item.priority].some((value) => safeText(value).toLowerCase().includes(query));
      const matchesPriority = priorityFilter === "all" || safeText(item.priority, "Unknown") === priorityFilter;
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      if (sortKey === "oldest") return new Date(String(a.createdAt || "")).getTime() - new Date(String(b.createdAt || "")).getTime();
      if (sortKey === "newest") return new Date(String(b.createdAt || "")).getTime() - new Date(String(a.createdAt || "")).getTime();
      return priorityRank(b.priority) - priorityRank(a.priority) || new Date(String(b.createdAt || "")).getTime() - new Date(String(a.createdAt || "")).getTime();
    });

  const priorities = React.useMemo(() => Array.from(new Set(itemList.map((item) => safeText(item.priority, "Unknown")).filter(Boolean))).sort(), [itemList]);
  const filtersActive = Boolean(searchQuery.trim()) || priorityFilter !== "all" || sortKey !== "priority";

  const clearFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
    setSortKey("priority");
  };

  const handleAction = (id: number, status: "in_progress" | "approved" | "rejected") => {
    updateItem.mutate(
      { id, data: { reviewStatus: status } },
      {
        onSuccess: () => {
          toast({ title: "Review updated", description: `Item marked as ${status.replace("_", " ")}.` });
          queryClient.invalidateQueries({ queryKey: getListReviewItemsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReviewCountsQueryKey() });
        },
        onError: (err) => {
          toast({ title: "Update failed", description: errorMessage(err), variant: "destructive" });
        },
      },
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6"><div><h1 className="text-3xl font-bold tracking-tight glow-text text-white">Review Queue</h1><p className="text-muted-foreground mt-2 text-sm max-w-xl leading-relaxed">Human-in-the-loop verification for uncertain extractions. Start, approve, or reject items to maintain database integrity.</p></div></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon={<Clock className="h-6 w-6 text-primary/80 mb-3" />} label="Pending Review" value={countsLoading ? "-" : counts?.pending || 0} />
        <SummaryCard icon={<AlertTriangle className="h-6 w-6 text-teal-300/80 mb-3" />} label="High Priority" value={countsLoading ? "-" : counts?.highPriority || 0} />
        <SummaryCard icon={<CheckCircle className="h-6 w-6 text-lime-300/80 mb-3" />} label="Approved" value={countsLoading ? "-" : counts?.approved || 0} />
        <SummaryCard icon={<ListChecks className="h-6 w-6 text-muted-foreground/80 mb-3" />} label="Total Processed" value={countsLoading ? "-" : counts?.total || 0} muted />
      </div>

      <Card className="glass-panel border-primary/20 bg-black/40 shadow-[0_0_40px_rgba(18,173,165,0.05)]">
        <div className="p-4 bg-white/[0.02] border-b border-white/[0.05] space-y-4">
          <div className="bg-black/60 border border-white/10 rounded-lg h-12 p-1 max-w-2xl flex">
            {REVIEW_STATUSES.map((status) => <button key={status.value} type="button" onClick={() => setActiveStatus(status.value)} className={`flex-1 rounded-md px-3 py-1 text-sm font-medium transition-all ${activeStatus === status.value ? status.activeClass : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>{status.label}</button>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_auto] gap-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search provider, issue, description, priority, or evidence ID..." className="pl-9 bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50" /></div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger className="bg-black/40 border-white/10 text-white"><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent className="bg-popover border-white/10 text-white"><SelectItem value="all">All priorities</SelectItem>{priorities.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}</SelectContent></Select>
            <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}><SelectTrigger className="bg-black/40 border-white/10 text-white"><SelectValue placeholder="Sort" /></SelectTrigger><SelectContent className="bg-popover border-white/10 text-white"><SelectItem value="priority">High priority first</SelectItem><SelectItem value="newest">Newest first</SelectItem><SelectItem value="oldest">Oldest first</SelectItem></SelectContent></Select>
            <Button type="button" variant="outline" onClick={clearFilters} disabled={!filtersActive} className="border-white/10 bg-black/30 text-muted-foreground hover:text-white hover:bg-white/10 disabled:opacity-40"><SlidersHorizontal className="h-4 w-4 mr-2" /> Clear</Button>
          </div>
        </div>

        <CardContent className="p-0 min-h-[400px]">
          {itemsLoading ? <div className="p-6 space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-xl" />)}</div> : filteredItems.length ? <div className="divide-y divide-white/[0.05]"><AnimatePresence mode="popLayout">{filteredItems.map((item) => <ReviewItem key={item.id} item={item} activeStatus={activeStatus} isPending={updateItem.isPending} onAction={handleAction} />)}</AnimatePresence></div> : <div className="p-20 text-center text-muted-foreground flex flex-col items-center justify-center"><div className="relative w-24 h-24 mb-6"><div className="absolute inset-0 rounded-full border border-primary/30 border-dashed animate-[spin_10s_linear_infinite]" /><div className="absolute inset-2 rounded-full border border-primary/20 border-dotted animate-[spin_7s_linear_infinite_reverse]" /><CheckCircle className="absolute inset-0 m-auto h-10 w-10 text-primary drop-shadow-[0_0_15px_rgba(18,173,165,0.5)]" /></div><h3 className="text-xl font-bold text-white mb-2 tracking-wide glow-text">{filtersActive ? "No Matching Review Items" : "No Items in This Status"}</h3><p className="max-w-sm mx-auto text-sm">{filtersActive ? "Try clearing the search or filter controls." : `No review items are currently listed under ${activeStatus.replace("_", " ")}.`}</p>{filtersActive && <Button type="button" variant="outline" onClick={clearFilters} className="mt-5 border-white/10 bg-black/30 text-muted-foreground hover:text-white hover:bg-white/10">Clear filters</Button>}</div>}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ icon, label, value, muted }: { icon: React.ReactNode; label: string; value: string | number; muted?: boolean }) {
  return <Card className={`glass-panel ${muted ? "border-white/[0.05] bg-white/[0.01]" : "border-primary/20 bg-primary/[0.02]"} relative overflow-hidden`}><div className={`absolute top-0 left-0 w-1 h-full ${muted ? "bg-white/20" : "bg-primary/50"}`} /><CardContent className="p-5 flex flex-col items-start">{icon}<p className={`text-[10px] font-bold uppercase tracking-widest ${muted ? "text-muted-foreground" : "text-primary"}`}>{label}</p><p className="text-3xl font-bold text-white mt-1">{value}</p></CardContent></Card>;
}

function ReviewItem({ item, activeStatus, isPending, onAction }: { item: any; activeStatus: string; isPending: boolean; onAction: (id: number, status: "in_progress" | "approved" | "rejected") => void }) {
  const priority = safeText(item.priority, "Unknown");
  const providerLabel = item.providerName || `ID: ${item.providerId || "Unknown"}`;
  return <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }} className="p-6 hover:bg-white/[0.02] transition-colors group relative overflow-hidden"><div className="absolute left-0 top-0 bottom-0 w-1 bg-white/5 group-hover:bg-primary/30 transition-colors" /><div className="flex flex-col xl:flex-row gap-6 items-start justify-between"><div className="flex-1 space-y-4 w-full"><div className="flex flex-wrap items-center gap-3"><Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border shadow-sm ${priority === "High" ? "bg-primary/20 text-primary border-primary/30 shadow-[inset_0_0_10px_rgba(18,173,165,0.1)]" : "bg-white/10 border-white/20 text-muted-foreground"}`}>{priority} Priority</Badge><span className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/10"><Search className="h-3.5 w-3.5 text-primary" /> {safeText(item.issueType, "Review Issue")}</span><span className="text-xs text-muted-foreground ml-auto font-mono">{formatSafeDate(item.createdAt)}</span></div><div className="bg-black/40 border border-white/[0.05] p-4 rounded-lg"><p className="text-white text-sm leading-relaxed">{safeText(item.description, "No description provided.")}</p></div></div><div className="w-full xl:w-[350px] space-y-3 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 shrink-0"><div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground border-b border-white/10 pb-2">Entity Context</div><div className="space-y-3 pt-1"><div className="flex items-start gap-3"><Fingerprint className="h-4 w-4 text-primary mt-0.5" /><div><div className="text-[9px] uppercase text-muted-foreground">Linked Provider</div>{item.providerId ? <Link href={`/providers/${item.providerId}`} className="text-sm font-bold text-white tracking-wide hover:text-primary inline-flex items-center gap-1">{providerLabel}<ExternalLink className="h-3 w-3" /></Link> : <div className="text-sm font-bold text-white tracking-wide">{providerLabel}</div>}</div></div>{item.evidenceFileId && <div className="flex items-start gap-3"><ListChecks className="h-4 w-4 text-primary mt-0.5" /><div><div className="text-[9px] uppercase text-muted-foreground">Source Evidence</div><Link href={`/evidence?file=${item.evidenceFileId}`} className="text-sm font-mono text-white tracking-wide hover:text-primary inline-flex items-center gap-1">EVD-{item.evidenceFileId}<ExternalLink className="h-3 w-3" /></Link></div></div>}</div></div><div className="flex xl:flex-col items-center gap-3 shrink-0 w-full xl:w-auto mt-4 xl:mt-0">{activeStatus === "pending" && <Button variant="outline" className="flex-1 xl:w-32 h-12 border-primary/30 text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary font-bold tracking-wide" onClick={() => onAction(item.id, "in_progress")} disabled={isPending}><PlayCircle className="h-4 w-4 mr-2" /> Start</Button>}{activeStatus === "pending" || activeStatus === "in_progress" ? <><Button className="flex-1 xl:w-32 h-12 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30 shadow-[0_0_15px_rgba(18,173,165,0.1)] transition-all hover:shadow-[0_0_20px_rgba(18,173,165,0.3)] font-bold tracking-wide" onClick={() => onAction(item.id, "approved")} disabled={isPending}><CheckCircle className="h-4 w-4 mr-2" /> Approve</Button><Button variant="outline" className="flex-1 xl:w-32 h-12 border-red-500/30 text-red-300 bg-red-500/10 hover:bg-red-500/20 hover:text-red-200 font-bold tracking-wide" onClick={() => onAction(item.id, "rejected")} disabled={isPending}><XCircle className="h-4 w-4 mr-2" /> Reject</Button></> : <div className="flex items-center justify-center h-full w-full xl:w-32 py-4"><Badge variant="outline" className={`px-4 py-2 border ${activeStatus === "approved" ? "bg-lime-500/10 text-lime-300 border-lime-500/30" : "bg-red-500/10 text-red-300 border-red-500/30"} uppercase tracking-widest font-bold`}>{activeStatus}</Badge></div>}</div></div></motion.div>;
}
