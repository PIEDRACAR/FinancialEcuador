import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ExportDropdown } from "@/components/ExportDropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, DollarSign, BarChart3, Building } from "lucide-react";

export default function FinancialStatementsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-12");
  const [selectedStatement, setSelectedStatement] = useState<string | null>(null);

  // Sample financial data for the 5 required statements
  const financialData = {
    balanceGeneral: {
      activos: {
        corrientes: [
          { cuenta: "Caja", monto: 15000 },
          { cuenta: "Bancos", monto: 85000 },
          { cuenta: "Cuentas por Cobrar", monto: 45000 },
          { cuenta: "Inventarios", monto: 120000 }
        ],
        noCorrientes: [
          { cuenta: "Propiedad, Planta y Equipo", monto: 350000 },
          { cuenta: "Depreciación Acumulada", monto: -85000 }
        ]
      },
      pasivos: {
        corrientes: [
          { cuenta: "Cuentas por Pagar", monto: 35000 },
          { cuenta: "Impuestos por Pagar", monto: 12000 }
        ],
        noCorrientes: [
          { cuenta: "Préstamos a Largo Plazo", monto: 180000 }
        ]
      },
      patrimonio: [
        { cuenta: "Capital Social", monto: 250000 },
        { cuenta: "Utilidades Retenidas", monto: 53000 }
      ]
    },
    estadoResultados: [
      { concepto: "Ingresos por Ventas", monto: 850000, tipo: "ingreso" },
      { concepto: "Costo de Ventas", monto: -510000, tipo: "costo" },
      { concepto: "Utilidad Bruta", monto: 340000, tipo: "subtotal" },
      { concepto: "Gastos Operativos", monto: -180000, tipo: "gasto" },
      { concepto: "Gastos Administrativos", monto: -85000, tipo: "gasto" },
      { concepto: "Utilidad Operativa", monto: 75000, tipo: "subtotal" },
      { concepto: "Gastos Financieros", monto: -8000, tipo: "gasto" },
      { concepto: "Utilidad antes de Impuestos", monto: 67000, tipo: "subtotal" },
      { concepto: "Impuesto a la Renta", monto: -14000, tipo: "impuesto" },
      { concepto: "Utilidad Neta", monto: 53000, tipo: "resultado" }
    ],
    flujoEfectivo: [
      { concepto: "Utilidad Neta", monto: 53000, tipo: "operativo" },
      { concepto: "Depreciación", monto: 25000, tipo: "operativo" },
      { concepto: "Cambios en Capital de Trabajo", monto: -15000, tipo: "operativo" },
      { concepto: "Flujo de Efectivo Operativo", monto: 63000, tipo: "subtotal" },
      { concepto: "Compra de Activos Fijos", monto: -45000, tipo: "inversion" },
      { concepto: "Flujo de Efectivo de Inversión", monto: -45000, tipo: "subtotal" },
      { concepto: "Préstamos Obtenidos", monto: 30000, tipo: "financiamiento" },
      { concepto: "Pago de Dividendos", monto: -20000, tipo: "financiamiento" },
      { concepto: "Flujo de Efectivo de Financiamiento", monto: 10000, tipo: "subtotal" },
      { concepto: "Aumento Neto en Efectivo", monto: 28000, tipo: "resultado" }
    ],
    estadoPatrimonio: [
      { concepto: "Saldo Inicial", capital: 250000, utilidades: 20000, total: 270000 },
      { concepto: "Utilidad del Ejercicio", capital: 0, utilidades: 53000, total: 53000 },
      { concepto: "Dividendos Pagados", capital: 0, utilidades: -20000, total: -20000 },
      { concepto: "Saldo Final", capital: 250000, utilidades: 53000, total: 303000 }
    ],
    notasExplicativas: [
      {
        numero: 1,
        titulo: "Políticas Contables",
        contenido: "Las políticas contables aplicadas están en conformidad con las NIIF para PYMES vigentes en Ecuador."
      },
      {
        numero: 2,
        titulo: "Efectivo y Equivalentes",
        contenido: "El efectivo incluye caja chica, depósitos bancarios a la vista y certificados de depósito."
      },
      {
        numero: 3,
        titulo: "Cuentas por Cobrar",
        contenido: "Las cuentas por cobrar se registran al valor nominal menos provisión por incobrabilidad."
      }
    ]
  };

  const statements = [
    {
      id: "balance-general",
      title: "Balance General",
      subtitle: "Estado de Situación Financiera",
      icon: BarChart3,
      description: "Activos, pasivos y patrimonio al corte del período",
      data: financialData.balanceGeneral,
      color: "bg-blue-50 border-blue-200"
    },
    {
      id: "estado-resultados", 
      title: "Estado de Resultados",
      subtitle: "Estado de Pérdidas y Ganancias",
      icon: TrendingUp,
      description: "Ingresos, costos y gastos del período",
      data: financialData.estadoResultados,
      color: "bg-green-50 border-green-200"
    },
    {
      id: "flujo-efectivo",
      title: "Flujo de Efectivo",
      subtitle: "Estado de Flujos de Efectivo",
      icon: DollarSign,
      description: "Entradas y salidas de efectivo por actividades",
      data: financialData.flujoEfectivo,
      color: "bg-purple-50 border-purple-200"
    },
    {
      id: "estado-patrimonio",
      title: "Estado de Patrimonio",
      subtitle: "Estado de Cambios en el Patrimonio",
      icon: Building,
      description: "Variaciones en las cuentas patrimoniales",
      data: financialData.estadoPatrimonio,
      color: "bg-orange-50 border-orange-200"
    },
    {
      id: "notas-explicativas",
      title: "Notas Explicativas",
      subtitle: "Notas a los Estados Financieros",
      icon: FileText,
      description: "Revelaciones y políticas contables aplicadas",
      data: financialData.notasExplicativas,
      color: "bg-gray-50 border-gray-200"
    }
  ];

  const viewStatement = (statementId: string) => {
    setSelectedStatement(statementId);
  };

  const renderSelectedStatement = () => {
    const statement = statements.find(s => s.id === selectedStatement);
    if (!statement) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <statement.icon className="w-5 h-5" />
                {statement.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{statement.subtitle}</p>
              <Badge variant="outline" className="mt-2">Período: {selectedPeriod}</Badge>
            </div>
            <div className="flex gap-2">
              <ExportDropdown
                data={Array.isArray(statement.data) ? statement.data : 
                      statement.id === 'balance-general' ? [
                        ...statement.data.activos.corrientes.map((item: any) => ({...item, tipo: 'Activo Corriente'})),
                        ...statement.data.activos.noCorrientes.map((item: any) => ({...item, tipo: 'Activo No Corriente'})),
                        ...statement.data.pasivos.corrientes.map((item: any) => ({...item, tipo: 'Pasivo Corriente'})),
                        ...statement.data.pasivos.noCorrientes.map((item: any) => ({...item, tipo: 'Pasivo No Corriente'})),
                        ...statement.data.patrimonio.map((item: any) => ({...item, tipo: 'Patrimonio'}))
                      ] : [statement.data]
                }
                filename={statement.id}
                title={statement.title}
                subtitle={`Período: ${selectedPeriod} - ${statement.subtitle}`}
                headers={statement.id === 'balance-general' ? ['Tipo', 'Cuenta', 'Monto'] :
                        statement.id === 'estado-resultados' ? ['Concepto', 'Monto', 'Tipo'] :
                        statement.id === 'flujo-efectivo' ? ['Concepto', 'Monto', 'Tipo'] :
                        statement.id === 'estado-patrimonio' ? ['Concepto', 'Capital', 'Utilidades', 'Total'] :
                        ['Numero', 'Titulo', 'Contenido']}
              />
              <Button variant="outline" onClick={() => setSelectedStatement(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {statement.id === 'balance-general' && (
            <BalanceGeneralView data={statement.data} />
          )}
          {statement.id === 'estado-resultados' && (
            <EstadoResultadosView data={statement.data} />
          )}
          {statement.id === 'flujo-efectivo' && (
            <FlujoEfectivoView data={statement.data} />
          )}
          {statement.id === 'estado-patrimonio' && (
            <EstadoPatrimonioView data={statement.data} />
          )}
          {statement.id === 'notas-explicativas' && (
            <NotasExplicativasView data={statement.data} />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout title="Estados Financieros" subtitle="Estados financieros según normativa ecuatoriana NIIF para PYMES">
      <div className="space-y-6">
        {/* Period Selection and Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium">Período:</label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="2024-12">Diciembre 2024</option>
              <option value="2024-11">Noviembre 2024</option>
              <option value="2024-10">Octubre 2024</option>
              <option value="2024-09">Septiembre 2024</option>
              <option value="2024-08">Agosto 2024</option>
              <option value="2024-07">Julio 2024</option>
            </select>
          </div>
          <ExportDropdown
            data={statements.map(s => ({
              estado: s.title,
              descripcion: s.description,
              periodo: selectedPeriod,
              cumplimiento: "NIIF para PYMES Ecuador"
            }))}
            filename="resumen_estados_financieros"
            title="Resumen de Estados Financieros"
            subtitle={`Período: ${selectedPeriod} - Cumplimiento normativo Ecuador`}
            headers={['Estado', 'Descripción', 'Período', 'Cumplimiento']}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {statements.map((statement) => (
            <Card key={statement.id} className={`hover:shadow-lg transition-shadow cursor-pointer ${statement.color}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <statement.icon className="w-4 h-4" />
                  {statement.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-3">
                  {statement.description}
                </p>
                <Button 
                  size="sm"
                  className="w-full" 
                  onClick={() => viewStatement(statement.id)}
                >
                  Ver Detalle
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Financial Statements Grid - Detailed View */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {statements.map((statement) => (
            <Card key={`detail-${statement.id}`} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <statement.icon className="w-5 h-5 text-blue-600" />
                  {statement.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{statement.subtitle}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {statement.description}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => viewStatement(statement.id)}
                  >
                    Ver Completo
                  </Button>
                  <ExportDropdown
                    data={Array.isArray(statement.data) ? statement.data : [statement.data]}
                    filename={statement.id}
                    title={statement.title}
                    subtitle={`${statement.subtitle} - Período: ${selectedPeriod}`}
                    headers={statement.id === 'balance-general' ? ['Cuenta', 'Monto'] :
                            statement.id === 'estado-resultados' ? ['Concepto', 'Monto'] :
                            statement.id === 'flujo-efectivo' ? ['Concepto', 'Monto'] :
                            statement.id === 'estado-patrimonio' ? ['Concepto', 'Total'] :
                            ['Titulo', 'Contenido']}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Render Selected Statement */}
        {renderSelectedStatement()}
      </div>
    </DashboardLayout>
  );
}

// Component views for each financial statement
function BalanceGeneralView({ data }: { data: any }) {
  const totalActivos = [...data.activos.corrientes, ...data.activos.noCorrientes].reduce((sum, item) => sum + item.monto, 0);
  const totalPasivos = [...data.pasivos.corrientes, ...data.pasivos.noCorrientes].reduce((sum, item) => sum + item.monto, 0);
  const totalPatrimonio = data.patrimonio.reduce((sum: number, item: any) => sum + item.monto, 0);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-blue-700 border-b pb-2">ACTIVOS</h3>
        
        <div>
          <h4 className="font-semibold mb-3 text-green-700">Activos Corrientes</h4>
          {data.activos.corrientes.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-sm">{item.cuenta}</span>
              <span className="text-sm font-medium">${item.monto.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 font-medium border-t mt-2">
            <span>Total Activos Corrientes</span>
            <span>${data.activos.corrientes.reduce((sum: number, item: any) => sum + item.monto, 0).toLocaleString()}</span>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3 text-green-700">Activos No Corrientes</h4>
          {data.activos.noCorrientes.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-sm">{item.cuenta}</span>
              <span className={`text-sm font-medium ${item.monto < 0 ? 'text-red-600' : ''}`}>
                ${item.monto.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-2 font-medium border-t mt-2">
            <span>Total Activos No Corrientes</span>
            <span>${data.activos.noCorrientes.reduce((sum: number, item: any) => sum + item.monto, 0).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="border-t-2 pt-3 bg-blue-50 p-3 rounded">
          <div className="flex justify-between font-bold text-lg">
            <span>TOTAL ACTIVOS</span>
            <span className="text-blue-700">${totalActivos.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg text-red-700 border-b pb-2">PASIVOS Y PATRIMONIO</h3>
        
        <div>
          <h4 className="font-semibold mb-3 text-orange-700">Pasivos Corrientes</h4>
          {data.pasivos.corrientes.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-sm">{item.cuenta}</span>
              <span className="text-sm font-medium">${item.monto.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 font-medium border-t mt-2">
            <span>Total Pasivos Corrientes</span>
            <span>${data.pasivos.corrientes.reduce((sum: number, item: any) => sum + item.monto, 0).toLocaleString()}</span>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3 text-orange-700">Pasivos No Corrientes</h4>
          {data.pasivos.noCorrientes.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-sm">{item.cuenta}</span>
              <span className="text-sm font-medium">${item.monto.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 font-medium border-t mt-2">
            <span>Total Pasivos No Corrientes</span>
            <span>${data.pasivos.noCorrientes.reduce((sum: number, item: any) => sum + item.monto, 0).toLocaleString()}</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-purple-700">Patrimonio</h4>
          {data.patrimonio.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-sm">{item.cuenta}</span>
              <span className="text-sm font-medium">${item.monto.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 font-medium border-t mt-2">
            <span>Total Patrimonio</span>
            <span>${totalPatrimonio.toLocaleString()}</span>
          </div>
        </div>

        <div className="border-t-2 pt-3 bg-red-50 p-3 rounded">
          <div className="flex justify-between font-bold text-lg">
            <span>TOTAL PASIVOS + PATRIMONIO</span>
            <span className="text-red-700">${(totalPasivos + totalPatrimonio).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EstadoResultadosView({ data }: { data: any[] }) {
  return (
    <div className="space-y-2">
      <h3 className="font-bold text-lg text-green-700 border-b pb-2 mb-4">ESTADO DE RESULTADOS</h3>
      {data.map((item, idx) => (
        <div key={idx} className={`flex justify-between py-2 px-2 rounded ${
          item.tipo === 'subtotal' || item.tipo === 'resultado' ? 'bg-gray-100 border font-semibold' : 'hover:bg-gray-50'
        } ${item.tipo === 'resultado' ? 'bg-green-100 border-green-300 font-bold text-green-800' : ''}`}>
          <span className={item.tipo === 'resultado' ? 'font-bold' : ''}>{item.concepto}</span>
          <span className={`${
            item.monto < 0 ? 'text-red-600' : 
            item.tipo === 'resultado' ? 'text-green-700 font-bold' : 
            item.tipo === 'subtotal' ? 'font-semibold' : ''
          }`}>
            {item.monto < 0 ? '(' : ''}${Math.abs(item.monto).toLocaleString()}{item.monto < 0 ? ')' : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

function FlujoEfectivoView({ data }: { data: any[] }) {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg text-purple-700 border-b pb-2">ESTADO DE FLUJOS DE EFECTIVO</h3>
      
      <div>
        <h4 className="font-semibold mb-3 text-blue-600 bg-blue-50 p-2 rounded">Actividades Operativas</h4>
        {data.filter(item => item.tipo === 'operativo' || (item.tipo === 'subtotal' && item.concepto.includes('Operativo'))).map((item, idx) => (
          <div key={idx} className={`flex justify-between py-1 px-2 ${item.tipo === 'subtotal' ? 'border-t font-semibold bg-blue-100 rounded' : ''}`}>
            <span>{item.concepto}</span>
            <span className={item.tipo === 'subtotal' ? 'font-bold text-blue-700' : ''}>${item.monto.toLocaleString()}</span>
          </div>
        ))}
      </div>
      
      <div>
        <h4 className="font-semibold mb-3 text-orange-600 bg-orange-50 p-2 rounded">Actividades de Inversión</h4>
        {data.filter(item => item.tipo === 'inversion' || (item.tipo === 'subtotal' && item.concepto.includes('Inversión'))).map((item, idx) => (
          <div key={idx} className={`flex justify-between py-1 px-2 ${item.tipo === 'subtotal' ? 'border-t font-semibold bg-orange-100 rounded' : ''}`}>
            <span>{item.concepto}</span>
            <span className={`${item.monto < 0 ? 'text-red-600' : ''} ${item.tipo === 'subtotal' ? 'font-bold text-orange-700' : ''}`}>
              {item.monto < 0 ? '(' : ''}${Math.abs(item.monto).toLocaleString()}{item.monto < 0 ? ')' : ''}
            </span>
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-semibold mb-3 text-green-600 bg-green-50 p-2 rounded">Actividades de Financiamiento</h4>
        {data.filter(item => item.tipo === 'financiamiento' || (item.tipo === 'subtotal' && item.concepto.includes('Financiamiento'))).map((item, idx) => (
          <div key={idx} className={`flex justify-between py-1 px-2 ${item.tipo === 'subtotal' ? 'border-t font-semibold bg-green-100 rounded' : ''}`}>
            <span>{item.concepto}</span>
            <span className={`${item.monto < 0 ? 'text-red-600' : ''} ${item.tipo === 'subtotal' ? 'font-bold text-green-700' : ''}`}>
              {item.monto < 0 ? '(' : ''}${Math.abs(item.monto).toLocaleString()}{item.monto < 0 ? ')' : ''}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t-2 pt-3 bg-purple-50 p-3 rounded">
        {data.filter(item => item.tipo === 'resultado').map((item, idx) => (
          <div key={idx} className="flex justify-between py-1 font-bold text-lg text-purple-700">
            <span>{item.concepto}</span>
            <span>${item.monto.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EstadoPatrimonioView({ data }: { data: any[] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-orange-700 border-b pb-2">ESTADO DE CAMBIOS EN EL PATRIMONIO</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-orange-100">
              <th className="text-left py-3 px-4 border border-gray-300 font-semibold">Concepto</th>
              <th className="text-right py-3 px-4 border border-gray-300 font-semibold">Capital Social</th>
              <th className="text-right py-3 px-4 border border-gray-300 font-semibold">Utilidades Retenidas</th>
              <th className="text-right py-3 px-4 border border-gray-300 font-semibold">Total Patrimonio</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className={`${idx === data.length - 1 ? 'bg-orange-50 font-bold' : 'hover:bg-gray-50'}`}>
                <td className="py-3 px-4 border border-gray-300">{item.concepto}</td>
                <td className="text-right py-3 px-4 border border-gray-300">${item.capital.toLocaleString()}</td>
                <td className={`text-right py-3 px-4 border border-gray-300 ${item.utilidades < 0 ? 'text-red-600' : ''}`}>
                  {item.utilidades < 0 ? '(' : ''}${Math.abs(item.utilidades).toLocaleString()}{item.utilidades < 0 ? ')' : ''}
                </td>
                <td className={`text-right py-3 px-4 border border-gray-300 font-medium ${idx === data.length - 1 ? 'text-orange-700 font-bold' : ''}`}>
                  ${item.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotasExplicativasView({ data }: { data: any[] }) {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg text-gray-700 border-b pb-2">NOTAS A LOS ESTADOS FINANCIEROS</h3>
      {data.map((nota, idx) => (
        <div key={idx} className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-r-lg">
          <h4 className="font-semibold text-blue-800 mb-2">
            Nota {nota.numero}: {nota.titulo}
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">{nota.contenido}</p>
        </div>
      ))}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Cumplimiento Normativo:</strong> Estos estados financieros han sido preparados de conformidad 
          con las Normas Internacionales de Información Financiera para Pequeñas y Medianas Entidades (NIIF para PYMES) 
          adoptadas en Ecuador y la normativa del Servicio de Rentas Internas (SRI).
        </p>
      </div>
    </div>
  );
}