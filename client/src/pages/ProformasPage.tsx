import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExportDropdown } from "@/components/ExportDropdown";
import { ImportDropdown } from "@/components/ImportDropdown";
import { Plus, Search, FileText, Eye, Edit, Trash2 } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Proforma {
  id: number;
  number: string;
  date: string;
  clientName: string;
  total: string;
  status: string;
  validUntil: string;
}

export default function ProformasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: proformas = [], isLoading } = useQuery<Proforma[]>({
    queryKey: ["/api/proformas", selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const deleteProformaMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/proformas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proformas"] });
      toast({
        title: "Proforma eliminada",
        description: "La proforma ha sido eliminada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la proforma",
        variant: "destructive",
      });
    },
  });

  const convertToInvoiceMutation = useMutation({
    mutationFn: (proformaId: number) => 
      apiRequest("POST", `/api/proformas/${proformaId}/convert-to-invoice`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proformas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Factura creada",
        description: "La proforma se ha convertido en factura exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo convertir la proforma en factura",
        variant: "destructive",
      });
    },
  });

  const handleImport = async (file: File) => {
    // Implementar lógica de importación CSV
    toast({
      title: "Importación en proceso",
      description: "La funcionalidad de importación estará disponible próximamente",
    });
  };

  const filteredProformas = proformas.filter((proforma: Proforma) =>
    proforma.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proforma.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      accessorKey: "number",
      header: "Número",
      cell: ({ row }: any) => (
        <span className="font-mono">{row.getValue("number")}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }: any) => (
        <span>{new Date(row.getValue("date")).toLocaleDateString('es-EC')}</span>
      ),
    },
    {
      accessorKey: "clientName",
      header: "Cliente",
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }: any) => (
        <span className="font-semibold">${parseFloat(row.getValue("total")).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        const variant = status === "pendiente" ? "secondary" : 
                       status === "aceptada" ? "default" : 
                       status === "rechazada" ? "destructive" : "outline";
        
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "validUntil",
      header: "Válida hasta",
      cell: ({ row }: any) => (
        <span>{new Date(row.getValue("validUntil")).toLocaleDateString('es-EC')}</span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }: any) => {
        const proforma = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            {proforma.status === "aceptada" && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => convertToInvoiceMutation.mutate(proforma.id)}
                disabled={convertToInvoiceMutation.isPending}
              >
                <FileText className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => deleteProformaMutation.mutate(proforma.id)}
              disabled={deleteProformaMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (!selectedCompany) {
    return (
      <DashboardLayout title="Proformas" subtitle="Gestiona tus cotizaciones y proformas">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              Selecciona una empresa para ver las proformas
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Proformas" subtitle="Gestiona tus cotizaciones y proformas">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Lista de Proformas
            </CardTitle>
            <div className="flex items-center gap-2">
              <ImportDropdown
                type="proformas"
                onImport={handleImport}
              />
              <ExportDropdown
                data={filteredProformas}
                filename="proformas"
                title="Listado de Proformas"
                headers={["Número", "Fecha", "Cliente", "Total", "Estado", "Válida hasta"]}
              />
              <Button onClick={() => {
                toast({
                  title: "Función disponible próximamente",
                  description: "La creación de proformas estará disponible en la próxima versión",
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Proforma
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar proformas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Válida hasta</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      </TableRow>
                    ))
                  ) : filteredProformas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No hay proformas disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProformas.map((proforma) => (
                      <TableRow key={proforma.id}>
                        <TableCell className="font-mono">{proforma.number}</TableCell>
                        <TableCell>{new Date(proforma.date).toLocaleDateString('es-EC')}</TableCell>
                        <TableCell>{proforma.clientName}</TableCell>
                        <TableCell className="font-semibold">${parseFloat(proforma.total).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            proforma.status === "pendiente" ? "secondary" : 
                            proforma.status === "aceptada" ? "default" : 
                            proforma.status === "rechazada" ? "destructive" : "outline"
                          }>
                            {proforma.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(proforma.validUntil).toLocaleDateString('es-EC')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {proforma.status === "aceptada" && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => convertToInvoiceMutation.mutate(proforma.id)}
                                disabled={convertToInvoiceMutation.isPending}
                                title="Convertir a factura"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteProformaMutation.mutate(proforma.id)}
                              disabled={deleteProformaMutation.isPending}
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {proformas.length}
              </div>
              <p className="text-sm text-gray-600">Total Proformas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {proformas.filter((p: any) => p.status === "pendiente").length}
              </div>
              <p className="text-sm text-gray-600">Pendientes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {proformas.filter((p: any) => p.status === "aceptada").length}
              </div>
              <p className="text-sm text-gray-600">Aceptadas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                ${proformas.reduce((sum: number, p: any) => sum + parseFloat(p.total || "0"), 0).toFixed(2)}
              </div>
              <p className="text-sm text-gray-600">Total Valor</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal will be implemented in next version */}
    </DashboardLayout>
  );
}