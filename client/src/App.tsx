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
import SuppliersPage from "@/pages/SuppliersPage";
import ProductsPage from "@/pages/ProductsPage";
import PurchasesPage from "@/pages/PurchasesPage";
import ImportPurchasesPage from "@/pages/ImportPurchasesPage";
import FinancialStatementsPage from "@/pages/FinancialStatementsPage";
import ElectronicInvoicingPage from "@/pages/ElectronicInvoicingPage";
import ChartAccountsPage from "@/pages/ChartAccountsPage";
import JournalEntriesPage from "@/pages/JournalEntriesPage";
import LedgerPage from "@/pages/LedgerPage";
import BalanceSheetPage from "@/pages/BalanceSheetPage";
import SRIReportsPage from "@/pages/SRIReportsPage";
import SRIDeclarationsPage from "@/pages/SRIDeclarationsPage";
import ImportAccountingPage from "@/pages/ImportAccountingPage";
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
      <Route path="/invoices">
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
      <Route path="/dashboard/suppliers">
        <DashboardWrapper>
          <SuppliersPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/products">
        <DashboardWrapper>
          <ProductsPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/purchases">
        <DashboardWrapper>
          <PurchasesPage />
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
      <Route path="/dashboard/import-purchases">
        <DashboardWrapper>
          <ImportPurchasesPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/financial-statements">
        <DashboardWrapper>
          <FinancialStatementsPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/electronic-invoicing">
        <DashboardWrapper>
          <ElectronicInvoicingPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/chart-accounts">
        <DashboardWrapper>
          <ChartAccountsPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/journal-entries">
        <DashboardWrapper>
          <JournalEntriesPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/ledger">
        <DashboardWrapper>
          <LedgerPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/balance-sheet">
        <DashboardWrapper>
          <BalanceSheetPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/settings">
        <DashboardWrapper>
          <SettingsPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/sri-reports">
        <DashboardWrapper>
          <SRIReportsPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/sri-declarations">
        <DashboardWrapper>
          <SRIDeclarationsPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/import-accounting">
        <DashboardWrapper>
          <ImportAccountingPage />
        </DashboardWrapper>
      </Route>
      <Route path="/dashboard/import-sri">
        <DashboardWrapper>
          <ImportAccountingPage />
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
