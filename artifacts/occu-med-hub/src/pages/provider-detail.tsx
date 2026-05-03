import React from "react";
import { useParams, Link } from "wouter";
import { useGetProvider, getGetProviderQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Phone, Globe, Mail, FileText, AlertTriangle, ArrowLeft, ShieldCheck, FileSearch, Fingerprint, Tags, Edit, ExternalLink, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

export default function ProviderDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  
  const { data: provider, isLoading } = useGetProvider(id, {
    query: { enabled: !!id, queryKey: getGetProviderQueryKey(id) }
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-6 w-32 bg-white/5" />
        <Skeleton className="h-12 w-1/2 bg-white/5" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[500px] lg:col-span-2 bg-white/5 rounded-xl" />
          <Skeleton className="h-[500px] bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return <div className="p-12 flex flex-col items-center text-center text-muted-foreground">
      <AlertTriangle className="h-12 w-12 text-orange-400/50 mb-4 drop-shadow-[0_0_15px_rgba(228,114,0,0.3)]" />
      <h2 className="text-xl font-bold text-white mb-2 tracking-wide">Provider Not Found</h2>
      <p>The intelligence profile you are looking for does not exist or has been redacted.</p>
      <Link href="/providers" className="mt-6 text-primary hover:text-primary/80 flex items-center gap-2 font-semibold">
        <ArrowLeft className="h-4 w-4" /> Return to Database
      </Link>
    </div>;
  }

  const confidenceRatio = Math.min(100, provider.sourceCount * 20);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <Link href="/providers" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mb-6 transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:border-primary/30">
          <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Back to Database
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex gap-6">
            <div className="h-20 w-20 rounded-2xl bg-black/60 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
               <Building2 className="h-8 w-8 text-primary drop-shadow-[0_0_8px_rgba(230,180,0,0.8)] relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold tracking-tight glow-text text-white">{provider.clinicName}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {provider.verificationStatus === "Verified" ? (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold uppercase tracking-widest text-[10px] px-2.5 py-1 shadow-[inset_0_0_10px_rgba(230,180,0,0.1),0_0_10px_rgba(230,180,0,0.2)]">
                    <ShieldCheck className="h-3 w-3 mr-1.5" /> Verified Profile
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 font-bold uppercase tracking-widest text-[10px] px-2.5 py-1 shadow-[inset_0_0_10px_rgba(234,179,8,0.1)]">
                    <ShieldAlert className="h-3 w-3 mr-1.5" /> Unverified
                  </Badge>
                )}
                <span className="flex items-center gap-1.5 bg-white/[0.03] px-2 py-1 rounded-md border border-white/[0.05]"><MapPin className="h-3.5 w-3.5 text-primary/70" /> {provider.address}, {provider.city}, {provider.state} {provider.zip}</span>
                <span className="flex items-center gap-1.5 bg-white/[0.03] px-2 py-1 rounded-md border border-white/[0.05]"><Tags className="h-3.5 w-3.5 text-primary/70" /> {provider.clinicType || "General Clinic"}</span>
              </div>
            </div>
          </div>
          <Button className="glass-button bg-primary/20 border-primary/30 hover:bg-primary/30 text-primary-foreground font-semibold tracking-wide h-11 shrink-0">
            <Edit className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Executive Summary */}
          <Card className="glass-panel border-primary/30 relative overflow-hidden shadow-[0_0_40px_rgba(230,180,0,0.06)] bg-black/40">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-[0_0_20px_rgba(230,180,0,1)]" />
            <CardHeader className="pb-4 border-b border-white/[0.05] bg-white/[0.02]">
              <CardTitle className="text-lg flex items-center justify-between text-white">
                <span className="flex items-center gap-2"><Fingerprint className="h-5 w-5 text-primary" /> Intelligence Profile</span>
                <div className="flex items-center gap-3">
                   <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Confidence Score</span>
                   <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-primary shadow-[0_0_10px_rgba(230,180,0,1)] transition-all duration-1000" style={{ width: `${confidenceRatio}%` }} />
                   </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2 uppercase tracking-widest text-[10px] font-bold">
                    <FileSearch className="h-3.5 w-3.5 text-primary" /> Services Offered
                  </div>
                  {provider.servicesOffered ? (
                    <div className="flex flex-wrap gap-2">
                      {provider.servicesOffered.split(',').map((s, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-1">{s.trim()}</Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground italic text-sm">Unknown / Not extracted</div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2 uppercase tracking-widest text-[10px] font-bold">
                    <FileText className="h-3.5 w-3.5 text-primary" /> Pricing & Billing Notes
                  </div>
                  <div className="text-white font-medium text-sm leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
                    {provider.pricingNotes || "No specific pricing or billing notes extracted from source documents."}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2 uppercase tracking-widest text-[10px] font-bold">
                    <Building2 className="h-3.5 w-3.5 text-amber-400" /> Employer Account Setup
                  </div>
                  <div className="text-white font-medium text-sm leading-relaxed border-l-2 border-amber-500/50 pl-3 py-1">
                    {provider.employerAccountClues || "No clues regarding employer account setup processes found."}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2 uppercase tracking-widest text-[10px] font-bold">
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" /> External Form Policy
                  </div>
                  <div className="text-white font-medium text-sm leading-relaxed border-l-2 border-yellow-500/50 pl-3 py-1">
                    {provider.acceptsOutsideForms || "Policy on accepting outside forms is currently unknown."}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Raw Extracted Entities */}
          <Card className="glass-panel border-white/[0.05] bg-black/20">
            <CardHeader className="bg-white/[0.01] border-b border-white/[0.05]">
              <CardTitle className="text-lg text-white">Structured Data Points</CardTitle>
              <CardDescription className="text-muted-foreground">Raw entities extracted from {provider.sourceCount} source files by the NLP engine</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {provider.extractedFields && provider.extractedFields.length > 0 ? (
                <div className="grid gap-4">
                  {provider.extractedFields.map(field => (
                    <div key={field.id} className="p-4 bg-white/[0.03] hover:bg-white/[0.05] transition-colors rounded-xl border border-white/[0.05] group relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 group-hover:bg-primary/50 transition-colors" />
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-white text-sm tracking-wide">{field.fieldName}</span>
                            <Badge variant="outline" className={`text-[9px] uppercase tracking-widest font-bold border ${
                              field.confidenceLevel === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                              field.confidenceLevel === 'MEDIUM' ? 'bg-primary/10 text-primary border-primary/30' :
                              'bg-orange-500/10 text-orange-400 border-orange-500/30'
                            }`}>
                              Conf: {field.confidenceLevel || 'MED'}
                            </Badge>
                          </div>
                          <div className="text-primary font-medium text-base mb-3 glow-text">{field.fieldValue}</div>
                          {field.sourceSnippet && (
                            <div className="text-xs font-mono text-muted-foreground/80 bg-black/60 p-3 rounded-lg border border-white/5 leading-relaxed relative">
                              <div className="absolute -top-2 left-3 bg-black text-[9px] uppercase font-bold text-muted-foreground px-1 tracking-widest">Source Snippet</div>
                              "{field.sourceSnippet}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center bg-white/[0.01] rounded-xl border border-dashed border-white/10">
                  <Fingerprint className="h-10 w-10 opacity-20 mb-3" />
                  <p className="text-sm font-medium tracking-wide">No structured entities extracted yet.</p>
                  <p className="text-xs mt-1">Upload relevant documents to populate this section.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          
          {/* Contact Details */}
          <Card className="glass-panel border-white/[0.05] bg-black/40">
            <CardHeader className="pb-4 border-b border-white/[0.05]">
              <CardTitle className="text-base text-white tracking-wide">Contact Directory</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/[0.05]">
                <div className="p-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="mt-0.5 p-2 bg-white/5 rounded-md border border-white/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">Phone Number</div>
                    <div className={`font-medium ${provider.phone ? "text-white text-lg tracking-wide" : "text-muted-foreground italic text-sm"}`}>{provider.phone || "Unverified"}</div>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="mt-0.5 p-2 bg-white/5 rounded-md border border-white/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">Fax Number</div>
                    <div className={`font-medium ${provider.fax ? "text-white text-lg tracking-wide" : "text-muted-foreground italic text-sm"}`}>{provider.fax || "Unverified"}</div>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="mt-0.5 p-2 bg-white/5 rounded-md border border-white/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">Email Address</div>
                    <div className={`font-medium truncate ${provider.email ? "text-white" : "text-muted-foreground italic text-sm"}`}>{provider.email || "Unverified"}</div>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="mt-0.5 p-2 bg-white/5 rounded-md border border-white/10">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">Website</div>
                    <div className={`font-medium truncate ${provider.website ? "text-white" : "text-muted-foreground italic text-sm"}`}>
                      {provider.website ? (
                        <a href={provider.website} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 hover:underline flex items-center gap-1.5 transition-colors">
                          {provider.website.replace(/^https?:\/\//, '')} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : "Unverified"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Chain */}
          <Card className="glass-panel border-white/[0.05] flex flex-col max-h-[500px] bg-black/40">
            <CardHeader className="pb-4 border-b border-white/[0.05] flex flex-row items-center justify-between">
              <CardTitle className="text-base text-white tracking-wide">Evidence Chain</CardTitle>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">{provider.sourceCount}</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
              {provider.evidenceFiles && provider.evidenceFiles.length > 0 ? (
                <div className="divide-y divide-white/[0.05]">
                  {provider.evidenceFiles.map(file => (
                    <Link key={file.id} href={`/evidence?file=${file.id}`} className="block group">
                      <div className="p-4 hover:bg-white/[0.04] transition-colors flex items-center justify-between relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3 min-w-0 pr-4">
                          <div className="h-10 w-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/30 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all">
                             <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate group-hover:text-primary/90 transition-colors">{file.originalFilename}</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70 mt-1">{format(new Date(file.uploadDate), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold border-white/10 bg-white/5 shrink-0 text-muted-foreground">{file.category || 'GEN'}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                  <FileText className="h-8 w-8 opacity-20 mb-3" />
                  <span className="text-sm font-medium tracking-wide">No evidence linked.</span>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}