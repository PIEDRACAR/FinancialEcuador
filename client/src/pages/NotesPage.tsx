import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, TrendingDown, TrendingUp, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { CreateNoteModal } from "@/components/CreateNoteModal";

export default function NotesPage() {
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [noteType, setNoteType] = useState<'nota_credito' | 'nota_debito'>('nota_credito');

  // Obtenemos todas las facturas que incluyen notas de crédito y débito
  const { data: allDocuments = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/invoices', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  // Filtrar notas de crédito y débito
  const creditNotes = allDocuments.filter((doc: any) => doc.type === 'nota_credito');
  const debitNotes = allDocuments.filter((doc: any) => doc.type === 'nota_debito');
  const regularInvoices = allDocuments.filter((doc: any) => doc.type === 'factura');

  // Cálculos de montos
  const totalCreditAmount = creditNotes.reduce((sum: number, note: any) => 
    sum + parseFloat(note.total || '0'), 0);
  const totalDebitAmount = debitNotes.reduce((sum: number, note: any) => 
    sum + parseFloat(note.total || '0'), 0);

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: any) => {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({
          ...noteData,
          companyId: selectedCompany?.id,
          type: noteType,
        }),
      });
      if (!response.ok) throw new Error('Error al crear la nota');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setCreateNoteOpen(false);
      toast({
        title: "Nota creada",
        description: `La ${noteType.replace('_', ' ')} se ha registrado correctamente`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la nota",
        variant: "destructive",
      });
    },
  });

  const stats = [
    {
      title: "Notas de Crédito",
      value: creditNotes.length.toString(),
      icon: TrendingDown,
      description: "Devoluciones y descuentos",
      color: "text-red-600",
    },
    {
      title: "Notas de Débito",
      value: debitNotes.length.toString(),
      icon: TrendingUp,
      description: "Cargos adicionales",
      color: "text-blue-600",
    },
    {
      title: "Monto Crédito",
      value: "$" + totalCreditAmount.toLocaleString(),
      icon: Calculator,
      description: "Total creditado",
      color: "text-red-600",
    },
    {
      title: "Monto Débito",
      value: "$" + totalDebitAmount.toLocaleString(),
      icon: Calculator,
      description: "Total debitado",
      color: "text-blue-600",
    },
  ];

  const getClientName = (clientId: number) => {
    const client = clients.find((c: any) => c.id === clientId);
    return client?.name || 'Cliente no encontrado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pagada': return 'default';
      case 'pendiente': return 'secondary';
      case 'vencida': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout
      title="Notas de Crédito y Débito"
      subtitle="Gestión de ajustes contables: devoluciones, descuentos y cargos adicionales"
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color || ''}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => {
              setNoteType('nota_credito');
              setCreateNoteOpen(true);
            }}
          >
            <TrendingDown className="mr-2 h-4 w-4" />
            Nueva Nota de Crédito
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setNoteType('nota_debito');
              setCreateNoteOpen(true);
            }}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Nueva Nota de Débito
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Reporte de Notas
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="credit-notes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="credit-notes">Notas de Crédito</TabsTrigger>
            <TabsTrigger value="debit-notes">Notas de Débito</TabsTrigger>
            <TabsTrigger value="original-invoices">Facturas Originales</TabsTrigger>
          </TabsList>

          <TabsContent value="credit-notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Notas de Crédito
                </CardTitle>
                <CardDescription>
                  Documentos para devoluciones, descuentos y anulaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documentsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : creditNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingDown className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Sin notas de crédito</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No se han emitido notas de crédito aún.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {creditNotes.map((note: any) => (
                      <div key={note.id} className="border rounded-lg p-4 border-l-4 border-l-red-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">NC-{note.number}</Badge>
                              <span className="font-medium">{getClientName(note.clientId)}</span>
                              <Badge variant={getStatusColor(note.status)}>
                                {note.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(note.date).toLocaleDateString('es-EC')} • 
                              Total: ${parseFloat(note.total).toLocaleString()} • 
                              IVA ({note.ivaRate}%): ${parseFloat(note.iva).toLocaleString()}
                            </p>
                            {note.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                Motivo: {note.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-red-600">
                              -${parseFloat(note.total).toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Crédito aplicado
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debit-notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Notas de Débito
                </CardTitle>
                <CardDescription>
                  Documentos para cargos adicionales, intereses y penalizaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documentsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : debitNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Sin notas de débito</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No se han emitido notas de débito aún.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {debitNotes.map((note: any) => (
                      <div key={note.id} className="border rounded-lg p-4 border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">ND-{note.number}</Badge>
                              <span className="font-medium">{getClientName(note.clientId)}</span>
                              <Badge variant={getStatusColor(note.status)}>
                                {note.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(note.date).toLocaleDateString('es-EC')} • 
                              Total: ${parseFloat(note.total).toLocaleString()} • 
                              IVA ({note.ivaRate}%): ${parseFloat(note.iva).toLocaleString()}
                            </p>
                            {note.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                Motivo: {note.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-blue-600">
                              +${parseFloat(note.total).toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Débito aplicado
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="original-invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Facturas Originales</CardTitle>
                <CardDescription>
                  Facturas que pueden requerir notas de crédito o débito
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regularInvoices.slice(0, 10).map((invoice: any) => (
                    <div key={invoice.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">#{invoice.number}</Badge>
                            <span className="font-medium">{getClientName(invoice.clientId)}</span>
                            <Badge variant={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(invoice.date).toLocaleDateString('es-EC')} • 
                            Total: ${parseFloat(invoice.total).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setNoteType('nota_credito');
                              setCreateNoteOpen(true);
                            }}
                          >
                            <TrendingDown className="h-4 w-4 mr-1" />
                            N. Crédito
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setNoteType('nota_debito');
                              setCreateNoteOpen(true);
                            }}
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            N. Débito
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateNoteModal 
        open={createNoteOpen} 
        onOpenChange={setCreateNoteOpen}
        noteType={noteType}
        onSubmit={createNoteMutation.mutate}
        isLoading={createNoteMutation.isPending}
      />
    </DashboardLayout>
  );
}