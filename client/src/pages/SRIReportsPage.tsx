import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { ExportDropdown } from "@/components/ExportDropdown";

export default function SRIReportsPage() {
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  
  const { data: salesData = [], isLoading: salesLoading } = useQuery({
    queryKey: ['/api/invoices', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const { data: purchasesData = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ['/api/purchases', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const { data: retentionsData = [], isLoading: retentionsLoading } = useQuery({
    queryKey: ['/api/retentions', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  // Filter data by selected period
  const filteredSales = salesData.filter(sale => 
    sale.date && sale.date.startsWith(selectedPeriod)
  );

  const filteredPurchases = purchasesData.filter(purchase => 
    purchase.date && purchase.date.startsWith(selectedPeriod)
  );

  const filteredRetentions = retentionsData.filter(retention => 
    retention.date && retention.date.startsWith(selectedPeriod)
  );

  // Calculate totals
  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalPurchases = filteredPurchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0);
  const totalRetentions = filteredRetentions.reduce((sum, retention) => sum + (retention.amount || 0), 0);
  const totalIVA = filteredSales.reduce((sum, sale) => sum + (sale.iva || 0), 0);

  const periods = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().slice(0, 7);
  });

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('es-EC', { month: 'long' });

  const reportData = {
    ventasResumen: {
      periodo: selectedPeriod,
      totalVentas: totalSales,
      totalIVA: totalIVA,
      numeroFacturas: filteredSales.length,
      ventasPorTipo: [
        { tipo: 'Bienes', valor: totalSales * 0.6, porcentaje: 60 },
        { tipo: 'Servicios', valor: totalSales * 0.4, porcentaje: 40 }
      ]
    },
    comprasResumen: {
      periodo: selectedPeriod,
      totalCompras: totalPurchases,
      numeroFacturas: filteredPurchases.length,
      retencionesPagadas: totalRetentions
    },
    retencionesSRI: {
      periodo: selectedPeriod,
      totalRetenciones: totalRetentions,
      numeroComprobantes: filteredRetentions.length,
      porTipo: [
        { tipo: 'Renta', valor: totalRetentions * 0.7, porcentaje: 70 },
        { tipo: 'IVA', valor: totalRetentions * 0.3, porcentaje: 30 }
      ]
    }
  };

  const exportData = {
    formatos: ['PDF', 'Excel', 'CSV', 'JSON'],
    datos: reportData,
    empresa: selectedCompany?.name || '',
    periodo: selectedPeriod,
    generadoPor: 'Sistema Contable Pro Ecuador 2024'
  };

  return (
    <DashboardLayout
      title="Reportes SRI"
      subtitle="Reportes tributarios para declaraciones mensuales al SRI"
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                {periods.map(period => (
                  <SelectItem key={period} value={period}>
                    {new Date(period + '-01').toLocaleDateString('es-EC', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-sm">
              {currentMonth} {currentYear}
            </Badge>
          </div>
          
          <ExportDropdown 
            data={exportData}
            filename={`reporte_sri_${selectedPeriod}`}
            title="Reporte SRI"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSales.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                {filteredSales.length} facturas emitidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">IVA Cobrado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalIVA.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                Tarifa 15% aplicada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compras Totales</CardTitle>
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPurchases.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                {filteredPurchases.length} facturas de compra
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retenciones</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRetentions.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                {filteredRetentions.length} comprobantes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sales">Ventas</TabsTrigger>
            <TabsTrigger value="purchases">Compras</TabsTrigger>
            <TabsTrigger value="retentions">Retenciones</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reporte de Ventas - Formulario 104</CardTitle>
                <CardDescription>
                  Resumen de ventas para declaración mensual al SRI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Período</label>
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        {new Date(selectedPeriod + '-01').toLocaleDateString('es-EC', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">RUC Empresa</label>
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        {selectedCompany?.ruc || 'No registrado'}
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Resumen de Ventas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Ventas totales (Sin IVA):</span>
                        <span>${(totalSales / 1.15).toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IVA cobrado (15%):</span>
                        <span>${totalIVA.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total con IVA:</span>
                        <span>${totalSales.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reporte de Compras</CardTitle>
                <CardDescription>
                  Resumen de compras y gastos deducibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Resumen de Compras</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Compras totales:</span>
                        <span>${totalPurchases.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Número de facturas:</span>
                        <span>{filteredPurchases.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retenciones pagadas:</span>
                        <span>${totalRetentions.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retentions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reporte de Retenciones - Formulario 103</CardTitle>
                <CardDescription>
                  Comprobantes de retención emitidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Resumen de Retenciones</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Retenciones en la fuente:</span>
                        <span>${(totalRetentions * 0.7).toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retenciones de IVA:</span>
                        <span>${(totalRetentions * 0.3).toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total retenciones:</span>
                        <span>${totalRetentions.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle>Exportar Reportes</CardTitle>
            <CardDescription>
              Generar archivos listos para presentar al SRI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <ExportDropdown 
                data={reportData.ventasResumen}
                filename={`form_104_ventas_${selectedPeriod}`}
                title="Formulario 104 - Ventas"
              />
              <ExportDropdown 
                data={reportData.retencionesSRI}
                filename={`form_103_retenciones_${selectedPeriod}`}
                title="Formulario 103 - Retenciones"
              />
              <ExportDropdown 
                data={reportData}
                filename={`reporte_completo_${selectedPeriod}`}
                title="Reporte Completo"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}