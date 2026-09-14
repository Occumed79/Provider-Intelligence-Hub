import React, { useState } from "react";
import { useUploadFile, useUploadPastedText } from "@workspace/api-client-react";
import type { UploadResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { Link } from "wouter";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Cloud,
  FileType,
  Folder,
  RefreshCw,
  ScanText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ".pdf,.csv,.xlsx,.xls,.docx,.png,.jpg,.jpeg,.webp,.txt";
const ACCEPTED_EXTENSIONS = new Set(["pdf", "csv", "xlsx", "xls", "docx", "png", "jpg", "jpeg", "webp", "txt"]);

type PipelineStatus = "ready" | "submitting" | "complete" | "failed";
type IntakeResult = UploadResult & {
  extractionMode?: string;
  parseWarning?: string | null;
  extractedFields?: Array<{ id?: number; fieldName?: string; fieldValue?: string; confidenceLevel?: string }>;
};

function validateFile(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!file.size) return "The selected file is empty.";
  if (file.size > MAX_FILE_SIZE_BYTES) return "Please select a file under 50MB.";
  if (!ACCEPTED_EXTENSIONS.has(ext)) return "Unsupported file type. Use PDF, DOCX, Excel, CSV, image, or TXT files.";
  return null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "The intake request failed. Check the API logs for details.";
}

function modeLabel(mode?: string) {
  const labels: Record<string, string> = {
    local_text: "Local text parser",
    local_spreadsheet: "Local spreadsheet parser",
    local_docx: "Local DOCX parser",
    local_pdf: "Local PDF parser",
    local_pdf_ocr: "Local PDF OCR",
    local_image_ocr: "Local image OCR",
    cloud_llamacloud: "LlamaCloud OCR",
    cloud_optiic: "Optiic OCR",
    cloud_ocrspace: "OCR.Space",
    raw_text: "Pasted source text",
    metadata_only: "Metadata only",
  };
  return labels[mode || ""] || mode || "Automatic extraction";
}

function isCloudMode(mode?: string) {
  return Boolean(mode?.startsWith("cloud_"));
}

