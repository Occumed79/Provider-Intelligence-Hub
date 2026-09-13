import React, { useState } from "react";
import { useUploadFile, useUploadPastedText } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UploadCloud,
  FileType,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Folder,
  ScanText,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { Link } from "wouter";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ".pdf,.csv,.xlsx,.xls,.docx,.png,.jpg,.jpeg,.webp,.txt";
const ACCEPTED_EXTENSIONS = new Set(["pdf", "csv", "xlsx", "xls", "docx", "png", "jpg", "jpeg", "webp", "txt"]);

type PipelineStatus = "ready" | "submitting" | "complete" | "failed";

function validateFile(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!file.size) return "The selected file is empty.";
  if (file.size > MAX_FILE_SIZE_BYTES) return "Please select a file under 50MB.";
  if (!ACCEPTED_EXTENSIONS.has(ext)) return "Unsupported file type. Use PDF, DOCX, Excel, CSV, image, or TXT files.";
  return null;
}

function getErrorMessage(err: unknown): string {
  if (!err) return "The intake request failed.";
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "The intake request failed. Check the API logs for details.";
}

export default function Upload() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [rawText, setRawText] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("ready");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const uploadFile = useUploadFile();
  const uploadPaste = useUploadPastedText();
  const isWorking = pipelineStatus === "submitting" || uploadFile.isPending || uploadPaste.isPending;

  const setSelectedFile = (nextFile?: File | null) => {
    if (!nextFile) {
      setFile(null);
      return;
    }
    const err = validateFile(nextFile);
    if (err) {
      setErrorMessage(err);
      setPipelineStatus("failed");
      toast({ title: "File rejected", description: err, variant: "destructive" });
      return;
    }
    setFile(nextFile);
    setResult(null);
    setErrorMessage(null);
    setPipelineStatus("ready");
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => setDragActive(false);

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    setSelectedFile(event.dataTransfer.files?.[0] || null);
  };

  const runFileIntake = () => {
    if (!file) {
      toast({ title: "Missing file", description: "Drop or choose a file first.", variant: "destructive" });
      return;
    }
    const err = validateFile(file);
    if (err) {
      setErrorMessage(err);
      setPipelineStatus("failed");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setResult(null);
    setErrorMessage(null);
    setPipelineStatus("submitting");

    uploadFile.mutate(
      { data: formData as any },
      {
        onSuccess: (data) => {
          setResult(data);
          setPipelineStatus("complete");
          toast({ title: "Automatic intake complete", description: "The file was read, classified, and filed automatically." });
          setFile(null);
        },
        onError: (err) => {
          const message = getErrorMessage(err);
          setErrorMessage(message);
          setPipelineStatus("failed");
          toast({ title: "Automatic intake failed", description: message, variant: "destructive" });
        },
      },
    );
  };

  const runTextIntake = () => {
    const text = rawText.trim();
    if (!text) {
      toast({ title: "Nothing to process", description: "Paste text first.", variant: "destructive" });
      return;
    }
    setResult(null);
    setErrorMessage(null);
    setPipelineStatus("submitting");
    uploadPaste.mutate(
      { data: { text } },
      {
        onSuccess: (data) => {
          setResult(data);
          setPipelineStatus("complete");
          setRawText("");
          toast({ title: "Automatic intake complete", description: "The text was analyzed and filed automatically." });
        },
        onError: (err) => {
          const message = getErrorMessage(err);
          setErrorMessage(message);
          setPipelineStatus("failed");
          toast({ title: "Automatic intake failed", description: message, variant: "destructive" });
        },
      },
    );
  };

  const progressWidth = pipelineStatus === "complete" ? 100 : pipelineStatus === "submitting" || pipelineStatus === "failed" ? 58 : 0;
  const steps = [
    { label: "Drop", active: true },
    { label: "Read", active: pipelineStatus === "submitting" || pipelineStatus === "complete" },
    { label: "Extract", active: pipelineStatus === "submitting" || pipelineStatus === "complete" },
    { label: "Filed", active: pipelineStatus === "complete" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Automatic Intake</h1>
          <p className="mt-1 text-muted-foreground">Drop a source file. The hub reads, classifies, extracts, and files it without provider metadata entry.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-primary"><ShieldCheck className="h-3.5 w-3.5" /> Local processing</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5"><Sparkles className="h-3.5 w-3.5" /> Zero metadata fields</span>
        </div>
      </div>

      <Card className="glass-panel border-white/[0.05] bg-black/20">
        <CardContent className="p-6">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 z-0 h-1 w-full -translate-y-1/2 rounded-full bg-white/[0.05]" />
            <div className="absolute left-0 top-1/2 z-0 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-500" style={{ width: `${progressWidth}%` }} />
            {steps.map((step, idx) => (
              <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background ${step.active ? "border-primary text-primary" : "border-white/20 text-muted-foreground"}`}>
                  {pipelineStatus === "complete" && idx === steps.length - 1 ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : isWorking && idx === 1 ? (
                    <div className="h-2 w-2 animate-ping rounded-full bg-primary" />
                  ) : (
                    <div className={`h-2 w-2 rounded-full ${step.active ? "bg-primary" : "bg-white/20"}`} />
                  )}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${step.active ? "text-white" : "text-muted-foreground/50"}`}>{step.label}</span>
              </div>
            ))}
          </div>
          {pipelineStatus === "failed" && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage || "The automatic intake request failed."}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Card className="glass-panel border-primary/20">
          <CardHeader className="border-b border-white/[0.05] bg-white/[0.02]">
            <CardTitle className="flex items-center gap-2 text-xl text-white"><ScanText className="h-5 w-5 text-primary" /> Source Drop Zone</CardTitle>
            <CardDescription className="text-muted-foreground">No clinic name, city, state, category, or notes are required before processing.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="file">
              <TabsList className="grid w-full grid-cols-2 rounded-lg border border-white/10 bg-black/40 p-1">
                <TabsTrigger value="file">Drop File</TabsTrigger>
                <TabsTrigger value="paste">Paste Text</TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="mt-6 space-y-5">
                <div
                  className={`flex min-h-[330px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${dragActive ? "border-primary bg-primary/10 shadow-[0_0_45px_rgba(18,173,165,.12)]" : "border-white/10 bg-black/20 hover:border-primary/35 hover:bg-primary/[0.025]"}`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                >
                  <button
                    type="button"
                    onClick={() => document.getElementById("automatic-file-upload")?.click()}
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-primary/25 bg-primary/10 shadow-[0_0_32px_rgba(18,173,165,.1)] transition-transform hover:scale-105"
                  >
                    <UploadCloud className="h-9 w-9 text-primary" />
                  </button>
                  <p className="mb-2 text-lg font-semibold text-white">Drop it. The hub does the rest.</p>
                  <p className="max-w-md text-sm leading-6 text-muted-foreground">PDF text extraction, scanned-document OCR, image OCR, DOCX reading, and spreadsheet parsing run automatically.</p>
                  <Input id="automatic-file-upload" type="file" className="hidden" accept={ACCEPTED_FILE_TYPES} onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />

                  {file && (
                    <div className="mt-7 flex w-full max-w-lg items-center gap-3 rounded-xl border border-primary/25 bg-black/45 p-4 text-left">
                      <FileType className="h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB · ready for automatic processing</p>
                      </div>
                      <button type="button" onClick={() => setSelectedFile(null)} className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-white">&times;</button>
                    </div>
                  )}
                </div>

                <Button type="button" onClick={runFileIntake} className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90" disabled={isWorking || !file}>
                  {isWorking ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  {isWorking ? "Processing automatically…" : "Process Automatically"}
                </Button>
              </TabsContent>

              <TabsContent value="paste" className="mt-6 space-y-5">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="mb-3 text-sm font-medium text-white">Optional raw-text fallback</p>
                  <p className="mb-4 text-xs leading-5 text-muted-foreground">Paste an email, copied price list, webpage text, or OCR output. No provider metadata fields are required.</p>
                  <Textarea value={rawText} onChange={(event) => setRawText(event.target.value)} placeholder="Paste source text here…" className="min-h-[260px] border-white/10 bg-black/40 text-white" />
                </div>
                <Button type="button" onClick={runTextIntake} className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isWorking || !rawText.trim()}>
                  {isWorking ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                  Process Text Automatically
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <ResultPanel result={result} />
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: UploadResult | null }) {
  return (
    <Card className="glass-panel border-white/[0.05]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white"><Folder className="h-5 w-5 text-primary" /> Automatic Intake Result</CardTitle>
        <CardDescription className="text-muted-foreground">The hub creates the provider/evidence record and only sends genuinely ambiguous output to review.</CardDescription>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-lime-500/20 bg-lime-500/10 p-4 text-lime-100">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Automatic intake saved</p>
                  <p className="mt-1 text-sm text-lime-100/70">{result.evidenceFile.processingStatus}</p>
                </div>
              </div>
            </div>

            {result.extractedProvider && (
              <div className="rounded-xl border border-white/10 bg-black/25 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Detected provider</p>
                <p className="mt-2 text-xl font-bold text-white">{result.extractedProvider.clinicName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[result.extractedProvider.city, result.extractedProvider.state].filter(Boolean).join(", ") || "Location not confidently detected"}
                </p>
                {result.extractedProvider.servicesOffered && (
                  <div className="mt-4 border-t border-white/[0.06] pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Detected services</p>
                    <p className="mt-1 text-sm leading-6 text-white/80">{result.extractedProvider.servicesOffered}</p>
                  </div>
                )}
              </div>
            )}

            {result.reviewItem ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-4 text-sm text-amber-100">
                <p className="font-semibold">Review suggested</p>
                <p className="mt-1 text-amber-100/65">The source was still saved automatically. Review is for ambiguity, not required intake data entry.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-primary/15 bg-primary/[0.05] p-4 text-sm text-white/75">No manual review was triggered by this intake.</div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link href="/evidence" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">Open Evidence Library <ArrowRight className="h-4 w-4" /></Link>
              {result.reviewItem && <Link href="/review" className="inline-flex items-center gap-2 text-white/70 hover:text-white">Open Review Queue <ArrowRight className="h-4 w-4" /></Link>}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]"><ScanText className="h-7 w-7 text-muted-foreground" /></div>
            <p className="font-medium text-white">Nothing to type in first.</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Drop a source file and the result will appear here after local parsing, OCR when necessary, automatic classification, and provider-field extraction.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
