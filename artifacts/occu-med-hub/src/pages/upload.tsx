import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUploadFile, useUploadPastedText } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, FileType, CheckCircle, AlertCircle, RefreshCw, ArrowRight, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.webp,.txt";

const fileFormSchema = z.object({
  category: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  providerName: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

const pasteFormSchema = z.object({
  text: z.string().min(1, "Text is required"),
  category: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  providerName: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

type PipelineStatus = "ready" | "submitting" | "complete" | "failed";

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
  const [result, setResult] = useState<UploadResult | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("ready");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const uploadFile = useUploadFile();
  const uploadPaste = useUploadPastedText();
  const isWorking = pipelineStatus === "submitting" || uploadFile.isPending || uploadPaste.isPending;

  const fileForm = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: { category: "", state: "", city: "", providerName: "", sourceUrl: "", notes: "" },
  });

  const pasteForm = useForm<z.infer<typeof pasteFormSchema>>({
    resolver: zodResolver(pasteFormSchema),
    defaultValues: { text: "", category: "", state: "", city: "", providerName: "", sourceUrl: "", notes: "" },
  });

  const setSelectedFile = (nextFile?: File | null) => {
    if (!nextFile) {
      setFile(null);
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      toast({ title: "File too large", description: "Please select a file under 50MB.", variant: "destructive" });
      return;
    }

    setFile(nextFile);
    setResult(null);
    setErrorMessage(null);
    setPipelineStatus("ready");
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => setDragActive(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    setSelectedFile(e.dataTransfer.files?.[0] || null);
  };

  const handleFileSubmit = (values: z.infer<typeof fileFormSchema>) => {
    if (!file) {
      toast({ title: "Missing file", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (values.state) formData.append("state", values.state);
    if (values.city) formData.append("city", values.city);
    if (values.providerName) formData.append("providerName", values.providerName);
    if (values.category) formData.append("category", values.category);
    if (values.sourceUrl) formData.append("sourceUrl", values.sourceUrl);
    if (values.notes) formData.append("notes", values.notes);

    setResult(null);
    setErrorMessage(null);
    setPipelineStatus("submitting");

    uploadFile.mutate({ data: formData as any }, {
      onSuccess: (data) => {
        setResult(data);
        setPipelineStatus("complete");
        toast({ title: "Intake complete", description: "File was ingested and saved." });
        setFile(null);
        fileForm.reset();
      },
      onError: (err) => {
        const message = getErrorMessage(err);
        setErrorMessage(message);
        setPipelineStatus("failed");
        toast({ title: "Upload failed", description: message, variant: "destructive" });
      },
    });
  };

  const handlePasteSubmit = (values: z.infer<typeof pasteFormSchema>) => {
    setResult(null);
    setErrorMessage(null);
    setPipelineStatus("submitting");

    uploadPaste.mutate({ data: {
      text: values.text,
      state: values.state,
      city: values.city,
      providerName: values.providerName,
      category: values.category,
      sourceUrl: values.sourceUrl,
      notes: values.notes,
    }}, {
      onSuccess: (data) => {
        setResult(data);
        setPipelineStatus("complete");
        toast({ title: "Intake complete", description: "Text was ingested and saved." });
        pasteForm.reset();
      },
      onError: (err) => {
        const message = getErrorMessage(err);
        setErrorMessage(message);
        setPipelineStatus("failed");
        toast({ title: "Extraction failed", description: message, variant: "destructive" });
      },
    });
  };

  const steps = [
    { label: "Ready", active: true },
    { label: "Submitting", active: pipelineStatus === "submitting" || pipelineStatus === "complete" },
    { label: "Saved", active: pipelineStatus === "complete" },
    { label: "Complete", active: pipelineStatus === "complete" },
  ];

  const progressWidth = pipelineStatus === "complete" ? 100 : pipelineStatus === "submitting" ? 45 : pipelineStatus === "failed" ? 45 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight glow-text text-white">Data Intake</h1>
        <p className="text-muted-foreground mt-1">Ingest raw evidence into the intelligence pipeline.</p>
      </div>

      <Card className="glass-panel border-white/[0.05] bg-black/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/[0.05] rounded-full z-0" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary shadow-[0_0_10px_rgba(18,173,165,0.8)] rounded-full z-0 transition-all duration-500 ease-out" style={{ width: `${progressWidth}%` }} />
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-background ${step.active ? "border-primary text-primary shadow-[0_0_15px_rgba(18,173,165,0.5)] scale-110" : "border-white/20 text-muted-foreground"}`}>
                  {step.active && idx === steps.length - 1 ? <CheckCircle className="h-4 w-4" /> : isWorking && idx === 1 ? <div className="w-2 h-2 rounded-full bg-primary animate-ping" /> : <div className={`w-2 h-2 rounded-full ${step.active ? "bg-primary" : "bg-white/20"}`} />}
                </div>
                <span className={`text-xs font-bold tracking-wider uppercase transition-colors ${step.active ? "text-white glow-text" : "text-muted-foreground/50"}`}>{step.label}</span>
              </div>
            ))}
          </div>
          {pipelineStatus === "failed" && (
            <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errorMessage || "The intake request failed."}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="glass-panel border-primary/20 shadow-[0_0_40px_rgba(18,173,165,0.05)]">
          <CardHeader className="bg-white/[0.02] border-b border-white/[0.05]">
            <CardTitle className="text-xl text-white">Source Drop Zone</CardTitle>
            <CardDescription className="text-muted-foreground">Submit raw files or text for automated extraction.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="file" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/10 rounded-lg p-1">
                <TabsTrigger value="file" className="data-[state=active]:bg-primary/20 data-[state=active]:text-white rounded-md transition-all">File Upload</TabsTrigger>
                <TabsTrigger value="paste" className="data-[state=active]:bg-primary/20 data-[state=active]:text-white rounded-md transition-all">Raw Text</TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="mt-6">
                <Form {...fileForm}>
                  <form onSubmit={fileForm.handleSubmit(handleFileSubmit)} className="space-y-6">
                    <div className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all duration-300 ${dragActive ? "border-primary bg-primary/10 shadow-[inset_0_0_20px_rgba(18,173,165,0.2)] scale-[1.02]" : "border-white/10 hover:border-white/30 bg-black/20"}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative group cursor-pointer" onClick={() => document.getElementById("file-upload")?.click()}>
                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        <UploadCloud className="h-8 w-8 text-primary relative z-10" />
                      </div>
                      <p className="text-base font-medium text-white mb-2">Drag & Drop Intel File</p>
                      <p className="text-sm text-muted-foreground mb-6">PDF, Excel, CSV, Image, or TXT up to 50MB</p>
                      <Input type="file" className="hidden" id="file-upload" accept={ACCEPTED_FILE_TYPES} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                      {file && (
                        <div className="mt-4 p-3 bg-black/40 border border-primary/30 rounded-lg flex items-center gap-3 w-full max-w-sm">
                          <FileType className="h-5 w-5 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-white transition-colors">&times;</button>
                        </div>
                      )}
                    </div>

                    <IntakeMetadataFields form={fileForm} />

                    <Button type="submit" className="w-full h-12 text-base font-semibold tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(18,173,165,0.45)] border border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(150,238,0,0.45)]" disabled={isWorking}>
                      {isWorking ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <UploadCloud className="h-5 w-5 mr-2" />}
                      Execute Intake
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="paste" className="mt-6">
                <Form {...pasteForm}>
                  <form onSubmit={pasteForm.handleSubmit(handlePasteSubmit)} className="space-y-6">
                    <FormField control={pasteForm.control} name="text" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder="Paste raw text dumps, email threads, or OCR output..." className="min-h-[220px] bg-black/40 border-white/10 text-white font-mono text-sm leading-relaxed p-4 resize-none placeholder:text-muted-foreground/30 focus-visible:ring-primary/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <IntakeMetadataFields form={pasteForm} includeTextCategory />

                    <Button type="submit" className="w-full h-12 text-base font-semibold tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(18,173,165,0.45)] border border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(150,238,0,0.45)]" disabled={isWorking}>
                      {isWorking ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <UploadCloud className="h-5 w-5 mr-2" />}
                      Execute Extraction
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/[0.05] relative overflow-hidden flex flex-col min-h-[600px] bg-black/40">
          <div className="absolute top-0 right-0 bg-white/[0.04] text-slate-400 text-[10px] font-bold px-4 py-1.5 rounded-bl-lg tracking-widest border-b border-l border-white/[0.08]">INTELLIGENCE OUTPUT</div>
          <CardHeader className="bg-white/[0.01] border-b border-white/[0.05]">
            <CardTitle className="text-xl text-white">Extraction Results</CardTitle>
            <CardDescription className="text-muted-foreground">Structured entities returned by the intake API</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-6">
            <AnimatePresence mode="wait">
              {!result && pipelineStatus === "ready" ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                  <div className="relative w-24 h-24 mb-6 opacity-20">
                    <div className="absolute inset-0 rounded-full border border-white border-dashed animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-4 rounded-full border border-white border-dotted animate-[spin_7s_linear_infinite_reverse]" />
                    <RefreshCw className="absolute inset-0 m-auto h-8 w-8" />
                  </div>
                  <p className="tracking-wide uppercase text-sm font-bold">Awaiting Input</p>
                </motion.div>
              ) : !result && pipelineStatus === "submitting" ? (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin shadow-[0_0_15px_rgba(18,173,165,0.5)]" />
                  <div className="text-primary font-mono text-sm tracking-widest uppercase animate-pulse glow-text">Submitting to intake API...</div>
                  <p className="text-xs text-muted-foreground max-w-sm text-center">The backend is saving the evidence and returning extracted provider data. This indicator now reflects the real request state.</p>
                </motion.div>
              ) : !result && pipelineStatus === "failed" ? (
                <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-red-300 mb-4" />
                  <p className="font-bold text-white mb-2">Intake failed</p>
                  <p className="text-sm text-red-200 max-w-md">{errorMessage}</p>
                </motion.div>
              ) : result ? (
                <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-primary/[0.05] border border-primary/20 shadow-[inset_0_0_20px_rgba(18,173,165,0.05)]">
                    <div className="flex items-center gap-3 text-primary">
                      <CheckCircle className="h-6 w-6 shrink-0 drop-shadow-[0_0_8px_rgba(18,173,165,0.8)]" />
                      <div>
                        <div className="font-bold tracking-wide uppercase text-sm glow-text">Extraction Complete</div>
                        <div className="text-xs text-muted-foreground mt-0.5">The backend returned a saved intake result. Review the mapped output below.</div>
                      </div>
                    </div>
                    {result.evidenceFile.folderPath && (
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded text-xs font-mono text-muted-foreground border border-white/10 shrink-0">
                        <Folder className="h-3.5 w-3.5 text-primary" />
                        {result.evidenceFile.folderPath}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link href="/evidence" className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/20 transition-colors">View Evidence</Link>
                    <Link href="/providers" className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/20 transition-colors">View Providers</Link>
                    <Link href="/review" className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/20 transition-colors">Review Queue</Link>
                  </div>

                  {result.extractedProvider && (
                    <div className="space-y-4 relative">
                      <div className="absolute -left-6 top-0 bottom-0 w-1 bg-primary rounded-r shadow-[0_0_10px_rgba(18,173,165,0.8)]" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Profile Mapping</h3>
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-5 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                        <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Entity Name</div><div className="text-white font-medium text-lg">{result.extractedProvider.clinicName}</div></div>
                        <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Location</div><div className="text-white flex items-center gap-1.5"><span className="text-primary">●</span> {result.extractedProvider.city}, {result.extractedProvider.state}</div></div>
                        <div className="md:col-span-2"><div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Detected Services</div><div className="flex flex-wrap gap-2 mt-1">{result.extractedProvider.servicesOffered?.split(",").map((s, i) => <span key={i} className="bg-primary/10 border border-primary/30 text-primary text-xs px-2 py-1 rounded-md font-medium">{s.trim()}</span>) || <span className="text-muted-foreground text-sm italic">No services detected</span>}</div></div>
                      </div>
                    </div>
                  )}

                  {result.extractedFields && result.extractedFields.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Raw Clues</h3>
                      <div className="space-y-3">
                        {result.extractedFields.map((f) => (
                          <div key={f.id} className="bg-black/40 p-4 rounded-lg border border-white/[0.05] hover:border-white/20 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-white text-sm tracking-wide">{f.fieldName}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border backdrop-blur-sm ${f.confidenceLevel === "HIGH" ? "bg-primary/10 text-primary border-primary/30" : f.confidenceLevel === "MEDIUM" ? "bg-teal-500/10 text-teal-300 border-teal-500/30" : "bg-lime-500/10 text-lime-300 border-lime-500/30"}`}>Conf: {f.confidenceLevel || "MED"}</span>
                            </div>
                            <div className="text-muted-foreground text-sm leading-relaxed bg-white/[0.02] p-3 rounded border border-white/[0.02] font-mono whitespace-pre-wrap">{f.fieldValue}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function IntakeMetadataFields({ form }: { form: any; includeTextCategory?: boolean }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField control={form.control} name="providerName" render={({ field }) => <FormItem><FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Known Provider</FormLabel><FormControl><Input {...field} className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 h-11" placeholder="Leave blank to auto-detect" /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="category" render={({ field }) => <FormItem><FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Doc Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="bg-black/40 border-white/10 text-white h-11"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent className="bg-popover border-white/10 text-white"><SelectItem value="invoice">Invoice</SelectItem><SelectItem value="intake_form">Intake Form</SelectItem><SelectItem value="fee_schedule">Fee Schedule</SelectItem><SelectItem value="website_screenshot">Website Screenshot</SelectItem><SelectItem value="email_thread">Email Thread</SelectItem><SelectItem value="price_sheet">Price Sheet</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>} />
        <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-bold">City</FormLabel><FormControl><Input {...field} className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 h-11" placeholder="Optional" /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="state" render={({ field }) => <FormItem><FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-bold">State</FormLabel><FormControl><Input {...field} className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 h-11" placeholder="CA" maxLength={2} /></FormControl><FormMessage /></FormItem>} />
      </div>
      <FormField control={form.control} name="sourceUrl" render={({ field }) => <FormItem><FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Source URL</FormLabel><FormControl><Input {...field} className="bg-black/40 border-white/10 text-white h-11 font-mono text-sm" placeholder="https://" /></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="notes" render={({ field }) => <FormItem><FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Notes</FormLabel><FormControl><Textarea {...field} className="min-h-[90px] bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50" placeholder="Optional context for this intake" /></FormControl><FormMessage /></FormItem>} />
    </div>
  );
}
