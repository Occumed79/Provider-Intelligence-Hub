import { Switch, Route, Router as WouterRouter } from "wouter";
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

const queryClient = new QueryClient();

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function Router() {
  return (
    <Switch>
      <Route path={`${BASE}/portal/:token`} component={Portal} />
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
