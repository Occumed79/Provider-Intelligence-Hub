import React, { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { 
  Activity, 
  UploadCloud, 
  FolderSearch, 
  Building2, 
  Search, 
  Map, 
  CheckSquare, 
  Settings as SettingsIcon,
  Menu,
  Network,
  Mail,
  Shield,
  Gauge,
  FileBarChart2,
  MapPinned,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "./animated-background";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/secure-comms/unread-count"],
    queryFn: () => customFetch("/api/secure-comms/unread-count"),
    refetchInterval: 8000,
    staleTime: 5000,
  });

  const unreadCount = unreadData?.count ?? 0;

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Upload Intake", href: "/upload" },
    { label: "Evidence Library", href: "/evidence" },
    { label: "Provider Database", href: "/providers" },
    { label: "Smart Search", href: "/search" },
    { label: "Analyst Tools", href: "/analyst" },
    { label: "Outreach", href: "/outreach" },
    { label: "Secure Comms", href: "/secure-comms", badge: unreadCount > 0 ? unreadCount : 0 },
    { label: "Map Coverage", href: "/map" },
    { label: "Difficulty Score", href: "/difficulty" },
    { label: "Search Attempt Map", href: "/search-mapping" },
    { label: "Director Report", href: "/director-report" },
    { label: "Review Queue", href: "/review" },
  ];

  const iconMap: Record<string, React.ElementType> = {
    "/": Activity,
    "/upload": UploadCloud,
    "/evidence": FolderSearch,
    "/providers": Building2,
    "/search": Search,
    "/analyst": Network,
    "/outreach": Mail,
    "/secure-comms": Shield,
    "/map": Map,
    "/difficulty": Gauge,
    "/search-mapping": MapPinned,
    "/director-report": FileBarChart2,
    "/review": CheckSquare,
  };

  return (
    <div className="flex h-screen w-full overflow-hidden text-foreground">
      <AnimatedBackground />
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          "bg-black/20 backdrop-blur-2xl border-r border-white/[0.08] shadow-[4px_0_24px_rgba(0,0,0,0.5)] flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
        
        <div className="flex h-16 items-center px-6 border-b border-white/[0.05] relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-black/50 border border-white/10 shadow-[inset_0_0_10px_rgba(230,180,0,0.15)]">
              <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md animate-pulse" />
              <Activity className="h-4 w-4 text-primary relative z-10" />
            </div>
            <span className="font-semibold tracking-wide text-white glow-text">Occu-Med</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 relative z-10">
          <div className="text-[10px] font-bold text-muted-foreground/70 mb-4 px-3 uppercase tracking-widest">Command Center</div>
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = iconMap[item.href];
            const badge = (item as { badge?: number }).badge ?? 0;

            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? "text-white bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/[0.05]" 
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.04] border border-transparent"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(230,180,0,0.8)]" />
                )}
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
                )}
                {Icon && (
                  <Icon className={cn("h-4 w-4 transition-colors shrink-0", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(230,180,0,0.7)]" : "group-hover:text-white")} />
                )}
                <span className="flex-1">{item.label}</span>
                <AnimatePresence>
                  {badge > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="relative shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-black text-[9px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(230,180,0,0.7)]"
                    >
                      <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-40" />
                      <span className="relative">{badge > 99 ? "99+" : badge}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/[0.05] relative z-10">
          <Link 
            href="/settings"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
              location === "/settings" 
                ? "text-white bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/[0.05]" 
                : "text-muted-foreground hover:text-white hover:bg-white/[0.04] border border-transparent"
            )}
          >
            <SettingsIcon className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        <div className="h-16 flex items-center px-4 md:hidden border-b border-white/[0.05] bg-black/40 backdrop-blur-xl z-30">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="text-white hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-4 font-semibold text-white tracking-wide glow-text">Occu-Med</span>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2 h-5 w-5 rounded-full bg-primary text-black text-[9px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(230,180,0,0.6)]"
            >
              {unreadCount}
            </motion.span>
          )}
        </div>
        
        <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
