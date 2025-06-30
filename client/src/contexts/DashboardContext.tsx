import { createContext, useContext, useState, useEffect } from "react";
import { useCompany } from "./CompanyContext";
import { useQuery } from "@tanstack/react-query";
import { clientsApi, invoicesApi } from "@/lib/api";
import type { Client, Invoice } from "@shared/schema";

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  collectionRate: number;
  recentInvoices: any[];
  monthlyGrowth: number;
  isLoading: boolean;
}

interface DashboardContextType {
  stats: DashboardStats;
  refreshData: () => void;
  isRefreshing: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { selectedCompany } = useCompany();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch clients data
  const { 
    data: clients = [], 
    isLoading: clientsLoading, 
    refetch: refetchClients 
  } = useQuery({
    queryKey: ['/api/companies', selectedCompany?.id, 'clients'],
    enabled: !!selectedCompany?.id,
  });

  // Fetch invoices data
  const { 
    data: invoices = [], 
    isLoading: invoicesLoading, 
    refetch: refetchInvoices 
  } = useQuery({
    queryKey: ['/api/companies', selectedCompany?.id, 'invoices'],
    enabled: !!selectedCompany?.id,
  });

  // Calculate dashboard statistics
  const calculateStats = (): DashboardStats => {
    const clientList = clients as Client[];
    const invoiceList = invoices as Invoice[];
    
    const totalClients = clientList.length;
    const activeClients = clientList.filter((client: Client) => client.isActive).length;
    const totalInvoices = invoiceList.length;
    const paidInvoices = invoiceList.filter((invoice: Invoice) => invoice.status === 'pagada').length;
    const pendingInvoices = invoiceList.filter((invoice: Invoice) => invoice.status === 'pendiente').length;
    const overdueInvoices = invoiceList.filter((invoice: Invoice) => invoice.status === 'vencida').length;
    
    const totalRevenue = invoiceList
      .filter((invoice: Invoice) => invoice.status === 'pagada')
      .reduce((sum: number, invoice: Invoice) => sum + parseFloat(invoice.total || '0'), 0);

    const recentInvoices = invoiceList
      .filter((invoice: Invoice) => invoice.date && !isNaN(new Date(invoice.date).getTime()))
      .sort((a: Invoice, b: Invoice) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const collectionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;

    // Calculate monthly growth (simplified - comparing recent vs older invoices)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthInvoices = invoiceList.filter((invoice: Invoice) => {
      if (!invoice.date) return false;
      const invoiceDate = new Date(invoice.date);
      if (isNaN(invoiceDate.getTime())) return false;
      return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
    });

    const lastMonthInvoices = invoiceList.filter((invoice: Invoice) => {
      if (!invoice.date) return false;
      const invoiceDate = new Date(invoice.date);
      if (isNaN(invoiceDate.getTime())) return false;
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      return invoiceDate.getMonth() === lastMonth && invoiceDate.getFullYear() === year;
    });

    const currentMonthRevenue = currentMonthInvoices
      .filter((invoice: Invoice) => invoice.status === 'pagada')
      .reduce((sum: number, invoice: Invoice) => sum + parseFloat(invoice.total || '0'), 0);

    const lastMonthRevenue = lastMonthInvoices
      .filter((invoice: Invoice) => invoice.status === 'pagada')
      .reduce((sum: number, invoice: Invoice) => sum + parseFloat(invoice.total || '0'), 0);

    const monthlyGrowth = lastMonthRevenue > 0 
      ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    return {
      totalClients,
      activeClients,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      collectionRate,
      recentInvoices,
      monthlyGrowth,
      isLoading: clientsLoading || invoicesLoading,
    };
  };

  const stats = calculateStats();

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchClients(), refetchInvoices()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const contextValue: DashboardContextType = {
    stats,
    refreshData,
    isRefreshing,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}