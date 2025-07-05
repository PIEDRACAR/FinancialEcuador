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

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients', selectedCompany?.id],
    enabled: !!selectedCompany?.id,
  });

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      number: `INV-${Date.now()}`,
      date: new Date(),
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
    const iva = subtotal * 0.15; // 15% IVA Ecuador 2024
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
      const newItems = currentItems.filter((_, i) => i !== index);
      form.setValue("items", newItems);
      calculateTotals();
    }
  };

  const updateItem = (index: number, field: keyof typeof invoiceItemSchema._type, value: any) => {
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
              <Label>Cliente</Label>
              <Select 
                onValueChange={(value) => form.setValue("clientId", parseInt(value))}
                value={form.watch("clientId")?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client: any) => (
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

          <div className="grid grid-cols-1 gap-4">
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
                      form.setValue("date", date || new Date());
                      setCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date && (
                <p className="text-sm text-red-600">{form.formState.errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Productos/Servicios</Label>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Línea
              </Button>
            </div>

            <div className="space-y-3">
              {form.watch("items").map((item, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-end p-3 border rounded-lg">
                  <div className="col-span-2">
                    <Label className="text-sm">Descripción</Label>
                    <Input
                      placeholder="Descripción del producto/servicio"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Precio Unit.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Total</Label>
                    <Input
                      type="number"
                      value={item.total.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={form.watch("items").length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {form.formState.errors.items && (
              <p className="text-sm text-red-600">{form.formState.errors.items.message}</p>
            )}
          </div>

          {/* Totals Section */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${form.watch("subtotal").toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (15%):</span>
              <span>${form.watch("iva").toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${form.watch("total").toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Input
              id="notes"
              {...form.register("notes")}
              placeholder="Notas adicionales sobre la factura"
            />
          </div>

          <div className="flex justify-end gap-2">
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