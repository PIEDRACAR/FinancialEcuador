import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const proformaItemSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
  unitPrice: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  total: z.number(),
});

const proformaSchema = z.object({
  number: z.string().min(1, "El número es requerido"),
  clientId: z.number().min(1, "Seleccione un cliente"),
  date: z.date({ required_error: "La fecha es requerida" }),
  dueDate: z.date().optional(),
  items: z.array(proformaItemSchema).min(1, "Agregue al menos un producto"),
  notes: z.string().optional(),
  ivaRate: z.string().default("15.00"),
});

type ProformaFormData = z.infer<typeof proformaSchema>;

interface CreateProformaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProformaModal({ open, onOpenChange }: CreateProformaModalProps) {
  const [items, setItems] = useState([
    { description: "", quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const form = useForm<ProformaFormData>({
    resolver: zodResolver(proformaSchema),
    defaultValues: {
      number: "",
      clientId: 0,
      date: new Date(),
      dueDate: undefined,
      items: items,
      notes: "",
      ivaRate: "15.00",
    },
  });

  const addItem = () => {
    const newItems = [...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }];
    setItems(newItems);
    form.setValue("items", newItems);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    form.setValue("items", newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
    form.setValue("items", newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const ivaRate = parseFloat(form.watch("ivaRate") || "15.00");
    const iva = (subtotal * ivaRate) / 100;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const { subtotal, iva, total } = calculateTotals();

  const onSubmit = (data: ProformaFormData) => {
    const proformaData = {
      ...data,
      subtotal: subtotal.toString(),
      iva: iva.toString(),
      total: total.toString(),
      status: "pendiente",
      type: "proforma",
    };
    console.log("Proforma Data:", proformaData);
    onOpenChange(false);
  };

  // Mock clients data
  const clients = [
    { id: 1, name: "Cliente Ejemplo 1" },
    { id: 2, name: "Cliente Ejemplo 2" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Proforma</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Proforma</FormLabel>
                    <FormControl>
                      <Input placeholder="PROF-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Emisión</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Vencimiento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ivaRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IVA (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Productos/Servicios</h3>
                <Button type="button" variant="outline" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-semibold text-sm">
                  <div className="col-span-5">Descripción</div>
                  <div className="col-span-2">Cantidad</div>
                  <div className="col-span-2">Precio Unit.</div>
                  <div className="col-span-2">Total</div>
                  <div className="col-span-1">Acción</div>
                </div>

                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 p-3 border-t">
                    <div className="col-span-5">
                      <Input
                        placeholder="Descripción del producto/servicio"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        value={item.total.toFixed(2)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                    <div className="col-span-1">
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="border-t bg-muted p-3">
                  <div className="flex justify-end space-y-1">
                    <div className="text-right space-y-1">
                      <div>Subtotal: ${subtotal.toFixed(2)}</div>
                      <div>IVA ({form.watch("ivaRate")}%): ${iva.toFixed(2)}</div>
                      <div className="font-bold text-lg">Total: ${total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Condiciones de la cotización, términos de pago, etc..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Crear Proforma
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}