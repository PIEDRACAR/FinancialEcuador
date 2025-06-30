import { 
  Building2, Calculator, LayoutDashboard, Users, Receipt, FileText, Settings, LogOut, User,
  BookOpen, TrendingDown, ClipboardList, Globe, PiggyBank
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import CompanySwitcher from "./CompanySwitcher";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Clientes", path: "/dashboard/clients" },
    { icon: Receipt, label: "Facturas", path: "/dashboard/invoices" },
    { icon: ClipboardList, label: "Proformas", path: "/dashboard/proformas" },
    { icon: TrendingDown, label: "Notas Crédito/Débito", path: "/dashboard/notes" },
    { icon: Calculator, label: "Comprobantes Retención", path: "/dashboard/retentions" },
    { icon: BookOpen, label: "Contabilidad", path: "/dashboard/accounting" },
    { icon: PiggyBank, label: "Empleados y Nómina", path: "/dashboard/employees" },
    { icon: Globe, label: "SRI Ecuador", path: "/dashboard/sri" },
    { icon: FileText, label: "Reportes", path: "/dashboard/reports" },
    { icon: Settings, label: "Configuración", path: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">SistemaContable</span>
        </div>

        {/* Company Switcher */}
        <div className="px-6 py-4 border-b border-gray-200">
          <CompanySwitcher />
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-6 py-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
