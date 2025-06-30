import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { invoicesApi, clientsApi } from "@/lib/api";
import { useCompany } from "@/contexts/CompanyContext";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
  unitPrice: z.number().min(0.01, "El precio debe ser mayor a 0"),
  total: z.number()
});

const invoiceSchema = z.object({
  number: z.string().min(1, "El número de factura es requerido"),
  clientId: z.number().min(1, "Debe seleccionar un cliente"),
  date: z.date(),
  dueDate: z.date(),
  subtotal: z.number().min(0),
  iva: z.number().min(0),
  total: z.number().min(0),
  items: z.array(invoiceItemSchema).min(1, "Debe agregar al menos un producto/servicio"),
  notes: z.string().optional()
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateInvoiceModal({ open, onOpenChange }: CreateInvoiceModalProps) {
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dueDateCalendarOpen, setDueDateCalendarOpen] = useState(false);

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      number: `INV-${Date.now()}`,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      subtotal: 0,
      iva: 0,
      total: 0,
      items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
      notes: ""
    }
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: any) => invoicesApi.create(selectedCompany!.id, data),
    onSuccess: () => {
      toast({
        title: "Factura creada",
        description: "La factura ha sido creada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la factura",
        variant: "destructive",
      });
    }
  });

  const watchedItems = form.watch("items");

  const calculateTotals = () => {
    const items = form.getValues("items");
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const iva = subtotal * 0.12; // 12% IVA Ecuador
    const total = subtotal + iva;

    form.setValue("subtotal", subtotal);
    form.setValue("iva", iva);
    form.setValue("total", total);
  };

  const addItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [...currentItems, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      form.setValue("items", currentItems.filter((_, i) => i !== index));
      calculateTotals();
    }
  };

  const updateItemTotal = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
    const currentItems = form.getValues("items");
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
      total: field === 'quantity' ? value * updatedItems[index].unitPrice : updatedItems[index].quantity * value
    };
    form.setValue("items", updatedItems);
    calculateTotals();
  };

  const onSubmit = (data: InvoiceFormData) => {
    if (!selectedCompany) return;

    createInvoiceMutation.mutate({
      number: data.number,
      clientId: data.clientId,
      date: data.date,
      dueDate: data.dueDate,
      subtotal: data.subtotal.toString(),
      iva: data.iva.toString(),
      total: data.total.toString(),
      status: 'pendiente',
      items: JSON.stringify(data.items),
      notes: data.notes || ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Factura</DialogTitle>
          <DialogDescription>
            Crea una nueva factura para tu empresa. Completa todos los campos requeridos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Número de Factura</Label>
              <Input
                id="number"
                {...form.register("number")}
                placeholder="INV-001"
              />
              {form.formState.errors.number && (
                <p className="text-sm text-red-600">{form.formState.errors.number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente</Label>
              <Select
                value={form.watch("clientId")?.toString()}
                onValueChange={(value) => form.setValue("clientId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {(clients as any[]).map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.clientId && (
                <p className="text-sm text-red-600">{form.formState.errors.clientId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Emisión</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("date") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("date") ? format(form.watch("date"), "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("date")}
                    onSelect={(date) => {
                      if (date) {
                        form.setValue("date", date);
                        setCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Vencimiento</Label>
              <Popover open={dueDateCalendarOpen} onOpenChange={setDueDateCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("dueDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("dueDate") ? format(form.watch("dueDate"), "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("dueDate")}
                    onSelect={(date) => {
                      if (date) {
                        form.setValue("dueDate", date);
                        setDueDateCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Productos/Servicios</Label>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Línea
              </Button>
            </div>

            <div className="space-y-3">
              {watchedItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Label htmlFor={`description-${index}`}>Descripción</Label>
                    <Input
                      id={`description-${index}`}
                      {...form.register(`items.${index}.description`)}
                      placeholder="Descripción del producto/servicio"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`quantity-${index}`}>Cantidad</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      step="1"
                      {...form.register(`items.${index}.quantity`, {
                        valueAsNumber: true,
                        onChange: (e) => updateItemTotal(index, 'quantity', parseFloat(e.target.value) || 0)
                      })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`unitPrice-${index}`}>Precio Unit.</Label>
                    <Input
                      id={`unitPrice-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      {...form.register(`items.${index}.unitPrice`, {
                        valueAsNumber: true,
                        onChange: (e) => updateItemTotal(index, 'unitPrice', parseFloat(e.target.value) || 0)
                      })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <Input
                      value={`$${(item.quantity * item.unitPrice).toFixed(2)}`}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    {watchedItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Input
              id="notes"
              {...form.register("notes")}
              placeholder="Notas adicionales sobre la factura"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${form.watch("subtotal").toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (12%):</span>
              <span>${form.watch("iva").toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${form.watch("total").toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createInvoiceMutation.isPending}>
              {createInvoiceMutation.isPending ? "Creando..." : "Crear Factura"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}