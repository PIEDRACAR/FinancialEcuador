import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import AuthGuard from "@/components/AuthGuard";
import "./lib/auth"; // Initialize auth interceptor
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ClientsPage from "@/pages/ClientsPage";
import InvoicesPage from "@/pages/InvoicesPage";
import NotFound from "@/pages/not-found";

// Wrapper component for all dashboard routes
function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <CompanyProvider>
        <DashboardProvider>
          {children}
        </DashboardProvider>
      </CompanyProvider>
    </AuthGuard>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard">
        <DashboardWrapper>
          <DashboardPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/clients">
        <DashboardWrapper>
          <ClientsPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/invoices">
        <DashboardWrapper>
          <InvoicesPage />
        </DashboardWrapper>
      </Route>
      <Route path="/">
        <DashboardWrapper>
          <DashboardPage />
        </DashboardWrapper>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
