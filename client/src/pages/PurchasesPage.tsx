import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ShoppingCart, Search, Edit, Trash2, Download, Upload, FileText, Printer, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

export default function PurchasesPage() {
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [createPurchaseOpen, setCreatePurchaseOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<any>(null);
  const [viewingPurchase, setViewingPurchase] = useState<any>(null);

  // Sample data for purchases
  const purchases = [
    {
      id: 1,
      number: "COMP-001",
      date: "2024-12-01",
      supplier: "Proveedor Tech Solutions S.A.",
      supplierRuc: "1792345678001",
      subtotal: 1000.00,
      iva: 150.00,
      total: 1150.00,
      status: "paid",
      retentionApplied: true,
      retentionAmount: 20.00,
      description: "Compra de equipos informáticos",
      items: [
        { id: 1, description: "Laptop Dell", quantity: 2, unitPrice: 400.00, total: 800.00 },
        { id: 2, description: "Mouse inalámbrico", quantity: 10, unitPrice: 20.00, total: 200.00 }
      ]
    },
    {
      id: 2,
      number: "COMP-002",
      date: "2024-12-05",
      supplier: "Suministros Oficina Ltda.",
      supplierRuc: "0992345678001",
      subtotal: 500.00,
      iva: 75.00,
      total: 575.00,
      status: "pending",
      retentionApplied: false,
      retentionAmount: 0,
      description: "Suministros de oficina",
      items: [
        { id: 1, description: "Papel A4", quantity: 50, unitPrice: 5.00, total: 250.00 },
        { id: 2, description: "Tinta impresora", quantity: 10, unitPrice: 25.00, total: 250.00 }
      ]
    },
    {
      id: 3,
      number: "COMP-003",
      date: "2024-12-10",
      supplier: "Servicios Profesionales ABC",
      supplierRuc: "1712345678001",
      subtotal: 2000.00,
      iva: 300.00,
      total: 2300.00,
      status: "paid",
      retentionApplied: true,
      retentionAmount: 160.00,
      description: "Servicios de consultoría",
      items: [
        { id: 1, description: "Consultoría IT", quantity: 40, unitPrice: 50.00, total: 2000.00 }
      ]
    }
  ];

  const filteredPurchases = purchases.filter(purchase => 
    purchase.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplierRuc.includes(searchTerm)
  );

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalRetentions = purchases.reduce((sum, p) => sum + p.retentionAmount, 0);
  const pendingPurchases = purchases.filter(p => p.status === 'pending').length;

  const exportPurchases = (format: string) => {
    const filename = `compras_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'pdf') {
      // Simular descarga PDF
      const link = document.createElement('a');
      link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKFJlcG9ydGUgZGUgQ29tcHJhcykKL0NyZWF0b3IgKFNpc3RlbWEgQ29udGFibGUgUHJvKQovUHJvZHVjZXIgKFNpc3RlbWEgQ29udGFibGUgUHJvKQovQ3JlYXRpb25EYXRlIChEOjIwMjQxMjMxKQo+PgplbmRvYmoKCjIgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iagoKMyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0NvdW50IDEKL0tpZHMgWzQgMCBSXQo+PgplbmRvYmoKCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMTc0IDAwMDAwIG4gCjAwMDAwMDAyMjEgMDAwMDAgbiAKMDAwMDAwMDI3OCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMiAwIFIKPj4Kc3RhcnR4cmVmCjM3OAolJUVPRgo=';
      link.download = `${filename}.pdf`;
      link.click();
      toast({
        title: "Exportación exitosa",
        description: `Reporte de compras exportado como ${format.toUpperCase()}`,
      });
    } else if (format === 'excel') {
      // Simular descarga Excel
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Número,Fecha,Proveedor,RUC,Subtotal,IVA,Total,Estado,Retención\n" +
        purchases.map(p => `${p.number},${p.date},${p.supplier},${p.supplierRuc},${p.subtotal},${p.iva},${p.total},${p.status},${p.retentionAmount}`).join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${filename}.csv`);
      link.click();
      toast({
        title: "Exportación exitosa",
        description: `Reporte de compras exportado como ${format.toUpperCase()}`,
      });
    }
  };

  const handleCreatePurchase = (purchaseData: any) => {
    // Simular creación
    toast({
      title: "Compra registrada",
      description: "La compra se ha registrado exitosamente",
    });
    setCreatePurchaseOpen(false);
  };

  const handleUpdatePurchase = (purchaseData: any) => {
    // Simular actualización
    toast({
      title: "Compra actualizada",
      description: "Los datos de la compra se han actualizado",
    });
    setEditingPurchase(null);
  };

  const handleDeletePurchase = (purchaseId: number) => {
    // Simular eliminación
    toast({
      title: "Compra eliminada",
      description: "La compra ha sido eliminada del sistema",
    });
  };

  return (
    <DashboardLayout title="Compras" subtitle="Gestión de compras y proveedores">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Compras</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchases.length}</div>
              <p className="text-xs text-muted-foreground">Registradas este mes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPurchases.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Valor total compras</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retenciones</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRetentions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total retenido</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{pendingPurchases}</div>
              <p className="text-xs text-muted-foreground">Por procesar</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <Button onClick={() => setCreatePurchaseOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Compra
            </Button>
            <Button variant="outline" onClick={() => exportPurchases('pdf')}>
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={() => exportPurchases('excel')}>
              <FileText className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar XML
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar compras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Compras</CardTitle>
            <CardDescription>
              Lista de todas las compras registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>IVA</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.number}</TableCell>
                    <TableCell>{new Date(purchase.date).toLocaleDateString('es-EC')}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{purchase.supplier}</div>
                        <div className="text-sm text-muted-foreground">{purchase.supplierRuc}</div>
                      </div>
                    </TableCell>
                    <TableCell>${purchase.subtotal.toFixed(2)}</TableCell>
                    <TableCell>${purchase.iva.toFixed(2)}</TableCell>
                    <TableCell className="font-medium">${purchase.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={purchase.status === 'paid' ? 'default' : 'secondary'}>
                        {purchase.status === 'paid' ? 'Pagada' : 'Pendiente'}
                      </Badge>
                      {purchase.retentionApplied && (
                        <Badge variant="outline" className="ml-2">
                          Ret: ${purchase.retentionAmount.toFixed(2)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingPurchase(purchase)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPurchase(purchase)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePurchase(purchase.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Purchase Dialog */}
        <Dialog open={createPurchaseOpen} onOpenChange={setCreatePurchaseOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Nueva Compra</DialogTitle>
              <DialogDescription>
                Registra una nueva compra en el sistema
              </DialogDescription>
            </DialogHeader>
            <PurchaseForm onSubmit={handleCreatePurchase} />
          </DialogContent>
        </Dialog>

        {/* Edit Purchase Dialog */}
        <Dialog open={!!editingPurchase} onOpenChange={() => setEditingPurchase(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Compra</DialogTitle>
              <DialogDescription>
                Modifica la información de la compra seleccionada
              </DialogDescription>
            </DialogHeader>
            <PurchaseForm 
              purchase={editingPurchase} 
              onSubmit={handleUpdatePurchase} 
            />
          </DialogContent>
        </Dialog>

        {/* View Purchase Dialog */}
        <Dialog open={!!viewingPurchase} onOpenChange={() => setViewingPurchase(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detalle de Compra</DialogTitle>
              <DialogDescription>
                Información completa de la compra {viewingPurchase?.number}
              </DialogDescription>
            </DialogHeader>
            {viewingPurchase && <PurchaseDetail purchase={viewingPurchase} />}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function PurchaseForm({ purchase, onSubmit }: { purchase?: any; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    number: purchase?.number || '',
    date: purchase?.date || new Date().toISOString().split('T')[0],
    supplier: purchase?.supplier || '',
    supplierRuc: purchase?.supplierRuc || '',
    subtotal: purchase?.subtotal || 0,
    iva: purchase?.iva || 0,
    total: purchase?.total || 0,
    status: purchase?.status || 'pending',
    retentionApplied: purchase?.retentionApplied || false,
    retentionAmount: purchase?.retentionAmount || 0,
    description: purchase?.description || '',
    items: purchase?.items || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const iva = subtotal * 0.15; // 15% IVA Ecuador 2024
    const total = subtotal + iva;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      iva,
      total
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number">Número de Compra</Label>
          <Input
            id="number"
            value={formData.number}
            onChange={(e) => setFormData({...formData, number: e.target.value})}
            placeholder="COMP-001"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier">Proveedor</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({...formData, supplier: e.target.value})}
            placeholder="Nombre del proveedor"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplierRuc">RUC Proveedor</Label>
          <Input
            id="supplierRuc"
            value={formData.supplierRuc}
            onChange={(e) => setFormData({...formData, supplierRuc: e.target.value})}
            placeholder="1234567890001"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Descripción de la compra..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subtotal">Subtotal</Label>
          <Input
            id="subtotal"
            type="number"
            step="0.01"
            value={formData.subtotal}
            onChange={(e) => setFormData({...formData, subtotal: parseFloat(e.target.value)})}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="iva">IVA (15%)</Label>
          <Input
            id="iva"
            type="number"
            step="0.01"
            value={formData.iva}
            onChange={(e) => setFormData({...formData, iva: parseFloat(e.target.value)})}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total">Total</Label>
          <Input
            id="total"
            type="number"
            step="0.01"
            value={formData.total}
            onChange={(e) => setFormData({...formData, total: parseFloat(e.target.value)})}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">
          {purchase ? 'Actualizar' : 'Crear'} Compra
        </Button>
      </div>
    </form>
  );
}

function PurchaseDetail({ purchase }: { purchase: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Información General</h3>
          <div className="mt-2 space-y-1">
            <p><strong>Número:</strong> {purchase.number}</p>
            <p><strong>Fecha:</strong> {new Date(purchase.date).toLocaleDateString('es-EC')}</p>
            <p><strong>Estado:</strong> {purchase.status === 'paid' ? 'Pagada' : 'Pendiente'}</p>
            <p><strong>Descripción:</strong> {purchase.description}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Proveedor</h3>
          <div className="mt-2 space-y-1">
            <p><strong>Nombre:</strong> {purchase.supplier}</p>
            <p><strong>RUC:</strong> {purchase.supplierRuc}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Detalle de Items</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Precio Unit.</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchase.items.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                <TableCell>${item.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Totales</h3>
            <div className="mt-2 space-y-1">
              <p><strong>Subtotal:</strong> ${purchase.subtotal.toFixed(2)}</p>
              <p><strong>IVA (15%):</strong> ${purchase.iva.toFixed(2)}</p>
              <p><strong>Total:</strong> ${purchase.total.toFixed(2)}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Retenciones</h3>
            <div className="mt-2 space-y-1">
              <p><strong>Retención aplicada:</strong> {purchase.retentionApplied ? 'Sí' : 'No'}</p>
              {purchase.retentionApplied && (
                <p><strong>Monto retenido:</strong> ${purchase.retentionAmount.toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}