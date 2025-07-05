import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, Download, Upload, CheckCircle, XCircle, Clock } from "lucide-react";

export default function ElectronicInvoicingPage() {
  return (
    <DashboardLayout title="Facturación Electrónica" subtitle="Gestiona facturas electrónicas según normativa SRI">
      <div className="space-y-6">
        {/* Nueva Factura Electrónica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Nueva Factura Electrónica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero-factura">Número de Factura</Label>
                <Input id="numero-factura" placeholder="001-001-000000001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha-emision">Fecha de Emisión</Label>
                <Input id="fecha-emision" type="date" />
              </div>
            </div>
            <Button className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Crear Factura Electrónica
            </Button>
          </CardContent>
        </Card>

        {/* Estado de Facturas */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Facturas Electrónicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <div>
                    <p className="font-medium">001-001-000000001</p>
                    <p className="text-sm text-gray-600">Cliente ABC S.A.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Autorizada
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    XML
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <div>
                    <p className="font-medium">001-001-000000002</p>
                    <p className="text-sm text-gray-600">Cliente XYZ Ltda.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Pendiente
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Send className="w-4 h-4 mr-1" />
                    Enviar
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <div>
                    <p className="font-medium">001-001-000000003</p>
                    <p className="text-sm text-gray-600">Cliente 123 S.A.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rechazada
                  </Badge>
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-1" />
                    Ver Error
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración SRI */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración SRI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ambiente-sri">Ambiente SRI</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Pruebas</option>
                  <option>Producción</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="establecimiento">Establecimiento</Label>
                <Input id="establecimiento" placeholder="001" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificado">Certificado Digital (.p12)</Label>
              <Input id="certificado" type="file" accept=".p12,.pfx" />
            </div>
            <Button>
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>

        {/* Firma Electrónica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Firma Electrónica para Facturas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Sube tu firma electrónica para firmar automáticamente las facturas.
            </p>
            <div className="space-y-2">
              <Label htmlFor="firma-factura">Archivo de Firma (.p12)</Label>
              <Input id="firma-factura" type="file" accept=".p12,.pfx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-firma-factura">Contraseña de la Firma</Label>
              <Input id="password-firma-factura" type="password" placeholder="Ingresa la contraseña" />
            </div>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Configurar Firma Electrónica
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}