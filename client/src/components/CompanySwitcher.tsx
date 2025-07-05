import { useState } from "react";
import { Building2, ChevronDown, Plus } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import CreateCompanyModalNew from "./CreateCompanyModalNew";

export default function CompanySwitcher() {
  const { companies, selectedCompany, selectCompany } = useCompany();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{selectedCompany?.name || "Seleccionar empresa"}</p>
            <p className="text-xs text-gray-500">Empresa activa</p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => {
                  selectCompany(company);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2 text-left rounded-md hover:bg-gray-50"
              >
                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                  <Building2 className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">{company.name}</span>
              </button>
            ))}
            <hr className="my-2" />
            <button
              onClick={() => {
                setShowCreateModal(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-2 text-left rounded-md hover:bg-gray-50 text-primary-600"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Crear nueva empresa</span>
            </button>
          </div>
        </div>
      )}

      <CreateCompanyModalNew
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
