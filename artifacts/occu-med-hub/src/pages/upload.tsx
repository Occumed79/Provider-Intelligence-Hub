import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUploadFile, useUploadPastedText } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, FileType, CheckCircle, AlertCircle, RefreshCw, ArrowRight, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { motion, AnimatePresence } from "framer-motion";

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

export default function Upload() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [pipelineStep, setPipelineStep] = useState<number>(0);

  const uploadFile = useUploadFile();
  const uploadPaste = useUploadPastedText();

  const fileForm = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      category: "", state: "", city: "", providerName: "", sourceUrl: "", notes: ""
    }
  });

  const pasteForm = useForm<z.infer<typeof pasteFormSchema>>({
    resolver: zodResolver(pasteFormSchema),
    defaultValues: {
      text: "", category: "", state: "", city: "", providerName: "", sourceUrl: "", notes: ""
    }
  });

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const onDragLeave = () => setDragActive(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const simulatePipeline = (onComplete: () => void) => {
    setPipelineStep(1); // Uploaded
    setTimeout(() => setPipelineStep(2), 600); // Raw Stored
    setTimeout(() => setPipelineStep(3), 1500); // Text Extracted
    setTimeout(() => setPipelineStep(4), 2200); // Provider Matched
    setTimeout(() => setPipelineStep(5), 2800); // Review Created
    setTimeout(() => {
      setPipelineStep(6); // Mapped
      onComplete();
    }, 3500);
  };

  const handleFileSubmit = (values: z.infer<typeof fileFormSchema>) => {
    if (!file) {
      toast({ title: "Error", description: "Please select a file to upload", variant: "destructive" });
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
    simulatePipeline(() => {
      uploadFile.mutate({ data: formData as any }, {
        onSuccess: (data) => {
          setResult(data);
          toast({ title: "Success", description: "File ingested successfully." });
          setFile(null);
          fileForm.reset();
        },
        onError: (err) => {
          setPipelineStep(0);
          toast({ title: "Error", description: "Failed to upload file.", variant: "destructive" });
        }
      });
    });
  };

  const handlePasteSubmit = (values: z.infer<typeof pasteFormSchema>) => {
    setResult(null);
    simulatePipeline(() => {
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
          toast({ title: "Success", description: "Text ingested successfully." });
          pasteForm.reset();
        },
        onError: (err) => {
          setPipelineStep(0);
          toast({ title: "Error", description: "Failed to upload text.", variant: "destructive" });
        }
      });
    });
  };

  const steps = [
    { label: "Ready", active: pipelineStep >= 0 },
    { label: "Ingesting", active: pipelineStep >= 1 },
    { label: "Storage", active: pipelineStep >= 2 },
    { label: "Extracting", active: pipelineStep >= 3 },
    { label: "Matching", active: pipelineStep >= 4 },
    { label: "Complete", active: pipelineStep >= 6 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight glow-text text-white">Data Intake</h1>
        <p className="text-muted-foreground mt-1">Ingest raw evidence into the intelligence pipeline.</p>
      </div>

      {/* Pipeline Visualization */}
      <Card className="glass-panel border-white/[0.05] bg-black/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/[0.05] rounded-full z-0" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary shadow-[0_0_10px_rgba(168,85,247,0.8)] rounded-full z-0 transition-all duration-500 ease-out" 
              style={{ width: `${Math.max(0, (pipelineStep / (steps.length - 1)) * 100)}%` }}
            />
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-background ${
                  step.active 
                    ? "border-primary text-primary shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-110" 
                    : "border-white/20 text-muted-foreground"
                }`}>
                  {step.active && idx === steps.length - 1 ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : step.active && idx === pipelineStep && idx !== steps.length - 1 ? (
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${step.active ? "bg-primary" : "bg-white/20"}`} />
                  )}
                </div>
                <span className={`text-xs font-bold tracking-wider uppercase transition-colors ${step.active ? "text-white glow-text" : "text-muted-foreground/50"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="glass-panel border-primary/20 shadow-[0_0_40px_rgba(168,85,247,0.05)]">
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
                    <div 
                      className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all duration-300 ${
                        dragActive ? "border-primary bg-primary/10 shadow-[inset_0_0_20px_rgba(168,85,247,0.2)] scale-[1.02]" : "border-white/10 hover:border-white/30 bg-black/20"
                      }`}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                    >
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative group cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        <UploadCloud className="h-8 w-8 text-primary relative z-10" />
                      </div>
                      <p className="text-base font-medium text-white mb-2">Drag & Drop Intel File</p>
                      <p className="text-sm text-muted-foreground mb-6">PDF, Excel, CSV, Image up to 50MB</p>
                      
                      <Input 
                        type="file" 
                        className="hidden" 
                        id="file-upload" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      
                      {file && (
                        <div className="mt-4 p-3 bg-black/40 border border-primary/30 rounded-lg flex items-center gap-3 w-full max-w-sm">
                          <FileType className="h-5 w-5 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-white transition-colors">&times;</button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={fileForm.control} name="providerName" render={({ field }) => (
                        <FormItem><FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Known Provider (Opt)</FormLabel><FormControl><Input {...field} className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 h-11" placeholder="Leave blank to auto-detect" /></FormControl></FormItem>
                      )} />
                      <FormField control={fileForm.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Doc Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="bg-black/40 border-white/10 text-white h-11"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent className="bg-popover border-white/10 text-white">
                            <SelectItem value="invoice">Invoice</SelectItem>
                            <SelectItem value="intake_form">Intake Form</SelectItem>
                            <SelectItem value="fee_schedule">Fee Schedule</SelectItem>
                            <SelectItem value="website_screenshot">Website Screenshot</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select></FormItem>
                      )} />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-semibold tracking-wide bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.8)]" disabled={uploadFile.isPending || pipelineStep > 0 && pipelineStep < 6}>
                      {uploadFile.isPending || (pipelineStep > 0 && pipelineStep < 6) ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <UploadCloud className="h-5 w-5 mr-2" />}
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
                          <Textarea placeholder="Paste raw text dumps, email threads, or OCR output..." className="min-h-[280px] bg-black/40 border-white/10 text-white font-mono text-sm leading-relaxed p-4 resize-none placeholder:text-muted-foreground/30 focus-visible:ring-primary/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={pasteForm.control} name="providerName" render={({ field }) => (
                        <FormItem><FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Known Provider</FormLabel><FormControl><Input {...field} className="bg-black/40 border-white/10 text-white h-11" /></FormControl></FormItem>
                      )} />
                      <FormField control={pasteForm.control} name="sourceUrl" render={({ field }) => (
                        <FormItem><FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Source URL</FormLabel><FormControl><Input {...field} className="bg-black/40 border-white/10 text-white h-11 font-mono text-sm" placeholder="https://" /></FormControl></FormItem>
                      )} />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-semibold tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(230,180,0,0.4)] border border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(230,180,0,0.6)]" disabled={uploadPaste.isPending || pipelineStep > 0 && pipelineStep < 6}>
                      {uploadPaste.isPending || (pipelineStep > 0 && pipelineStep < 6) ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <UploadCloud className="h-5 w-5 mr-2" />}
                      Execute Extraction
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Extraction Results */}
        <Card className="glass-panel border-white/[0.05] relative overflow-hidden flex flex-col min-h-[600px] bg-black/40">
          <div className="absolute top-0 right-0 bg-white/[0.04] text-slate-400 text-[10px] font-bold px-4 py-1.5 rounded-bl-lg tracking-widest border-b border-l border-white/[0.08]">
            INTELLIGENCE OUTPUT
          </div>
          <CardHeader className="bg-white/[0.01] border-b border-white/[0.05]">
            <CardTitle className="text-xl text-white">Extraction Results</CardTitle>
            <CardDescription className="text-muted-foreground">Structured entities identified by AI engine</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-6">
            <AnimatePresence mode="wait">
              {!result && pipelineStep === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-muted-foreground py-12"
                >
                  <div className="relative w-24 h-24 mb-6 opacity-20">
                    <div className="absolute inset-0 rounded-full border border-white border-dashed animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-4 rounded-full border border-white border-dotted animate-[spin_7s_linear_infinite_reverse]" />
                    <RefreshCw className="absolute inset-0 m-auto h-8 w-8" />
                  </div>
                  <p className="tracking-wide uppercase text-sm font-bold">Awaiting Input</p>
                </motion.div>
              ) : !result && pipelineStep > 0 ? (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center py-12 space-y-6"
                >
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                  <div className="text-primary font-mono text-sm tracking-widest uppercase animate-pulse glow-text">
                    Processing {steps.find((s,i) => i === pipelineStep)?.label}...
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-amber-500/[0.05] border border-amber-500/20 shadow-[inset_0_0_20px_rgba(230,180,0,0.05)]">
                    <div className="flex items-center gap-3 text-amber-400">
                      <CheckCircle className="h-6 w-6 shrink-0 drop-shadow-[0_0_8px_rgba(230,180,0,0.8)]" />
                      <div>
                        <div className="font-bold tracking-wide uppercase text-sm glow-text">Extraction Complete</div>
                        <div className="text-xs text-amber-400/70 mt-0.5">Confidence thresholds met. Ready for review.</div>
                      </div>
                    </div>
                    {result.evidenceFile.folderPath && (
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded text-xs font-mono text-muted-foreground border border-white/10 shrink-0">
                        <Folder className="h-3.5 w-3.5 text-primary" />
                        {result.evidenceFile.folderPath}
                      </div>
                    )}
                  </div>

                  {result.extractedProvider && (
                    <div className="space-y-4 relative">
                      <div className="absolute -left-6 top-0 bottom-0 w-1 bg-primary rounded-r shadow-[0_0_10px_rgba(230,180,0,0.8)]" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2 flex items-center gap-2">
                        Profile Mapping
                      </h3>
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-5 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Entity Name</div>
                          <div className="text-white font-medium text-lg">{result.extractedProvider.clinicName}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Location</div>
                          <div className="text-white flex items-center gap-1.5"><span className="text-primary">📍</span> {result.extractedProvider.city}, {result.extractedProvider.state}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Detected Services</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {result.extractedProvider.servicesOffered?.split(',').map((s, i) => (
                              <span key={i} className="bg-primary/10 border border-primary/30 text-primary text-xs px-2 py-1 rounded-md font-medium">{s.trim()}</span>
                            )) || <span className="text-muted-foreground text-sm italic">No services detected</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.extractedFields && result.extractedFields.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">
                        Raw Clues
                      </h3>
                      <div className="space-y-3">
                        {result.extractedFields.map(f => (
                          <div key={f.id} className="bg-black/40 p-4 rounded-lg border border-white/[0.05] hover:border-white/20 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-white text-sm tracking-wide">{f.fieldName}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border backdrop-blur-sm ${
                                f.confidenceLevel === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                f.confidenceLevel === 'MEDIUM' ? 'bg-primary/10 text-primary border-primary/30' :
                                'bg-orange-500/10 text-orange-400 border-orange-500/30'
                              }`}>
                                Conf: {f.confidenceLevel || 'MED'}
                              </span>
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