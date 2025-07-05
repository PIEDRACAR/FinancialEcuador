import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/DashboardLayout";

export default function PurchasesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const response = await fetch("/api/purchases", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        }
      });
      if (!response.ok) throw new Error("Error al cargar compras");
      return response.json();
    },
  });

  const filteredPurchases = purchases.filter((purchase: any) =>
    purchase.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Gestión de Compras" subtitle="Registra y controla todas tus compras con retenciones automáticas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Compra
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-1">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar compras..."
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
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Compras
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {purchases.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Valor Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    $0.00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Retenciones
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    $0.00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : filteredPurchases.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No hay compras registradas
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Comienza registrando tu primera compra.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Número
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Fecha
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Subtotal
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        IVA
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Total
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase: any) => (
                      <tr key={purchase.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {purchase.number}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {new Date(purchase.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          ${parseFloat(purchase.subtotal || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          ${parseFloat(purchase.iva || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                          ${parseFloat(purchase.total || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            purchase.status === "PAGADO" 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {purchase.status || "PENDIENTE"}
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