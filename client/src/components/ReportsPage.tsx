import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, FileText, TrendingUp, DollarSign, Users, BarChart3 } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { invoicesApi, clientsApi } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("monthly");
  const [periodFilter, setPeriodFilter] = useState("current");
  const { selectedCompany } = useCompany();

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/companies", selectedCompany?.id, "invoices"],
    queryFn: () => {
      if (!selectedCompany) return [];
      return invoicesApi.getByCompany(selectedCompany.id);
    },
    enabled: !!selectedCompany
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/companies", selectedCompany?.id, "clients"],
    queryFn: () => {
      if (!selectedCompany) return [];
      return clientsApi.getByCompany(selectedCompany.id);
    },
    enabled: !!selectedCompany
  });

  // Calculate report data
  const calculateReportData = () => {
    if (!invoices.length) return null;

    const now = new Date();
    let startDate, endDate;

    switch (periodFilter) {
      case "current":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "previous":
        const prevMonth = subMonths(now, 1);
        startDate = startOfMonth(prevMonth);
        endDate = endOfMonth(prevMonth);
        break;
      case "quarter":
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        startDate = quarterStart;
        endDate = endOfMonth(new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 2, 1));
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    const filteredInvoices = invoices.filter((invoice: any) => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });

    const totalInvoices = filteredInvoices.length;
    const paidInvoices = filteredInvoices.filter((inv: any) => inv.status === 'pagada');
    const pendingInvoices = filteredInvoices.filter((inv: any) => inv.status === 'pendiente');
    const overdueInvoices = filteredInvoices.filter((inv: any) => inv.status === 'vencida');

    const totalRevenue = paidInvoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.total || '0'), 0);
    const pendingRevenue = pendingInvoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.total || '0'), 0);
    const overdueRevenue = overdueInvoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.total || '0'), 0);

    // Client analysis
    const clientInvoiceCount = filteredInvoices.reduce((acc: any, inv: any) => {
      acc[inv.clientId] = (acc[inv.clientId] || 0) + 1;
      return acc;
    }, {});

    const topClients = Object.entries(clientInvoiceCount)
      .map(([clientId, count]) => ({ clientId: parseInt(clientId), invoiceCount: count }))
      .sort((a, b) => (b.invoiceCount as number) - (a.invoiceCount as number))
      .slice(0, 5);

    return {
      period: { startDate, endDate },
      summary: {
        totalInvoices,
        paidCount: paidInvoices.length,
        pendingCount: pendingInvoices.length,
        overdueCount: overdueInvoices.length,
        totalRevenue,
        pendingRevenue,
        overdueRevenue,
        collectionRate: totalInvoices > 0 ? (paidInvoices.length / totalInvoices) * 100 : 0
      },
      invoices: filteredInvoices,
      topClients
    };
  };

  const reportData = calculateReportData();

  if (invoicesLoading || clientsLoading) {
    return (
      <DashboardLayout title="Reportes" subtitle="Análisis y estadísticas de tu negocio">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!reportData) {
    return (
      <DashboardLayout title="Reportes" subtitle="Análisis y estadísticas de tu negocio">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin datos para mostrar</h3>
          <p className="text-gray-600">No hay facturas en el período seleccionado para generar reportes.</p>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pagada':
        return <Badge className="bg-green-100 text-green-800">Pagada</Badge>;
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'vencida':
        return <Badge className="bg-red-100 text-red-800">Vencida</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Reportes" subtitle="Análisis y estadísticas de tu negocio">
      <div className="space-y-6">
        {/* Report Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Configuración del Reporte
              </CardTitle>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Reporte</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Mes Actual</SelectItem>
                    <SelectItem value="previous">Mes Anterior</SelectItem>
                    <SelectItem value="quarter">Trimestre Actual</SelectItem>
                    <SelectItem value="year">Año Actual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Período Seleccionado</label>
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(reportData.period.startDate, "dd MMM", { locale: es })} - {format(reportData.period.endDate, "dd MMM yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Facturas</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalInvoices}</p>
                  <p className="text-xs text-gray-500">En el período</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-green-600">${reportData.summary.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Facturas pagadas</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Por Cobrar</p>
                  <p className="text-2xl font-bold text-yellow-600">${reportData.summary.pendingRevenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{reportData.summary.pendingCount} facturas</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Cobro</p>
                  <p className="text-2xl font-bold text-purple-600">{reportData.summary.collectionRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">Efectividad</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Report */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Facturas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{reportData.summary.paidCount}</p>
                    <p className="text-sm text-green-700">Pagadas</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{reportData.summary.pendingCount}</p>
                    <p className="text-sm text-yellow-700">Pendientes</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{reportData.summary.overdueCount}</p>
                    <p className="text-sm text-red-700">Vencidas</p>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Factura</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.invoices.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.number}</TableCell>
                          <TableCell>{format(new Date(invoice.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>${parseFloat(invoice.total || '0').toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Clients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Clientes Principales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.topClients.length > 0 ? (
                  reportData.topClients.map((client: any, index: number) => {
                    const clientData = clients.find((c: any) => c.id === client.clientId);
                    return (
                      <div key={client.clientId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{clientData?.name || `Cliente ${client.clientId}`}</p>
                            <p className="text-sm text-gray-600">{clientData?.ruc || 'RUC no disponible'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{client.invoiceCount}</p>
                          <p className="text-xs text-gray-500">facturas</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay datos de clientes para mostrar</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}