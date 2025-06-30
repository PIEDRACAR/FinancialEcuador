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

const journalEntryDetailSchema = z.object({
  accountId: z.number().min(1, "Seleccione una cuenta"),
  description: z.string().optional(),
  debit: z.string().optional(),
  credit: z.string().optional(),
});

const journalEntrySchema = z.object({
  number: z.string().min(1, "El número es requerido"),
  date: z.date({ required_error: "La fecha es requerida" }),
  description: z.string().min(1, "La descripción es requerida"),
  reference: z.string().optional(),
  details: z.array(journalEntryDetailSchema).min(2, "Se requieren al menos 2 movimientos"),
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface CreateJournalEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateJournalEntryModal({ open, onOpenChange }: CreateJournalEntryModalProps) {
  const [details, setDetails] = useState([
    { accountId: 0, description: "", debit: "", credit: "" },
    { accountId: 0, description: "", debit: "", credit: "" },
  ]);

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      number: "",
      date: new Date(),
      description: "",
      reference: "",
      details: details,
    },
  });

  const addDetail = () => {
    const newDetails = [...details, { accountId: 0, description: "", debit: "", credit: "" }];
    setDetails(newDetails);
    form.setValue("details", newDetails);
  };

  const removeDetail = (index: number) => {
    if (details.length <= 2) return;
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
    form.setValue("details", newDetails);
  };

  const updateDetail = (index: number, field: string, value: any) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setDetails(newDetails);
    form.setValue("details", newDetails);
  };

  const calculateTotals = () => {
    const totalDebit = details.reduce((sum, detail) => sum + parseFloat(detail.debit || "0"), 0);
    const totalCredit = details.reduce((sum, detail) => sum + parseFloat(detail.credit || "0"), 0);
    return { totalDebit, totalCredit, isBalanced: totalDebit === totalCredit };
  };

  const { totalDebit, totalCredit, isBalanced } = calculateTotals();

  const onSubmit = (data: JournalEntryFormData) => {
    if (!isBalanced) {
      form.setError("details", { message: "El total de débitos debe ser igual al total de créditos" });
      return;
    }
    console.log("Journal Entry Data:", data);
    onOpenChange(false);
  };

  // Mock chart of accounts
  const chartOfAccounts = [
    { id: 1, code: "1.1.01", name: "Caja" },
    { id: 2, code: "1.1.02", name: "Bancos" },
    { id: 3, code: "1.2.01", name: "Cuentas por Cobrar" },
    { id: 4, code: "2.1.01", name: "Cuentas por Pagar" },
    { id: 5, code: "3.1.01", name: "Capital Social" },
    { id: 6, code: "4.1.01", name: "Ingresos por Ventas" },
    { id: 7, code: "5.1.01", name: "Gastos Administrativos" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Asiento Contable</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Asiento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: AST-001" {...field} />
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Asiento</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe la transacción contable..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Documento de referencia..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Movimientos Contables</h3>
                <Button type="button" variant="outline" onClick={addDetail}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Movimiento
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-semibold text-sm">
                  <div className="col-span-4">Cuenta</div>
                  <div className="col-span-3">Descripción</div>
                  <div className="col-span-2">Débito</div>
                  <div className="col-span-2">Crédito</div>
                  <div className="col-span-1">Acción</div>
                </div>

                {details.map((detail, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 p-3 border-t">
                    <div className="col-span-4">
                      <Select
                        value={detail.accountId.toString()}
                        onValueChange={(value) => updateDetail(index, "accountId", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cuenta" />
                        </SelectTrigger>
                        <SelectContent>
                          {chartOfAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-3">
                      <Input
                        placeholder="Descripción del movimiento"
                        value={detail.description}
                        onChange={(e) => updateDetail(index, "description", e.target.value)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={detail.debit}
                        onChange={(e) => updateDetail(index, "debit", e.target.value)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={detail.credit}
                        onChange={(e) => updateDetail(index, "credit", e.target.value)}
                      />
                    </div>

                    <div className="col-span-1">
                      {details.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDetail(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-12 gap-2 p-3 bg-muted border-t font-semibold">
                  <div className="col-span-7">TOTALES:</div>
                  <div className="col-span-2 text-right">${totalDebit.toFixed(2)}</div>
                  <div className="col-span-2 text-right">${totalCredit.toFixed(2)}</div>
                  <div className="col-span-1"></div>
                </div>

                {!isBalanced && totalDebit > 0 && totalCredit > 0 && (
                  <div className="p-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">
                    ⚠️ Los totales de débitos y créditos deben ser iguales
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!isBalanced}>
                Crear Asiento
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}