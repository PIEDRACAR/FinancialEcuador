import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Package, Search, Edit, Trash2, Download, Upload, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { ExportDropdown } from "@/components/ExportDropdown";

export default function ProductsPage() {
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Sample data for products
  const products = [
    {
      id: 1,
      code: "PROD-001",
      name: "Laptop Dell Inspiron 15",
      category: "Electrónicos",
      price: 899.99,
      cost: 650.00,
      stock: 25,
      minStock: 5,
      unit: "unidad",
      taxable: true,
      status: "active",
      description: "Laptop con procesador Intel i5, 8GB RAM, 256GB SSD"
    },
    {
      id: 2,
      code: "PROD-002", 
      name: "Mouse Inalámbrico Logitech",
      category: "Accesorios",
      price: 29.99,
      cost: 18.00,
      stock: 100,
      minStock: 20,
      unit: "unidad",
      taxable: true,
      status: "active",
      description: "Mouse inalámbrico con conexión USB"
    },
    {
      id: 3,
      code: "PROD-003",
      name: "Servicio de Consultoría",
      category: "Servicios",
      price: 150.00,
      cost: 0,
      stock: 0,
      minStock: 0,
      unit: "hora",
      taxable: true,
      status: "active",
      description: "Servicios profesionales de consultoría en TI"
    }
  ];

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStock);

  const exportProducts = (format: string) => {
    const filename = `productos_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'pdf') {
      // Simular descarga PDF
      const link = document.createElement('a');
      link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKExpc3RhIGRlIFByb2R1Y3RvcykKL0NyZWF0b3IgKFNpc3RlbWEgQ29udGFibGUgUHJvKQovUHJvZHVjZXIgKFNpc3RlbWEgQ29udGFibGUgUHJvKQovQ3JlYXRpb25EYXRlIChEOjIwMjQxMjMxKQo+PgplbmRvYmoKCjIgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iagoKMyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0NvdW50IDEKL0tpZHMgWzQgMCBSXQo+PgplbmRvYmoKCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMTc0IDAwMDAwIG4gCjAwMDAwMDAyMjEgMDAwMDAgbiAKMDAwMDAwMDI3OCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMiAwIFIKPj4Kc3RhcnR4cmVmCjM3OAolJUVPRgo=';
      link.download = `${filename}.pdf`;
      link.click();
      toast({
        title: "Exportación exitosa",
        description: `Lista de productos exportada como ${format.toUpperCase()}`,
      });
    } else if (format === 'excel') {
      // Simular descarga Excel
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Código,Nombre,Categoría,Precio,Costo,Stock,Stock Mínimo,Unidad,Gravable,Estado,Descripción\n" +
        products.map(p => `${p.code},${p.name},${p.category},${p.price},${p.cost},${p.stock},${p.minStock},${p.unit},${p.taxable ? 'Sí' : 'No'},${p.status},${p.description}`).join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${filename}.csv`);
      link.click();
      toast({
        title: "Exportación exitosa",
        description: `Lista de productos exportada como ${format.toUpperCase()}`,
      });
    }
  };

  const handleCreateProduct = (productData: any) => {
    // Simular creación
    toast({
      title: "Producto creado",
      description: "El producto se ha registrado exitosamente",
    });
    setCreateProductOpen(false);
  };

  const handleUpdateProduct = (productData: any) => {
    // Simular actualización
    toast({
      title: "Producto actualizado",
      description: "Los datos del producto se han actualizado",
    });
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: number) => {
    // Simular eliminación
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado del sistema",
    });
  };

  return (
    <DashboardLayout title="Productos y Servicios" subtitle="Gestión del catálogo de productos y servicios">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">Activos en catálogo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <Package className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{lowStockProducts.length}</div>
              <p className="text-xs text-muted-foreground">Requieren reposición</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${products.reduce((sum, p) => sum + (p.cost * p.stock), 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Costo total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(products.map(p => p.category)).size}</div>
              <p className="text-xs text-muted-foreground">Diferentes categorías</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <Button onClick={() => setCreateProductOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
            <ExportDropdown
              data={products}
              filename="productos"
              title="Lista de Productos"
              subtitle="Catálogo completo de productos y servicios"
              headers={['Código', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', 'Descripción']}
            />
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Productos</CardTitle>
            <CardDescription>
              Lista completa de productos y servicios registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={product.stock <= product.minStock && product.stock > 0 ? "text-red-500" : ""}>
                          {product.stock} {product.unit}
                        </span>
                        {product.stock <= product.minStock && product.stock > 0 && (
                          <Badge variant="destructive" className="text-xs">Stock Bajo</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
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

        {/* Create Product Dialog */}
        <Dialog open={createProductOpen} onOpenChange={setCreateProductOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo Producto</DialogTitle>
              <DialogDescription>
                Registra un nuevo producto o servicio en el catálogo
              </DialogDescription>
            </DialogHeader>
            <ProductForm onSubmit={handleCreateProduct} />
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
              <DialogDescription>
                Modifica la información del producto seleccionado
              </DialogDescription>
            </DialogHeader>
            <ProductForm 
              product={editingProduct} 
              onSubmit={handleUpdateProduct} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function ProductForm({ product, onSubmit }: { product?: any; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    code: product?.code || '',
    name: product?.name || '',
    category: product?.category || '',
    price: product?.price || 0,
    cost: product?.cost || 0,
    stock: product?.stock || 0,
    minStock: product?.minStock || 0,
    unit: product?.unit || 'unidad',
    taxable: product?.taxable || true,
    status: product?.status || 'active',
    description: product?.description || ''
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
            placeholder="PROD-001"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Nombre del producto"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Electrónicos">Electrónicos</SelectItem>
              <SelectItem value="Accesorios">Accesorios</SelectItem>
              <SelectItem value="Servicios">Servicios</SelectItem>
              <SelectItem value="Oficina">Oficina</SelectItem>
              <SelectItem value="Otros">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unidad</Label>
          <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona unidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unidad">Unidad</SelectItem>
              <SelectItem value="metro">Metro</SelectItem>
              <SelectItem value="kilogramo">Kilogramo</SelectItem>
              <SelectItem value="litro">Litro</SelectItem>
              <SelectItem value="hora">Hora</SelectItem>
              <SelectItem value="servicio">Servicio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Precio de Venta</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Costo</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stock">Stock Inicial</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minStock">Stock Mínimo</Label>
          <Input
            id="minStock"
            type="number"
            value={formData.minStock}
            onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value)})}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Descripción del producto..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">
          {product ? 'Actualizar' : 'Crear'} Producto
        </Button>
      </div>
    </form>
  );
}