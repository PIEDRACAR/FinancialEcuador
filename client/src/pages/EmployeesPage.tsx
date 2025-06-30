import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, DollarSign, Calendar, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { CreateEmployeeModal } from "@/components/CreateEmployeeModal";
import { PayrollModal } from "@/components/PayrollModal";

export default function EmployeesPage() {
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createEmployeeOpen, setCreateEmployeeOpen] = useState(false);
  const [payrollOpen, setPayrollOpen] = useState(false);

  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const { data: payrolls = [], isLoading: payrollsLoading } = useQuery({
    queryKey: ['/api/payrolls', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const generatePayrollMutation = useMutation({
    mutationFn: async (period: string) => {
      const response = await fetch('/api/payrolls/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({ companyId: selectedCompany?.id, period }),
      });
      if (!response.ok) throw new Error('Error al generar nómina');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payrolls'] });
      toast({
        title: "Nómina generada",
        description: "La nómina se ha calculado automáticamente con descuentos del IESS",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo generar la nómina",
        variant: "destructive",
      });
    },
  });

  const activeEmployees = employees.filter((emp: any) => emp.isActive);
  const totalSalaries = activeEmployees.reduce((sum: number, emp: any) => sum + parseFloat(emp.salary || '0'), 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthPayrolls = payrolls.filter((p: any) => p.period === currentMonth);

  const stats = [
    {
      title: "Empleados Activos",
      value: activeEmployees.length.toString(),
      icon: Users,
      description: "Personal en planilla",
    },
    {
      title: "Masa Salarial",
      value: "$" + totalSalaries.toLocaleString(),
      icon: DollarSign,
      description: "Salarios mensuales",
    },
    {
      title: "Nóminas Generadas",
      value: currentMonthPayrolls.length.toString(),
      icon: Calendar,
      description: "Mes actual",
    },
    {
      title: "Carga Patronal",
      value: (totalSalaries * 0.1215).toFixed(0),
      icon: Calculator,
      description: "IESS patronal mensual",
    },
  ];

  return (
    <DashboardLayout
      title="Gestión de Empleados y Nómina"
      subtitle="Administra el personal y genera nóminas con cálculos automáticos del IESS"
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setCreateEmployeeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Empleado
          </Button>
          <Button variant="outline" onClick={() => setPayrollOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Generar Nómina
          </Button>
          <Button 
            variant="outline" 
            onClick={() => generatePayrollMutation.mutate(currentMonth)}
            disabled={generatePayrollMutation.isPending}
          >
            <Calculator className="mr-2 h-4 w-4" />
            {generatePayrollMutation.isPending ? "Calculando..." : "Calcular Nómina Automática"}
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Empleados</TabsTrigger>
            <TabsTrigger value="payrolls">Nóminas</TabsTrigger>
            <TabsTrigger value="benefits">Beneficios Sociales</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Empleados</CardTitle>
                <CardDescription>
                  Gestión del personal de la empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                {employeesLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Sin empleados registrados</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comienza agregando empleados a tu empresa.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {employees.map((employee: any) => (
                      <div key={employee.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {employee.firstName} {employee.lastName}
                              </span>
                              <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                                {employee.isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {employee.position} • {employee.department || 'Sin departamento'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Cédula: {employee.cedula} • Salario: ${parseFloat(employee.salary).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Ingreso: {new Date(employee.startDate).toLocaleDateString('es-EC')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payrolls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nóminas Generadas</CardTitle>
                <CardDescription>
                  Histórico de nóminas con cálculos automáticos del IESS
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payrollsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : payrolls.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Sin nóminas generadas</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Genera tu primera nómina del mes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(
                      payrolls.reduce((acc: any, payroll: any) => {
                        if (!acc[payroll.period]) acc[payroll.period] = [];
                        acc[payroll.period].push(payroll);
                        return acc;
                      }, {})
                    ).map(([period, periodPayrolls]: [string, any]) => (
                      <div key={period} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">
                          Nómina {new Date(period + '-01').toLocaleDateString('es-EC', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </h4>
                        <div className="space-y-2">
                          {periodPayrolls.map((payroll: any) => {
                            const employee = employees.find((emp: any) => emp.id === payroll.employeeId);
                            return (
                              <div key={payroll.id} className="flex items-center justify-between text-sm border-l-4 border-blue-500 pl-3">
                                <div>
                                  <span className="font-medium">
                                    {employee?.firstName} {employee?.lastName}
                                  </span>
                                  <div className="text-muted-foreground">
                                    Base: ${parseFloat(payroll.baseSalary).toLocaleString()} • 
                                    IESS: ${parseFloat(payroll.iessEmployee).toLocaleString()} • 
                                    Neto: ${parseFloat(payroll.netSalary).toLocaleString()}
                                  </div>
                                </div>
                                <Badge variant={payroll.status === 'pagada' ? 'default' : 'secondary'}>
                                  {payroll.status}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Beneficios Sociales</CardTitle>
                <CardDescription>
                  Cálculo de décimos, vacaciones y otros beneficios según ley ecuatoriana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Décimo Tercer Sueldo</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Calculado automáticamente según ingresos del año
                    </p>
                    <div className="text-2xl font-bold text-green-600">
                      ${(totalSalaries / 12).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Promedio por empleado</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Décimo Cuarto Sueldo</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Basado en salario básico unificado
                    </p>
                    <div className="text-2xl font-bold text-green-600">
                      $460.00
                    </div>
                    <p className="text-xs text-muted-foreground">Por empleado anual</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Fondos de Reserva</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Después del primer año de trabajo
                    </p>
                    <div className="text-2xl font-bold text-blue-600">
                      ${(totalSalaries * 0.0833).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Mensual acumulado</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Vacaciones</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      15 días por año trabajado
                    </p>
                    <div className="text-2xl font-bold text-purple-600">
                      ${(totalSalaries / 24).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Promedio por empleado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateEmployeeModal 
        open={createEmployeeOpen} 
        onOpenChange={setCreateEmployeeOpen} 
      />
      <PayrollModal 
        open={payrollOpen} 
        onOpenChange={setPayrollOpen} 
      />
    </DashboardLayout>
  );
}