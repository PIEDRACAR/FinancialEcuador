import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Upload, TrendingUp, DollarSign, BarChart3, PieChart, Calculator } from "lucide-react";

export default function FinancialStatementsPage() {
  return (
    <DashboardLayout title="Estados Financieros" subtitle="Los 5 estados financieros principales para Ecuador">
      <div className="space-y-6">
        {/* Estado de Situación Financiera */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estado de Situación Financiera (Balance General)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Muestra los activos, pasivos y patrimonio de la empresa a una fecha específica.
            </p>
            <div className="flex gap-2">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Generar
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estado de Resultados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Estado de Resultados (P&L)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Presenta los ingresos, costos y gastos para determinar la utilidad o pérdida del período.
            </p>
            <div className="flex gap-2">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Generar
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estado de Flujo de Efectivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Estado de Flujo de Efectivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Muestra los flujos de efectivo de actividades operativas, de inversión y financieras.
            </p>
            <div className="flex gap-2">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Generar
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estado de Cambios en el Patrimonio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Estado de Cambios en el Patrimonio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Detalla las variaciones en las cuentas patrimoniales durante el período.
            </p>
            <div className="flex gap-2">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Generar
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notas a los Estados Financieros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Notas a los Estados Financieros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Explicaciones detalladas y revelaciones complementarias a los estados financieros.
            </p>
            <div className="flex gap-2">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Generar
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Períodos */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Períodos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha-inicio">Fecha de Inicio</Label>
                <Input id="fecha-inicio" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha-fin">Fecha de Fin</Label>
                <Input id="fecha-fin" type="date" />
              </div>
            </div>
            <Button className="w-full">
              Generar Todos los Estados Financieros
            </Button>
          </CardContent>
        </Card>

        {/* Firma Electrónica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Firma Electrónica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Sube tu firma electrónica para firmar digitalmente los estados financieros.
            </p>
            <div className="space-y-2">
              <Label htmlFor="firma-electronica">Archivo de Firma (.p12)</Label>
              <Input id="firma-electronica" type="file" accept=".p12,.pfx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-firma">Contraseña de la Firma</Label>
              <Input id="password-firma" type="password" placeholder="Ingresa la contraseña" />
            </div>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Subir Firma Electrónica
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}