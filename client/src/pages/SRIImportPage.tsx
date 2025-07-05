import { useState } from "react";
import { Upload, FileText, Download, AlertCircle, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function SRIImportPage() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          // Add mock uploaded files
          setUploadedFiles([
            { name: "ATS_102024.xml", type: "ATS", status: "success", size: "2.3 MB" },
            { name: "Retenciones_102024.xml", type: "Retenciones", status: "success", size: "1.8 MB" },
            { name: "Ventas_102024.xml", type: "Ventas", status: "warning", size: "3.1 MB" }
          ]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadTemplate = (type: string) => {
    const templates = {
      ATS: "plantilla_ats_sri.xml",
      Retenciones: "plantilla_retenciones_sri.xml",
      Ventas: "plantilla_ventas_sri.xml",
      Compras: "plantilla_compras_sri.xml"
    };
    
    // Create mock download
    const element = document.createElement("a");
    element.href = `data:text/xml;charset=utf-8,<?xml version="1.0" encoding="UTF-8"?><${type}></${type}>`;
    element.download = templates[type as keyof typeof templates] || "plantilla_sri.xml";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <DashboardLayout 
      title="Importar/Exportar SRI" 
      subtitle="Gestión de archivos XML para reportes del SRI"
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">ATS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <p className="text-xs text-gray-600 mt-1">Archivos procesados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Retenciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">8</div>
              <p className="text-xs text-gray-600 mt-1">Archivos validados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">3</div>
              <p className="text-xs text-gray-600 mt-1">Con observaciones</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Compras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">15</div>
              <p className="text-xs text-gray-600 mt-1">Total procesados</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Subir Archivos</TabsTrigger>
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Subir Archivos XML del SRI
                </CardTitle>
                <CardDescription>
                  Selecciona los archivos XML generados por el SRI para importar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Arrastra y suelta archivos XML aquí</p>
                    <p className="text-sm text-gray-500 mb-4">o haz clic para seleccionar</p>
                    <input
                      type="file"
                      multiple
                      accept=".xml"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Seleccionar Archivos
                      </Button>
                    </label>
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subiendo archivos...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}
                  
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Archivos Subidos</h4>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-gray-500">{file.size}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={file.status === 'success' ? 'default' : 'secondary'}>
                              {file.type}
                            </Badge>
                            {file.status === 'success' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Plantillas XML del SRI
                </CardTitle>
                <CardDescription>
                  Descarga las plantillas oficiales para generar archivos XML
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "ATS", desc: "Anexo Transaccional Simplificado", icon: "📊" },
                    { name: "Retenciones", desc: "Archivo de Retenciones", icon: "🧾" },
                    { name: "Ventas", desc: "Reporte de Ventas", icon: "💰" },
                    { name: "Compras", desc: "Reporte de Compras", icon: "🛒" }
                  ].map((template) => (
                    <div key={template.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{template.icon}</div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-gray-500">{template.desc}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadTemplate(template.name)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Importaciones</CardTitle>
                <CardDescription>
                  Registro de todos los archivos procesados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: "2024-12-15", file: "ATS_122024.xml", type: "ATS", status: "success", records: 1250 },
                    { date: "2024-12-14", file: "Retenciones_122024.xml", type: "Retenciones", status: "success", records: 890 },
                    { date: "2024-12-13", file: "Ventas_122024.xml", type: "Ventas", status: "warning", records: 2100 },
                    { date: "2024-12-12", file: "Compras_122024.xml", type: "Compras", status: "success", records: 1560 }
                  ].map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">{record.date}</p>
                          <p className="text-xs text-gray-500">Fecha</p>
                        </div>
                        <div>
                          <p className="font-medium">{record.file}</p>
                          <p className="text-sm text-gray-500">{record.records} registros procesados</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={record.status === 'success' ? 'default' : 'secondary'}>
                          {record.type}
                        </Badge>
                        {record.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Instructions */}
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            <strong>Importante:</strong> Los archivos XML deben estar en formato SRI válido. 
            Verifica que los archivos estén firmados digitalmente antes de subirlos.
          </AlertDescription>
        </Alert>
      </div>
    </DashboardLayout>
  );
}