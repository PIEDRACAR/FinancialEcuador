import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Upload, FileText, AlertCircle, CheckCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

export default function SRIPage() {
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: sriConnection = null, isLoading: connectionLoading } = useQuery({
    queryKey: ['/api/sri/connection', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const { data: exportableData = [], isLoading: dataLoading } = useQuery({
    queryKey: ['/api/sri/exportable-data', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const { data: importHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['/api/sri/import-history', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const connectSRIMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const response = await fetch('/api/sri/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({ companyId: selectedCompany?.id, ...credentials }),
      });
      if (!response.ok) throw new Error('Error al conectar con SRI');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sri/connection'] });
      toast({
        title: "Conexión establecida",
        description: "Se ha conectado exitosamente con el SRI en línea",
      });
    },
    onError: () => {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el SRI. Verifique sus credenciales",
        variant: "destructive",
      });
    },
  });

  const exportToSRIMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/sri/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({ companyId: selectedCompany?.id, ...data }),
      });
      if (!response.ok) throw new Error('Error al exportar al SRI');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Exportación exitosa",
        description: "Los datos se han enviado al SRI correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error de exportación",
        description: "No se pudieron enviar los datos al SRI",
        variant: "destructive",
      });
    },
  });

  const importFromSRIMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/sri/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({ companyId: selectedCompany?.id }),
      });
      if (!response.ok) throw new Error('Error al importar del SRI');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sri/import-history'] });
      toast({
        title: "Importación exitosa",
        description: "Los datos del SRI se han sincronizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error de importación",
        description: "No se pudieron obtener los datos del SRI",
        variant: "destructive",
      });
    },
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentYear = new Date().getFullYear();

  return (
    <DashboardLayout
      title="Integración SRI Ecuador"
      subtitle="Exportación e importación de información tributaria en línea"
    >
      <div className="space-y-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Estado de Conexión SRI
            </CardTitle>
            <CardDescription>
              Conexión con el sistema en línea del Servicio de Rentas Internas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sriConnection ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Conectado</AlertTitle>
                <AlertDescription>
                  Conexión activa con SRI en línea. RUC: {selectedCompany?.ruc}
                  <br />
                  Última sincronización: {new Date(sriConnection.lastSync).toLocaleString('es-EC')}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sin conexión</AlertTitle>
                <AlertDescription>
                  No hay conexión establecida con el SRI. Configure sus credenciales para habilitar la sincronización.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={() => setIsConnecting(true)}
                disabled={connectSRIMutation.isPending}
              >
                <Globe className="mr-2 h-4 w-4" />
                {sriConnection ? 'Reconectar' : 'Conectar'} al SRI
              </Button>
              {sriConnection && (
                <Button 
                  variant="outline"
                  onClick={() => importFromSRIMutation.mutate()}
                  disabled={importFromSRIMutation.isPending}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {importFromSRIMutation.isPending ? "Sincronizando..." : "Sincronizar Datos"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="export" className="space-y-4">
          <TabsList>
            <TabsTrigger value="export">Exportar al SRI</TabsTrigger>
            <TabsTrigger value="import">Importar del SRI</TabsTrigger>
            <TabsTrigger value="forms">Formularios</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Anexo Transaccional Simplificado (ATS)</CardTitle>
                  <CardDescription>
                    Reporte mensual de transacciones para el SRI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Período: {new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long' })}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Ventas registradas</div>
                        <div className="text-sm text-muted-foreground">{exportableData.sales || 0} transacciones</div>
                      </div>
                      <Badge variant="outline">Pendiente</Badge>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => exportToSRIMutation.mutate({ type: 'ATS', period: currentMonth })}
                      disabled={exportToSRIMutation.isPending || !sriConnection}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Generar y Enviar ATS
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formulario 104 - IVA</CardTitle>
                  <CardDescription>
                    Declaración mensual del Impuesto al Valor Agregado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      IVA causado: ${exportableData.ivaAmount || 0}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Estado</div>
                        <div className="text-sm text-muted-foreground">Pendiente de declaración</div>
                      </div>
                      <Badge variant="secondary">En proceso</Badge>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => exportToSRIMutation.mutate({ type: 'F104', period: currentMonth })}
                      disabled={exportToSRIMutation.isPending || !sriConnection}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generar Declaración
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formulario 103 - Retenciones</CardTitle>
                  <CardDescription>
                    Declaración mensual de retenciones en la fuente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Retenciones: ${exportableData.retentionsAmount || 0}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Comprobantes</div>
                        <div className="text-sm text-muted-foreground">{exportableData.retentions || 0} emitidos</div>
                      </div>
                      <Badge variant="outline">Pendiente</Badge>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => exportToSRIMutation.mutate({ type: 'F103', period: currentMonth })}
                      disabled={exportToSRIMutation.isPending || !sriConnection}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Declarar Retenciones
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formulario 101 - Impuesto a la Renta</CardTitle>
                  <CardDescription>
                    Declaración anual del impuesto a la renta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Año fiscal: {currentYear}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Ingresos gravables</div>
                        <div className="text-sm text-muted-foreground">${exportableData.annualIncome || 0}</div>
                      </div>
                      <Badge variant="secondary">Año en curso</Badge>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => exportToSRIMutation.mutate({ type: 'F101', period: currentYear.toString() })}
                      disabled={exportToSRIMutation.isPending || !sriConnection}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generar F101
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Importación de Datos SRI</CardTitle>
                <CardDescription>
                  Sincroniza información desde el portal del SRI
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : importHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Download className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Sin importaciones</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No se han realizado importaciones desde el SRI.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {importHistory.map((import_: any) => (
                      <div key={import_.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{import_.type}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(import_.date).toLocaleDateString('es-EC')} • 
                              {import_.recordsCount} registros importados
                            </div>
                          </div>
                          <Badge variant={import_.status === 'success' ? 'default' : 'destructive'}>
                            {import_.status === 'success' ? 'Exitoso' : 'Error'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Formularios Mensuales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Formulario 104 (IVA)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Formulario 103 (Retenciones)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    ATS Mensual
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Formularios Anuales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Formulario 101 (IR)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Anexo RDEP
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Anexo RISEMP
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comprobantes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Facturas Electrónicas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Notas de Crédito
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Comprobantes Retención
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}