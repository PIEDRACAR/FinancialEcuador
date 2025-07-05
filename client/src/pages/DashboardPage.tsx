import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton, CompanySelectionSkeleton } from "@/components/LoadingStates";
import { NoCompaniesState } from "@/components/EmptyStates";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, FileText, DollarSign, TrendingUp, AlertCircle, Plus, UserPlus, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "wouter";
import { useState } from "react";
import CreateCompanyModal from "@/components/CreateCompanyModal";
import type { Client, Invoice } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedCompany, companies, isLoading: companyLoading } = useCompany();
  const { stats, refreshData, isRefreshing } = useDashboard();
  const [showCreateCompany, setShowCreateCompany] = useState(false);

  if (companyLoading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Cargando información de la empresa...">
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (companies.length === 0) {
    return (
      <DashboardLayout title="Bienvenido" subtitle="Configura tu primera empresa">
        <NoCompaniesState onCreateCompany={() => setShowCreateCompany(true)} />
        <CreateCompanyModal 
          open={showCreateCompany} 
          onOpenChange={setShowCreateCompany} 
        />
      </DashboardLayout>
    );
  }

  if (!selectedCompany) {
    return (
      <DashboardLayout
        title="Dashboard"
        subtitle="Selecciona una empresa para continuar"
      >
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay empresa seleccionada</h3>
              <p className="mt-1 text-sm text-gray-500">
                Selecciona una empresa desde el menú lateral para ver el dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Use dashboard statistics from context
  const {
    totalClients,
    activeClients,
    totalInvoices,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    totalRevenue,
    collectionRate,
    recentInvoices,
    monthlyGrowth,
    isLoading
  } = stats;

  return (
    <DashboardLayout
      title={`Dashboard - ${selectedCompany.name}`}
      subtitle={`Bienvenido, ${user?.name || 'Usuario'}`}
    >
      <div className="space-y-6">
        {/* Company Welcome Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCompany.name}
                </h2>
                <p className="text-gray-600">
                  {selectedCompany.ruc ? `RUC: ${selectedCompany.ruc}` : 'Gestiona toda tu contabilidad desde un solo lugar'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Empresa activa</p>
                <Badge variant="default" className="mt-1">Activa</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalClients}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeClients} activos
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturas Emitidas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalInvoices}</div>
                  <p className="text-xs text-muted-foreground">
                    {paidInvoices} pagadas, {pendingInvoices} pendientes
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    ${totalRevenue.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    De facturas pagadas
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Cobro</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{collectionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Eficiencia de cobro
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
          {/* Facturas recientes */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Facturas Recientes</CardTitle>
              <CardDescription>
                Últimas facturas emitidas para {selectedCompany.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="ml-auto space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentInvoices.length > 0 ? (
                <div className="space-y-4">
                  {recentInvoices.map((invoice: any) => {
                    // For demo purposes, we'll show client as "Cliente" + invoice ID
                    return (
                      <div key={invoice.id} className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            Cliente #{invoice.clientId}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            Factura #{invoice.number} - {invoice.date ? format(new Date(invoice.date), 'dd MMM yyyy', { locale: es }) : 'Fecha no disponible'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            ${parseFloat(invoice.total || '0').toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                          </span>
                          <Badge 
                            variant={
                              invoice.status === "pagada" ? "default" :
                              invoice.status === "pendiente" ? "secondary" : "destructive"
                            }
                          >
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No hay facturas</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Comienza creando tu primera factura.
                  </p>
                  <div className="mt-6">
                    <Link href="/invoices">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Factura
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Acciones rápidas */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Tareas frecuentes para gestionar {selectedCompany.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/dashboard/invoices">
                <Button className="justify-start w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Nueva Factura
                </Button>
              </Link>
              <Link href="/dashboard/clients">
                <Button className="justify-start w-full" variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Agregar Cliente
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button className="justify-start w-full" variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  Configurar Empresa
                </Button>
              </Link>
              <Link href="/dashboard/reports">
                <Button className="justify-start w-full" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Ver Reportes
                </Button>
              </Link>
              <Link href="/dashboard/financial-statements">
                <Button className="justify-start w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Estados Financieros
                </Button>
              </Link>
              <Link href="/dashboard/electronic-invoicing">
                <Button className="justify-start w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Facturación Electrónica
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Alertas y notificaciones */}
        {(overdueInvoices > 0 || pendingInvoices > 5) && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Alertas y Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueInvoices > 0 && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm text-red-800">
                      Tienes {overdueInvoices} facturas vencidas que requieren atención
                    </span>
                  </div>
                )}
                {pendingInvoices > 5 && (
                  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      Tienes {pendingInvoices} facturas pendientes de cobro
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información de la empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-4 w-4" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">NOMBRE</h4>
                <p className="text-sm">{selectedCompany.name}</p>
              </div>
              {selectedCompany.ruc && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">RUC</h4>
                  <p className="text-sm">{selectedCompany.ruc}</p>
                </div>
              )}
              {selectedCompany.address && (
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">DIRECCIÓN</h4>
                  <p className="text-sm">{selectedCompany.address}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">FECHA DE CREACIÓN</h4>
                <p className="text-sm">
                  {format(new Date(selectedCompany.createdAt), 'dd MMMM yyyy', { locale: es })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
