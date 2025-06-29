import { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { companiesApi } from "@/lib/api";
import type { Company } from "@shared/schema";

const SELECTED_COMPANY_KEY = "selected_company_id";

interface CompanyContextType {
  companies: Company[];
  selectedCompany: Company | null;
  selectCompany: (company: Company) => void;
  isLoading: boolean;
  refetch: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: companiesApi.getAll,
  });

  useEffect(() => {
    if (companies.length > 0) {
      const savedCompanyId = localStorage.getItem(SELECTED_COMPANY_KEY);
      let companyToSelect = companies[0];

      if (savedCompanyId) {
        const savedCompany = companies.find(c => c.id === parseInt(savedCompanyId));
        if (savedCompany) {
          companyToSelect = savedCompany;
        }
      }

      setSelectedCompany(companyToSelect);
    }
  }, [companies]);

  const selectCompany = (company: Company) => {
    setSelectedCompany(company);
    localStorage.setItem(SELECTED_COMPANY_KEY, company.id.toString());
  };

  return (
    <CompanyContext.Provider value={{
      companies,
      selectedCompany,
      selectCompany,
      isLoading,
      refetch,
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
