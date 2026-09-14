import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Plus,
  Search,
  Target,
  UserRound,
  XCircle,
} from "lucide-react";

const STAGES = [
  "Need Identified",
  "Prospecting",
  "In Contact",
  "Evaluating",
  "Pricing Secured",
  "Agreement Pending",
  "Final Review",
  "Activated / Live",
  "Lost / Not Viable",
] as const;

type Stage = (typeof STAGES)[number];

type ProcurementRecord = {
  id: number;
  providerId?: number | null;
  providerName: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  serviceCategory?: string | null;
  stage: Stage;
  owner?: string | null;
  waitingOn?: string | null;
  lastTouchAt?: string | null;
  nextAction?: string | null;
  followUpDate?: string | null;
  activatedAt?: string | null;
  lostAt?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ProcurementSummary = {
  byStage: Record<string, number>;
  overdue: number;
};

const initialDraft = {
  providerName: "",
  city: "",
  state: "",
  country: "",
  serviceCategory: "",
  owner: "",
  waitingOn: "",
  nextAction: "",
  followUpDate: "",
  notes: "",
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

function place(record: ProcurementRecord) {
  return [record.city, record.state, record.country].filter(Boolean).join(", ") || "Location not set";
}

function isOverdue(record: ProcurementRecord) {
  if (!record.followUpDate || ["Activated / Live", "Lost / Not Viable"].includes(record.stage)) return false;
  return new Date(record.followUpDate).getTime() < Date.now();
}

function stageTone(stage: Stage) {
  if (stage === "Activated / Live") return "border-lime-500/30 bg-lime-500/10 text-lime-300";
  if (stage === "Lost / Not Viable") return "border-red-500/25 bg-red-500/10 text-red-300";
  if (["Pricing Secured", "Agreement Pending", "Final Review"].includes(stage)) return "border-amber-400/25 bg-amber-400/10 text-amber-200";
  return "border-primary/25 bg-primary/10 text-primary";
}

export default function Procurement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState(initialDraft);
  const [saving, setSaving] = useState(false);

  const { data: records = [], isLoading } = useQuery<ProcurementRecord[]>({
    queryKey: ["/api/procurement"],
    queryFn: () => api<ProcurementRecord[]>("/api/procurement"),
  });
  const { data: summary } = useQuery<ProcurementSummary>({
    queryKey: ["/api/procurement/summary"],
    queryFn: () => api<ProcurementSummary>("/api/procurement/summary"),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((record) =>
      [record.providerName, record.city, record.state, record.country, record.serviceCategory, record.owner, record.waitingOn, record.nextAction]
        .some((value) => String(value || "").toLowerCase().includes(q)),
    );
  }, [records, search]);

  const activeCount = records.filter((record) => !["Activated / Live", "Lost / Not Viable"].includes(record.stage)).length;
  const liveCount = records.filter((record) => record.stage === "Activated / Live").length;
  const pricingCount = records.filter((record) => ["Pricing Secured", "Agreement Pending", "Final Review", "Activated / Live"].includes(record.stage)).length;

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/procurement"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/procurement/summary"] }),
    ]);
  };

  const createRecord = async () => {
    if (!draft.providerName.trim()) {
      toast({ title: "Provider name required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await api("/api/procurement", {
        method: "POST",
        body: JSON.stringify({
          ...draft,
          stage: "Need Identified",
          followUpDate: draft.followUpDate || null,
        }),
      });
      setDraft(initialDraft);
      setShowCreate(false);
      await refresh();
      toast({ title: "Procurement target added" });
    } catch (error) {
      toast({ title: "Could not add target", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const moveRecord = async (record: ProcurementRecord, stage: Stage) => {
    if (record.stage === stage) return;
    try {
      await api(`/api/procurement/${record.id}`, { method: "PATCH", body: JSON.stringify({ stage, lastTouchAt: new Date().toISOString() }) });
      await refresh();
    } catch (error) {
      toast({ title: "Could not move target", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    }
  };

  const patchRecord = async (record: ProcurementRecord, patch: Partial<ProcurementRecord>) => {
    try {
      await api(`/api/procurement/${record.id}`, { method: "PATCH", body: JSON.stringify(patch) });
      await refresh();
    } catch (error) {
      toast({ title: "Could not update target", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 shadow-[0_0_24px_rgba(18,173,165,.14)]"><Target className="h-5 w-5 text-primary" /></div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Provider Procurement Command</h1>
              <p className="mt-1 text-muted-foreground">Needs → prospecting → pricing → agreement → activation. Every target has an owner and next action.</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowCreate((value) => !value)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add Target
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={Activity} label="Active Pipeline" value={activeCount} />
        <Metric icon={CircleDollarSign} label="Pricing+" value={pricingCount} />
        <Metric icon={CheckCircle2} label="Activated" value={liveCount} />
        <Metric icon={Clock3} label="Overdue" value={summary?.overdue ?? 0} danger={(summary?.overdue ?? 0) > 0} />
      </div>

      {showCreate && (
        <Card className="glass-panel border-primary/20">
          <CardHeader className="border-b border-white/[0.05]"><CardTitle className="text-base text-white">New procurement target</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
            <Input value={draft.providerName} onChange={(e) => setDraft({ ...draft, providerName: e.target.value })} placeholder="Provider / clinic *" className="border-white/10 bg-black/30 text-white" />
            <Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="City" className="border-white/10 bg-black/30 text-white" />
            <Input value={draft.state} onChange={(e) => setDraft({ ...draft, state: e.target.value })} placeholder="State / region" className="border-white/10 bg-black/30 text-white" />
            <Input value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} placeholder="Country" className="border-white/10 bg-black/30 text-white" />
            <Input value={draft.serviceCategory} onChange={(e) => setDraft({ ...draft, serviceCategory: e.target.value })} placeholder="Service / category" className="border-white/10 bg-black/30 text-white" />
            <Input value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} placeholder="Owner" className="border-white/10 bg-black/30 text-white" />
            <Input value={draft.waitingOn} onChange={(e) => setDraft({ ...draft, waitingOn: e.target.value })} placeholder="Waiting on" className="border-white/10 bg-black/30 text-white" />
            <Input type="date" value={draft.followUpDate} onChange={(e) => setDraft({ ...draft, followUpDate: e.target.value })} className="border-white/10 bg-black/30 text-white" />
            <Input value={draft.nextAction} onChange={(e) => setDraft({ ...draft, nextAction: e.target.value })} placeholder="Next action" className="md:col-span-2 border-white/10 bg-black/30 text-white" />
            <Textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Notes" className="md:col-span-2 min-h-[42px] border-white/10 bg-black/30 text-white" />
            <div className="flex gap-2 md:col-span-2 xl:col-span-4">
              <Button onClick={createRecord} disabled={saving} className="bg-primary text-primary-foreground">{saving ? "Saving…" : "Create Target"}</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)} className="border-white/10">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-panel border-white/[0.07]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search provider, geography, owner, service, or next action…" className="border-white/10 bg-black/30 pl-9 text-white" />
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto pb-4">
        <div className="grid min-w-[2450px] grid-cols-9 gap-3">
          {STAGES.map((stage) => {
            const stageRecords = filtered.filter((record) => record.stage === stage);
            return (
              <section key={stage} className="min-h-[520px] rounded-2xl border border-white/[0.07] bg-black/20 p-3 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/[0.05] pb-3">
                  <div className="text-xs font-black uppercase tracking-[.12em] text-white">{stage}</div>
                  <Badge variant="outline" className={stageTone(stage)}>{stageRecords.length}</Badge>
                </div>
                <div className="space-y-3">
                  {stageRecords.map((record) => (
                    <ProcurementCard key={record.id} record={record} onMove={moveRecord} onPatch={patchRecord} />
                  ))}
                  {!stageRecords.length && <div className="rounded-xl border border-dashed border-white/10 px-3 py-8 text-center text-[11px] text-muted-foreground">No targets</div>}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {isLoading && <div className="text-center text-sm text-muted-foreground">Loading procurement pipeline…</div>}
    </div>
  );
}

function ProcurementCard({ record, onMove, onPatch }: {
  record: ProcurementRecord;
  onMove: (record: ProcurementRecord, stage: Stage) => void;
  onPatch: (record: ProcurementRecord, patch: Partial<ProcurementRecord>) => void;
}) {
  const current = STAGES.indexOf(record.stage);
  const overdue = isOverdue(record);
  return (
    <div className={`rounded-xl border p-3 shadow-[0_12px_30px_rgba(0,0,0,.18)] ${overdue ? "border-red-500/30 bg-red-500/[0.055]" : "border-white/[0.08] bg-black/35"}`}>
      <div className="text-sm font-bold leading-5 text-white">{record.providerName}</div>
      <div className="mt-1 text-[10px] text-muted-foreground">{place(record)}</div>
      {record.serviceCategory && <div className="mt-2 line-clamp-2 text-[11px] text-white/75">{record.serviceCategory}</div>}

      <div className="mt-3 space-y-2 border-t border-white/[0.05] pt-3 text-[10px]">
        <Meta icon={UserRound} label="Owner" value={record.owner || "Unassigned"} />
        <Meta icon={Clock3} label="Waiting" value={record.waitingOn || "Nothing"} />
        <Meta icon={ArrowRight} label="Next" value={record.nextAction || "Not set"} />
        <Meta icon={CalendarClock} label="Follow-up" value={record.followUpDate ? new Date(record.followUpDate).toLocaleDateString() : "Not set"} danger={overdue} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" disabled={current <= 0} onClick={() => onMove(record, STAGES[current - 1])} className="h-8 border-white/10 px-2 text-[10px]">Back</Button>
        <Button size="sm" disabled={current >= STAGES.length - 1} onClick={() => onMove(record, STAGES[current + 1])} className="h-8 bg-primary px-2 text-[10px] text-primary-foreground">Advance</Button>
      </div>

      <details className="mt-3 border-t border-white/[0.05] pt-2">
        <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-primary">Quick update</summary>
        <div className="mt-3 space-y-2">
          <Input defaultValue={record.owner || ""} placeholder="Owner" className="h-8 border-white/10 bg-black/30 text-xs text-white" onBlur={(e) => e.target.value !== (record.owner || "") && onPatch(record, { owner: e.target.value })} />
          <Input defaultValue={record.waitingOn || ""} placeholder="Waiting on" className="h-8 border-white/10 bg-black/30 text-xs text-white" onBlur={(e) => e.target.value !== (record.waitingOn || "") && onPatch(record, { waitingOn: e.target.value })} />
          <Input defaultValue={record.nextAction || ""} placeholder="Next action" className="h-8 border-white/10 bg-black/30 text-xs text-white" onBlur={(e) => e.target.value !== (record.nextAction || "") && onPatch(record, { nextAction: e.target.value })} />
          <Input type="date" defaultValue={record.followUpDate ? record.followUpDate.slice(0, 10) : ""} className="h-8 border-white/10 bg-black/30 text-xs text-white" onBlur={(e) => onPatch(record, { followUpDate: e.target.value || null })} />
        </div>
      </details>
    </div>
  );
}

function Metric({ icon: Icon, label, value, danger }: { icon: React.ElementType; label: string; value: number; danger?: boolean }) {
  return (
    <div className={`glass-panel rounded-xl border p-4 ${danger ? "border-red-500/25" : "border-white/[0.06]"}`}>
      <div className="flex items-center justify-between gap-3">
        <div><div className="text-[9px] font-black uppercase tracking-[.18em] text-muted-foreground">{label}</div><div className={`mt-1 text-2xl font-black ${danger ? "text-red-300" : "text-white"}`}>{value}</div></div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${danger ? "border-red-500/25 bg-red-500/10 text-red-300" : "border-white/10 bg-white/[.035] text-white/65"}`}><Icon className="h-4 w-4" /></div>
      </div>
    </div>
  );
}

function Meta({ icon: Icon, label, value, danger }: { icon: React.ElementType; label: string; value: string; danger?: boolean }) {
  return <div className="flex gap-2"><Icon className={`mt-0.5 h-3 w-3 shrink-0 ${danger ? "text-red-300" : "text-primary"}`} /><div className="min-w-0"><span className="text-muted-foreground">{label}: </span><span className={danger ? "text-red-200" : "text-white/75"}>{value}</span></div></div>;
}
