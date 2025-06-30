import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen } from "lucide-react";

const accountSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["activo", "pasivo", "patrimonio", "ingreso", "gasto"], {
    required_error: "Seleccione el tipo de cuenta",
  }),
  parentId: z.number().optional(),
  level: z.number().default(1),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface ChartOfAccountsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChartOfAccountsModal({ open, onOpenChange }: ChartOfAccountsModalProps) {
  const [activeTab, setActiveTab] = useState("view");
  
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "activo",
      parentId: undefined,
      level: 1,
    },
  });

  const onSubmit = (data: AccountFormData) => {
    console.log("Account Data:", data);
    form.reset();
    setActiveTab("view");
  };

  // Plan de cuentas estándar para Ecuador
  const standardAccounts = [
    // ACTIVOS
    { code: "1", name: "ACTIVOS", type: "activo", level: 1, children: [
      { code: "1.1", name: "ACTIVO CORRIENTE", type: "activo", level: 2, children: [
        { code: "1.1.01", name: "Caja", type: "activo", level: 3 },
        { code: "1.1.02", name: "Bancos", type: "activo", level: 3 },
        { code: "1.1.03", name: "Inversiones Temporales", type: "activo", level: 3 },
        { code: "1.1.04", name: "Cuentas por Cobrar Clientes", type: "activo", level: 3 },
        { code: "1.1.05", name: "Provisión Cuentas Incobrables", type: "activo", level: 3 },
        { code: "1.1.06", name: "Inventarios", type: "activo", level: 3 },
        { code: "1.1.07", name: "IVA en Compras", type: "activo", level: 3 },
        { code: "1.1.08", name: "Retención en la Fuente", type: "activo", level: 3 },
      ]},
      { code: "1.2", name: "ACTIVO NO CORRIENTE", type: "activo", level: 2, children: [
        { code: "1.2.01", name: "Muebles y Enseres", type: "activo", level: 3 },
        { code: "1.2.02", name: "Equipos de Oficina", type: "activo", level: 3 },
        { code: "1.2.03", name: "Equipos de Computación", type: "activo", level: 3 },
        { code: "1.2.04", name: "Vehículos", type: "activo", level: 3 },
        { code: "1.2.05", name: "Depreciación Acumulada", type: "activo", level: 3 },
      ]},
    ]},
    
    // PASIVOS
    { code: "2", name: "PASIVOS", type: "pasivo", level: 1, children: [
      { code: "2.1", name: "PASIVO CORRIENTE", type: "pasivo", level: 2, children: [
        { code: "2.1.01", name: "Cuentas por Pagar Proveedores", type: "pasivo", level: 3 },
        { code: "2.1.02", name: "IVA en Ventas", type: "pasivo", level: 3 },
        { code: "2.1.03", name: "Retención en la Fuente por Pagar", type: "pasivo", level: 3 },
        { code: "2.1.04", name: "IESS por Pagar", type: "pasivo", level: 3 },
        { code: "2.1.05", name: "Sueldos por Pagar", type: "pasivo", level: 3 },
        { code: "2.1.06", name: "Préstamos Bancarios CP", type: "pasivo", level: 3 },
      ]},
      { code: "2.2", name: "PASIVO NO CORRIENTE", type: "pasivo", level: 2, children: [
        { code: "2.2.01", name: "Préstamos Bancarios LP", type: "pasivo", level: 3 },
      ]},
    ]},
    
    // PATRIMONIO
    { code: "3", name: "PATRIMONIO", type: "patrimonio", level: 1, children: [
      { code: "3.1.01", name: "Capital Social", type: "patrimonio", level: 3 },
      { code: "3.1.02", name: "Reserva Legal", type: "patrimonio", level: 3 },
      { code: "3.1.03", name: "Utilidades Retenidas", type: "patrimonio", level: 3 },
      { code: "3.1.04", name: "Utilidad del Ejercicio", type: "patrimonio", level: 3 },
    ]},
    
    // INGRESOS
    { code: "4", name: "INGRESOS", type: "ingreso", level: 1, children: [
      { code: "4.1.01", name: "Ventas", type: "ingreso", level: 3 },
      { code: "4.1.02", name: "Ingresos por Servicios", type: "ingreso", level: 3 },
      { code: "4.1.03", name: "Otros Ingresos", type: "ingreso", level: 3 },
    ]},
    
    // GASTOS
    { code: "5", name: "GASTOS", type: "gasto", level: 1, children: [
      { code: "5.1", name: "GASTOS OPERACIONALES", type: "gasto", level: 2, children: [
        { code: "5.1.01", name: "Sueldos y Salarios", type: "gasto", level: 3 },
        { code: "5.1.02", name: "Aporte Patronal IESS", type: "gasto", level: 3 },
        { code: "5.1.03", name: "Décimo Tercer Sueldo", type: "gasto", level: 3 },
        { code: "5.1.04", name: "Décimo Cuarto Sueldo", type: "gasto", level: 3 },
        { code: "5.1.05", name: "Vacaciones", type: "gasto", level: 3 },
        { code: "5.1.06", name: "Arriendo", type: "gasto", level: 3 },
        { code: "5.1.07", name: "Servicios Básicos", type: "gasto", level: 3 },
        { code: "5.1.08", name: "Suministros de Oficina", type: "gasto", level: 3 },
        { code: "5.1.09", name: "Depreciaciones", type: "gasto", level: 3 },
      ]},
      { code: "5.2", name: "GASTOS FINANCIEROS", type: "gasto", level: 2, children: [
        { code: "5.2.01", name: "Intereses Bancarios", type: "gasto", level: 3 },
        { code: "5.2.02", name: "Comisiones Bancarias", type: "gasto", level: 3 },
      ]},
    ]},
  ];

  const renderAccountTree = (accounts: any[], parentLevel = 0) => {
    return accounts.map((account) => (
      <div key={account.code} className={`ml-${parentLevel * 4}`}>
        <div className="flex items-center justify-between py-1 border-b">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{account.code}</span>
            <span className={account.level <= 2 ? "font-semibold" : ""}>{account.name}</span>
            <Badge variant="outline" className="text-xs">
              {account.type}
            </Badge>
          </div>
          <Badge variant={account.level === 3 ? "default" : "secondary"}>
            Nivel {account.level}
          </Badge>
        </div>
        {account.children && renderAccountTree(account.children, parentLevel + 1)}
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Plan de Cuentas
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="view">Ver Plan de Cuentas</TabsTrigger>
            <TabsTrigger value="create">Crear Cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-4">
            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-4">Plan de Cuentas Estándar Ecuador</h3>
              {renderAccountTree(standardAccounts)}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("create")}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Nueva Cuenta
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de Cuenta</FormLabel>
                        <FormControl>
                          <Input placeholder="1.1.09" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Cuenta</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="activo">Activo</SelectItem>
                            <SelectItem value="pasivo">Pasivo</SelectItem>
                            <SelectItem value="patrimonio">Patrimonio</SelectItem>
                            <SelectItem value="ingreso">Ingreso</SelectItem>
                            <SelectItem value="gasto">Gasto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Cuenta</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre descriptivo de la cuenta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar nivel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Nivel 1 - Mayor</SelectItem>
                          <SelectItem value="2">Nivel 2 - Submmayor</SelectItem>
                          <SelectItem value="3">Nivel 3 - Auxiliar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("view")}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Crear Cuenta
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}