import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";

import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { Navbar } from "./components/layout/navbar";
import { LevelUpModal } from "./components/level-up-modal";
import { useAppStore } from "./lib/store";

import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Onboarding from "./pages/onboarding";
import Dashboard from "./pages/dashboard";
import Sessions from "./pages/sessions";
import LiveSession from "./pages/live-session";
import Network from "./pages/network";
import Messages from "./pages/messages";
import Profile from "./pages/profile";
import NotFound from "./pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useAppStore((state) => state.currentUser);
  const ensureDemoMatchRequest = useAppStore((state) => state.ensureDemoMatchRequest);

  useEffect(() => {
    if (currentUser) {
      ensureDemoMatchRequest();
    }
  }, [currentUser?.id, ensureDemoMatchRequest]);

  return (
    <div className="h-screen h-dvh bg-background text-foreground flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const currentUser = useAppStore(state => state.currentUser);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!currentUser) {
      setLocation("/");
    }
  }, [currentUser, setLocation]);

  if (!currentUser) return null;

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/onboarding">
        <RequireAuth>
          <Onboarding />
        </RequireAuth>
      </Route>
      
      <Route path="/dashboard">
        <RequireAuth>
          <AppLayout><Dashboard /></AppLayout>
        </RequireAuth>
      </Route>
      <Route path="/sessions">
        <RequireAuth>
          <AppLayout><Sessions /></AppLayout>
        </RequireAuth>
      </Route>
      <Route path="/sessions/live/:id">
        <RequireAuth>
          <AppLayout><LiveSession /></AppLayout>
        </RequireAuth>
      </Route>
      <Route path="/network">
        <RequireAuth>
          <AppLayout><Network /></AppLayout>
        </RequireAuth>
      </Route>
      <Route path="/messages">
        <RequireAuth>
          <AppLayout><Messages /></AppLayout>
        </RequireAuth>
      </Route>
      <Route path="/profile/:id">
        {(params) => (
          <RequireAuth>
            <AppLayout><Profile key={params.id} /></AppLayout>
          </RequireAuth>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <LevelUpModal />
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
