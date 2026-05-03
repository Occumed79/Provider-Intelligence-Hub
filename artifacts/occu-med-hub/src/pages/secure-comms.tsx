import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Send,
  Paperclip,
  UserPlus,
  Copy,
  Check,
  ChevronLeft,
  MessageSquare,
  FileText,
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Link2,
  X,
  RefreshCw,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";

type Invite = {
  id: number;
  token: string;
  providerName: string;
  providerEmail: string | null;
  providerOrg: string | null;
  status: string;
  notes: string | null;
  invitedAt: string | null;
  lastActivityAt: string | null;
  unreadCount: number;
  lastMessage: SecureMessage | null;
};

type SecureMessage = {
  id: number;
  inviteToken: string;
  senderType: string;
  senderName: string | null;
  messageText: string | null;
  isFile: boolean;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  readByHub: boolean;
  readByProvider: boolean;
  createdAt: string;
};

type Thread = { invite: Invite; messages: SecureMessage[] };

type Provider = { id: number; clinicName: string; city: string | null; state: string | null; email: string | null };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getPortalLink(token: string) {
  return `${window.location.origin}${BASE}/portal/${token}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "active" ? "bg-amber-400 shadow-[0_0_6px_rgba(230,180,0,0.8)]" :
    status === "pending" ? "bg-yellow-600" :
    "bg-red-500";
  return <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${color}`} />;
}

