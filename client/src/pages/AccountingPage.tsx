import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, BookOpen, Calculator, TrendingUp, BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { CreateJournalEntryModal } from "@/components/CreateJournalEntryModal";
import { ChartOfAccountsModal } from "@/components/ChartOfAccountsModal";
import { FinancialStatementsModal } from "@/components/FinancialStatementsModal";

export default function AccountingPage() {
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createJournalEntryOpen, setCreateJournalEntryOpen] = useState(false);
  const [chartOfAccountsOpen, setChartOfAccountsOpen] = useState(false);
  const [financialStatementsOpen, setFinancialStatementsOpen] = useState(false);

  const { data: journalEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['/api/accounting/journal-entries', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const { data: chartOfAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/accounting/chart-of-accounts', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const { data: accountingStats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/accounting/stats', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const automaticEntryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/accounting/generate-automatic-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({ companyId: selectedCompany?.id }),
      });
      if (!response.ok) throw new Error('Error al generar asientos automáticos');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/journal-entries'] });
      toast({
        title: "Asientos generados",
        description: "Los asientos contables se han generado automáticamente con IA",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron generar los asientos automáticos",
        variant: "destructive",
      });
    },
  });

  const stats = [
    {
      title: "Total Asientos",
      value: journalEntries.length.toString(),
      icon: BookOpen,
      description: "Asientos contables registrados",
    },
    {
      title: "Cuentas Activas",
      value: chartOfAccounts.filter((acc: any) => acc.isActive).length.toString(),
      icon: Calculator,
      description: "Plan de cuentas configurado",
    },
    {
      title: "Balance General",
      value: "$" + (accountingStats.totalAssets || 0).toLocaleString(),
      icon: TrendingUp,
      description: "Total de activos",
    },
    {
      title: "Estados Financieros",
      value: "5",
      icon: BarChart3,
      description: "Reportes disponibles",
    },
  ];

  return (
    <DashboardLayout
      title="Módulo de Contabilidad"
      subtitle="Gestiona el plan de cuentas, asientos contables y estados financieros"
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
          <Button onClick={() => setCreateJournalEntryOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Asiento
          </Button>
          <Button variant="outline" onClick={() => setChartOfAccountsOpen(true)}>
            <Calculator className="mr-2 h-4 w-4" />
            Plan de Cuentas
          </Button>
          <Button variant="outline" onClick={() => setFinancialStatementsOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Estados Financieros
          </Button>
          <Button 
            variant="outline" 
            onClick={() => automaticEntryMutation.mutate()}
            disabled={automaticEntryMutation.isPending}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            {automaticEntryMutation.isPending ? "Generando..." : "Asientos con IA"}
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="journal-entries" className="space-y-4">
          <TabsList>
            <TabsTrigger value="journal-entries">Libro Diario</TabsTrigger>
            <TabsTrigger value="chart-of-accounts">Plan de Cuentas</TabsTrigger>
            <TabsTrigger value="trial-balance">Balance de Comprobación</TabsTrigger>
          </TabsList>

          <TabsContent value="journal-entries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Libro Diario</CardTitle>
                <CardDescription>
                  Registro cronológico de todas las transacciones contables
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entriesLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : journalEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Sin asientos contables</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comienza creando tu primer asiento contable.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {journalEntries.map((entry: any) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">#{entry.number}</Badge>
                              <span className="font-medium">{entry.description}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(entry.date).toLocaleDateString('es-EC')} • {entry.reference || 'Sin referencia'}
                            </p>
                          </div>
                          <Badge variant={entry.type === 'automatic' ? 'default' : 'secondary'}>
                            {entry.type === 'automatic' ? 'Automático' : 'Manual'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart-of-accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plan de Cuentas</CardTitle>
                <CardDescription>
                  Estructura contable de la empresa según normativa ecuatoriana
                </CardDescription>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="space-y-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {['activo', 'pasivo', 'patrimonio', 'ingreso', 'gasto'].map((type) => {
                      const accounts = chartOfAccounts.filter((acc: any) => acc.type === type);
                      return (
                        <div key={type} className="border rounded-lg p-3">
                          <h4 className="font-semibold capitalize mb-2">{type}s</h4>
                          {accounts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Sin cuentas configuradas</p>
                          ) : (
                            <div className="grid gap-1">
                              {accounts.map((account: any) => (
                                <div key={account.id} className="flex items-center justify-between text-sm">
                                  <span>{account.code} - {account.name}</span>
                                  <Badge variant={account.isActive ? 'default' : 'secondary'}>
                                    {account.isActive ? 'Activa' : 'Inactiva'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trial-balance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Balance de Comprobación</CardTitle>
                <CardDescription>
                  Verificación de la igualdad contable: Debe = Haber
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">Balance de Comprobación</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Genera el balance de comprobación con los asientos contables registrados.
                  </p>
                  <Button className="mt-4">Generar Balance</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateJournalEntryModal 
        open={createJournalEntryOpen} 
        onOpenChange={setCreateJournalEntryOpen} 
      />
      <ChartOfAccountsModal 
        open={chartOfAccountsOpen} 
        onOpenChange={setChartOfAccountsOpen} 
      />
      <FinancialStatementsModal 
        open={financialStatementsOpen} 
        onOpenChange={setFinancialStatementsOpen} 
      />
    </DashboardLayout>
  );
}