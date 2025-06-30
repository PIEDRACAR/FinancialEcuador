import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Eye, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { CreateProformaModal } from "@/components/CreateProformaModal";

export default function ProformasPage() {
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createProformaOpen, setCreateProformaOpen] = useState(false);

  // Obtenemos todas las facturas/documentos que incluyen proformas
  const { data: allDocuments = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/invoices', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  // Filtrar solo proformas
  const proformas = allDocuments.filter((doc: any) => doc.type === 'proforma');
  const convertedProformas = proformas.filter((p: any) => p.status === 'convertida');
  const pendingProformas = proformas.filter((p: any) => p.status === 'pendiente');
  const expiredProformas = proformas.filter((p: any) => p.status === 'vencida');

  // Cálculos de montos
  const totalProformaAmount = proformas.reduce((sum: number, proforma: any) => 
    sum + parseFloat(proforma.total || '0'), 0);

  const convertToInvoiceMutation = useMutation({
    mutationFn: async (proformaId: number) => {
      const response = await fetch(`/api/invoices/${proformaId}/convert-to-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });
      if (!response.ok) throw new Error('Error al convertir proforma');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Proforma convertida",
        description: "La proforma se ha convertido a factura exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo convertir la proforma a factura",
        variant: "destructive",
      });
    },
  });

  const stats = [
    {
      title: "Total Proformas",
      value: proformas.length.toString(),
      icon: FileText,
      description: "Proformas emitidas",
    },
    {
      title: "Pendientes",
      value: pendingProformas.length.toString(),
      icon: Clock,
      description: "Esperando aprobación",
    },
    {
      title: "Convertidas",
      value: convertedProformas.length.toString(),
      icon: CheckCircle,
      description: "Convertidas a factura",
    },
    {
      title: "Valor Total",
      value: "$" + totalProformaAmount.toLocaleString(),
      icon: Calculator,
      description: "Valor en proformas",
    },
  ];

  const getClientName = (clientId: number) => {
    const client = clients.find((c: any) => c.id === clientId);
    return client?.name || 'Cliente no encontrado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'convertida': return 'default';
      case 'pendiente': return 'secondary';
      case 'vencida': return 'destructive';
      case 'aprobada': return 'default';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'convertida': return 'Convertida';
      case 'pendiente': return 'Pendiente';
      case 'vencida': return 'Vencida';
      case 'aprobada': return 'Aprobada';
      default: return status;
    }
  };

  const isExpired = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <DashboardLayout
      title="Gestión de Proformas"
      subtitle="Cotizaciones y presupuestos con conversión automática a factura"
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
          <Button onClick={() => setCreateProformaOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Proforma
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Reporte de Proformas
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all-proformas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-proformas">Todas las Proformas</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="converted">Convertidas</TabsTrigger>
          </TabsList>

          <TabsContent value="all-proformas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Todas las Proformas</CardTitle>
                <CardDescription>
                  Gestión completa de cotizaciones y presupuestos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documentsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : proformas.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Sin proformas</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comienza creando tu primera proforma o cotización.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proformas.map((proforma: any) => (
                      <div key={proforma.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">PROF-{proforma.number}</Badge>
                              <span className="font-medium">{getClientName(proforma.clientId)}</span>
                              <Badge variant={getStatusColor(proforma.status)}>
                                {getStatusLabel(proforma.status)}
                              </Badge>
                              {proforma.dueDate && isExpired(proforma.dueDate) && (
                                <Badge variant="destructive">Vencida</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Emisión: {new Date(proforma.date).toLocaleDateString('es-EC')} • 
                              {proforma.dueDate && (
                                <>Vence: {new Date(proforma.dueDate).toLocaleDateString('es-EC')} • </>
                              )}
                              Total: ${parseFloat(proforma.total).toLocaleString()} • 
                              IVA ({proforma.ivaRate}%): ${parseFloat(proforma.iva).toLocaleString()}
                            </p>
                            {proforma.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                {proforma.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {proforma.status === 'pendiente' && !isExpired(proforma.dueDate) && (
                              <Button 
                                size="sm"
                                onClick={() => convertToInvoiceMutation.mutate(proforma.id)}
                                disabled={convertToInvoiceMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Convertir
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Proformas Pendientes
                </CardTitle>
                <CardDescription>
                  Cotizaciones esperando aprobación del cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingProformas.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Sin proformas pendientes</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Todas las proformas han sido procesadas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingProformas.map((proforma: any) => (
                      <div key={proforma.id} className="border rounded-lg p-4 border-l-4 border-l-yellow-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">PROF-{proforma.number}</Badge>
                              <span className="font-medium">{getClientName(proforma.clientId)}</span>
                              {proforma.dueDate && (
                                <Badge variant={isExpired(proforma.dueDate) ? 'destructive' : 'secondary'}>
                                  {isExpired(proforma.dueDate) ? 'Vencida' : 'Vigente'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Emisión: {new Date(proforma.date).toLocaleDateString('es-EC')} • 
                              {proforma.dueDate && (
                                <>Vence: {new Date(proforma.dueDate).toLocaleDateString('es-EC')} • </>
                              )}
                              Total: ${parseFloat(proforma.total).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!isExpired(proforma.dueDate) && (
                              <Button 
                                size="sm"
                                onClick={() => convertToInvoiceMutation.mutate(proforma.id)}
                                disabled={convertToInvoiceMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Convertir
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="converted" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Proformas Convertidas
                </CardTitle>
                <CardDescription>
                  Proformas que han sido convertidas a facturas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {convertedProformas.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Sin conversiones</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Aún no se han convertido proformas a facturas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {convertedProformas.map((proforma: any) => (
                      <div key={proforma.id} className="border rounded-lg p-4 border-l-4 border-l-green-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">PROF-{proforma.number}</Badge>
                              <span className="font-medium">{getClientName(proforma.clientId)}</span>
                              <Badge variant="default">Convertida</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Conversión: {new Date(proforma.date).toLocaleDateString('es-EC')} • 
                              Total: ${parseFloat(proforma.total).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              ✓ Facturada
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Ver en facturas
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateProformaModal 
        open={createProformaOpen} 
        onOpenChange={setCreateProformaOpen} 
      />
    </DashboardLayout>
  );
}