export default function Upload() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [rawText, setRawText] = useState("");
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("ready");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const uploadFile = useUploadFile();
  const uploadPaste = useUploadPastedText();
  const isWorking = pipelineStatus === "submitting" || uploadFile.isPending || uploadPaste.isPending;

  const processFile = (nextFile: File) => {
    const validationError = validateFile(nextFile);
    if (validationError) {
      setFile(null);
      setErrorMessage(validationError);
      setPipelineStatus("failed");
      toast({ title: "File rejected", description: validationError, variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("file", nextFile);
    setFile(nextFile);
    setResult(null);
    setErrorMessage(null);
    setPipelineStatus("submitting");

    uploadFile.mutate(
      { data: formData as any },
      {
        onSuccess: (data) => {
          const intake = data as IntakeResult;
          setResult(intake);
          setPipelineStatus("complete");
          setFile(null);
          toast({ title: "Automatic intake complete", description: `${modeLabel(intake.extractionMode)} · provider and evidence records saved.` });
        },
        onError: (error) => {
          const message = getErrorMessage(error);
          setErrorMessage(message);
          setPipelineStatus("failed");
          toast({ title: "Automatic intake failed", description: message, variant: "destructive" });
        },
      },
    );
  };

  const selectFile = (nextFile?: File | null) => {
    if (!nextFile || isWorking) return;
    processFile(nextFile);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  const processText = () => {
    const text = rawText.trim();
    if (!text) return;
    setResult(null);
    setErrorMessage(null);
    setPipelineStatus("submitting");
    uploadPaste.mutate(
      { data: { text } },
      {
        onSuccess: (data) => {
          setResult(data as IntakeResult);
          setRawText("");
          setPipelineStatus("complete");
          toast({ title: "Automatic intake complete", description: "Pasted source text was extracted and filed." });
        },
        onError: (error) => {
          const message = getErrorMessage(error);
          setErrorMessage(message);
          setPipelineStatus("failed");
          toast({ title: "Automatic intake failed", description: message, variant: "destructive" });
        },
      },
    );
  };

  const progress = pipelineStatus === "complete" ? 100 : pipelineStatus === "submitting" ? 62 : pipelineStatus === "failed" ? 62 : 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Automatic Intake</h1>
          <p className="mt-1 text-muted-foreground">Drop a source. Processing starts immediately — no provider metadata form and no extra click.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[.16em]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-primary"><ShieldCheck className="h-3.5 w-3.5" /> Local first</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-muted-foreground"><Cloud className="h-3.5 w-3.5" /> OCR fallback</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-muted-foreground"><Sparkles className="h-3.5 w-3.5" /> Zero metadata entry</span>
        </div>
      </div>

      <Card className="glass-panel border-white/[.05] bg-black/20">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[.16em] text-muted-foreground">
            <span>Source</span><span>Read</span><span>Extract</span><span>Filed</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[.05]"><div className="h-full rounded-full bg-primary shadow-[0_0_14px_rgba(18,173,165,.35)] transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          {pipelineStatus === "submitting" && <div className="mt-4 flex items-center gap-2 text-sm text-primary"><RefreshCw className="h-4 w-4 animate-spin" /> Reading, OCRing if necessary, extracting, and filing…</div>}
          {pipelineStatus === "failed" && <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"><AlertCircle className="mt-.5 h-4 w-4 shrink-0" />{errorMessage}</div>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Card className="glass-panel border-primary/20">
          <CardHeader className="border-b border-white/[.05] bg-white/[.02]">
            <CardTitle className="flex items-center gap-2 text-xl text-white"><ScanText className="h-5 w-5 text-primary" />Source Drop Zone</CardTitle>
            <CardDescription>No clinic name, geography, category, or notes required before processing.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="file">
              <TabsList className="grid w-full grid-cols-2 rounded-lg border border-white/10 bg-black/40 p-1"><TabsTrigger value="file">Drop File</TabsTrigger><TabsTrigger value="paste">Paste Text</TabsTrigger></TabsList>

              <TabsContent value="file" className="mt-6">
                <div
                  onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={onDrop}
                  className={`flex min-h-[390px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${dragActive ? "border-primary bg-primary/10 shadow-[0_0_45px_rgba(18,173,165,.12)]" : "border-white/10 bg-black/20 hover:border-primary/35 hover:bg-primary/[.025]"}`}
                >
                  <button type="button" disabled={isWorking} onClick={() => document.getElementById("automatic-file-upload")?.click()} className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-primary/25 bg-primary/10 shadow-[0_0_32px_rgba(18,173,165,.1)] transition-transform hover:scale-105 disabled:opacity-50">
                    {isWorking ? <RefreshCw className="h-9 w-9 animate-spin text-primary" /> : <UploadCloud className="h-9 w-9 text-primary" />}
                  </button>
                  <p className="mb-2 text-lg font-semibold text-white">{isWorking ? "Processing automatically…" : "Drop it. Processing starts instantly."}</p>
                  <p className="max-w-md text-sm leading-6 text-muted-foreground">Text PDFs stay local. Scans and images use the configured OCR cascade only when needed. DOCX, spreadsheets, CSV, and TXT stay local.</p>
                  <Input id="automatic-file-upload" type="file" className="hidden" accept={ACCEPTED_FILE_TYPES} disabled={isWorking} onChange={(event) => { selectFile(event.target.files?.[0]); event.currentTarget.value = ""; }} />
                  {file && isWorking && <div className="mt-6 flex max-w-lg items-center gap-3 rounded-xl border border-primary/20 bg-black/40 px-4 py-3 text-left"><FileType className="h-5 w-5 text-primary" /><div><div className="text-sm font-semibold text-white">{file.name}</div><div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div></div></div>}
                  {pipelineStatus === "failed" && file && <Button variant="outline" onClick={() => processFile(file)} className="mt-5 border-primary/20 text-primary"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>}
                </div>
              </TabsContent>

              <TabsContent value="paste" className="mt-6 space-y-5">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="mb-3 text-sm font-medium text-white">Paste source text</p>
                  <p className="mb-4 text-xs leading-5 text-muted-foreground">Email, webpage text, copied price list, provider information, or OCR output.</p>
                  <Textarea value={rawText} onChange={(event) => setRawText(event.target.value)} placeholder="Paste source text here…" className="min-h-[300px] border-white/10 bg-black/40 text-white" />
                </div>
                <Button onClick={processText} disabled={isWorking || !rawText.trim()} className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90">{isWorking ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}Process Text Automatically</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <ResultPanel result={result} />
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: IntakeResult | null }) {
  if (!result) return <Card className="glass-panel border-white/[.05]"><CardHeader><CardTitle className="flex items-center gap-2 text-white"><Folder className="h-5 w-5 text-primary" />Automatic Intake Result</CardTitle><CardDescription>The provider/evidence record appears here after processing.</CardDescription></CardHeader><CardContent><div className="flex min-h-[430px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-8 text-center"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[.03]"><ScanText className="h-7 w-7 text-muted-foreground" /></div><p className="font-medium text-white">No metadata form to complete.</p><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Drop a source and the extraction result, filing path, and review decision will appear here.</p></div></CardContent></Card>;

  const fields = Array.isArray(result.extractedFields) ? result.extractedFields : [];
  return <Card className="glass-panel border-white/[.05]">
    <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Folder className="h-5 w-5 text-primary" />Automatic Intake Result</CardTitle><CardDescription>Saved to the live provider/evidence database.</CardDescription></CardHeader>
    <CardContent className="space-y-5">
      <div className="rounded-xl border border-lime-500/20 bg-lime-500/10 p-4 text-lime-100"><div className="flex items-start gap-3"><CheckCircle className="mt-.5 h-5 w-5 shrink-0" /><div className="flex-1"><p className="font-semibold">Automatic intake saved</p><p className="mt-1 text-sm text-lime-100/70">{result.evidenceFile.processingStatus}</p><div className="mt-3 flex flex-wrap gap-2"><Badge variant="outline" className="border-lime-400/20 bg-black/15 text-lime-100">{modeLabel(result.extractionMode)}</Badge><Badge variant="outline" className="border-white/10 bg-black/15 text-white/75">{fields.length} extracted fields</Badge>{isCloudMode(result.extractionMode) && <Badge variant="outline" className="border-sky-400/20 bg-sky-400/10 text-sky-200"><Cloud className="mr-1 h-3 w-3" />Cloud OCR</Badge>}</div></div></div></div>

      {result.parseWarning && <div className="rounded-xl border border-amber-500/25 bg-amber-500/[.07] p-4 text-sm text-amber-100"><div className="flex gap-2"><AlertCircle className="mt-.5 h-4 w-4 shrink-0" /><span>{result.parseWarning}</span></div></div>}

      {result.extractedProvider && <div className="rounded-xl border border-white/10 bg-black/25 p-5"><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">Detected provider</p><p className="mt-2 text-xl font-bold text-white">{result.extractedProvider.clinicName}</p><p className="mt-1 text-sm text-muted-foreground">{[result.extractedProvider.city, result.extractedProvider.state].filter(Boolean).join(", ") || "Location not confidently detected"}</p>{result.extractedProvider.servicesOffered && <div className="mt-4 border-t border-white/[.06] pt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Detected services</p><p className="mt-1 text-sm leading-6 text-white/80">{result.extractedProvider.servicesOffered}</p></div>}</div>}

      {result.reviewItem ? <div className="rounded-xl border border-amber-500/20 bg-amber-500/[.07] p-4 text-sm text-amber-100"><p className="font-semibold">Review suggested</p><p className="mt-1 text-amber-100/65">The source is already saved. Review is only for ambiguity.</p></div> : <div className="rounded-xl border border-primary/15 bg-primary/[.05] p-4 text-sm text-white/75">No manual review was triggered.</div>}

      <div className="flex flex-wrap gap-4"><Link href="/evidence" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">Evidence Library <ArrowRight className="h-4 w-4" /></Link>{result.extractedProvider?.id && <Link href={`/providers/${result.extractedProvider.id}`} className="inline-flex items-center gap-2 text-white/70 hover:text-white">Provider record <ArrowRight className="h-4 w-4" /></Link>}{result.reviewItem && <Link href="/review" className="inline-flex items-center gap-2 text-white/70 hover:text-white">Review Queue <ArrowRight className="h-4 w-4" /></Link>}</div>
    </CardContent>
  </Card>;
}
