import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Printer,
  FileSignature,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Send,
  RefreshCw,
  Copy,
  Check,
  Filter,
  Building2,
  MapPin,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

type OutreachRecord = {
  id: number;
  providerId: number | null;
  providerName: string;
  providerCity: string | null;
  providerState: string | null;
  outreachType: string;
  templateName: string | null;
  subject: string | null;
  body: string | null;
  recipientEmail: string | null;
  recipientFax: string | null;
  status: string;
  sentAt: string | null;
  receivedAt: string | null;
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
};

type OutreachStats = { total: number; sent: number; received: number; signed: number; overdue: number };

type OutreachProvider = {
  id: number;
  clinicName: string;
  city: string | null;
  state: string | null;
  email: string | null;
  fax: string | null;
  phone: string | null;
  contactPerson: string | null;
  servicesOffered: string | null;
  verificationStatus: string;
  tpaFriendlyClues: string | null;
  website: string | null;
};

type OutreachTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft:    { label: "Draft",     color: "text-slate-400 bg-white/5 border-white/10",                   icon: MessageSquare },
  sent:     { label: "Sent",      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",           icon: Send },
  received: { label: "Received",  color: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",        icon: CheckCircle2 },
  signed:   { label: "Signed",    color: "text-amber-300 bg-amber-500/15 border-amber-400/30",           icon: FileSignature },
  declined: { label: "Declined",  color: "text-red-400 bg-red-500/10 border-red-500/20",                 icon: XCircle },
  follow_up_needed: { label: "Follow Up", color: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: AlertCircle },
};

const TEMPLATES = [
  {
    id: "service_agreement",
    name: "Service Agreement Request",
    subject: (p: OutreachProvider) => `Service Agreement — ${p.clinicName}`,
    body: (p: OutreachProvider) => `Dear ${p.contactPerson || "Clinic Administrator"},

I hope this message finds you well. My name is [Your Name], and I am reaching out on behalf of Occu-Med, a network management organization specializing in occupational medicine and employer health services.

We would like to formally invite ${p.clinicName}${p.city ? ` in ${p.city}, ${p.state}` : ""} to join our preferred provider network. Based on our research, your facility${p.servicesOffered ? ` — offering services such as ${p.servicesOffered.split(",").slice(0, 3).join(", ")}` : ""} — aligns closely with the needs of our employer clients.

Please find attached our standard Network Participation Agreement. This agreement outlines:
  • Reimbursement terms and fee schedules
  • Billing and claims submission procedures
  • Quality standards and compliance requirements
  • TPA and corporate billing capabilities

We kindly request that you review, execute, and return the agreement at your earliest convenience. If you have any questions or would like to discuss terms, please do not hesitate to contact us.

We look forward to building a strong partnership with your team.

Best regards,
[Your Name]
[Your Title]
Occu-Med Network Operations
[Phone] | [Email]`,
  },
  {
    id: "agreement_followup",
    name: "Agreement Follow-Up (Pending)",
    subject: (p: OutreachProvider) => `Follow-Up: Pending Service Agreement — ${p.clinicName}`,
    body: (p: OutreachProvider) => `Dear ${p.contactPerson || "Clinic Administrator"},

I am following up on the Service Participation Agreement we sent to ${p.clinicName}${p.city ? ` in ${p.city}, ${p.state}` : ""} approximately [X] days ago.

We have not yet received the executed agreement and wanted to check in to ensure it was received and to address any questions or concerns you may have.

If you have had a chance to review the document, we would greatly appreciate your signature and return at your earliest convenience. If you require a new copy or have questions about specific terms, please let us know and we will be happy to assist.

Your participation in our network is important to us, and we remain committed to making this process as straightforward as possible.

Please feel free to respond to this email or call us at [Phone].

Best regards,
[Your Name]
[Your Title]
Occu-Med Network Operations
[Phone] | [Email]`,
  },
  {
    id: "initial_outreach",
    name: "Initial Cold Outreach",
    subject: (p: OutreachProvider) => `Network Partnership Opportunity — ${p.clinicName}`,
    body: (p: OutreachProvider) => `Dear ${p.contactPerson || "Clinic Director"},

I am reaching out to introduce Occu-Med and explore a potential partnership with ${p.clinicName}${p.city ? ` in ${p.city}, ${p.state}` : ""}.

Occu-Med is a specialized network management organization that connects occupational medicine and urgent care facilities with employers, TPAs, and corporate clients seeking reliable occupational health services.

We believe your clinic${p.servicesOffered ? `, with capabilities including ${p.servicesOffered.split(",").slice(0, 3).map(s => s.trim()).join(", ")},` : ""} would be an excellent fit for our network. Joining our network provides:

  • Increased referrals from our employer and TPA client base
  • Streamlined billing through our corporate accounts
  • Access to our digital intake and case management tools
  • Competitive reimbursement rates

I would love to schedule a brief call to discuss how we can work together. Are you available for a 15-minute conversation this week?

Looking forward to hearing from you.

Best regards,
[Your Name]
[Your Title]
Occu-Med Network Operations
[Phone] | [Email]`,
  },
  {
    id: "tpa_inquiry",
    name: "TPA / Corporate Billing Inquiry",
    subject: (p: OutreachProvider) => `TPA & Corporate Billing Capabilities — ${p.clinicName}`,
    body: (p: OutreachProvider) => `Dear ${p.contactPerson || "Billing Department"},

I am reaching out to ${p.clinicName}${p.city ? ` in ${p.city}, ${p.state}` : ""} to inquire about your current capabilities for TPA (Third-Party Administrator) and corporate account billing.

As part of our network qualification process, we need to confirm the following:

  1. Do you currently accept billing through TPA platforms?
  2. Do you maintain corporate/employer accounts with net-30 or net-60 payment terms?
  3. Can you accommodate injury care, DOT physicals, and pre-employment screenings billed to employer accounts?
  4. Do you utilize any electronic case management or authorization systems?

Understanding your billing capabilities will help us determine the best way to route referrals from our employer clients to your facility. Please reply with answers to the above, or feel free to call us directly at [Phone].

Thank you for your time.

Best regards,
[Your Name]
[Your Title]
Occu-Med Network Operations
[Phone] | [Email]`,
  },
  {
    id: "fax_cover",
    name: "Fax Cover Sheet",
    subject: (p: OutreachProvider) => `FAX — Network Agreement — ${p.clinicName}`,
    body: (p: OutreachProvider) => `════════════════════════════════════════
FACSIMILE TRANSMISSION
════════════════════════════════════════

TO:      ${p.clinicName}
         ${p.contactPerson ? `Attn: ${p.contactPerson}` : "Attn: Clinic Administrator"}
         ${p.city || ""}, ${p.state || ""}
FAX:     ${p.fax || "[FAX NUMBER]"}

FROM:    Occu-Med Network Operations
         [Your Name], [Your Title]
         FAX: [Your Fax Number]
         TEL: [Your Phone Number]

DATE:    ${format(new Date(), "MMMM d, yyyy")}
PAGES:   [X] (including cover sheet)

RE:      Network Participation Agreement — Action Required

════════════════════════════════════════
CONFIDENTIALITY NOTICE
This facsimile transmission contains information that may be confidential.
If you have received this in error, please notify the sender immediately.
════════════════════════════════════════

Dear ${p.contactPerson || "Clinic Administrator"},

Please find enclosed the Occu-Med Network Participation Agreement for your review and execution. Kindly sign and return all pages at your earliest convenience.

For questions, please contact us at [Phone] or [Email].

Thank you.`,
  },
];

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || STATUS_META.sent;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${meta.color}`}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

export default function Outreach() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("tracker");
  const [trackerFilter, setTrackerFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState<number | "">("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("service_agreement");
  const [outreachType, setOutreachType] = useState<"email" | "fax">("email");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [recipientOverride, setRecipientOverride] = useState("");
  const [copied, setCopied] = useState(false);
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [massSelected, setMassSelected] = useState<Set<number>>(new Set());
  const [massTemplate, setMassTemplate] = useState("service_agreement");
  const [massType, setMassType] = useState<"email" | "fax" | "agreement">("agreement");
  const [massRecording, setMassRecording] = useState(false);
  const [massStateFilter, setMassStateFilter] = useState("");
  const [massTpaOnly, setMassTpaOnly] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<OutreachTemplate[]>([
    { id: "custom_kab_followup", name: "KAB / COC Follow-Up", subject: "Follow-Up: KAB / COC Supply Request", body: "Hello {{clinic_name}},\n\nChecking in on the KAB requests, COCs, and specimen supply request we sent to {{clinic_name}} in {{city}}, {{state}}.\n\nPlease let us know the current status and whether you need any changes to the shipment.\n\nThank you,\n[Your Name]" },
    { id: "custom_site_opening", name: "New Site Opening", subject: "New Site Opening Coordination", body: "Hello {{clinic_name}},\n\nWe saw your new site opening and wanted to coordinate outreach, supply routing, and network onboarding details.\n\nPlease share the best contact for billing, fax, and shipping.\n\nBest,\n[Your Name]" },
  ]);
  const [templateForm, setTemplateForm] = useState({ name: "", subject: "", body: "" });
  const [templateSearch, setTemplateSearch] = useState("");

  const { data: records, isLoading: loadingRecords } = useQuery<OutreachRecord[]>({
    queryKey: ["/api/outreach"],
    queryFn: () => customFetch("/api/outreach"),
  });

  const { data: stats } = useQuery<OutreachStats>({
    queryKey: ["/api/outreach/stats"],
    queryFn: () => customFetch("/api/outreach/stats"),
  });

  const { data: providers, isLoading: loadingProviders } = useQuery<OutreachProvider[]>({
    queryKey: ["/api/outreach/providers-for-outreach"],
    queryFn: () => customFetch("/api/outreach/providers-for-outreach"),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      customFetch(`/api/outreach/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outreach"] });
      queryClient.invalidateQueries({ queryKey: ["/api/outreach/stats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customFetch(`/api/outreach/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outreach"] });
      queryClient.invalidateQueries({ queryKey: ["/api/outreach/stats"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (records: Record<string, unknown>[]) =>
      customFetch("/api/outreach", { method: "POST", body: JSON.stringify({ records }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outreach"] });
      queryClient.invalidateQueries({ queryKey: ["/api/outreach/stats"] });
    },
  });

  const selectedProvider = useMemo(
    () => providers?.find((p) => p.id === selectedProviderId) ?? null,
    [providers, selectedProviderId],
  );

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((t) => t.id === selectedTemplateId) ?? TEMPLATES[0],
    [selectedTemplateId],
  );
  const allTemplates = useMemo(
    () => [...TEMPLATES.map((t) => ({ id: t.id, name: t.name, subject: "", body: "" })), ...customTemplates],
    [customTemplates],
  );
  const filteredCustomTemplates = customTemplates.filter((t) => {
    const q = templateSearch.toLowerCase();
    return !q || [t.name, t.subject, t.body].join(" ").toLowerCase().includes(q);
  });

  const generatedSubject = useMemo(
    () => (selectedProvider ? selectedTemplate.subject(selectedProvider) : ""),
    [selectedProvider, selectedTemplate],
  );

  const generatedBody = useMemo(
    () => (selectedProvider ? selectedTemplate.body(selectedProvider) : ""),
    [selectedProvider, selectedTemplate],
  );

  const displaySubject = customSubject || generatedSubject;
  const displayBody = customBody || generatedBody;

  React.useEffect(() => {
    setCustomSubject("");
    setCustomBody("");
  }, [selectedProviderId, selectedTemplateId]);

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter((r) => {
      if (trackerFilter === "pending") return r.status === "sent";
      if (trackerFilter === "overdue") {
        return r.status === "sent" && r.sentAt && differenceInDays(new Date(), new Date(r.sentAt)) >= 7;
      }
      if (trackerFilter === "received") return r.status === "received" || r.status === "signed";
      if (trackerFilter === "follow_up") return r.status === "follow_up_needed";
      return true;
    }).filter((r) =>
      !searchTerm ||
      r.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.providerState?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.providerCity?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [records, trackerFilter, searchTerm]);

  const allStates = useMemo(() => {
    if (!providers) return [];
    return Array.from(new Set(providers.map((p) => p.state).filter(Boolean))).sort() as string[];
  }, [providers]);

  const filteredMassProviders = useMemo(() => {
    if (!providers) return [];
    return providers.filter((p) => {
      if (massStateFilter && p.state !== massStateFilter) return false;
      if (massTpaOnly && !p.tpaFriendlyClues) return false;
      return true;
    });
  }, [providers, massStateFilter, massTpaOnly]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${displaySubject}\n\n${displayBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRecordAsSent = async () => {
    if (!selectedProvider) return;
    const template = TEMPLATES.find((t) => t.id === selectedTemplateId)!;
    await createMutation.mutateAsync([{
      providerId: selectedProvider.id,
      providerName: selectedProvider.clinicName,
      providerCity: selectedProvider.city,
      providerState: selectedProvider.state,
      providerEmail: selectedProvider.email,
      providerFax: selectedProvider.fax,
      outreachType,
      templateName: template.name,
      subject: displaySubject,
      body: displayBody,
      recipientEmail: outreachType === "email" ? (recipientOverride || selectedProvider.email) : undefined,
      recipientFax: outreachType === "fax" ? (recipientOverride || selectedProvider.fax) : undefined,
      status: "sent",
    }]);
    setActiveTab("tracker");
  };

  const handleMassRecord = async () => {
    if (massSelected.size === 0) return;
    setMassRecording(true);
    const template = TEMPLATES.find((t) => t.id === massTemplate)!;
    const selectedProviders = filteredMassProviders.filter((p) => massSelected.has(p.id));
    const records = selectedProviders.map((p) => ({
      providerId: p.id,
      providerName: p.clinicName,
      providerCity: p.city,
      providerState: p.state,
      providerEmail: p.email,
      providerFax: p.fax,
      outreachType: massType,
      templateName: template.name,
      subject: template.subject(p),
      body: template.body(p),
      recipientEmail: massType === "email" || massType === "agreement" ? p.email : undefined,
      recipientFax: massType === "fax" ? p.fax : undefined,
      status: "sent",
    }));
    await createMutation.mutateAsync(records);
    setMassSelected(new Set());
    setMassRecording(false);
    setActiveTab("tracker");
  };

  const saveCustomTemplate = () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.body) return;
    setCustomTemplates((prev) => [
      { id: `custom_${Date.now()}`, name: templateForm.name, subject: templateForm.subject, body: templateForm.body },
      ...prev,
    ]);
    setTemplateForm({ name: "", subject: "", body: "" });
  };

  const removeCustomTemplate = (id: string) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleMassSelect = (id: number) => {
    setMassSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (massSelected.size === filteredMassProviders.length) setMassSelected(new Set());
    else setMassSelected(new Set(filteredMassProviders.map((p) => p.id)));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Mail className="h-8 w-8 text-primary drop-shadow-[0_0_12px_rgba(230,180,0,0.6)]" />
            Outreach Center
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-2xl leading-relaxed">
            Track service agreements, generate professional emails and faxes, and run mass outreach campaigns.
          </p>
        </div>

        {stats && (
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {[
              { label: "Sent", value: stats.sent, color: "text-amber-400" },
              { label: "Pending", value: Number(stats.sent), color: "text-amber-300" },
              { label: "Overdue", value: Number(stats.overdue), color: "text-orange-400" },
              { label: "Signed", value: Number(stats.signed), color: "text-amber-400" },
            ].map((s) => (
              <div key={s.label} className="glass-panel px-4 py-2 rounded-lg border-white/[0.08] text-center min-w-[70px]">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-black/40 border border-white/[0.08] p-1 rounded-xl h-auto flex gap-1">
          <TabsTrigger value="tracker" className="data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold rounded-lg px-4 py-2 text-sm text-muted-foreground">
            <FileSignature className="h-3.5 w-3.5 mr-2" />Agreement Tracker
            {stats && Number(stats.overdue) > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{stats.overdue}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="generator" className="data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold rounded-lg px-4 py-2 text-sm text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5 mr-2" />Email Generator
          </TabsTrigger>
          <TabsTrigger value="mass" className="data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold rounded-lg px-4 py-2 text-sm text-muted-foreground">
            <Send className="h-3.5 w-3.5 mr-2" />Mass Outreach
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold rounded-lg px-4 py-2 text-sm text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5 mr-2" />Templates
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: AGREEMENT TRACKER ── */}
        <TabsContent value="tracker" className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search provider…" className="pl-8 h-9 bg-black/40 border-white/10 text-white text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "all", label: "All" },
                { key: "pending", label: "Pending" },
                { key: "overdue", label: "Overdue" },
                { key: "received", label: "Received / Signed" },
                { key: "follow_up", label: "Follow Up" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTrackerFilter(f.key)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wider transition-all ${trackerFilter === f.key ? "bg-primary/20 text-primary border-primary/40" : "bg-white/[0.03] text-muted-foreground border-white/10 hover:border-white/20 hover:text-white"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              onClick={() => setActiveTab("generator")}
              className="ml-auto bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 shrink-0"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />New Record
            </Button>
          </div>

          {loadingRecords ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />)}</div>
          ) : filteredRecords.length === 0 ? (
            <Card className="glass-panel border-white/5 bg-black/30">
              <CardContent className="h-48 flex flex-col items-center justify-center text-center">
                <FileSignature className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground font-medium">No outreach records found.</p>
                <p className="text-muted-foreground/60 text-sm mt-1">Use the Email Generator or Mass Outreach tab to record sent agreements.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredRecords.map((record) => {
                const isOverdue = record.status === "sent" && record.sentAt && differenceInDays(new Date(), new Date(record.sentAt)) >= 7;
                const isExpanded = expandedId === record.id;

                return (
                  <motion.div key={record.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className={`glass-panel border-white/[0.05] bg-black/40 transition-all ${isOverdue ? "border-l-2 border-l-orange-500/60" : ""}`}>
                      <CardContent className="p-0">
                        <div
                          className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                          onClick={() => setExpandedId(isExpanded ? null : record.id)}
                        >
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${record.outreachType === "fax" ? "bg-white/[0.04] border-white/[0.1]" : "bg-primary/10 border-primary/20"}`}>
                            {record.outreachType === "fax" ? <Printer className="h-4 w-4 text-muted-foreground" /> : <Mail className="h-4 w-4 text-primary" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-white text-sm truncate">{record.providerName}</span>
                              {record.providerCity && <span className="text-xs text-muted-foreground">{record.providerCity}, {record.providerState}</span>}
                              {isOverdue && <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Overdue</span>}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {record.templateName && <span className="truncate max-w-[180px] opacity-70">{record.templateName}</span>}
                              {record.sentAt && <span className="flex items-center gap-1 shrink-0"><Calendar className="h-3 w-3" />Sent {formatDistanceToNow(new Date(record.sentAt), { addSuffix: true })}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <StatusBadge status={record.status} />
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden border-t border-white/[0.05]"
                            >
                              <div className="p-4 space-y-4">
                                {record.subject && (
                                  <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Subject</div>
                                    <div className="text-sm text-white">{record.subject}</div>
                                  </div>
                                )}
                                {record.body && (
                                  <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Message Preview</div>
                                    <div className="text-xs text-muted-foreground leading-relaxed bg-black/30 border border-white/[0.06] rounded-lg p-3 max-h-48 overflow-auto whitespace-pre-line font-mono">{record.body.slice(0, 500)}{record.body.length > 500 ? "…" : ""}</div>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                  {record.recipientEmail && <div><span className="text-muted-foreground">Email: </span><span className="text-white">{record.recipientEmail}</span></div>}
                                  {record.recipientFax && <div><span className="text-muted-foreground">Fax: </span><span className="text-white">{record.recipientFax}</span></div>}
                                  {record.sentAt && <div><span className="text-muted-foreground">Sent: </span><span className="text-white">{format(new Date(record.sentAt), "MMM d, yyyy")}</span></div>}
                                  {record.receivedAt && <div><span className="text-muted-foreground">Received: </span><span className="text-white">{format(new Date(record.receivedAt), "MMM d, yyyy")}</span></div>}
                                </div>
                                <div className="space-y-2">
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Notes</div>
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Add a note…"
                                      className="h-9 bg-black/40 border-white/10 text-white text-sm flex-1"
                                      value={noteInputs[record.id] ?? record.notes ?? ""}
                                      onChange={(e) => setNoteInputs((prev) => ({ ...prev, [record.id]: e.target.value }))}
                                    />
                                    <Button size="sm" variant="outline" className="border-white/10 text-muted-foreground hover:text-white" onClick={() => patchMutation.mutate({ id: record.id, data: { notes: noteInputs[record.id] } })}>Save</Button>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {record.status === "sent" && (
                                    <>
                                      <Button size="sm" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs" onClick={() => patchMutation.mutate({ id: record.id, data: { status: "received" } })}>
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Mark Received
                                      </Button>
                                      <Button size="sm" className="bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/25 text-xs" onClick={() => patchMutation.mutate({ id: record.id, data: { status: "follow_up_needed" } })}>
                                        <AlertCircle className="h-3.5 w-3.5 mr-1.5" />Flag Follow-Up
                                      </Button>
                                    </>
                                  )}
                                  {(record.status === "received" || record.status === "follow_up_needed") && (
                                    <Button size="sm" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-xs" onClick={() => patchMutation.mutate({ id: record.id, data: { status: "signed" } })}>
                                      <FileSignature className="h-3.5 w-3.5 mr-1.5" />Mark Signed
                                    </Button>
                                  )}
                                  {record.status === "follow_up_needed" && (
                                    <Button size="sm" className="bg-primary/15 hover:bg-primary/25 text-primary border border-primary/25 text-xs" onClick={() => { setSelectedProviderId(record.providerId ?? ""); setSelectedTemplateId("agreement_followup"); setActiveTab("generator"); }}>
                                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Generate Follow-Up
                                    </Button>
                                  )}
                                  <Button size="sm" variant="ghost" className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-xs ml-auto" onClick={() => deleteMutation.mutate(record.id)}>
                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── TAB 2: EMAIL GENERATOR ── */}
        <TabsContent value="generator" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-panel border-white/[0.06]">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />Compose
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Provider</label>
                  <select
                    className="w-full h-10 rounded-lg bg-black/40 border border-white/10 text-sm text-white px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value ? parseInt(e.target.value) : "")}
                  >
                    <option value="">— Select a provider —</option>
                    {(providers || []).map((p) => (
                      <option key={p.id} value={p.id}>{p.clinicName} — {p.city}, {p.state}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Template</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplateId(t.id)}
                        className={`text-left text-sm px-3 py-2.5 rounded-lg border transition-all ${selectedTemplateId === t.id ? "bg-primary/15 text-primary border-primary/40" : "bg-white/[0.02] text-muted-foreground border-white/[0.07] hover:bg-white/[0.05] hover:text-white"}`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOutreachType("email")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${outreachType === "email" ? "bg-primary/15 text-primary border-primary/40" : "bg-white/[0.03] text-muted-foreground border-white/[0.08] hover:text-white"}`}
                    >
                      <Mail className="h-4 w-4" />Email
                    </button>
                    <button
                      onClick={() => setOutreachType("fax")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${outreachType === "fax" ? "bg-primary/15 text-primary border-primary/40" : "bg-white/[0.03] text-muted-foreground border-white/[0.08] hover:text-white"}`}
                    >
                      <Printer className="h-4 w-4" />Fax
                    </button>
                  </div>
                </div>

                {selectedProvider && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {outreachType === "email" ? "Send to Email" : "Send to Fax"}
                    </label>
                    <Input
                      placeholder={outreachType === "email" ? selectedProvider.email || "Enter email address" : selectedProvider.fax || "Enter fax number"}
                      className="h-9 bg-black/40 border-white/10 text-white text-sm font-mono"
                      value={recipientOverride}
                      onChange={(e) => setRecipientOverride(e.target.value)}
                    />
                    {outreachType === "email" && selectedProvider.email && !recipientOverride && (
                      <p className="text-[10px] text-muted-foreground">Using: {selectedProvider.email}</p>
                    )}
                    {outreachType === "fax" && selectedProvider.fax && !recipientOverride && (
                      <p className="text-[10px] text-muted-foreground">Using: {selectedProvider.fax}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/[0.06] flex flex-col">
              <CardHeader className="border-b border-white/[0.05] pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base text-white">Preview</CardTitle>
                {selectedProvider && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-white/10 text-muted-foreground hover:text-white text-xs h-8" onClick={handleCopy}>
                      {copied ? <><Check className="h-3.5 w-3.5 mr-1.5 text-amber-400" />Copied</> : <><Copy className="h-3.5 w-3.5 mr-1.5" />Copy</>}
                    </Button>
                    <Button size="sm" className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs h-8" onClick={handleRecordAsSent} disabled={createMutation.isPending}>
                      {createMutation.isPending ? <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                      Record as Sent
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col gap-3">
                {!selectedProvider ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Mail className="h-12 w-12 opacity-15 mb-3" />
                    <p className="font-medium">Select a provider to generate</p>
                    <p className="text-sm opacity-60 mt-1">Your email or fax will auto-populate with their details</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Subject</div>
                      <Input
                        value={displaySubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        className="h-9 bg-black/40 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div className="space-y-1 flex-1 flex flex-col">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Body</div>
                      <Textarea
                        value={displayBody}
                        onChange={(e) => setCustomBody(e.target.value)}
                        className="flex-1 min-h-[380px] bg-black/40 border-white/10 text-white text-xs leading-relaxed font-mono resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                      <span>Provider: <span className="text-white">{selectedProvider.clinicName}</span></span>
                      <span className="text-muted-foreground/50">{displayBody.length} chars</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 3: MASS OUTREACH ── */}
        <TabsContent value="mass" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <Card className="glass-panel border-white/[0.06]">
                <CardHeader className="border-b border-white/[0.05] pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />Select Providers
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <select className="h-8 rounded-lg bg-black/40 border border-white/10 text-xs text-white px-2 focus:outline-none" value={massStateFilter} onChange={(e) => setMassStateFilter(e.target.value)}>
                      <option value="">All States</option>
                      {allStates.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button
                      onClick={() => setMassTpaOnly(!massTpaOnly)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-bold tracking-wider transition-all ${massTpaOnly ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-white/[0.03] text-muted-foreground border-white/10"}`}
                    >
                      TPA Only
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-3">
                    <input type="checkbox" className="rounded" checked={massSelected.size === filteredMassProviders.length && filteredMassProviders.length > 0} onChange={toggleSelectAll} />
                    <span className="text-xs text-muted-foreground">
                      {massSelected.size > 0 ? <span className="text-amber-400 font-bold">{massSelected.size} selected</span> : "Select all"}
                      {" "}of {filteredMassProviders.length}
                    </span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto divide-y divide-white/[0.04]">
                    {loadingProviders
                      ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 mx-4 my-2 rounded bg-white/5" />)
                      : filteredMassProviders.map((p) => (
                          <label key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors">
                            <input type="checkbox" checked={massSelected.has(p.id)} onChange={() => toggleMassSelect(p.id)} className="rounded shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white truncate">{p.clinicName}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                <span>{p.city}, {p.state}</span>
                                {p.email && <span className="text-primary/60 font-mono">✉</span>}
                                {p.fax && <span className="text-muted-foreground/50 font-mono">📠</span>}
                                {p.tpaFriendlyClues && <span className="text-amber-400/60 text-[10px] font-bold">TPA</span>}
                              </div>
                            </div>
                            {p.verificationStatus === "Verified" && <span className="text-[9px] text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold">✓</span>}
                          </label>
                        ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="glass-panel border-white/[0.06]">
                <CardHeader className="border-b border-white/[0.05] pb-4">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Send className="h-4 w-4 text-primary" />Outreach Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Outreach Type</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { val: "agreement", icon: FileSignature, label: "Agreement" },
                        { val: "email", icon: Mail, label: "Email" },
                        { val: "fax", icon: Printer, label: "Fax" },
                      ].map(({ val, icon: Icon, label }) => (
                        <button
                          key={val}
                          onClick={() => setMassType(val as "email" | "fax" | "agreement")}
                          className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border text-xs font-medium transition-all ${massType === val ? "bg-primary/15 text-primary border-primary/40" : "bg-white/[0.02] text-muted-foreground border-white/[0.07] hover:text-white"}`}
                        >
                          <Icon className="h-4 w-4" />{label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Template</label>
                    <select
                      className="w-full h-9 rounded-lg bg-black/40 border border-white/10 text-xs text-white px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                      value={massTemplate}
                      onChange={(e) => setMassTemplate(e.target.value)}
                    >
                      {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div className="bg-black/30 border border-white/[0.07] rounded-xl p-4 space-y-2 text-xs">
                    <div className="font-bold text-muted-foreground uppercase tracking-widest mb-2">Summary</div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Providers selected</span><span className="text-white font-bold">{massSelected.size}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-white capitalize">{massType}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Template</span><span className="text-primary text-[10px]">{TEMPLATES.find((t) => t.id === massTemplate)?.name}</span></div>
                  </div>

                  <Button
                    onClick={handleMassRecord}
                    disabled={massSelected.size === 0 || massRecording}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_20px_rgba(230,180,0,0.3)] border border-primary/50 transition-all disabled:opacity-40"
                  >
                    {massRecording ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Recording…</> : <><Send className="h-4 w-4 mr-2" />Record {massSelected.size} as Sent</>}
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                    This records the outreach in the tracker. Copy emails separately from the Email Generator.
                  </p>
                </CardContent>
              </Card>

              {massSelected.size > 0 && providers && (
                <Card className="glass-panel border-white/[0.06]">
                  <CardHeader className="py-3 px-4 border-b border-white/[0.04]">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Selected Providers</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 max-h-48 overflow-y-auto">
                    <div className="space-y-1.5">
                      {providers.filter((p) => massSelected.has(p.id)).map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-xs">
                          <span className="text-white truncate">{p.clinicName}</span>
                          <button onClick={() => toggleMassSelect(p.id)} className="text-muted-foreground hover:text-red-400 ml-2 transition-colors shrink-0">
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <TabsContent value="templates" className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="glass-panel border-white/[0.06]">
            <CardHeader className="border-b border-white/[0.05] pb-4">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />Create Template
              </CardTitle>
              <CardDescription className="text-xs mt-1 text-muted-foreground">Add your own reusable outreach template.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <Input placeholder="Template name" value={templateForm.name} onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
              <Input placeholder="Subject" value={templateForm.subject} onChange={(e) => setTemplateForm((p) => ({ ...p, subject: e.target.value }))} className="bg-black/40 border-white/10 text-white" />
              <Textarea placeholder="Body" value={templateForm.body} onChange={(e) => setTemplateForm((p) => ({ ...p, body: e.target.value }))} className="min-h-56 bg-black/40 border-white/10 text-white font-mono text-xs" />
              <Button onClick={saveCustomTemplate} className="bg-primary text-black hover:bg-primary/90">Save Template</Button>
            </CardContent>
          </Card>
          <Card className="glass-panel border-white/[0.06]">
            <CardHeader className="border-b border-white/[0.05] pb-4 flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base text-white">My Templates</CardTitle>
                <CardDescription className="text-xs mt-1 text-muted-foreground">Use these in the generator and mass outreach tabs.</CardDescription>
              </div>
              <Input value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} placeholder="Search templates…" className="w-full sm:w-56 bg-black/40 border-white/10 text-white h-9" />
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {filteredCustomTemplates.map((t) => (
                <div key={t.id} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.subject}</div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => removeCustomTemplate(t.id)}>Delete</Button>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-pre-line max-h-32 overflow-auto">{t.body}</div>
                </div>
              ))}
              {filteredCustomTemplates.length === 0 && <p className="text-sm text-muted-foreground">No custom templates yet.</p>}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </div>
  );
}
