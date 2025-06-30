import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Calculator } from "lucide-react";

interface FinancialStatementsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FinancialStatementsModal({ open, onOpenChange }: FinancialStatementsModalProps) {
  const [selectedStatement, setSelectedStatement] = useState<string | null>(null);

  const financialStatements = [
    {
      id: "balance-sheet",
      name: "Balance General",
      description: "Estado de situación financiera con activos, pasivos y patrimonio",
      icon: Calculator,
      required: "Obligatorio - SRI Ecuador",
    },
    {
      id: "income-statement",
      name: "Estado de Resultados",
      description: "Ingresos, gastos y utilidad del período contable",
      icon: FileText,
      required: "Obligatorio - SRI Ecuador",
    },
    {
      id: "cash-flow",
      name: "Estado de Flujo de Efectivo",
      description: "Movimientos de efectivo por actividades operacionales, inversión y financiamiento",
      icon: FileText,
      required: "Obligatorio - SRI Ecuador",
    },
    {
      id: "equity-changes",
      name: "Estado de Cambios en el Patrimonio",
      description: "Variaciones en las cuentas patrimoniales durante el período",
      icon: FileText,
      required: "Obligatorio - SRI Ecuador",
    },
    {
      id: "notes",
      name: "Notas a los Estados Financieros",
      description: "Información explicativa y complementaria de los estados financieros",
      icon: FileText,
      required: "Obligatorio - SRI Ecuador",
    },
  ];

  const sampleBalanceSheet = {
    activos: {
      corrientes: {
        caja: 5000,
        bancos: 25000,
        cuentasPorCobrar: 15000,
        inventarios: 30000,
        total: 75000
      },
      noCorrientes: {
        propiedadPlantaEquipo: 150000,
        depreciacionAcumulada: -30000,
        total: 120000
      },
      total: 195000
    },
    pasivos: {
      corrientes: {
        cuentasPorPagar: 20000,
        ivaPorPagar: 3000,
        iessPorPagar: 2000,
        total: 25000
      },
      noCorrientes: {
        prestamosBancarios: 50000,
        total: 50000
      },
      total: 75000
    },
    patrimonio: {
      capitalSocial: 100000,
      utilidadesRetenidas: 15000,
      utilidadEjercicio: 5000,
      total: 120000
    }
  };

  const generateStatement = (statementId: string) => {
    console.log(`Generating statement: ${statementId}`);
    setSelectedStatement(statementId);
  };

  const exportStatement = (statementId: string, format: 'pdf' | 'excel') => {
    console.log(`Exporting ${statementId} as ${format}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Estados Financieros
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="generate">Generar Estados</TabsTrigger>
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4">
              <div className="text-sm text-muted-foreground">
                Los 5 estados financieros requeridos por el SRI Ecuador para empresas:
              </div>
              
              {financialStatements.map((statement) => (
                <Card key={statement.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <statement.icon className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">{statement.name}</CardTitle>
                          <CardDescription>{statement.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">{statement.required}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => generateStatement(statement.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Generar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => exportStatement(statement.id, 'pdf')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => exportStatement(statement.id, 'excel')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="generate" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Período de Reporte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Fecha Inicio</label>
                      <input 
                        type="date" 
                        className="w-full p-2 border rounded-md" 
                        defaultValue="2025-01-01"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Fecha Fin</label>
                      <input 
                        type="date" 
                        className="w-full p-2 border rounded-md" 
                        defaultValue="2025-12-31"
                      />
                    </div>
                  </div>
                  <Button className="w-full">
                    Generar Todos los Estados
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Exportación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Formato</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="both">PDF + Excel</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Moneda</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="usd">Dólares USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Incluir notas explicativas</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {selectedStatement === "balance-sheet" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Balance General</CardTitle>
                  <CardDescription>Al 31 de Diciembre de 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-3">ACTIVOS</h4>
                      <div className="space-y-2 text-sm">
                        <div className="font-medium">Activos Corrientes:</div>
                        <div className="ml-4 space-y-1">
                          <div className="flex justify-between">
                            <span>Caja</span>
                            <span>${sampleBalanceSheet.activos.corrientes.caja.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bancos</span>
                            <span>${sampleBalanceSheet.activos.corrientes.bancos.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cuentas por Cobrar</span>
                            <span>${sampleBalanceSheet.activos.corrientes.cuentasPorCobrar.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Inventarios</span>
                            <span>${sampleBalanceSheet.activos.corrientes.inventarios.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Total Activos Corrientes</span>
                            <span>${sampleBalanceSheet.activos.corrientes.total.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="font-medium mt-4">Activos No Corrientes:</div>
                        <div className="ml-4 space-y-1">
                          <div className="flex justify-between">
                            <span>Propiedad, Planta y Equipo</span>
                            <span>${sampleBalanceSheet.activos.noCorrientes.propiedadPlantaEquipo.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>(-) Depreciación Acumulada</span>
                            <span>${sampleBalanceSheet.activos.noCorrientes.depreciacionAcumulada.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Total Activos No Corrientes</span>
                            <span>${sampleBalanceSheet.activos.noCorrientes.total.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between font-bold text-lg border-t-2 pt-2 mt-4">
                          <span>TOTAL ACTIVOS</span>
                          <span>${sampleBalanceSheet.activos.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">PASIVOS Y PATRIMONIO</h4>
                      <div className="space-y-2 text-sm">
                        <div className="font-medium">Pasivos Corrientes:</div>
                        <div className="ml-4 space-y-1">
                          <div className="flex justify-between">
                            <span>Cuentas por Pagar</span>
                            <span>${sampleBalanceSheet.pasivos.corrientes.cuentasPorPagar.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>IVA por Pagar</span>
                            <span>${sampleBalanceSheet.pasivos.corrientes.ivaPorPagar.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>IESS por Pagar</span>
                            <span>${sampleBalanceSheet.pasivos.corrientes.iessPorPagar.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Total Pasivos Corrientes</span>
                            <span>${sampleBalanceSheet.pasivos.corrientes.total.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="font-medium mt-4">Pasivos No Corrientes:</div>
                        <div className="ml-4 space-y-1">
                          <div className="flex justify-between">
                            <span>Préstamos Bancarios</span>
                            <span>${sampleBalanceSheet.pasivos.noCorrientes.prestamosBancarios.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Total Pasivos No Corrientes</span>
                            <span>${sampleBalanceSheet.pasivos.noCorrientes.total.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between font-medium border-t pt-2 mt-4">
                          <span>TOTAL PASIVOS</span>
                          <span>${sampleBalanceSheet.pasivos.total.toLocaleString()}</span>
                        </div>
                        
                        <div className="font-medium mt-4">Patrimonio:</div>
                        <div className="ml-4 space-y-1">
                          <div className="flex justify-between">
                            <span>Capital Social</span>
                            <span>${sampleBalanceSheet.patrimonio.capitalSocial.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Utilidades Retenidas</span>
                            <span>${sampleBalanceSheet.patrimonio.utilidadesRetenidas.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Utilidad del Ejercicio</span>
                            <span>${sampleBalanceSheet.patrimonio.utilidadEjercicio.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Total Patrimonio</span>
                            <span>${sampleBalanceSheet.patrimonio.total.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between font-bold text-lg border-t-2 pt-2 mt-4">
                          <span>TOTAL PASIVOS + PATRIMONIO</span>
                          <span>${(sampleBalanceSheet.pasivos.total + sampleBalanceSheet.patrimonio.total).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Selecciona un Estado Financiero</h3>
                  <p className="text-muted-foreground mb-4">
                    Ve a la pestaña "Resumen" y genera un estado financiero para verlo aquí.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}