import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { differenceInDays, format, isBefore } from "date-fns";
import {
  Activity,
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ClipboardPenLine,
  Copy,
  FileSignature,
  Handshake,
  Mail,
  MessageSquareText,
  PhoneCall,
  Plus,
  Send,
  Trash2,
  Workflow,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type OutreachRecord = {
  id: number;
  providerId?: number | null;
  providerName?: string;
  providerCity?: string | null;
  providerState?: string | null;
  providerEmail?: string | null;
  providerFax?: string | null;
  outreachType?: string;
  templateName?: string | null;
  subject?: string | null;
  body?: string | null;
  recipientEmail?: string | null;
  recipientFax?: string | null;
  status?: string;
  sentAt?: string | null;
  receivedAt?: string | null;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt?: string | null;
};

type OutreachProvider = {
  id: number;
  clinicName?: string;
  city?: string | null;
  state?: string | null;
  email?: string | null;
  fax?: string | null;
  contactPerson?: string | null;
};

type StatusKey = "draft" | "sent" | "received" | "follow_up_needed" | "signed" | "declined";

type StatusMeta = {
  label: string;
  color: string;
  icon: React.ElementType;
};

const STATUS_META: Record<StatusKey, StatusMeta> = {
  draft: { label: "Draft", color: "text-slate-300 bg-white/5 border-white/10", icon: ClipboardPenLine },
  sent: { label: "Sent", color: "text-primary bg-primary/10 border-primary/20", icon: Send },
  received: { label: "Received", color: "text-teal-300 bg-teal-500/10 border-teal-500/20", icon: MessageSquareText },
  follow_up_needed: { label: "Follow Up", color: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20", icon: CalendarClock },
  signed: { label: "Signed", color: "text-lime-300 bg-lime-500/10 border-lime-500/20", icon: FileSignature },
  declined: { label: "Declined", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: XCircle },
};

const TEMPLATES = [
  {
    id: "service_agreement",
    name: "Service Agreement Request",
    subject: "Service Agreement Request",
    body: "Hello {{clinic_name}},\n\nI am reaching out on behalf of Occu-Med to confirm whether your clinic can support occupational health referrals, employer billing, and related documentation requests.\n\nThank you,",
  },
  {
    id: "agreement_followup",
    name: "Agreement Follow-Up",
    subject: "Follow-Up: Service Agreement",
    body: "Hello {{clinic_name}},\n\nI am following up on the service agreement/outreach request sent to your clinic. Please let us know the current status when available.\n\nThank you,",
  },
];

const STATUS_OPTIONS: StatusKey[] = ["draft", "sent", "received", "follow_up_needed", "signed", "declined"];

function safeText(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function list<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeStatus(value: unknown): StatusKey {
  const status = safeText(value, "sent") as StatusKey;
  return STATUS_META[status] ? status : "sent";
}

function isOverdue(record: OutreachRecord) {
  const status = normalizeStatus(record.status);
  if (["signed", "declined"].includes(status)) return false;
  if (record.followUpDate) {
    const followUpDate = new Date(record.followUpDate);
    if (!Number.isNaN(followUpDate.getTime()) && isBefore(followUpDate, new Date())) return true;
  }
  return status === "sent" && Boolean(record.sentAt) && differenceInDays(new Date(), new Date(String(record.sentAt))) >= 7;
}

function renderTemplate(text: string, provider: OutreachProvider) {
  return text
    .replaceAll("{{clinic_name}}", safeText(provider.clinicName, "the clinic"))
    .replaceAll("{{city}}", safeText(provider.city))
    .replaceAll("{{state}}", safeText(provider.state))
    .replaceAll("{{contact_name}}", safeText(provider.contactPerson, "Clinic Administrator"));
}

function StatusBadge({ status }: { status?: string }) {
  const meta = STATUS_META[normalizeStatus(status)];
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={`${meta.color} text-[9px] font-black uppercase tracking-wider`}>
      <Icon className="mr-1 h-3 w-3" />
      {meta.label}
    </Badge>
  );
}

export default function Outreach() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("tracker");
  const [searchTerm, setSearchTerm] = useState("");
  const [trackerFilter, setTrackerFilter] = useState("all");
  const [selectedProviderId, setSelectedProviderId] = useState<number | "">("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("service_agreement");
  const [outreachType, setOutreachType] = useState<"email" | "fax">("email");
  const [uiError, setUiError] = useState<string | null>(null);
  const [uiNotice, setUiNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [logProviderId, setLogProviderId] = useState<number | "">("");
  const [logType, setLogType] = useState("email");
  const [logStatus, setLogStatus] = useState<StatusKey>("sent");
  const [logSubject, setLogSubject] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logFollowUpDate, setLogFollowUpDate] = useState("");

  const { data: records, isLoading } = useQuery<OutreachRecord[]>({
    queryKey: ["/api/outreach"],
    queryFn: () => customFetch("/api/outreach"),
  });
  const { data: providers } = useQuery<OutreachProvider[]>({
    queryKey: ["/api/outreach/providers-for-outreach"],
    queryFn: () => customFetch("/api/outreach/providers-for-outreach"),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/outreach"] });
    queryClient.invalidateQueries({ queryKey: ["/api/outreach/stats"] });
  };

  const sendMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => customFetch(outreachType === "fax" ? "/api/outreach/send-fax" : "/api/outreach/send-email", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    onSuccess: (result: any) => {
      invalidate();
      setUiError(null);
      setUiNotice(result?.delivery?.delivered ? "Outreach sent and logged." : "Outreach logged as draft because sender credentials are not configured yet.");
      setActiveTab("tracker");
    },
    onError: (error: Error) => setUiError(error.message || "Failed to send outreach."),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => customFetch(`/api/outreach/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      invalidate();
      setUiNotice("Outreach status updated.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customFetch(`/api/outreach/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  const manualLogMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => customFetch("/api/outreach", {
      method: "POST",
      body: JSON.stringify({ records: [payload] }),
    }),
    onSuccess: () => {
      invalidate();
      setUiError(null);
      setUiNotice("Outreach touch logged.");
      setLogSubject("");
      setLogNotes("");
      setLogFollowUpDate("");
      setLogStatus("sent");
      setActiveTab("tracker");
    },
    onError: (error: Error) => setUiError(error.message || "Failed to log outreach."),
  });

  const providerRows = list(providers);
  const recordRows = list(records);
  const selectedProvider = useMemo(
    () => providerRows.find((provider) => provider.id === selectedProviderId) ?? null,
    [providerRows, selectedProviderId],
  );
  const logProvider = useMemo(
    () => providerRows.find((provider) => provider.id === logProviderId) ?? null,
    [providerRows, logProviderId],
  );
  const selectedTemplate = TEMPLATES.find((template) => template.id === selectedTemplateId) ?? TEMPLATES[0];
  const subject = selectedProvider ? renderTemplate(selectedTemplate.subject, selectedProvider) : "";
  const body = selectedProvider ? renderTemplate(selectedTemplate.body, selectedProvider) : "";

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return recordRows.filter((record) => {
      if (trackerFilter === "overdue" && !isOverdue(record)) return false;
      if (trackerFilter !== "all" && trackerFilter !== "overdue" && normalizeStatus(record.status) !== trackerFilter) return false;
      return !query || [record.providerName, record.providerCity, record.providerState, record.subject, record.status, record.notes]
        .some((value) => safeText(value).toLowerCase().includes(query));
    });
  }, [recordRows, searchTerm, trackerFilter]);

  const overdueRecords = useMemo(() => recordRows.filter(isOverdue), [recordRows]);
  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(STATUS_OPTIONS.map((status) => [status, 0])) as Record<StatusKey, number>;
    for (const record of recordRows) byStatus[normalizeStatus(record.status)] += 1;
    return byStatus;
  }, [recordRows]);

  const sendOutreach = () => {
    if (!selectedProvider) return;
    const recipient = outreachType === "fax" ? selectedProvider.fax : selectedProvider.email;
    if (!recipient) {
      setUiError(`Missing ${outreachType === "fax" ? "fax number" : "email address"}.`);
      return;
    }
    sendMutation.mutate({
      providerId: selectedProvider.id,
      providerName: selectedProvider.clinicName,
      to: recipient,
      subject,
      body,
      templateName: selectedTemplate.name,
    });
  };

  const logTouch = () => {
    if (!logProvider) {
      setUiError("Select a provider before logging outreach.");
      return;
    }
    if (!logNotes.trim() && !logSubject.trim()) {
      setUiError("Add a subject or note so the activity is useful later.");
      return;
    }
    manualLogMutation.mutate({
      providerId: logProvider.id,
      providerName: safeText(logProvider.clinicName, `Provider #${logProvider.id}`),
      providerCity: logProvider.city,
      providerState: logProvider.state,
      providerEmail: logProvider.email,
      providerFax: logProvider.fax,
      outreachType: logType,
      templateName: "Manual activity log",
      subject: logSubject.trim() || `${logType} outreach`,
      status: logStatus,
      notes: logNotes.trim(),
      followUpDate: logFollowUpDate || undefined,
    });
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setUiError("Could not copy outreach text.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Workflow className="h-5 w-5 text-primary" />
              <div className="absolute inset-0 rounded-xl border border-primary/20 animate-ping opacity-25" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Outreach Command</h1>
              <p className="mt-1 text-muted-foreground">Document touches as they happen and keep every provider relationship moving.</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab("log")} className="border-white/10 bg-black/20"><Plus className="mr-2 h-4 w-4" />Log Touch</Button>
          <Button onClick={() => setActiveTab("compose")} className="bg-primary hover:bg-primary/90"><Send className="mr-2 h-4 w-4" />New Outreach</Button>
        </div>
      </div>

      {uiError && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{uiError}</div>}
      {uiNotice && <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">{uiNotice}</div>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric label="Total" value={recordRows.length} icon={Activity} />
        <Metric label="Sent" value={counts.sent} icon={Send} />
        <Metric label="Received" value={counts.received} icon={MessageSquareText} />
        <Metric label="Signed" value={counts.signed} icon={Handshake} highlight />
        <Metric label="Needs Attention" value={overdueRecords.length + counts.follow_up_needed} icon={AlertCircle} alert={overdueRecords.length > 0 || counts.follow_up_needed > 0} />
      </div>

      <PipelineRail counts={counts} onSelect={(status) => { setTrackerFilter(status); setActiveTab("tracker"); }} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border border-white/10 bg-black/40">
          <TabsTrigger value="tracker">Tracker</TabsTrigger>
          <TabsTrigger value="log">Log Activity</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="mt-5">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr_.75fr]">
            <Card className="glass-panel overflow-hidden border-white/[0.07]">
              <CardHeader className="border-b border-white/[0.05] bg-black/20">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="text-base text-white">Relationship Activity</CardTitle>
                  <div className="flex gap-2">
                    <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search outreach…" className="w-full bg-black/35 text-white border-white/10 md:w-64" />
                    <select value={trackerFilter} onChange={(event) => setTrackerFilter(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 text-xs text-white">
                      <option value="all">All</option>
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="received">Received</option>
                      <option value="follow_up_needed">Follow Up</option>
                      <option value="signed">Signed</option>
                      <option value="declined">Declined</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/[0.05]">
                  {filteredRecords.map((record, index) => (
                    <OutreachRow
                      key={record.id}
                      record={record}
                      index={index}
                      onStatusChange={(status) => patchMutation.mutate({ id: record.id, data: { status } })}
                      onDelete={() => deleteMutation.mutate(record.id)}
                    />
                  ))}
                  {!filteredRecords.length && !isLoading && <Empty>No outreach records found.</Empty>}
                  {isLoading && <div className="p-10 text-center text-sm text-muted-foreground">Loading outreach…</div>}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="glass-panel overflow-hidden border-cyan-500/15">
                <CardHeader className="border-b border-white/[0.05] bg-cyan-500/[0.025]">
                  <CardTitle className="flex items-center gap-2 text-base text-white"><CalendarClock className="h-4 w-4 text-cyan-300" />Follow-Up Radar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-4">
                  {overdueRecords.length ? overdueRecords.slice(0, 8).map((record) => (
                    <button key={record.id} type="button" onClick={() => { setSearchTerm(safeText(record.providerName)); setTrackerFilter("all"); }} className="w-full rounded-lg border border-white/[0.06] bg-black/20 p-3 text-left transition-colors hover:border-cyan-400/25 hover:bg-cyan-500/[0.03]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold text-white">{safeText(record.providerName, "Unknown provider")}</div>
                          <div className="mt-1 truncate text-[10px] text-muted-foreground">{safeText(record.subject, safeText(record.outreachType, "Outreach"))}</div>
                        </div>
                        <span className="shrink-0 text-[9px] font-black uppercase tracking-wider text-cyan-300">{record.followUpDate ? format(new Date(record.followUpDate), "MMM d") : `${record.sentAt ? differenceInDays(new Date(), new Date(record.sentAt)) : 7}+ days`}</span>
                      </div>
                    </button>
                  )) : <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-xs text-muted-foreground">Nothing overdue right now.</div>}
                </CardContent>
              </Card>

              <Card className="glass-panel border-white/[0.07]">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10"><PhoneCall className="h-4 w-4 text-primary" /></div>
                    <div>
                      <div className="text-sm font-semibold text-white">Manual touches count too</div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">Calls, meetings, follow-ups, and in-progress agreement activity can now be logged without sending an email from the app.</p>
                      <Button variant="outline" size="sm" className="mt-3 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10" onClick={() => setActiveTab("log")}>Log activity</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="log" className="mt-5">
          <Card className="glass-panel border-primary/15">
            <CardHeader className="border-b border-white/[0.05] bg-black/20"><CardTitle className="text-white">Log Outreach Activity</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2">
              <div className="space-y-4">
                <FieldLabel>Provider</FieldLabel>
                <select value={logProviderId} onChange={(event) => setLogProviderId(event.target.value ? Number(event.target.value) : "")} className="w-full rounded-md border border-white/10 bg-black p-2.5 text-sm text-white">
                  <option value="">Select provider</option>
                  {providerRows.map((provider) => <option key={provider.id} value={provider.id}>{safeText(provider.clinicName, `Provider #${provider.id}`)}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Activity Type</FieldLabel>
                    <select value={logType} onChange={(event) => setLogType(event.target.value)} className="w-full rounded-md border border-white/10 bg-black p-2.5 text-sm text-white">
                      <option value="email">Email</option>
                      <option value="call">Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="fax">Fax</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <select value={logStatus} onChange={(event) => setLogStatus(event.target.value as StatusKey)} className="w-full rounded-md border border-white/10 bg-black p-2.5 text-sm text-white">
                      {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{STATUS_META[status].label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <FieldLabel>Subject / Milestone</FieldLabel>
                  <Input value={logSubject} onChange={(event) => setLogSubject(event.target.value)} placeholder="Pricing received, agreement under review, follow-up call…" className="bg-black/35 text-white border-white/10" />
                </div>
                <div>
                  <FieldLabel>Follow-Up Date</FieldLabel>
                  <Input type="date" value={logFollowUpDate} onChange={(event) => setLogFollowUpDate(event.target.value)} className="bg-black/35 text-white border-white/10" />
                </div>
              </div>
              <div className="flex flex-col">
                <FieldLabel>Notes</FieldLabel>
                <Textarea value={logNotes} onChange={(event) => setLogNotes(event.target.value)} placeholder="What happened? What are we waiting on? What should the next person know?" className="min-h-[245px] flex-1 bg-black/35 text-white border-white/10" />
                {logProvider && <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.025] p-3 text-xs text-muted-foreground">Logging activity for <span className="font-semibold text-white">{safeText(logProvider.clinicName, `Provider #${logProvider.id}`)}</span>{[safeText(logProvider.city), safeText(logProvider.state)].filter(Boolean).length ? ` • ${[safeText(logProvider.city), safeText(logProvider.state)].filter(Boolean).join(", ")}` : ""}</div>}
                <Button onClick={logTouch} disabled={!logProvider || manualLogMutation.isPending} className="mt-4 self-end bg-primary hover:bg-primary/90"><Plus className="mr-2 h-4 w-4" />{manualLogMutation.isPending ? "Logging…" : "Log Activity"}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose" className="mt-5">
          <Card className="glass-panel border-primary/15">
            <CardHeader className="border-b border-white/[0.05] bg-black/20"><CardTitle className="text-white">Compose Outreach</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <select value={selectedProviderId} onChange={(event) => setSelectedProviderId(event.target.value ? Number(event.target.value) : "")} className="w-full rounded-md border border-white/10 bg-black p-2.5 text-sm text-white">
                  <option value="">Select provider</option>
                  {providerRows.map((provider) => <option key={provider.id} value={provider.id}>{safeText(provider.clinicName, `Provider #${provider.id}`)}</option>)}
                </select>
                <select value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)} className="w-full rounded-md border border-white/10 bg-black p-2.5 text-sm text-white">
                  {TEMPLATES.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                </select>
                <select value={outreachType} onChange={(event) => setOutreachType(event.target.value as "email" | "fax")} className="w-full rounded-md border border-white/10 bg-black p-2.5 text-sm text-white">
                  <option value="email">Email</option>
                  <option value="fax">Fax</option>
                </select>
              </div>
              {selectedProvider && <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-muted-foreground">Recipient: {outreachType === "email" ? safeText(selectedProvider.email, "Missing email") : safeText(selectedProvider.fax, "Missing fax")}</div>}
              <Input readOnly value={subject} className="bg-black/40 text-white border-white/10" />
              <Textarea readOnly value={body} className="min-h-[250px] bg-black/40 text-white border-white/10" />
              <div className="flex gap-3">
                <Button onClick={copyText} variant="outline" className="border-white/10 bg-black/20"><Copy className="mr-2 h-4 w-4" />{copied ? "Copied" : "Copy"}</Button>
                <Button onClick={sendOutreach} disabled={!selectedProvider || sendMutation.isPending} className="bg-primary hover:bg-primary/90"><Send className="mr-2 h-4 w-4" />{sendMutation.isPending ? "Sending…" : outreachType === "fax" ? "Send Fax" : "Send Email"}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Metric({ label, value, icon: Icon, highlight, alert }: { label: string; value: number; icon: React.ElementType; highlight?: boolean; alert?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className={`glass-panel rounded-xl border p-4 ${alert ? "border-cyan-500/20" : highlight ? "border-primary/25" : "border-white/[0.06]"}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
            <div className={`mt-1 text-2xl font-black ${alert ? "text-cyan-300" : highlight ? "text-primary" : "text-white"}`}>{value}</div>
          </div>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${alert ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300" : highlight ? "border-primary/25 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.035] text-white/65"}`}><Icon className="h-4 w-4" /></div>
        </div>
      </div>
    </motion.div>
  );
}

function PipelineRail({ counts, onSelect }: { counts: Record<StatusKey, number>; onSelect: (status: StatusKey) => void }) {
  const stages: StatusKey[] = ["draft", "sent", "received", "follow_up_needed", "signed"];
  const max = Math.max(...stages.map((stage) => counts[stage]), 1);
  return (
    <Card className="glass-panel overflow-hidden border-primary/15">
      <CardContent className="p-4 md:p-5">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"><Workflow className="h-3.5 w-3.5 text-primary" />Live relationship pipeline</div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {stages.map((stage, index) => {
            const meta = STATUS_META[stage];
            const Icon = meta.icon;
            const count = counts[stage];
            return (
              <button key={stage} type="button" onClick={() => onSelect(stage)} className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/20 p-3 text-left transition-all hover:border-primary/25 hover:bg-primary/[0.03]">
                {index < stages.length - 1 && <div className="pointer-events-none absolute right-[-8px] top-[24px] hidden h-px w-4 bg-primary/30 md:block" />}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.06] text-primary"><Icon className="h-3.5 w-3.5" /></div>
                  <span className="text-lg font-black text-white">{count}</span>
                </div>
                <div className="mt-2 text-[9px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-white/75">{meta.label}</div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.04]"><motion.div initial={{ width: 0 }} animate={{ width: `${(count / max) * 100}%` }} transition={{ duration: 0.55, delay: index * 0.05 }} className="h-full rounded-full bg-primary/70 shadow-[0_0_8px_rgba(18,173,165,.35)]" /></div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function OutreachRow({ record, index, onStatusChange, onDelete }: { record: OutreachRecord; index: number; onStatusChange: (status: StatusKey) => void; onDelete: () => void }) {
  const status = normalizeStatus(record.status);
  const overdue = isOverdue(record);
  const when = record.sentAt || record.createdAt;
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.025 }} className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-4 transition-colors hover:bg-white/[0.02] md:grid-cols-[auto_minmax(0,1fr)_auto]">
      <div className="relative flex w-5 justify-center">
        <div className={`mt-1.5 h-2.5 w-2.5 rounded-full border ${overdue ? "border-cyan-300 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,.55)]" : status === "signed" ? "border-lime-300 bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,.4)]" : "border-primary bg-primary/75"}`} />
        <div className="absolute bottom-[-16px] top-5 w-px bg-white/[0.06] group-last:hidden" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate text-sm font-semibold text-white">{safeText(record.providerName, "Unknown Provider")}</div>
          <StatusBadge status={record.status} />
          {overdue && <Badge variant="outline" className="border-cyan-500/20 bg-cyan-500/10 text-[9px] font-black uppercase tracking-wider text-cyan-300">Due</Badge>}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
          <span>{safeText(record.outreachType, "outreach").toUpperCase()}</span>
          <span>•</span>
          <span className="truncate">{safeText(record.subject, "No subject")}</span>
          {when && <><span>•</span><span>{format(new Date(when), "MMM d, yyyy")}</span></>}
        </div>
        {record.notes && <div className="mt-2 max-w-3xl text-xs leading-5 text-white/55">{record.notes}</div>}
        {record.followUpDate && <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-cyan-300"><CalendarClock className="h-3 w-3" />Follow up {format(new Date(record.followUpDate), "MMM d, yyyy")}</div>}
      </div>
      <div className="col-start-2 flex items-center gap-2 md:col-start-3">
        <select value={status} onChange={(event) => onStatusChange(event.target.value as StatusKey)} className="rounded-md border border-white/10 bg-black/60 px-2 py-1.5 text-[10px] text-white">
          {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{STATUS_META[option].label}</option>)}
        </select>
        <Button size="icon" variant="ghost" onClick={onDelete} className="h-8 w-8 text-muted-foreground hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    </motion.div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">{children}</div>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="m-4 rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">{children}</div>;
}
