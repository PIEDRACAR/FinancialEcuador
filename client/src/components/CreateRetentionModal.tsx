import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const retentionSchema = z.object({
  number: z.string().min(1, "El número es requerido"),
  clientId: z.number().min(1, "Seleccione un cliente"),
  date: z.date({ required_error: "La fecha es requerida" }),
  type: z.enum(["fuente", "iva"], { required_error: "Seleccione el tipo de retención" }),
  percentage: z.string().min(1, "El porcentaje es requerido"),
  baseAmount: z.string().min(1, "El monto base es requerido"),
  invoiceId: z.number().optional(),
});

type RetentionFormData = z.infer<typeof retentionSchema>;

interface CreateRetentionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRetentionModal({ open, onOpenChange }: CreateRetentionModalProps) {
  const form = useForm<RetentionFormData>({
    resolver: zodResolver(retentionSchema),
    defaultValues: {
      number: "",
      clientId: 0,
      date: new Date(),
      type: "fuente",
      percentage: "",
      baseAmount: "",
      invoiceId: undefined,
    },
  });

  const handleSubmit = (data: RetentionFormData) => {
    const baseAmount = parseFloat(data.baseAmount);
    const percentage = parseFloat(data.percentage);
    const retentionAmount = (baseAmount * percentage) / 100;

    const retentionData = {
      ...data,
      retentionAmount: retentionAmount.toString(),
    };
    
    console.log("Retention Data:", retentionData);
    onOpenChange(false);
  };

  // Mock data
  const clients = [
    { id: 1, name: "Cliente Ejemplo 1" },
    { id: 2, name: "Cliente Ejemplo 2" },
  ];

  const retentionRates = {
    fuente: [
      { code: "303", name: "Honorarios profesionales", rate: "8.00" },
      { code: "304", name: "Servicios predomina intelecto", rate: "8.00" },
      { code: "307", name: "Servicios predomina mano obra", rate: "2.00" },
      { code: "310", name: "Arrendamiento inmuebles", rate: "8.00" },
      { code: "312", name: "Transporte privado", rate: "1.00" },
      { code: "319", name: "Otros servicios", rate: "2.00" },
      { code: "320", name: "Transferencia bienes muebles", rate: "1.00" },
    ],
    iva: [
      { code: "725", name: "Retención 30% IVA", rate: "30.00" },
      { code: "727", name: "Retención 70% IVA", rate: "70.00" },
      { code: "729", name: "Retención 100% IVA", rate: "100.00" },
    ]
  };

  const selectedType = form.watch("type");
  const availableRates = selectedType ? retentionRates[selectedType] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo Comprobante de Retención</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Comprobante</FormLabel>
                    <FormControl>
                      <Input placeholder="001-001-000000001" {...field} />
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

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Retención</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fuente">Retención en la Fuente</SelectItem>
                      <SelectItem value="iva">Retención IVA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porcentaje de Retención</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar porcentaje" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRates.map((rate) => (
                          <SelectItem key={rate.code} value={rate.rate}>
                            {rate.code} - {rate.name} ({rate.rate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baseAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Base</FormLabel>
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
            </div>

            {form.watch("percentage") && form.watch("baseAmount") && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Cálculo de Retención</h4>
                <div className="space-y-1 text-sm">
                  <div>Base imponible: ${parseFloat(form.watch("baseAmount") || "0").toFixed(2)}</div>
                  <div>Porcentaje: {form.watch("percentage")}%</div>
                  <div className="font-semibold">
                    Valor retenido: ${((parseFloat(form.watch("baseAmount") || "0") * parseFloat(form.watch("percentage") || "0")) / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Crear Comprobante
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}