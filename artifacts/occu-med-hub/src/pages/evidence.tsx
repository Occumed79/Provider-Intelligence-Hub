import React, { useState } from "react";
import { useGetEvidenceFolderTree, useListEvidenceFiles, useGetEvidenceFile, getGetEvidenceFileQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, FileText, ChevronRight, ChevronDown, FileSpreadsheet, FileImage, ExternalLink, X, Building2, Calendar, FileType2, Target, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { FolderNode, EvidenceFile } from "@workspace/api-client-react/src/generated/api.schemas";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

export default function Evidence() {
  const [selectedPath, setSelectedPath] = useState<string>("/");
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  
  const { data: folderTree, isLoading: isLoadingTree } = useGetEvidenceFolderTree();
  const { data: evidenceFiles, isLoading: isLoadingFiles } = useListEvidenceFiles();
  const { data: fileDetail, isLoading: isLoadingDetail } = useGetEvidenceFile(
    selectedFileId as number, 
    { query: { enabled: !!selectedFileId, queryKey: getGetEvidenceFileQueryKey(selectedFileId as number) } }
  );

  const currentFiles = evidenceFiles?.filter(f => f.folderPath === selectedPath || selectedPath === "/") || [];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col relative overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold tracking-tight glow-text text-white">Evidence Library</h1>
        <p className="text-muted-foreground mt-1">Browse ingested files, screenshots, and source documents.</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0 w-full overflow-hidden">
        {/* Pane 1: Folder Tree */}
        <Card className="glass-panel w-72 shrink-0 flex flex-col h-full bg-black/20 border-white/[0.05] hidden md:flex">
          <CardHeader className="pb-3 border-b border-white/[0.05] bg-white/[0.01] shrink-0">
            <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-3 overflow-y-auto flex-1 custom-scrollbar">
            {isLoadingTree ? (
              <div className="space-y-3 p-2">
                <Skeleton className="h-8 w-full bg-white/5 rounded-md" />
                <Skeleton className="h-8 w-5/6 ml-4 bg-white/5 rounded-md" />
                <Skeleton className="h-8 w-2/3 ml-8 bg-white/5 rounded-md" />
              </div>
            ) : (
              <div className="space-y-1">
                <div 
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${selectedPath === "/" ? "bg-primary/20 text-white border border-primary/30 shadow-[inset_0_0_10px_rgba(168,85,247,0.1)]" : "hover:bg-white/[0.05] text-muted-foreground border border-transparent"}`}
                  onClick={() => setSelectedPath("/")}
                >
                  <Folder className={`h-4 w-4 ${selectedPath === "/" ? "text-primary fill-primary/20" : ""}`} />
                  <span className="text-sm font-medium tracking-wide">All Evidence</span>
                </div>
                {folderTree?.map((node, i) => (
                  <TreeNode key={i} node={node} level={1} selectedPath={selectedPath} onSelect={setSelectedPath} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pane 2: File Browser */}
        <Card className={`glass-panel flex flex-col h-full bg-black/40 border-white/[0.05] flex-1 min-w-0 transition-all duration-500 ease-in-out`}>
          <CardHeader className="pb-3 border-b border-white/[0.05] bg-white/[0.01] shrink-0 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-3 text-white font-medium tracking-wide">
              <Folder className="h-5 w-5 text-primary" />
              {selectedPath === "/" ? "All Evidence" : selectedPath.split('/').pop() || selectedPath}
            </CardTitle>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">{currentFiles.length} items</div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
            {isLoadingFiles ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-[72px] w-full bg-white/5 rounded-lg" />)}
              </div>
            ) : currentFiles.length > 0 ? (
              <div className="divide-y divide-white/[0.03]">
                {currentFiles.map(file => (
                  <div 
                    key={file.id} 
                    onClick={() => setSelectedFileId(file.id)}
                    className={`p-4 hover:bg-white/[0.04] flex items-center justify-between group transition-all duration-200 cursor-pointer border-l-2 ${selectedFileId === file.id ? 'border-primary bg-primary/[0.05]' : 'border-transparent'}`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${selectedFileId === file.id ? 'bg-primary/10 border-primary/30 shadow-[inset_0_0_10px_rgba(230,180,0,0.15)]' : 'bg-black/50 border-white/10 group-hover:border-white/20'}`}>
                        {getFileIcon(file.fileType)}
                      </div>
                      <div className="min-w-0">
                        <div className={`font-semibold truncate flex items-center gap-2 transition-colors ${selectedFileId === file.id ? 'text-primary' : 'text-white group-hover:text-white/80'}`}>
                          {file.originalFilename}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-3">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(file.uploadDate), "MMM d, yyyy")}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="flex items-center gap-1 font-mono">{formatBytes(file.fileSize || 0)}</span>
                          {file.associatedProvider && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-white/20" />
                              <span className="truncate text-white/70 max-w-[150px] font-medium">{file.associatedProvider}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <StatusBadge status={file.processingStatus} />
                      <span className="text-[10px] text-muted-foreground font-mono uppercase border border-white/10 px-1.5 py-0.5 rounded bg-black/40">{file.category || 'GEN'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20 px-8 text-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center mb-6 bg-white/[0.01]">
                  <Folder className="h-8 w-8 opacity-40 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 tracking-wide">Empty Directory</h3>
                <p className="text-sm">No evidence files found in {selectedPath}. Upload new intake to populate this folder.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pane 3: Detail Panel */}
        <AnimatePresence>
          {selectedFileId && (
            <motion.div
              initial={{ width: 0, opacity: 0, scale: 0.95 }}
              animate={{ width: "420px", opacity: 1, scale: 1 }}
              exit={{ width: 0, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="shrink-0 h-full overflow-hidden origin-right"
            >
              <Card className="glass-panel h-full flex flex-col bg-black/60 border-primary/20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] w-[420px]">
                {isLoadingDetail ? (
                  <div className="p-6 space-y-6">
                    <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
                    <Skeleton className="h-8 w-full bg-white/5 rounded-md" />
                    <Skeleton className="h-4 w-2/3 bg-white/5 rounded-md" />
                    <div className="space-y-3 pt-6">
                      <Skeleton className="h-24 w-full bg-white/5 rounded-lg" />
                      <Skeleton className="h-24 w-full bg-white/5 rounded-lg" />
                    </div>
                  </div>
                ) : fileDetail ? (
                  <>
                    <CardHeader className="pb-4 border-b border-white/[0.05] relative bg-gradient-to-br from-primary/10 to-transparent">
                      <button 
                        onClick={() => setSelectedFileId(null)}
                        className="absolute right-4 top-4 p-1.5 bg-black/40 hover:bg-white/10 rounded-md text-muted-foreground hover:text-white transition-colors border border-white/10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="flex items-start gap-4 pr-8">
                        <div className="h-14 w-14 rounded-xl bg-black/60 border border-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                          {getFileIcon(fileDetail.fileType)}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white leading-tight break-all">{fileDetail.originalFilename}</CardTitle>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <StatusBadge status={fileDetail.processingStatus} />
                            {fileDetail.sourceUrl && (
                              <a href={fileDetail.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded backdrop-blur hover:bg-primary/20 transition-colors">
                                <ExternalLink className="h-3 w-3" /> Source
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                      <div className="p-6 space-y-8">
                        
                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-lg">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5"><Calendar className="h-3 w-3" /> Ingested</div>
                            <div className="text-sm font-medium text-white">{format(new Date(fileDetail.uploadDate), "MMM d, yyyy")}</div>
                          </div>
                          <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-lg">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5"><FileType2 className="h-3 w-3" /> Type</div>
                            <div className="text-sm font-medium text-white uppercase">{fileDetail.fileType}</div>
                          </div>
                          <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-lg col-span-2">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5"><Folder className="h-3 w-3" /> Storage Path</div>
                            <div className="text-xs font-mono text-white/80 truncate bg-black/40 p-1.5 rounded border border-white/5">{fileDetail.folderPath}</div>
                          </div>
                        </div>

                        {/* Linked Provider */}
                        {fileDetail.providerId && (
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b border-primary/20 pb-2">
                              <LinkIcon className="h-3 w-3" /> Linked Entity
                            </h4>
                            <Link href={`/providers/${fileDetail.providerId}`} className="block group">
                              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg hover:bg-primary/10 hover:border-primary/40 transition-all">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-black/50 rounded-md border border-white/10 group-hover:border-primary/30">
                                      <Building2 className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{fileDetail.associatedProvider || `Provider ID: ${fileDetail.providerId}`}</div>
                                      <div className="text-xs text-muted-foreground">Click to view profile</div>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                              </div>
                            </Link>
                          </div>
                        )}

                        {/* Extracted Text Preview */}
                        {fileDetail.extractedText && (
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b border-primary/20 pb-2">
                              <Target className="h-3 w-3" /> Raw Extraction Dump
                            </h4>
                            <div className="bg-black/60 border border-white/[0.05] rounded-lg p-4 max-h-[250px] overflow-y-auto custom-scrollbar">
                              <p className="text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap">{fileDetail.extractedText}</p>
                            </div>
                          </div>
                        )}

                      </div>
                    </CardContent>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">Error loading details.</div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TreeNode({ node, level, selectedPath, onSelect }: { node: FolderNode, level: number, selectedPath: string, onSelect: (path: string) => void }) {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedPath === node.path;
  
  return (
    <div className="space-y-1">
      <div 
        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all duration-200 border ${isSelected ? "bg-primary/20 text-white border-primary/30 shadow-[inset_0_0_10px_rgba(168,85,247,0.1)]" : "border-transparent hover:bg-white/[0.05] text-muted-foreground"}`}
        style={{ paddingLeft: `${(level * 12) + 8}px` }}
        onClick={() => {
          onSelect(node.path);
          if (node.children?.length) setIsOpen(!isOpen);
        }}
      >
        <div className="w-4 flex justify-center shrink-0 transition-transform duration-200">
          {node.children?.length ? (
            isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : <span className="w-3.5" />}
        </div>
        <Folder className={`h-4 w-4 shrink-0 transition-colors ${isSelected ? "text-primary fill-primary/20" : "opacity-70 group-hover:text-white"}`} />
        <span className={`text-sm truncate ${isSelected ? 'font-semibold tracking-wide' : 'font-medium'}`}>{node.name}</span>
        {node.fileCount > 0 && (
          <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${isSelected ? 'bg-primary border-primary text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-black/50 border-white/10 text-muted-foreground'}`}>
            {node.fileCount}
          </span>
        )}
      </div>
      {isOpen && node.children && (
        <div className="space-y-1 mt-1">
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} level={level + 1} selectedPath={selectedPath} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function getFileIcon(type: string) {
  if (type.includes("pdf")) return <FileText className="h-6 w-6 text-orange-400 drop-shadow-[0_0_5px_rgba(228,114,0,0.5)]" />;
  if (type.includes("excel") || type.includes("csv") || type.includes("spreadsheet")) return <FileSpreadsheet className="h-6 w-6 text-amber-400 drop-shadow-[0_0_5px_rgba(230,180,0,0.5)]" />;
  if (type.includes("image")) return <FileImage className="h-6 w-6 text-primary drop-shadow-[0_0_5px_rgba(230,155,0,0.5)]" />;
  return <FileText className="h-6 w-6 text-muted-foreground" />;
}

function StatusBadge({ status }: { status: string }) {
  let colorClass = "bg-white/[0.05] text-muted-foreground border-white/10";
  let glowClass = "";

  if (status.includes("Extracted") || status.includes("Mapped")) {
    colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    glowClass = "shadow-[inset_0_0_10px_rgba(230,180,0,0.1),0_0_5px_rgba(230,180,0,0.2)]";
  } else if (status.includes("Processing")) {
    colorClass = "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
    glowClass = "shadow-[inset_0_0_10px_rgba(230,204,0,0.1),0_0_5px_rgba(230,204,0,0.2)]";
  } else if (status.includes("Review") || status.includes("Pending")) {
    colorClass = "bg-primary/10 text-primary border-primary/30";
    glowClass = "shadow-[inset_0_0_10px_rgba(230,180,0,0.1),0_0_5px_rgba(230,180,0,0.2)]";
  }
  
  return (
    <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm ${colorClass} ${glowClass}`}>
      {status}
    </Badge>
  );
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}