import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Download, CheckCircle, AlertCircle, Database, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { ImportDropdown } from "@/components/ImportDropdown";

interface ImportTemplate {
  type: string;
  name: string;
  description: string;
  fields: string[];
  example: string;
  icon: React.ReactNode;
}

interface ImportHistory {
  id: string;
  type: string;
  fileName: string;
  recordsImported: number;
  recordsRejected: number;
  status: 'success' | 'partial' | 'failed';
  importedAt: string;
  errors?: string[];
}

export default function ImportAccountingPage() {
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const templates: ImportTemplate[] = [
    {
      type: "clients",
      name: "Clientes",
      description: "Importar datos de clientes con RUC/CI validación",
      fields: ["nombre", "ruc_ci", "email", "telefono", "direccion", "tipo_contribuyente"],
      example: "Empresa ABC S.A., 0912345678001, cliente@empresa.com, 0999123456, Av. Principal 123, sociedad",
      icon: <Database className="h-5 w-5" />
    },
    {
      type: "suppliers",
      name: "Proveedores", 
      description: "Importar proveedores con configuración de retenciones",
      fields: ["nombre", "ruc_ci", "email", "telefono", "tipo_proveedor", "categoria_retencion"],
      example: "Proveedor XYZ Ltda., 0987654321001, proveedor@empresa.com, 0988765432, bienes, 1.75%",
      icon: <FileSpreadsheet className="h-5 w-5" />
    },
    {
      type: "products",
      name: "Productos/Servicios",
      description: "Catálogo de productos con precios e IVA",
      fields: ["codigo", "nombre", "descripcion", "precio_compra", "precio_venta", "iva", "categoria"],
      example: "PROD001, Producto ejemplo, Descripción del producto, 10.50, 15.75, 15%, categoria1",
      icon: <Database className="h-5 w-5" />
    },
    {
      type: "chart_accounts",
      name: "Plan de Cuentas",
      description: "Cuentas contables según normativa ecuatoriana",
      fields: ["codigo", "nombre", "tipo", "nivel", "padre", "naturaleza"],
      example: "1.1.01.001, Caja General, activo, 4, 1.1.01, deudora",
      icon: <FileText className="h-5 w-5" />
    },
    {
      type: "journal_entries",
      name: "Asientos Contables",
      description: "Importar movimientos contables masivamente",
      fields: ["fecha", "descripcion", "cuenta_debito", "cuenta_credito", "valor", "referencia"],
      example: "2024-07-05, Venta de mercadería, 1.1.01.001, 4.1.01.001, 1000.00, FAC-001",
      icon: <FileText className="h-5 w-5" />
    },
    {
      type: "employees",
      name: "Empleados",
      description: "Información de empleados para nómina",
      fields: ["cedula", "nombres", "apellidos", "cargo", "sueldo", "fecha_ingreso", "tipo_contrato"],
      example: "0912345678, Juan Carlos, Pérez López, Contador, 800.00, 2024-01-15, indefinido",
      icon: <Database className="h-5 w-5" />
    }
  ];

  // Mock data for import history
  const mockHistory: ImportHistory[] = [
    {
      id: "1",
      type: "clients",
      fileName: "clientes_julio_2024.xlsx",
      recordsImported: 145,
      recordsRejected: 3,
      status: "partial",
      importedAt: "2024-07-05T10:30:00Z",
      errors: ["RUC inválido en fila 15", "Email duplicado en fila 78", "Teléfono requerido en fila 102"]
    },
    {
      id: "2",
      type: "products",
      fileName: "productos_actualizados.csv",
      recordsImported: 89,
      recordsRejected: 0,
      status: "success",
      importedAt: "2024-07-04T14:20:00Z"
    },
    {
      id: "3",
      type: "suppliers",
      fileName: "proveedores_nuevos.xlsx",
      recordsImported: 25,
      recordsRejected: 5,
      status: "partial",
      importedAt: "2024-07-03T09:15:00Z",
      errors: ["RUC duplicado en fila 12", "Categoría inválida en fila 18"]
    }
  ];

  const { data: importHistory = mockHistory, isLoading } = useQuery({
    queryKey: ['/api/import/history', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const importDataMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('companyId', selectedCompany?.id?.toString() || '');

      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Error al importar archivo');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/import/history'] });
      toast({
        title: "Importación completada",
        description: `${data.recordsImported} registros importados exitosamente`,
      });
      setUploadProgress(0);
      setIsUploading(false);
    },
    onError: (error) => {
      toast({
        title: "Error en importación",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
      setIsUploading(false);
    },
  });

  const handleFileImport = async (file: File, type: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    importDataMutation.mutate({ file, type });
  };

  const downloadTemplate = (type: string) => {
    const template = templates.find(t => t.type === type);
    if (!template) return;

    // Create CSV template with headers and example row
    const headers = template.fields.join(',');
    const exampleRow = template.example;
    const csvContent = `${headers}\n${exampleRow}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `plantilla_${type}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Plantilla descargada",
      description: `Plantilla de ${template.name} lista para usar`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'partial': return <AlertCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Exitosa';
      case 'partial': return 'Con errores';
      case 'failed': return 'Fallida';
      default: return 'Desconocido';
    }
  };

  return (
    <DashboardLayout
      title="Importación Contable"
      subtitle="Importación masiva de datos contables desde archivos Excel/CSV"
    >
      <div className="space-y-6">
        {/* Quick Info Alert */}
        <Alert>
          <Database className="h-4 w-4" />
          <AlertTitle>Importación Masiva de Datos</AlertTitle>
          <AlertDescription>
            Acelera la configuración de tu sistema importando datos desde archivos Excel o CSV. 
            Descarga las plantillas, completa los datos y súbelos aquí.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="import" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Importar Datos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            {/* Upload Progress */}
            {isUploading && (
              <Card>
                <CardHeader>
                  <CardTitle>Procesando importación...</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {uploadProgress}% completado
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Import Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.type} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {template.icon}
                      {template.name}
                    </CardTitle>
                    <CardDescription>
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Campos requeridos:</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.map(field => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Ejemplo:</h4>
                      <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded text-wrap">
                        {template.example}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadTemplate(template.type)}
                        className="flex-1"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Plantilla
                      </Button>
                      
                      <ImportDropdown
                        type={template.type}
                        onFileSelect={(file) => handleFileImport(file, template.type)}
                        acceptedTypes=".csv,.xlsx,.xls"
                        disabled={isUploading}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Validation Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Reglas de Validación</CardTitle>
                <CardDescription>
                  Requisitos importantes para una importación exitosa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">RUC/Cédula:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Cédulas: 10 dígitos válidos</li>
                      <li>• RUC: 13 dígitos válidos</li>
                      <li>• Verificación de dígito validador</li>
                      <li>• Sin duplicados en el archivo</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Campos numéricos:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Usar punto (.) para decimales</li>
                      <li>• Sin símbolos de moneda</li>
                      <li>• Valores positivos únicamente</li>
                      <li>• Máximo 2 decimales</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Fechas:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Formato: YYYY-MM-DD</li>
                      <li>• Ejemplo: 2024-07-05</li>
                      <li>• No fechas futuras</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Archivos:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Formatos: CSV, XLSX, XLS</li>
                      <li>• Máximo 1000 registros</li>
                      <li>• Codificación UTF-8</li>
                      <li>• Primera fila con encabezados</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Importaciones</CardTitle>
                <CardDescription>
                  Registro de todas las importaciones realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {importHistory.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            <span className="font-medium">{item.fileName}</span>
                          </div>
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusText(item.status)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {item.recordsImported} importados
                          </div>
                          {item.recordsRejected > 0 && (
                            <div className="text-sm text-red-600">
                              {item.recordsRejected} rechazados
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Tipo: {templates.find(t => t.type === item.type)?.name || item.type}</span>
                        <span>•</span>
                        <span>Fecha: {new Date(item.importedAt).toLocaleDateString('es-EC')}</span>
                      </div>
                      
                      {item.errors && item.errors.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                          <h5 className="text-sm font-medium text-red-800 mb-1">Errores encontrados:</h5>
                          <ul className="text-sm text-red-700 space-y-1">
                            {item.errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
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