import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Download, Printer, Calendar } from "lucide-react";

export default function BalanceSheetPage() {
  const balanceData = {
    activos: {
      corrientes: [
        { account: "Caja", amount: 5000.00 },
        { account: "Bancos", amount: 25000.00 },
        { account: "Cuentas por Cobrar", amount: 15000.00 },
        { account: "Inventarios", amount: 30000.00 }
      ],
      noCorrientes: [
        { account: "Maquinaria y Equipo", amount: 50000.00 },
        { account: "Edificios", amount: 100000.00 },
        { account: "Depreciación Acumulada", amount: -15000.00 }
      ]
    },
    pasivos: {
      corrientes: [
        { account: "Cuentas por Pagar", amount: 12000.00 },
        { account: "IVA por Pagar", amount: 3000.00 },
        { account: "Préstamos Corto Plazo", amount: 8000.00 }
      ],
      noCorrientes: [
        { account: "Préstamos Largo Plazo", amount: 40000.00 }
      ]
    },
    patrimonio: [
      { account: "Capital Social", amount: 100000.00 },
      { account: "Utilidades Retenidas", amount: 47000.00 }
    ]
  };

  const totalActivosCorrientes = balanceData.activos.corrientes.reduce((sum, item) => sum + item.amount, 0);
  const totalActivosNoCorrientes = balanceData.activos.noCorrientes.reduce((sum, item) => sum + item.amount, 0);
  const totalActivos = totalActivosCorrientes + totalActivosNoCorrientes;

  const totalPasivosCorrientes = balanceData.pasivos.corrientes.reduce((sum, item) => sum + item.amount, 0);
  const totalPasivosNoCorrientes = balanceData.pasivos.noCorrientes.reduce((sum, item) => sum + item.amount, 0);
  const totalPasivos = totalPasivosCorrientes + totalPasivosNoCorrientes;

  const totalPatrimonio = balanceData.patrimonio.reduce((sum, item) => sum + item.amount, 0);

  return (
    <DashboardLayout title="Balance General" subtitle="Estado de Situación Financiera">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
          <div className="flex gap-2">
            <div className="space-y-2">
              <Label htmlFor="fecha-corte">Fecha de Corte</Label>
              <Input id="fecha-corte" type="date" defaultValue="2024-12-31" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* ACTIVOS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                ACTIVOS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">ACTIVOS CORRIENTES</h4>
                <div className="space-y-1">
                  {balanceData.activos.corrientes.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.account}</span>
                      <span>${item.amount.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium border-t pt-1">
                    <span>Total Activos Corrientes</span>
                    <span>${totalActivosCorrientes.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">ACTIVOS NO CORRIENTES</h4>
                <div className="space-y-1">
                  {balanceData.activos.noCorrientes.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.account}</span>
                      <span>${item.amount.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium border-t pt-1">
                    <span>Total Activos No Corrientes</span>
                    <span>${totalActivosNoCorrientes.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-base font-bold border-t-2 pt-2">
                <span>TOTAL ACTIVOS</span>
                <span>${totalActivos.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>

          {/* PASIVOS Y PATRIMONIO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                PASIVOS Y PATRIMONIO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">PASIVOS CORRIENTES</h4>
                <div className="space-y-1">
                  {balanceData.pasivos.corrientes.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.account}</span>
                      <span>${item.amount.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium border-t pt-1">
                    <span>Total Pasivos Corrientes</span>
                    <span>${totalPasivosCorrientes.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">PASIVOS NO CORRIENTES</h4>
                <div className="space-y-1">
                  {balanceData.pasivos.noCorrientes.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.account}</span>
                      <span>${item.amount.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium border-t pt-1">
                    <span>Total Pasivos No Corrientes</span>
                    <span>${totalPasivosNoCorrientes.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm font-medium border-t pt-1">
                <span>TOTAL PASIVOS</span>
                <span>${totalPasivos.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">PATRIMONIO</h4>
                <div className="space-y-1">
                  {balanceData.patrimonio.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.account}</span>
                      <span>${item.amount.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium border-t pt-1">
                    <span>Total Patrimonio</span>
                    <span>${totalPatrimonio.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-base font-bold border-t-2 pt-2">
                <span>TOTAL PASIVOS + PATRIMONIO</span>
                <span>${(totalPasivos + totalPatrimonio).toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}