import React from "react";
import { useListReviewItems, useGetReviewCounts, useUpdateReviewItem, getListReviewItemsQueryKey, getGetReviewCountsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Clock, ListChecks, Fingerprint, MapPin, Search } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewQueue() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: counts, isLoading: countsLoading } = useGetReviewCounts();
  const [activeStatus, setActiveStatus] = React.useState("pending");
  const { data: items, isLoading: itemsLoading } = useListReviewItems({ status: activeStatus });
  
  const updateItem = useUpdateReviewItem();

  const handleAction = (id: number, status: "approved" | "rejected") => {
    updateItem.mutate(
      { id, data: { reviewStatus: status } },
      {
        onSuccess: () => {
          toast({ title: `Item ${status}`, description: `Review item successfully marked as ${status}.` });
          queryClient.invalidateQueries({ queryKey: getListReviewItemsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReviewCountsQueryKey() });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update review item.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight glow-text text-white">Review Queue</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl leading-relaxed">Human-in-the-loop verification for uncertain extractions. Approve or reject AI-generated entities to maintain database integrity.</p>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-panel border-yellow-500/20 bg-yellow-500/[0.02] shadow-[0_0_30px_rgba(234,179,8,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/50" />
          <CardContent className="p-5 flex flex-col items-start">
            <Clock className="h-6 w-6 text-yellow-500/80 mb-3" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending Review</p>
            <p className="text-3xl font-bold text-white mt-1">{countsLoading ? "-" : counts?.pending || 0}</p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-orange-500/20 bg-orange-500/[0.02] shadow-[0_0_30px_rgba(228,114,0,0.08)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/50" />
          <CardContent className="p-5 flex flex-col items-start">
            <AlertTriangle className="h-6 w-6 text-orange-400/80 mb-3" />
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">High Priority</p>
            <p className="text-3xl font-bold text-white mt-1">{countsLoading ? "-" : counts?.highPriority || 0}</p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-amber-500/20 bg-amber-500/[0.02] shadow-[0_0_30px_rgba(230,180,0,0.08)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
          <CardContent className="p-5 flex flex-col items-start">
            <CheckCircle className="h-6 w-6 text-amber-400/80 mb-3" />
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Approved</p>
            <p className="text-3xl font-bold text-white mt-1">{countsLoading ? "-" : counts?.approved || 0}</p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-white/[0.05] bg-white/[0.01] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-white/20" />
          <CardContent className="p-5 flex flex-col items-start">
            <ListChecks className="h-6 w-6 text-muted-foreground/80 mb-3" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Processed</p>
            <p className="text-3xl font-bold text-white mt-1">{countsLoading ? "-" : counts?.total || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-primary/20 bg-black/40 shadow-[0_0_40px_rgba(168,85,247,0.05)]">
        <CardHeader className="p-0 border-b border-white/[0.05]">
          <Tabs value={activeStatus} onValueChange={setActiveStatus} className="w-full">
            <div className="p-4 bg-white/[0.02]">
              <TabsList className="bg-black/60 border border-white/10 rounded-lg h-12 p-1 max-w-2xl flex">
                <TabsTrigger value="pending" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-white data-[state=active]:shadow-[inset_0_0_10px_rgba(230,180,0,0.2)]">Pending</TabsTrigger>
                <TabsTrigger value="in_progress" className="flex-1 data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-100 data-[state=active]:shadow-[inset_0_0_10px_rgba(230,204,0,0.2)]">In Progress</TabsTrigger>
                <TabsTrigger value="approved" className="flex-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-100 data-[state=active]:shadow-[inset_0_0_10px_rgba(230,180,0,0.2)]">Approved</TabsTrigger>
                <TabsTrigger value="rejected" className="flex-1 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-100 data-[state=active]:shadow-[inset_0_0_10px_rgba(228,114,0,0.2)]">Rejected</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </CardHeader>
        
        <CardContent className="p-0 min-h-[400px]">
          {itemsLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-xl" />)}
            </div>
          ) : items?.length ? (
            <div className="divide-y divide-white/[0.05]">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="p-6 hover:bg-white/[0.02] transition-colors group relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/5 group-hover:bg-primary/30 transition-colors" />
                    
                    <div className="flex flex-col xl:flex-row gap-6 items-start justify-between">
                      
                      {/* Left: Issue Info */}
                      <div className="flex-1 space-y-4 w-full">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border shadow-sm ${
                            item.priority === 'High' ? "bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-[inset_0_0_10px_rgba(228,114,0,0.1)]" : "bg-white/10 border-white/20 text-muted-foreground"
                          }`}>
                            {item.priority} Priority
                          </Badge>
                          <span className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            <Search className="h-3.5 w-3.5 text-primary" /> {item.issueType}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto font-mono">{format(new Date(item.createdAt), "MMM d, yyyy HH:mm")}</span>
                        </div>
                        
                        <div className="bg-black/40 border border-white/[0.05] p-4 rounded-lg">
                          <p className="text-white text-sm leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      {/* Middle: Entity Context */}
                      <div className="w-full xl:w-[350px] space-y-3 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 shrink-0">
                         <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground border-b border-white/10 pb-2">Entity Context</div>
                         <div className="space-y-3 pt-1">
                           <div className="flex items-start gap-3">
                             <Fingerprint className="h-4 w-4 text-primary mt-0.5" />
                             <div>
                               <div className="text-[9px] uppercase text-muted-foreground">Linked Provider</div>
                               <div className="text-sm font-bold text-white tracking-wide">{item.providerName || `ID: ${item.providerId}`}</div>
                             </div>
                           </div>
                           {item.evidenceFileId && (
                             <div className="flex items-start gap-3">
                               <ListChecks className="h-4 w-4 text-primary mt-0.5" />
                               <div>
                                 <div className="text-[9px] uppercase text-muted-foreground">Source Evidence ID</div>
                                 <div className="text-sm font-mono text-white tracking-wide">EVD-{item.evidenceFileId}</div>
                               </div>
                             </div>
                           )}
                         </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex xl:flex-col items-center gap-3 shrink-0 w-full xl:w-auto mt-4 xl:mt-0">
                        {activeStatus === "pending" || activeStatus === "in_progress" ? (
                          <>
                            <Button 
                              className="flex-1 xl:w-32 h-12 bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(230,180,0,0.1)] transition-all hover:shadow-[0_0_20px_rgba(230,180,0,0.3)] font-bold tracking-wide"
                              onClick={() => handleAction(item.id, "approved")}
                              disabled={updateItem.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" /> Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1 xl:w-32 h-12 border-orange-500/30 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 hover:text-orange-300 font-bold tracking-wide"
                              onClick={() => handleAction(item.id, "rejected")}
                              disabled={updateItem.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Reject
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full w-full xl:w-32 py-4">
                             <Badge variant="outline" className={`px-4 py-2 border ${activeStatus === 'approved' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'} uppercase tracking-widest font-bold`}>
                               {activeStatus}
                             </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-20 text-center text-muted-foreground flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border border-amber-500/30 border-dashed animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border border-amber-500/20 border-dotted animate-[spin_7s_linear_infinite_reverse]" />
                <CheckCircle className="absolute inset-0 m-auto h-10 w-10 text-amber-400 drop-shadow-[0_0_15px_rgba(230,180,0,0.5)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-wide glow-text">Queue Clear</h3>
              <p className="max-w-sm mx-auto text-sm">No items currently require human verification for the '{activeStatus}' status. Intelligence pipeline is fully operational.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}