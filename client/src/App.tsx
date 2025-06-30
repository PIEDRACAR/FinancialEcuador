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
import ProformasPage from "@/pages/ProformasPage";
import NotesPage from "@/pages/NotesPage";
import RetentionsPage from "@/pages/RetentionsPage";
import AccountingPage from "@/pages/AccountingPage";
import EmployeesPage from "@/pages/EmployeesPage";
import SRIPage from "@/pages/SRIPage";
import ReportsPage from "@/components/ReportsPage";
import SettingsPage from "@/components/SettingsPage";
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
      <Route path="/dashboard/reports">
        <DashboardWrapper>
          <ReportsPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/proformas">
        <DashboardWrapper>
          <ProformasPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/notes">
        <DashboardWrapper>
          <NotesPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/retentions">
        <DashboardWrapper>
          <RetentionsPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/accounting">
        <DashboardWrapper>
          <AccountingPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/employees">
        <DashboardWrapper>
          <EmployeesPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/sri">
        <DashboardWrapper>
          <SRIPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/settings">
        <DashboardWrapper>
          <SettingsPage />
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
