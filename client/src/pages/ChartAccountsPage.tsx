import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Plus, Search, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export default function ChartAccountsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const accounts = [
    { id: 1, code: "1.1.01", name: "Caja", type: "Activo", level: 1 },
    { id: 2, code: "1.1.02", name: "Bancos", type: "Activo", level: 1 },
    { id: 3, code: "1.2.01", name: "Cuentas por Cobrar", type: "Activo", level: 1 },
    { id: 4, code: "2.1.01", name: "Cuentas por Pagar", type: "Pasivo", level: 1 },
    { id: 5, code: "3.1.01", name: "Capital", type: "Patrimonio", level: 1 },
    { id: 6, code: "4.1.01", name: "Ventas", type: "Ingresos", level: 1 },
    { id: 7, code: "5.1.01", name: "Costo de Ventas", type: "Gastos", level: 1 }
  ];

  return (
    <DashboardLayout title="Plan de Cuentas" subtitle="Gestiona la estructura contable de la empresa">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cuenta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Cuenta</DialogTitle>
              </DialogHeader>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código</Label>
                    <Input id="code" placeholder="1.1.01" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Activo</option>
                      <option>Pasivo</option>
                      <option>Patrimonio</option>
                      <option>Ingresos</option>
                      <option>Gastos</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Cuenta</Label>
                  <Input id="name" placeholder="Nombre de la cuenta" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Cuenta</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar cuentas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Plan de Cuentas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.code}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{account.type}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}