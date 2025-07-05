import { useState } from "react";
import { 
  Building2, Calculator, LayoutDashboard, Users, Receipt, FileText, Settings, LogOut, User,
  BookOpen, TrendingDown, ClipboardList, Globe, PiggyBank, Truck, Package, ShoppingCart,
  ChevronDown, ChevronRight, Upload, Download
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import CompanySwitcher from "./CompanySwitcher";

interface MenuItem {
  icon: any;
  label: string;
  path?: string;
  children?: MenuItem[];
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Clientes", path: "/dashboard/clients" },
    { 
      icon: ShoppingCart, 
      label: "Compras", 
      children: [
        { icon: Truck, label: "Proveedores", path: "/dashboard/suppliers" },
        { icon: ShoppingCart, label: "Órdenes de Compra", path: "/dashboard/purchases" },
        { icon: Receipt, label: "Facturas de Compra", path: "/dashboard/purchase-invoices" },
        { icon: Upload, label: "Importar Compras", path: "/dashboard/import-purchases" },
        { icon: Download, label: "Exportar Compras", path: "/dashboard/export-purchases" }
      ]
    },
    { 
      icon: Receipt, 
      label: "Ventas", 
      children: [
        { icon: Receipt, label: "Facturas Electrónicas", path: "/dashboard/invoices" },
        { icon: ClipboardList, label: "Proformas", path: "/dashboard/proformas" },
        { icon: TrendingDown, label: "Notas Crédito/Débito", path: "/dashboard/notes" },
        { icon: Upload, label: "Importar Ventas", path: "/dashboard/import-sales" },
        { icon: Download, label: "Exportar Ventas", path: "/dashboard/export-sales" }
      ]
    },
    { icon: Package, label: "Productos", path: "/dashboard/products" },
    { icon: Calculator, label: "Comprobantes Retención", path: "/dashboard/retentions" },
    { 
      icon: BookOpen, 
      label: "Contabilidad", 
      children: [
        { icon: BookOpen, label: "Plan de Cuentas", path: "/dashboard/chart-accounts" },
        { icon: FileText, label: "Asientos Contables", path: "/dashboard/journal-entries" },
        { icon: Calculator, label: "Libro Mayor", path: "/dashboard/ledger" },
        { icon: Upload, label: "Importar Contabilidad", path: "/dashboard/import-accounting" },
        { icon: Download, label: "Exportar Contabilidad", path: "/dashboard/export-accounting" }
      ]
    },
    { icon: PiggyBank, label: "Empleados y Nómina", path: "/dashboard/employees" },
    { 
      icon: Globe, 
      label: "SRI Ecuador", 
      children: [
        { icon: Globe, label: "Declaraciones SRI", path: "/dashboard/sri-declarations" },
        { icon: Upload, label: "Importar XML SRI", path: "/dashboard/import-sri" },
        { icon: Download, label: "Exportar XML SRI", path: "/dashboard/export-sri" },
        { icon: FileText, label: "Reportes SRI", path: "/dashboard/sri-reports" }
      ]
    },
    { 
      icon: FileText, 
      label: "Reportes", 
      children: [
        { icon: FileText, label: "Estados Financieros", path: "/dashboard/financial-statements" },
        { icon: FileText, label: "Balance General", path: "/dashboard/balance-sheet" },
        { icon: FileText, label: "Estado de Resultados", path: "/dashboard/income-statement" },
        { icon: FileText, label: "Flujo de Caja", path: "/dashboard/cash-flow" },
        { icon: Upload, label: "Importar Reportes", path: "/dashboard/import-reports" },
        { icon: Download, label: "Exportar Reportes", path: "/dashboard/export-reports" }
      ]
    },
    { icon: Settings, label: "Configuración", path: "/dashboard/settings" },
  ];

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isExpanded = expandedItems.includes(item.label);
    const isActive = location === item.path;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.label}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.label);
            } else if (item.path) {
              navigate(item.path);
            }
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            depth > 0 ? 'ml-4' : ''
          } ${
            isActive
              ? "bg-blue-100 text-blue-700 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <item.icon className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {hasChildren && (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">SistemaContable</span>
        </div>

        {/* Company Switcher */}
        <div className="px-6 py-4 border-b border-gray-200">
          <CompanySwitcher />
        </div>

        {/* Navigation Menu with Scroll */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-2">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>

        {/* User Profile */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}