import { useState } from "react";
import { Plus, Users, Search, Edit, Trash2, Phone, Mail, MapPin, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { ExportDropdown } from "@/components/ExportDropdown";

export default function SuppliersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [createSupplierOpen, setCreateSupplierOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  // Sample data for suppliers
  const suppliers = [
    {
      id: 1,
      code: "PROV-001",
      name: "Tech Solutions S.A.",
      ruc: "1792345678001",
      email: "ventas@techsolutions.com",
      phone: "02-2345678",
      address: "Av. Amazonas 123, Quito",
      city: "Quito",
      country: "Ecuador",
      category: "Tecnología",
      status: "active",
      creditLimit: 50000.00,
      creditUsed: 15000.00,
      paymentTerms: "30 días",
      contactPerson: "Juan Pérez",
      totalPurchases: 125000.00,
      lastPurchase: "2024-12-01"
    },
    {
      id: 2,
      code: "PROV-002", 
      name: "Suministros Oficina Ltda.",
      ruc: "0992345678001",
      email: "info@suministros.com",
      phone: "04-2567890",
      address: "Calle 9 de Octubre 456, Guayaquil",
      city: "Guayaquil",
      country: "Ecuador",
      category: "Oficina",
      status: "active",
      creditLimit: 25000.00,
      creditUsed: 8500.00,
      paymentTerms: "15 días",
      contactPerson: "María González",
      totalPurchases: 65000.00,
      lastPurchase: "2024-12-05"
    },
    {
      id: 3,
      code: "PROV-003",
      name: "Servicios Profesionales ABC",
      ruc: "1712345678001",
      email: "contacto@serviciosABC.com",
      phone: "02-3456789",
      address: "Av. 6 de Diciembre 789, Quito",
      city: "Quito",
      country: "Ecuador",
      category: "Servicios",
      status: "active",
      creditLimit: 100000.00,
      creditUsed: 45000.00,
      paymentTerms: "45 días",
      contactPerson: "Carlos Rivera",
      totalPurchases: 280000.00,
      lastPurchase: "2024-12-10"
    }
  ];

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.ruc.includes(searchTerm) ||
    supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const totalCreditLimit = suppliers.reduce((sum, s) => sum + s.creditLimit, 0);
  const totalCreditUsed = suppliers.reduce((sum, s) => sum + s.creditUsed, 0);

  const handleCreateSupplier = (supplierData: any) => {
    toast({
      title: "Proveedor creado",
      description: "El proveedor se ha registrado exitosamente",
    });
    setCreateSupplierOpen(false);
  };

  const handleUpdateSupplier = (supplierData: any) => {
    toast({
      title: "Proveedor actualizado",
      description: "Los datos del proveedor se han actualizado",
    });
    setEditingSupplier(null);
  };

  const handleDeleteSupplier = (supplierId: number) => {
    toast({
      title: "Proveedor eliminado",
      description: "El proveedor ha sido eliminado del sistema",
    });
  };

  return (
    <DashboardLayout title="Proveedores" subtitle="Gestión de proveedores y contactos comerciales">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSuppliers}</div>
              <p className="text-xs text-muted-foreground">Registrados en sistema</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{activeSuppliers}</div>
              <p className="text-xs text-muted-foreground">Con estado activo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Límite Crédito</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCreditLimit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total disponible</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crédito Usado</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">${totalCreditUsed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{((totalCreditUsed/totalCreditLimit)*100).toFixed(1)}% utilizado</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <Button onClick={() => setCreateSupplierOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Proveedor
            </Button>
            <ExportDropdown
              data={suppliers}
              filename="proveedores"
              title="Lista de Proveedores"
              subtitle="Directorio completo de proveedores"
              headers={['Código', 'Nombre', 'RUC', 'Email', 'Teléfono', 'Ciudad', 'Categoría', 'Estado']}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar proveedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>

        {/* Suppliers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Directorio de Proveedores</CardTitle>
            <CardDescription>
              Lista completa de proveedores registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Crédito</TableHead>
                  <TableHead>Compras</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-sm text-muted-foreground">{supplier.code} • {supplier.ruc}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {supplier.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3" />
                          {supplier.phone}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          {supplier.city}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{supplier.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">
                          ${supplier.creditUsed.toLocaleString()} / ${supplier.creditLimit.toLocaleString()}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(supplier.creditUsed/supplier.creditLimit)*100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">${supplier.totalPurchases.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          Último: {new Date(supplier.lastPurchase).toLocaleDateString('es-EC')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                        {supplier.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSupplier(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSupplier(supplier.id)}
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

        {/* Create Supplier Dialog */}
        <Dialog open={createSupplierOpen} onOpenChange={setCreateSupplierOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo Proveedor</DialogTitle>
              <DialogDescription>
                Registra un nuevo proveedor en el sistema
              </DialogDescription>
            </DialogHeader>
            <SupplierForm onSubmit={handleCreateSupplier} />
          </DialogContent>
        </Dialog>

        {/* Edit Supplier Dialog */}
        <Dialog open={!!editingSupplier} onOpenChange={() => setEditingSupplier(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Proveedor</DialogTitle>
              <DialogDescription>
                Modifica la información del proveedor seleccionado
              </DialogDescription>
            </DialogHeader>
            <SupplierForm 
              supplier={editingSupplier} 
              onSubmit={handleUpdateSupplier} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function SupplierForm({ supplier, onSubmit }: { supplier?: any; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    code: supplier?.code || '',
    name: supplier?.name || '',
    ruc: supplier?.ruc || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    city: supplier?.city || '',
    country: supplier?.country || 'Ecuador',
    category: supplier?.category || '',
    status: supplier?.status || 'active',
    creditLimit: supplier?.creditLimit || 0,
    paymentTerms: supplier?.paymentTerms || '30 días',
    contactPerson: supplier?.contactPerson || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
            placeholder="PROV-001"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nombre/Razón Social</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Nombre del proveedor"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ruc">RUC</Label>
          <Input
            id="ruc"
            value={formData.ruc}
            onChange={(e) => setFormData({...formData, ruc: e.target.value})}
            placeholder="1234567890001"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tecnología">Tecnología</SelectItem>
              <SelectItem value="Oficina">Oficina</SelectItem>
              <SelectItem value="Servicios">Servicios</SelectItem>
              <SelectItem value="Construcción">Construcción</SelectItem>
              <SelectItem value="Otros">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="proveedor@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="02-2345678"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          placeholder="Dirección completa"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            placeholder="Ciudad"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Persona de Contacto</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
            placeholder="Nombre del contacto"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="creditLimit">Límite de Crédito</Label>
          <Input
            id="creditLimit"
            type="number"
            step="0.01"
            value={formData.creditLimit}
            onChange={(e) => setFormData({...formData, creditLimit: parseFloat(e.target.value)})}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentTerms">Términos de Pago</Label>
          <Select value={formData.paymentTerms} onValueChange={(value) => setFormData({...formData, paymentTerms: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona términos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Contado">Contado</SelectItem>
              <SelectItem value="15 días">15 días</SelectItem>
              <SelectItem value="30 días">30 días</SelectItem>
              <SelectItem value="45 días">45 días</SelectItem>
              <SelectItem value="60 días">60 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">
          {supplier ? 'Actualizar' : 'Crear'} Proveedor
        </Button>
      </div>
    </form>
  );
}