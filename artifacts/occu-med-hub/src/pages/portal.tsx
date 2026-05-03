import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import {
  Shield,
  Send,
  Paperclip,
  FileText,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  Lock,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

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

type PortalInfo = {
  providerName: string;
  providerOrg: string | null;
  status: string;
  invitedAt: string | null;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Portal() {
  const [, params] = useRoute(`${BASE}/portal/:token`);
  const token = params?.token ?? "";

  const queryClient = useQueryClient();
  const [msgText, setMsgText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: portalInfo, isLoading: loadingInfo, error: verifyError } = useQuery<PortalInfo>({
    queryKey: ["/api/portal-api", token, "verify"],
    queryFn: () => customFetch(`/api/portal-api/${token}/verify`),
    enabled: !!token,
    retry: false,
  });

  const { data: messages, isLoading: loadingMessages } = useQuery<SecureMessage[]>({
    queryKey: ["/api/portal-api", token, "messages"],
    queryFn: () => customFetch(`/api/portal-api/${token}/messages`),
    enabled: !!token && !!portalInfo,
    refetchInterval: 8000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      customFetch(`/api/portal-api/${token}/message`, {
        method: "POST",
        body: JSON.stringify({ messageText: text, senderName: portalInfo?.providerName }),
      }),
    onSuccess: () => {
      setMsgText("");
      queryClient.invalidateQueries({ queryKey: ["/api/portal-api", token, "messages"] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return customFetch(`/api/portal-api/${token}/upload`, { method: "POST", body: fd });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portal-api", token, "messages"] });
    },
  });

  const handleSend = () => {
    if (!msgText.trim()) return;
    sendMutation.mutate(msgText.trim());
  };

  const handleFileUpload = (file: File) => uploadMutation.mutate(file);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [token]);

  if (loadingInfo) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-white/60 text-sm">Verifying secure link…</p>
        </div>
      </div>
    );
  }

  if (verifyError || !portalInfo) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Invalid or Expired Link</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            This secure portal link is no longer valid. Please contact Occu-Med to request a new invite link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/[0.04] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.07] bg-black/40 backdrop-blur-xl px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/30 rounded-xl blur-md" />
              <div className="relative h-9 w-9 rounded-xl bg-black/60 border border-amber-400/30 flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">Occu-Med Secure Portal</div>
              <div className="text-white/40 text-[10px] mt-0.5 flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" />End-to-end secure channel
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-sm font-medium">{portalInfo.providerName}</div>
            {portalInfo.providerOrg && <div className="text-white/40 text-[10px]">{portalInfo.providerOrg}</div>}
          </div>
        </div>
      </header>

      {/* Welcome banner (shown when no messages) */}
      {messages && messages.length === 0 && (
        <div className="relative z-10 max-w-2xl mx-auto w-full px-4 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/[0.06] border border-amber-500/[0.15] rounded-2xl p-5 text-center"
          >
            <Shield className="h-8 w-8 text-amber-400 mx-auto mb-3 drop-shadow-[0_0_12px_rgba(230,180,0,0.5)]" />
            <h3 className="text-white font-bold text-base mb-1">Welcome, {portalInfo.providerName}</h3>
            <p className="text-white/50 text-xs leading-relaxed max-w-sm mx-auto">
              This is your secure, private communication channel with Occu-Med. You can send messages, share documents, and receive records — everything stays within this encrypted channel.
            </p>
          </motion.div>
        </div>
      )}

      {/* Messages */}
      <main
        className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-4 py-4 overflow-y-auto"
        style={{ minHeight: "calc(100vh - 220px)" }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {loadingMessages ? (
          <div className="space-y-4 pt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className="h-12 w-48 rounded-2xl bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className={`space-y-4 transition-colors pb-4 ${dragOver ? "bg-amber-500/5 ring-2 ring-inset ring-amber-500/20 rounded-xl" : ""}`}>
            <AnimatePresence initial={false}>
              {messages?.map((msg) => {
                const isHub = msg.senderType === "hub";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isHub ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-[80%] flex flex-col gap-1 ${isHub ? "items-start" : "items-end"}`}>
                      <div className={`text-[10px] font-medium px-1 text-white/30`}>
                        {isHub ? (msg.senderName || "Occu-Med Team") : "You"}
                      </div>

                      {msg.isFile ? (
                        <a
                          href={`/api/portal-api/${token}/file/${msg.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all hover:opacity-90 cursor-pointer ${
                            isHub
                              ? "bg-white/[0.07] border-white/[0.12] text-white"
                              : "bg-amber-500/20 border-amber-500/30 text-amber-200"
                          }`}
                        >
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${isHub ? "bg-white/10" : "bg-amber-500/20"}`}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-xs truncate max-w-[180px]">{msg.fileName}</div>
                            {msg.fileSize && <div className="text-[10px] opacity-60">{formatBytes(msg.fileSize)}</div>}
                          </div>
                          <Download className="h-3.5 w-3.5 opacity-60 shrink-0" />
                        </a>
                      ) : (
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isHub
                            ? "bg-white/[0.07] text-white border border-white/[0.1] rounded-tl-sm"
                            : "bg-amber-500/20 text-white border border-amber-500/25 rounded-tr-sm"
                        }`}>
                          {msg.messageText}
                        </div>
                      )}

                      <div className={`text-[9px] text-white/20 px-1 flex items-center gap-1.5`}>
                        {format(new Date(msg.createdAt), "h:mm a · MMM d")}
                        {!isHub && (msg.readByHub
                          ? <span className="text-amber-400/50">· Seen</span>
                          : <span className="text-white/20">· Delivered</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {dragOver && (
              <div className="flex items-center justify-center h-20 text-amber-400/60 text-sm font-medium rounded-xl border border-dashed border-amber-400/20">
                <Paperclip className="h-4 w-4 mr-2" />Drop file to send
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input bar */}
      <div className="relative z-10 sticky bottom-0 border-t border-white/[0.07] bg-black/60 backdrop-blur-xl px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors shrink-0"
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
          <textarea
            placeholder="Type your message…"
            className="flex-1 min-h-[40px] max-h-36 bg-white/[0.05] border border-white/[0.1] text-white text-sm rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-amber-400/30 placeholder-white/20 leading-relaxed"
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!msgText.trim() || sendMutation.isPending}
            className="h-10 w-10 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-black transition-colors shadow-[0_0_16px_rgba(230,180,0,0.3)] shrink-0"
          >
            {sendMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        {uploadMutation.isPending && (
          <p className="max-w-2xl mx-auto text-[10px] text-amber-400/50 mt-1.5 flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />Uploading…
          </p>
        )}
        <div className="max-w-2xl mx-auto mt-2 flex items-center justify-center gap-1.5 text-[9px] text-white/20">
          <Lock className="h-2.5 w-2.5" />Secured by Occu-Med · Messages are private to this channel
        </div>
      </div>
    </div>
  );
}
