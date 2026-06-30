import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import RequestPage from "@/pages/RequestPage";
import NeedsPage from "@/pages/NeedsPage";
import WaitingPage from "@/pages/WaitingPage";
import ResultPage from "@/pages/ResultPage";
import ContestsPage from "@/pages/ContestsPage";
import AuthPage from "@/pages/AuthPage";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

const queryClient = new QueryClient();

const FULL_SCREEN_PATHS = ["/request/needs", "/request/waiting"];

function Layout() {
  const [location] = useLocation();
  const isFullScreen = FULL_SCREEN_PATHS.some((p) => location === p || location.startsWith(p));

  if (isFullScreen) {
    return (
      <Switch>
        <Route path="/request/needs" component={NeedsPage} />
        <Route path="/request/waiting" component={WaitingPage} />
      </Switch>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F0F2F8]">
      <Sidebar />
      <div className="flex-1 ml-[60px] flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-1 overflow-x-hidden">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/request" component={RequestPage} />
            <Route path="/results" component={ResultPage} />
            <Route path="/contests" component={ContestsPage} />
            <Route path="/login" component={AuthPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