export default function SecureComms() {
  const queryClient = useQueryClient();
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inviteForm, setInviteForm] = useState({
    providerName: "",
    providerEmail: "",
    providerOrg: "",
    notes: "",
    providerId: "",
  });

  const { data: invites, isLoading: loadingInvites } = useQuery<Invite[]>({
    queryKey: ["/api/secure-comms/invites"],
    queryFn: () => customFetch("/api/secure-comms/invites"),
    refetchInterval: 10000,
  });

  const { data: thread, isLoading: loadingThread } = useQuery<Thread>({
    queryKey: ["/api/secure-comms/thread", activeToken],
    queryFn: () => customFetch(`/api/secure-comms/thread/${activeToken}`),
    enabled: !!activeToken,
    refetchInterval: 5000,
  });

  const { data: providers } = useQuery<Provider[]>({
    queryKey: ["/api/outreach/providers-for-outreach"],
    queryFn: () => customFetch("/api/outreach/providers-for-outreach"),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  useEffect(() => {
    if (activeToken) queryClient.invalidateQueries({ queryKey: ["/api/secure-comms/invites"] });
  }, [thread?.messages?.length]);

  const createInviteMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      customFetch("/api/secure-comms/invite", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (invite: Invite) => {
      queryClient.invalidateQueries({ queryKey: ["/api/secure-comms/invites"] });
      setShowInvitePanel(false);
      setInviteForm({ providerName: "", providerEmail: "", providerOrg: "", notes: "", providerId: "" });
      setActiveToken(invite.token);
    },
  });

  const deleteInviteMutation = useMutation({
    mutationFn: (id: number) => customFetch(`/api/secure-comms/invite/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/secure-comms/invites"] });
      setActiveToken(null);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ token, text }: { token: string; text: string }) =>
      customFetch(`/api/secure-comms/thread/${token}/message`, {
        method: "POST",
        body: JSON.stringify({ messageText: text }),
      }),
    onSuccess: () => {
      setMsgText("");
      queryClient.invalidateQueries({ queryKey: ["/api/secure-comms/thread", activeToken] });
      queryClient.invalidateQueries({ queryKey: ["/api/secure-comms/invites"] });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: ({ token, file }: { token: string; file: File }) => {
      const fd = new FormData();
      fd.append("file", file);
      return customFetch(`/api/secure-comms/thread/${token}/upload`, { method: "POST", body: fd });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/secure-comms/thread", activeToken] });
      queryClient.invalidateQueries({ queryKey: ["/api/secure-comms/invites"] });
    },
  });

  const handleSend = () => {
    if (!activeToken || !msgText.trim()) return;
    sendMessageMutation.mutate({ token: activeToken, text: msgText.trim() });
  };

  const handleFileUpload = (file: File) => {
    if (!activeToken) return;
    uploadFileMutation.mutate({ token: activeToken, file });
  };

  const handleCopyLink = (token: string) => {
    navigator.clipboard.writeText(getPortalLink(token));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleInviteSubmit = () => {
    if (!inviteForm.providerName.trim()) return;
    createInviteMutation.mutate({
      providerName: inviteForm.providerName,
      providerEmail: inviteForm.providerEmail || undefined,
      providerOrg: inviteForm.providerOrg || undefined,
      notes: inviteForm.notes || undefined,
      providerId: inviteForm.providerId ? parseInt(inviteForm.providerId) : undefined,
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [activeToken],
  );

  const activeInvite = invites?.find((i) => i.token === activeToken);

  return (
    <div className="flex h-[calc(100vh-5rem)] -mt-6 -mx-6 overflow-hidden">
      {/* ── LEFT SIDEBAR ── */}
      <div className={`flex flex-col w-full md:w-72 shrink-0 border-r border-white/[0.06] bg-black/30 backdrop-blur-xl overflow-hidden transition-all ${activeToken ? "hidden md:flex" : "flex"}`}>
        <div className="px-4 pt-5 pb-4 border-b border-white/[0.05]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary drop-shadow-[0_0_8px_rgba(230,180,0,0.7)]" />
              <h2 className="font-bold text-white text-sm tracking-wide">Secure Comms</h2>
            </div>
            <Button
              size="sm"
              onClick={() => setShowInvitePanel(true)}
              className="h-7 px-2.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs"
            >
              <UserPlus className="h-3 w-3 mr-1" />Invite
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Encrypted private channel. Providers get a secure link to message and share files.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingInvites ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg bg-white/5" />)}
            </div>
          ) : !invites?.length ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground/20 mb-2" />
              <p className="text-xs text-muted-foreground">No active threads yet.</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Invite a provider to start a secure channel.</p>
            </div>
          ) : (
            invites.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setActiveToken(inv.token)}
                className={`w-full text-left px-4 py-3.5 border-b border-white/[0.04] transition-all hover:bg-white/[0.03] ${activeToken === inv.token ? "bg-primary/[0.08] border-l-2 border-l-primary/60" : ""}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                    {inv.providerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <StatusDot status={inv.status} />
                      <span className="text-white text-sm font-medium truncate">{inv.providerName}</span>
                      {inv.unreadCount > 0 && (
                        <span className="ml-auto shrink-0 h-4 w-4 bg-primary text-black text-[9px] font-black rounded-full flex items-center justify-center">{inv.unreadCount}</span>
                      )}
                    </div>
                    {inv.lastMessage ? (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {inv.lastMessage.senderType === "hub" ? "You: " : ""}
                        {inv.lastMessage.isFile ? `📎 ${inv.lastMessage.fileName}` : inv.lastMessage.messageText}
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground/50 italic">No messages yet</p>
                    )}
                    {inv.lastActivityAt && (
                      <p className="text-[9px] text-muted-foreground/40 mt-0.5">{formatDistanceToNow(new Date(inv.lastActivityAt), { addSuffix: true })}</p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!activeToken ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
              <Shield className="h-16 w-16 text-primary relative drop-shadow-[0_0_20px_rgba(230,180,0,0.5)]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Secure Provider Communications</h3>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              Invite any provider to a private, secure channel. They get a unique link to communicate, share documents, and upload records — no account required on their end.
            </p>
            <Button
              className="mt-6 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
              onClick={() => setShowInvitePanel(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />Invite a Provider
            </Button>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-black/20 shrink-0">
              <button onClick={() => setActiveToken(null)} className="md:hidden text-muted-foreground hover:text-white">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="h-9 w-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                {activeInvite?.providerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <StatusDot status={activeInvite?.status ?? "pending"} />
                  <span className="font-semibold text-white text-sm">{activeInvite?.providerName}</span>
                  {activeInvite?.providerOrg && <span className="text-xs text-muted-foreground">· {activeInvite.providerOrg}</span>}
                </div>
                {activeInvite?.providerEmail && <p className="text-[10px] text-muted-foreground">{activeInvite.providerEmail}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-muted-foreground hover:text-white text-xs h-7"
                  onClick={() => activeToken && handleCopyLink(activeToken)}
                >
                  {copiedToken === activeToken ? (
                    <><Check className="h-3 w-3 mr-1.5 text-amber-400" />Copied</>
                  ) : (
                    <><Link2 className="h-3 w-3 mr-1.5" />Copy Link</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10 h-7 px-2"
                  onClick={() => activeInvite && deleteInviteMutation.mutate(activeInvite.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Invite link banner */}
            {activeInvite?.status === "pending" && (
              <div className="mx-4 mt-3 px-3 py-2.5 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3 text-xs shrink-0">
                <Link2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-muted-foreground flex-1 truncate font-mono text-[10px]">{getPortalLink(activeInvite.token)}</span>
                <button onClick={() => handleCopyLink(activeInvite.token)} className="text-primary hover:text-amber-300 font-bold shrink-0 transition-colors">
                  {copiedToken === activeInvite.token ? "Copied!" : "Copy"}
                </button>
              </div>
            )}

            {/* Messages area */}
            <div
              className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 transition-colors ${dragOver ? "bg-primary/5 ring-2 ring-inset ring-primary/30" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {loadingThread ? (
                <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl bg-white/5" />)}</div>
              ) : thread?.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/20 mb-2" />
                  <p className="text-muted-foreground text-sm">No messages yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Send the invite link to start a conversation.</p>
                </div>
              ) : (
                thread?.messages.map((msg) => {
                  const isHub = msg.senderType === "hub";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isHub ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[72%] ${isHub ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div className={`text-[10px] font-medium px-1 ${isHub ? "text-primary/70 text-right" : "text-muted-foreground"}`}>
                          {isHub ? "Occu-Med Team" : (msg.senderName || "Provider")}
                        </div>
                        {msg.isFile ? (
                          <a
                            href={`/api/${isHub ? "secure-comms" : `portal-api/${msg.inviteToken}`}/file/${msg.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm transition-all hover:opacity-90 ${isHub ? "bg-primary/20 border-primary/30 text-primary ml-auto" : "bg-white/[0.06] border-white/[0.1] text-white"}`}
                          >
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${isHub ? "bg-primary/20" : "bg-white/10"}`}>
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium text-xs truncate max-w-[180px]">{msg.fileName}</div>
                              {msg.fileSize && <div className="text-[10px] opacity-60">{formatBytes(msg.fileSize)}</div>}
                            </div>
                            <Download className="h-3.5 w-3.5 opacity-60 shrink-0" />
                          </a>
                        ) : (
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isHub ? "bg-primary/20 text-white border border-primary/20 rounded-tr-sm" : "bg-white/[0.07] text-white border border-white/[0.1] rounded-tl-sm"}`}>
                            {msg.messageText}
                          </div>
                        )}
                        <div className={`text-[9px] text-muted-foreground/40 px-1 flex items-center gap-1.5 ${isHub ? "justify-end" : ""}`}>
                          {format(new Date(msg.createdAt), "h:mm a")}
                          {isHub && (msg.readByProvider ? <CheckCircle2 className="h-3 w-3 text-amber-400/50" /> : <Clock className="h-3 w-3 opacity-40" />)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              {dragOver && (
                <div className="flex items-center justify-center h-24 text-primary/60 text-sm font-medium">
                  <Paperclip className="h-4 w-4 mr-2" />Drop file to attach
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="px-4 py-3 border-t border-white/[0.06] bg-black/20 shrink-0">
              <div className="flex items-end gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.1] hover:bg-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-white transition-colors shrink-0"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <Textarea
                  placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                  className="flex-1 min-h-[36px] max-h-32 bg-black/40 border-white/10 text-white text-sm resize-none py-2 leading-relaxed"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!msgText.trim() || sendMessageMutation.isPending}
                  className="h-9 w-9 p-0 bg-primary hover:bg-primary/90 text-black shrink-0 shadow-[0_0_12px_rgba(230,180,0,0.3)]"
                >
                  {sendMessageMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              {uploadFileMutation.isPending && (
                <p className="text-[10px] text-primary/60 mt-1.5 flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" />Uploading file…</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── INVITE PANEL MODAL ── */}
      <AnimatePresence>
        {showInvitePanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowInvitePanel(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-md glass-panel border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-white text-base">Invite Provider</h3>
                </div>
                <button onClick={() => setShowInvitePanel(false)} className="text-muted-foreground hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Link to Provider (optional)</label>
                  <select
                    className="w-full h-9 rounded-lg bg-black/40 border border-white/10 text-sm text-white px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={inviteForm.providerId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      const p = providers?.find((pr) => String(pr.id) === pid);
                      setInviteForm((f) => ({
                        ...f,
                        providerId: pid,
                        providerName: p ? p.clinicName : f.providerName,
                        providerEmail: p?.email || f.providerEmail,
                      }));
                    }}
                  >
                    <option value="">— Select existing provider —</option>
                    {(providers || []).map((p) => (
                      <option key={p.id} value={p.id}>{p.clinicName} — {p.city}, {p.state}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contact Name *</label>
                  <Input
                    placeholder="Dr. Smith / Billing Office / etc."
                    className="h-9 bg-black/40 border-white/10 text-white text-sm"
                    value={inviteForm.providerName}
                    onChange={(e) => setInviteForm((f) => ({ ...f, providerName: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Organization</label>
                    <Input
                      placeholder="Clinic / Hospital name"
                      className="h-9 bg-black/40 border-white/10 text-white text-sm"
                      value={inviteForm.providerOrg}
                      onChange={(e) => setInviteForm((f) => ({ ...f, providerOrg: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email (optional)</label>
                    <Input
                      placeholder="provider@clinic.com"
                      type="email"
                      className="h-9 bg-black/40 border-white/10 text-white text-sm"
                      value={inviteForm.providerEmail}
                      onChange={(e) => setInviteForm((f) => ({ ...f, providerEmail: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Internal Notes</label>
                  <Textarea
                    placeholder="Reason for invitation, agreements to discuss…"
                    className="bg-black/40 border-white/10 text-white text-sm resize-none"
                    rows={2}
                    value={inviteForm.notes}
                    onChange={(e) => setInviteForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </div>

                <div className="bg-primary/8 border border-primary/15 rounded-lg px-3 py-2.5 text-[10px] text-muted-foreground leading-relaxed">
                  <Shield className="h-3 w-3 text-primary inline mr-1.5 -mt-0.5" />
                  A unique secure link will be generated. The provider can open it to message and share files without creating an account.
                </div>

                <Button
                  onClick={handleInviteSubmit}
                  disabled={!inviteForm.providerName.trim() || createInviteMutation.isPending}
                  className="w-full h-10 bg-primary hover:bg-primary/90 text-black font-bold shadow-[0_0_16px_rgba(230,180,0,0.3)] border border-primary/50"
                >
                  {createInviteMutation.isPending ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Creating…</>
                  ) : (
                    <><Shield className="h-4 w-4 mr-2" />Generate Secure Link</>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
