import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Costs from "@/pages/Costs";
import Sales from "@/pages/Sales";
import Reports from "@/pages/Reports";
import Support from "@/pages/Support";
import OAuthTest from "@/pages/OAuthTest";
import OAuthDiagnostic from "@/pages/OAuthDiagnostic";
import LWASetupGuide from "@/pages/LWASetupGuide";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/support" component={Support} />
      <Route path="/oauth-test" component={OAuthTest} />
      <Route path="/oauth-diagnostic" component={OAuthDiagnostic} />
      <Route path="/lwa-setup" component={LWASetupGuide} />
      {!isAuthenticated ? (
        <>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/" component={Login} />
        </>
      ) : isLoading ? (
        <Route path="/" component={() => (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Carregando...</p>
            </div>
          </div>
        )} />
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
