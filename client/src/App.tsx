import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Costs from "@/pages/Costs";
import Sales from "@/pages/Sales";
import Reports from "@/pages/Reports";
import Support from "@/pages/Support";
import OAuthTest from "@/pages/OAuthTest";
import OAuthDiagnostic from "@/pages/OAuthDiagnostic";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/support" component={Support} />
      <Route path="/oauth-test" component={OAuthTest} />
      <Route path="/oauth-diagnostic" component={OAuthDiagnostic} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/products" component={Products} />
          <Route path="/costs" component={Costs} />
          <Route path="/sales" component={Sales} />
          <Route path="/reports" component={Reports} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
