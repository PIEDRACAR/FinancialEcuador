import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const payrollSchema = z.object({
  employeeId: z.number().min(1, "Seleccione un empleado"),
  period: z.string().min(1, "El período es requerido"),
  baseSalary: z.string().min(1, "El salario base es requerido"),
  overtime: z.string().optional(),
  bonuses: z.string().optional(),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

interface PayrollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollModal({ open, onOpenChange }: PayrollModalProps) {
  const form = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      employeeId: 0,
      period: new Date().toISOString().slice(0, 7), // YYYY-MM format
      baseSalary: "",
      overtime: "0",
      bonuses: "0",
    },
  });

  const calculatePayroll = (data: PayrollFormData) => {
    const baseSalary = parseFloat(data.baseSalary);
    const overtime = parseFloat(data.overtime || "0");
    const bonuses = parseFloat(data.bonuses || "0");
    
    const grossSalary = baseSalary + overtime + bonuses;
    const iessEmployee = grossSalary * 0.0945; // 9.45% IESS empleado
    const iessEmployer = grossSalary * 0.1215; // 12.15% IESS patronal
    
    // Impuesto a la renta (simplificado)
    let incomeTax = 0;
    const annualSalary = grossSalary * 12;
    if (annualSalary > 11722) {
      incomeTax = Math.max(0, (annualSalary - 11722) * 0.05 / 12);
    }
    
    const netSalary = grossSalary - iessEmployee - incomeTax;
    
    return {
      grossSalary,
      iessEmployee,
      iessEmployer,
      incomeTax,
      netSalary,
    };
  };

  const onSubmit = (data: PayrollFormData) => {
    const calculations = calculatePayroll(data);
    
    const payrollData = {
      ...data,
      ...calculations,
      status: "pendiente",
    };
    
    console.log("Payroll Data:", payrollData);
    onOpenChange(false);
  };

  // Mock employees data
  const employees = [
    { id: 1, name: "Juan Pérez", position: "Contador" },
    { id: 2, name: "María García", position: "Vendedora" },
  ];

  const currentPeriod = new Date().toISOString().slice(0, 7);
  const watchedData = form.watch();
  const calculations = watchedData.baseSalary ? calculatePayroll(watchedData) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generar Nómina</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empleado</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar empleado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.name} - {employee.position}
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
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="baseSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario Base</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="460.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overtime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas Extras</FormLabel>
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
                name="bonuses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bonificaciones</FormLabel>
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

            {calculations && (
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h4 className="font-semibold">Cálculo Automático de Nómina</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Ingresos:</div>
                    <div>Salario Base: ${parseFloat(watchedData.baseSalary).toFixed(2)}</div>
                    <div>Horas Extras: ${parseFloat(watchedData.overtime || "0").toFixed(2)}</div>
                    <div>Bonificaciones: ${parseFloat(watchedData.bonuses || "0").toFixed(2)}</div>
                    <div className="font-semibold border-t pt-1">
                      Salario Bruto: ${calculations.grossSalary.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Descuentos:</div>
                    <div>IESS Empleado (9.45%): ${calculations.iessEmployee.toFixed(2)}</div>
                    <div>Impuesto Renta: ${calculations.incomeTax.toFixed(2)}</div>
                    <div className="font-semibold border-t pt-1 text-green-600">
                      Salario Neto: ${calculations.netSalary.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="text-sm text-muted-foreground">
                    <strong>Carga Patronal:</strong> IESS Patronal (12.15%): ${calculations.iessEmployer.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!calculations}>
                Generar Nómina
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}