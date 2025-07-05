import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileText } from "lucide-react";

export default function ImportPurchasesPage() {
  return (
    <DashboardLayout title="Importar Compras" subtitle="Importa datos de compras desde archivos Excel o CSV">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Importar Compras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Seleccionar archivo</Label>
              <Input id="file-upload" type="file" accept=".xlsx,.xls,.csv" />
            </div>
            
            <div className="flex gap-2">
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Plantilla Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Formato de Archivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">
              El archivo debe contener las siguientes columnas:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Número de Factura</li>
              <li>• Fecha</li>
              <li>• Proveedor</li>
              <li>• Subtotal</li>
              <li>• IVA</li>
              <li>• Total</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}