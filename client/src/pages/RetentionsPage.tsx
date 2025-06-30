import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Receipt, FileText, Calculator, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { CreateRetentionModal } from "@/components/CreateRetentionModal";

export default function RetentionsPage() {
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createRetentionOpen, setCreateRetentionOpen] = useState(false);

  const { data: retentions = [], isLoading: retentionsLoading } = useQuery({
    queryKey: ['/api/retentions', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['/api/invoices', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const generateRetentionMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await fetch('/api/retentions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({ invoiceId, companyId: selectedCompany?.id }),
      });
      if (!response.ok) throw new Error('Error al generar comprobante');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/retentions'] });
      toast({
        title: "Comprobante generado",
        description: "El comprobante de retención se ha creado automáticamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo generar el comprobante de retención",
        variant: "destructive",
      });
    },
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyRetentions = retentions.filter((r: any) => r.date.startsWith(currentMonth));
  const totalRetentionAmount = monthlyRetentions.reduce((sum: number, r: any) => 
    sum + parseFloat(r.retentionAmount || '0'), 0);

  const retentionRates = {
    fuente: {
      '303': { name: 'Honorarios profesionales', rate: 8 },
      '304': { name: 'Servicios predomina intelecto', rate: 8 },
      '307': { name: 'Servicios predomina mano obra', rate: 2 },
      '308': { name: 'Utilización o aprovechamiento imagen', rate: 10 },
      '309': { name: 'Servicios entre sociedades', rate: 2 },
      '310': { name: 'Arrendamiento inmuebles', rate: 8 },
      '312': { name: 'Transporte privado', rate: 1 },
      '319': { name: 'Otros servicios', rate: 2 },
      '320': { name: 'Transferencia bienes muebles', rate: 1 },
    },
    iva: {
      '725': { name: 'Retención 30% IVA', rate: 30 },
      '727': { name: 'Retención 70% IVA', rate: 70 },
      '729': { name: 'Retención 100% IVA', rate: 100 },
    }
  };

  const stats = [
    {
      title: "Comprobantes Emitidos",
      value: retentions.length.toString(),
      icon: Receipt,
      description: "Total de comprobantes",
    },
    {
      title: "Retenciones del Mes",
      value: monthlyRetentions.length.toString(),
      icon: Calendar,
      description: currentMonth.split('-').reverse().join('/'),
    },
    {
      title: "Monto Retenido",
      value: "$" + totalRetentionAmount.toLocaleString(),
      icon: Calculator,
      description: "Mes actual",
    },
    {
      title: "Facturas Pendientes",
      value: invoices.filter((inv: any) => !retentions.some((ret: any) => ret.invoiceId === inv.id)).length.toString(),
      icon: FileText,
      description: "Sin retención",
    },
  ];

  return (
    <DashboardLayout
      title="Comprobantes de Retención"
      subtitle="Gestión de retenciones en la fuente e IVA según normativa ecuatoriana"
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setCreateRetentionOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Comprobante
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar XML
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Reporte Mensual
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="retentions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="retentions">Comprobantes</TabsTrigger>
            <TabsTrigger value="rates">Tablas de Retención</TabsTrigger>
            <TabsTrigger value="pending">Facturas Pendientes</TabsTrigger>
          </TabsList>

          <TabsContent value="retentions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Comprobantes de Retención</CardTitle>
                <CardDescription>
                  Lista de comprobantes emitidos con cálculo automático
                </CardDescription>
              </CardHeader>
              <CardContent>
                {retentionsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : retentions.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Sin comprobantes</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comienza creando tu primer comprobante de retención.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {retentions.map((retention: any) => (
                      <div key={retention.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">#{retention.number}</Badge>
                              <span className="font-medium">
                                {retention.type === 'fuente' ? 'Retención en la Fuente' : 'Retención IVA'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(retention.date).toLocaleDateString('es-EC')} • 
                              Base: ${parseFloat(retention.baseAmount).toLocaleString()} • 
                              {retention.percentage}% = ${parseFloat(retention.retentionAmount).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Retención en la Fuente</CardTitle>
                  <CardDescription>
                    Porcentajes según tabla del SRI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(retentionRates.fuente).map(([code, data]) => (
                      <div key={code} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <div className="font-medium">{data.name}</div>
                          <div className="text-sm text-muted-foreground">Código: {code}</div>
                        </div>
                        <Badge variant="secondary">{data.rate}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retención IVA</CardTitle>
                  <CardDescription>
                    Porcentajes para agentes de retención
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(retentionRates.iva).map(([code, data]) => (
                      <div key={code} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <div className="font-medium">{data.name}</div>
                          <div className="text-sm text-muted-foreground">Código: {code}</div>
                        </div>
                        <Badge variant="secondary">{data.rate}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Facturas Pendientes de Retención</CardTitle>
                <CardDescription>
                  Facturas que requieren comprobante de retención
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices
                      .filter((invoice: any) => 
                        !retentions.some((retention: any) => retention.invoiceId === invoice.id)
                      )
                      .map((invoice: any) => (
                        <div key={invoice.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">#{invoice.number}</Badge>
                                <span className="font-medium">
                                  Total: ${parseFloat(invoice.total).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(invoice.date).toLocaleDateString('es-EC')} • 
                                IVA: ${parseFloat(invoice.iva).toLocaleString()}
                              </p>
                            </div>
                            <Button 
                              onClick={() => generateRetentionMutation.mutate(invoice.id)}
                              disabled={generateRetentionMutation.isPending}
                              size="sm"
                            >
                              <Receipt className="mr-2 h-4 w-4" />
                              Generar Retención
                            </Button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateRetentionModal 
        open={createRetentionOpen} 
        onOpenChange={setCreateRetentionOpen} 
      />
    </DashboardLayout>
  );
}