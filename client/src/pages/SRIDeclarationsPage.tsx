import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Calendar, CheckCircle, AlertCircle, Clock, Send, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

interface DeclarationStatus {
  id: string;
  form: string;
  period: string;
  status: 'pending' | 'submitted' | 'processed' | 'rejected';
  submittedAt?: string;
  processedAt?: string;
  amount: number;
  dueDate: string;
  description: string;
}

export default function SRIDeclarationsPage() {
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [selectedForm, setSelectedForm] = useState("104");

  // Mock data for declarations - in real app this would come from API
  const mockDeclarations: DeclarationStatus[] = [
    {
      id: "1",
      form: "104",
      period: "2024-07",
      status: "processed",
      submittedAt: "2024-07-15T10:30:00Z",
      processedAt: "2024-07-16T14:20:00Z",
      amount: 1250.50,
      dueDate: "2024-07-28",
      description: "Declaración mensual de IVA"
    },
    {
      id: "2",
      form: "103",
      period: "2024-07",
      status: "submitted",
      submittedAt: "2024-07-15T11:45:00Z",
      amount: 850.75,
      dueDate: "2024-07-28",
      description: "Declaración de retenciones en la fuente"
    },
    {
      id: "3",
      form: "104",
      period: "2024-06",
      status: "processed",
      submittedAt: "2024-06-14T09:15:00Z",
      processedAt: "2024-06-15T16:30:00Z",
      amount: 2150.25,
      dueDate: "2024-06-28",
      description: "Declaración mensual de IVA"
    }
  ];

  const { data: declarations = mockDeclarations, isLoading } = useQuery({
    queryKey: ['/api/sri/declarations', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const { data: salesData = [], isLoading: salesLoading } = useQuery({
    queryKey: ['/api/invoices', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const { data: retentionsData = [], isLoading: retentionsLoading } = useQuery({
    queryKey: ['/api/retentions', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const submitDeclarationMutation = useMutation({
    mutationFn: async (declarationData: any) => {
      const response = await fetch('/api/sri/submit-declaration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify(declarationData),
      });
      if (!response.ok) throw new Error('Error al enviar declaración');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sri/declarations'] });
      toast({
        title: "Declaración enviada",
        description: `La declaración ${data.form} ha sido enviada exitosamente al SRI`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error al enviar declaración",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentMonth = new Date().toLocaleString('es-EC', { month: 'long', year: 'numeric' });
  const currentYear = new Date().getFullYear();

  // Calculate current period data
  const currentPeriodSales = salesData.filter(sale => 
    sale.date && sale.date.startsWith(selectedPeriod)
  );
  const currentPeriodRetentions = retentionsData.filter(retention => 
    retention.date && retention.date.startsWith(selectedPeriod)
  );

  const totalSales = currentPeriodSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalIVA = currentPeriodSales.reduce((sum, sale) => sum + (sale.iva || 0), 0);
  const totalRetentions = currentPeriodRetentions.reduce((sum, retention) => sum + (retention.amount || 0), 0);

  const periods = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().slice(0, 7);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed': return <CheckCircle className="h-4 w-4" />;
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processed': return 'Procesada';
      case 'submitted': return 'Enviada';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazada';
      default: return 'Desconocido';
    }
  };

  const handleSubmitDeclaration = async (formType: string) => {
    const declarationData = {
      form: formType,
      period: selectedPeriod,
      companyId: selectedCompany?.id,
      data: formType === "104" ? {
        totalSales: totalSales,
        totalIVA: totalIVA,
        numberOfInvoices: currentPeriodSales.length
      } : {
        totalRetentions: totalRetentions,
        numberOfCertificates: currentPeriodRetentions.length
      }
    };

    submitDeclarationMutation.mutate(declarationData);
  };

  return (
    <DashboardLayout
      title="Declaraciones SRI"
      subtitle="Gestión de declaraciones tributarias mensuales"
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
              {currentMonth}
            </Badge>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Declaraciones Procesadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {declarations.filter(d => d.status === 'processed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Este año {currentYear}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {declarations.filter(d => d.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Por procesar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${declarations.reduce((sum, d) => sum + d.amount, 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Impuestos {currentYear}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Period Alert */}
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertTitle>Período Actual: {new Date(selectedPeriod + '-01').toLocaleDateString('es-EC', { 
            year: 'numeric', 
            month: 'long' 
          })}</AlertTitle>
          <AlertDescription>
            Fecha límite de declaración: {new Date(selectedPeriod + '-28').toLocaleDateString('es-EC')}
            {new Date() > new Date(selectedPeriod + '-28') && (
              <span className="text-red-600 font-medium"> - VENCIDA</span>
            )}
          </AlertDescription>
        </Alert>

        {/* Declaration Forms */}
        <Tabs defaultValue="submit" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submit">Enviar Declaración</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Form 104 - IVA */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Formulario 104 - IVA
                  </CardTitle>
                  <CardDescription>
                    Declaración mensual de IVA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Ventas gravadas:</span>
                      <span className="text-sm font-medium">
                        ${(totalSales / 1.15).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">IVA causado (15%):</span>
                      <span className="text-sm font-medium">
                        ${totalIVA.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Facturas emitidas:</span>
                      <span className="text-sm font-medium">{currentPeriodSales.length}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total a pagar:</span>
                      <span className="font-bold text-lg">
                        ${totalIVA.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleSubmitDeclaration("104")}
                    disabled={submitDeclarationMutation.isPending || totalSales === 0}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitDeclarationMutation.isPending ? "Enviando..." : "Enviar Declaración 104"}
                  </Button>
                </CardContent>
              </Card>

              {/* Form 103 - Retenciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Formulario 103 - Retenciones
                  </CardTitle>
                  <CardDescription>
                    Declaración de retenciones en la fuente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Retenciones renta:</span>
                      <span className="text-sm font-medium">
                        ${(totalRetentions * 0.7).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Retenciones IVA:</span>
                      <span className="text-sm font-medium">
                        ${(totalRetentions * 0.3).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Comprobantes emitidos:</span>
                      <span className="text-sm font-medium">{currentPeriodRetentions.length}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total retenido:</span>
                      <span className="font-bold text-lg">
                        ${totalRetentions.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleSubmitDeclaration("103")}
                    disabled={submitDeclarationMutation.isPending || totalRetentions === 0}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitDeclarationMutation.isPending ? "Enviando..." : "Enviar Declaración 103"}
                  </Button>
                </CardContent>
              </Card>

              {/* Form 102 - Impuesto a la Renta Personas Naturales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Formulario 102 - Renta PN
                  </CardTitle>
                  <CardDescription>
                    Declaración anual personas naturales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Ingresos anuales:</span>
                      <span className="text-sm font-medium">
                        ${(totalSales * 12).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Gastos personales:</span>
                      <span className="text-sm font-medium">
                        ${Math.min(totalSales * 12 * 0.5, 15954).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Base imponible:</span>
                      <span className="text-sm font-medium">
                        ${Math.max(0, (totalSales * 12) - Math.min(totalSales * 12 * 0.5, 15954)).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Impuesto tabla progresiva:</span>
                      <span className="text-sm font-medium">
                        ${((totalSales * 12 > 11722) ? (totalSales * 12 * 0.15) : 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total a pagar:</span>
                      <span className="font-bold text-lg">
                        ${((totalSales * 12 > 11722) ? (totalSales * 12 * 0.15) : 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      *Tabla progresiva 2024 - Verificar con contador
                    </p>
                  </div>

                  <Button 
                    onClick={() => handleSubmitDeclaration("102")}
                    disabled={submitDeclarationMutation.isPending || totalSales === 0}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitDeclarationMutation.isPending ? "Enviando..." : "Enviar Declaración 102"}
                  </Button>
                </CardContent>
              </Card>

              {/* Form 101 - Impuesto a la Renta Sociedades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Formulario 101 - Renta Sociedades
                  </CardTitle>
                  <CardDescription>
                    Declaración anual para sociedades
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Ingresos brutos:</span>
                      <span className="text-sm font-medium">
                        ${(totalSales * 12).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Costos y gastos:</span>
                      <span className="text-sm font-medium">
                        ${(totalSales * 0.65 * 12).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Utilidad antes participación:</span>
                      <span className="text-sm font-medium">
                        ${(totalSales * 0.35 * 12).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Participación trabajadores (15%):</span>
                      <span className="text-sm font-medium">
                        ${(totalSales * 0.35 * 12 * 0.15).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Base imponible:</span>
                      <span className="text-sm font-medium">
                        ${(totalSales * 0.35 * 12 * 0.85).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Impuesto renta (25%):</span>
                      <span className="text-sm font-medium">
                        ${(totalSales * 0.35 * 12 * 0.85 * 0.25).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total a pagar:</span>
                      <span className="font-bold text-lg">
                        ${(totalSales * 0.35 * 12 * 0.85 * 0.25).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      *Tarifa sociedades 25% - Verificar con contador
                    </p>
                  </div>

                  <Button 
                    onClick={() => handleSubmitDeclaration("101")}
                    disabled={submitDeclarationMutation.isPending || totalSales === 0}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitDeclarationMutation.isPending ? "Enviando..." : "Enviar Declaración 101"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Declaraciones</CardTitle>
                <CardDescription>
                  Todas las declaraciones enviadas al SRI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {declarations.map((declaration) => (
                    <div key={declaration.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(declaration.status)}
                            <span className="font-medium">
                              Formulario {declaration.form}
                            </span>
                          </div>
                          <Badge className={getStatusColor(declaration.status)}>
                            {getStatusText(declaration.status)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${declaration.amount.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(declaration.period + '-01').toLocaleDateString('es-EC', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-muted-foreground">
                        {declaration.description}
                      </div>
                      
                      {declaration.submittedAt && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Enviado: {new Date(declaration.submittedAt).toLocaleDateString('es-EC')}
                          {declaration.processedAt && (
                            <span> • Procesado: {new Date(declaration.processedAt).toLocaleDateString('es-EC')}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}