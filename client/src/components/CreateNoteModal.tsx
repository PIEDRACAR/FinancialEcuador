import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const noteSchema = z.object({
  number: z.string().min(1, "El número es requerido"),
  clientId: z.number().min(1, "Seleccione un cliente"),
  date: z.date({ required_error: "La fecha es requerida" }),
  subtotal: z.string().min(1, "El subtotal es requerido"),
  ivaRate: z.string().default("15.00"),
  notes: z.string().optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface CreateNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteType: 'nota_credito' | 'nota_debito';
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export function CreateNoteModal({ open, onOpenChange, noteType, onSubmit, isLoading }: CreateNoteModalProps) {
  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      number: "",
      clientId: 0,
      date: new Date(),
      subtotal: "",
      ivaRate: "15.00",
      notes: "",
    },
  });

  const handleSubmit = (data: NoteFormData) => {
    const subtotal = parseFloat(data.subtotal);
    const ivaRate = parseFloat(data.ivaRate);
    const iva = (subtotal * ivaRate) / 100;
    const total = subtotal + iva;

    onSubmit({
      ...data,
      subtotal: subtotal.toString(),
      iva: iva.toString(),
      total: total.toString(),
      status: "pendiente",
    });
  };

  // Mock clients data
  const clients = [
    { id: 1, name: "Cliente Ejemplo 1" },
    { id: 2, name: "Cliente Ejemplo 2" },
  ];

  const noteTypeLabel = noteType === 'nota_credito' ? 'Nota de Crédito' : 'Nota de Débito';
  const notePrefix = noteType === 'nota_credito' ? 'NC' : 'ND';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva {noteTypeLabel}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de {noteTypeLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={`${notePrefix}-001`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
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
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subtotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtotal</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
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
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo / Observaciones</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={`Describa el motivo de esta ${noteTypeLabel.toLowerCase()}...`}
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creando..." : `Crear ${noteTypeLabel}`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}