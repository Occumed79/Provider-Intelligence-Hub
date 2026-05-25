import React from "react";
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import Evidence from "@/pages/evidence";
import Providers from "@/pages/providers";
import ProviderDetail from "@/pages/provider-detail";
import Search from "@/pages/search";
import Analyst from "@/pages/analyst";
import Outreach from "@/pages/outreach";
import SecureComms from "@/pages/secure-comms";
import Portal from "@/pages/portal";
import MapCoverage from "@/pages/map";
import ReviewQueue from "@/pages/review";
import Settings from "@/pages/settings";
import ProviderDifficulty from "@/pages/provider-difficulty";
import SearchMapping from "@/pages/search-mapping";
import DirectorReport from "@/pages/director-report";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Provider Intelligence Hub crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", background: "#100b07", color: "#fff", padding: "32px", fontFamily: "Inter, system-ui, sans-serif" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", border: "1px solid rgba(230,180,0,0.35)", borderRadius: "16px", padding: "24px", background: "rgba(255,255,255,0.04)" }}>
            <h1 style={{ fontSize: "28px", marginBottom: "12px", color: "#e6b400" }}>Provider Intelligence Hub runtime error</h1>
            <p style={{ marginBottom: "16px", color: "#d6d0c8" }}>The app loaded, but a frontend component crashed after startup.</p>
            <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto", background: "rgba(0,0,0,0.35)", padding: "16px", borderRadius: "12px", color: "#fff" }}>
              {this.state.error.message}\n\n{this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/portal/:token" component={Portal} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/upload" component={Upload} />
            <Route path="/evidence" component={Evidence} />
            <Route path="/providers" component={Providers} />
            <Route path="/providers/:id" component={ProviderDetail} />
            <Route path="/search" component={Search} />
            <Route path="/analyst" component={Analyst} />
            <Route path="/outreach" component={Outreach} />
            <Route path="/secure-comms" component={SecureComms} />
            <Route path="/map" component={MapCoverage} />
            <Route path="/review" component={ReviewQueue} />
            <Route path="/settings" component={Settings} />
            <Route path="/difficulty" component={ProviderDifficulty} />
            <Route path="/search-mapping" component={SearchMapping} />
            <Route path="/director-report" component={DirectorReport} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
