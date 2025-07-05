import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/DashboardLayout";

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const response = await fetch("/api/suppliers", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        }
      });
      if (!response.ok) throw new Error("Error al cargar proveedores");
      return response.json();
    },
  });

  const filteredSuppliers = suppliers.filter((supplier: any) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.ruc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Gestión de Proveedores" subtitle="Administra tu base de datos de proveedores">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-1">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar proveedores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Proveedores
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {suppliers.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Proveedores Activos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {suppliers.filter((s: any) => s.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Valor Compras
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    $0.00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suppliers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Base de Datos de Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No hay proveedores
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Comienza agregando tu primer proveedor.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        RUC
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Teléfono
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier: any) => (
                      <tr key={supplier.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {supplier.ruc}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {supplier.name}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {supplier.email || "Sin email"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {supplier.phone || "Sin teléfono"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            supplier.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {supplier.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}