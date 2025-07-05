import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Building2, CheckCircle, AlertCircle } from "lucide-react";
import { insertCompanySchema } from "@shared/schema";
import { companiesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface SRICompanyData {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  tipoContribuyente: string;
  estado: string;
  claseContribuyente: string;
  fechaInicioActividades: string;
  actividadEconomica: {
    principal: {
      codigo: string;
      descripcion: string;
    };
  };
  direccion: {
    provincia: string;
    canton: string;
    direccionCompleta: string;
  };
  obligaciones: {
    llevarContabilidad: boolean;
    agenteRetencion: boolean;
    regimen: string;
  };
  representanteLegal?: {
    nombres: string;
    apellidos: string;
  };
}

interface CreateCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCompanyModalSRI({ open, onOpenChange }: CreateCompanyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sriData, setSriData] = useState<SRICompanyData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(insertCompanySchema.extend({
      name: insertCompanySchema.shape.name.min(1, "El nombre es requerido"),
    })),
    defaultValues: {
      name: "",
      ruc: "",
      address: "",
    },
  });

  const handleRucSearch = async (ruc: string) => {
    if (!ruc || ruc.length !== 13) {
      setSearchError("RUC debe tener 13 dígitos");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSriData(null);

    try {
      const response = await fetch(`/api/sri/ruc/${ruc}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error consultando RUC");
      }

      setSriData(data);
      
      // Auto-llenar formulario con datos del SRI
      form.setValue("name", data.razonSocial);
      form.setValue("ruc", data.ruc);
      form.setValue("address", data.direccion.direccionCompleta);

      toast({
        title: "RUC encontrado",
        description: `Datos de ${data.razonSocial} cargados desde el SRI`,
      });
    } catch (error: any) {
      setSearchError(error.message);
      toast({
        title: "Error consultando RUC",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: companiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Empresa creada con éxito",
        description: `Tu empresa "${form.getValues().name}" ha sido registrada`,
      });
      form.reset();
      setSriData(null);
      setSearchError(null);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear empresa",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Crear Nueva Empresa con SRI
          </DialogTitle>
          <DialogDescription>
            Ingresa el RUC para sincronizar automáticamente con el SRI
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Búsqueda RUC */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="ruc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          placeholder="1234567890123" 
                          {...field} 
                          maxLength={13}
                          onChange={(e) => {
                            field.onChange(e);
                            setSearchError(null);
                            setSriData(null);
                          }}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRucSearch(field.value)}
                        disabled={isSearching || field.value.length !== 13}
                      >
                        {isSearching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                    {searchError && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {searchError}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Datos del SRI */}
              {sriData && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      Datos del SRI Verificados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium text-green-800">Razón Social</div>
                        <div className="text-green-700">{sriData.razonSocial}</div>
                      </div>
                      <div>
                        <div className="font-medium text-green-800">Estado</div>
                        <Badge variant={sriData.estado === 'ACTIVO' ? 'default' : 'destructive'}>
                          {sriData.estado}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium text-green-800">Tipo Contribuyente</div>
                        <div className="text-green-700">{sriData.tipoContribuyente}</div>
                      </div>
                      <div>
                        <div className="font-medium text-green-800">Régimen</div>
                        <div className="text-green-700">{sriData.obligaciones.regimen}</div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-green-800">Actividad Económica</div>
                      <div className="text-green-700">
                        {sriData.actividadEconomica.principal.codigo} - {sriData.actividadEconomica.principal.descripcion}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {sriData.obligaciones.llevarContabilidad && (
                        <Badge variant="outline">Lleva Contabilidad</Badge>
                      )}
                      {sriData.obligaciones.agenteRetencion && (
                        <Badge variant="outline">Agente de Retención</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Formulario principal */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Empresa</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Mi Empresa S.A." 
                        {...field}
                        className={sriData ? "bg-green-50 border-green-200" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Av. Principal 123 y Secundaria" 
                        {...field}
                        className={sriData ? "bg-green-50 border-green-200" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                  setSriData(null);
                  setSearchError(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !form.watch("name") || !form.watch("ruc")}
                className="flex-1"
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {sriData ? "Crear con Datos SRI" : "Crear Empresa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}