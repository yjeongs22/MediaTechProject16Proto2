import { useEffect, useState } from "react";
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
import { getCurrentUser } from "@/lib/auth";

const queryClient = new QueryClient();

const FULL_SCREEN_PATHS: string[] = [];

function Layout() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState(getCurrentUser);
  const isFullScreen = FULL_SCREEN_PATHS.some((p) => location === p || location.startsWith(p));

  useEffect(() => {
    const update = () => setUser(getCurrentUser());
    window.addEventListener("storage", update);
    window.addEventListener("planpick-user-change", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("planpick-user-change", update);
    };
  }, []);

  useEffect(() => {
    if (!user && location !== "/login") {
      if (location !== "/") window.alert("로그인이 필요합니다.");
      setLocation("/login");
    }
  }, [location, setLocation, user]);

  if (!user && location !== "/login") {
    return (
      <main className="min-h-screen bg-[#F4F2FF]">
        <AuthPage />
      </main>
    );
  }

  if (location === "/login") {
    return <AuthPage />;
  }

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
            <Route path="/request/needs" component={NeedsPage} />
            <Route path="/request/waiting" component={WaitingPage} />
            <Route path="/request" component={RequestPage} />
            <Route path="/results" component={ResultPage} />
            <Route path="/contests" component={ContestsPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const restoredPath = params.get("p");
    if (!restoredPath) return;

    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    window.history.replaceState(null, "", `${base}${restoredPath}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

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
