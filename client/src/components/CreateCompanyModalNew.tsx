import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertCompanySchema } from "../../../shared/schema";
import { companiesApi } from "@/lib/api";

interface SRICompanyData {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  tipoContribuyente: string;
  estado: string;
  claseContribuyente: string;
  fechaInicioActividades: string;
  fechaActualizacion?: string;
  actividadEconomica: {
    principal: {
      codigo: string;
      descripcion: string;
    };
    secundarias?: Array<{
      codigo: string;
      descripcion: string;
    }>;
  };
  direccion: {
    provincia: string;
    canton: string;
    parroquia: string;
    direccionCompleta: string;
  };
  obligaciones: {
    llevarContabilidad: boolean;
    agenteRetencion: boolean;
    regimen: string;
  };
  representanteLegal?: {
    cedula: string;
    nombres: string;
    apellidos: string;
  };
  establecimientos?: Array<{
    codigo: string;
    nombre: string;
    direccion: string;
    estado: string;
  }>;
}

interface CreateCompanyModalNewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCompanyModalNew({ open, onOpenChange }: CreateCompanyModalNewProps) {
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
    console.log("NEW MODAL - handleRucSearch called with RUC:", ruc);
    if (!ruc || ruc.length !== 13) {
      setSearchError("RUC debe tener 13 dígitos");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSriData(null);

    try {
      console.log("NEW MODAL - Fetching SRI data for RUC:", ruc);
      const response = await fetch(`/api/sri/ruc/${ruc}`);
      const data = await response.json();
      console.log("NEW MODAL - SRI response:", data);

      if (!response.ok) {
        // Mostrar mensaje específico sobre la falta de conexión al SRI
        const errorMessage = data.error || "Error consultando RUC";
        if (errorMessage.includes("SRI de Ecuador")) {
          setSearchError(`
            IMPORTANTE: Este sistema no tiene acceso directo a la base de datos del SRI de Ecuador.
            
            Para obtener información oficial del RUC ${ruc}:
            1. Visite: https://srienlinea.sri.gob.ec/facturacion-internet/consultas/publico/ruc-datos2.jspa
            2. Consulte los datos oficiales
            3. Ingrese manualmente la información de la empresa en el formulario
          `);
        } else {
          setSearchError(errorMessage);
        }
        return;
      }

      setSriData(data);
      
      // Auto-llenar formulario con datos del SRI
      console.log("NEW MODAL - Setting form values:", {
        name: data.razonSocial,
        ruc: data.ruc,
        address: data.direccion.direccionCompleta
      });
      
      form.setValue("name", data.razonSocial);
      form.setValue("ruc", data.ruc);
      form.setValue("address", data.direccion.direccionCompleta);

      toast({
        title: "RUC encontrado",
        description: `Datos de ${data.razonSocial} cargados desde el SRI`,
      });
    } catch (error: any) {
      console.error("NEW MODAL - Error in handleRucSearch:", error);
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
          <DialogTitle>🏢 Crear Nueva Empresa - SRI AUTO</DialogTitle>
          <DialogDescription>
            ✅ PASO 1: Ingresa el RUC de 13 dígitos para sincronizar automáticamente con el SRI
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* RUC COMO PRIMER CAMPO */}
            <FormField
              control={form.control}
              name="ruc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-bold text-blue-600">🔍 RUC de la Empresa (Primer Campo) *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        placeholder="Ingresa el RUC (13 dígitos)" 
                        {...field} 
                        maxLength={13}
                        onChange={(e) => {
                          field.onChange(e);
                          setSearchError(null);
                          setSriData(null);
                          // Auto-búsqueda cuando se completan 13 dígitos
                          if (e.target.value.length === 13) {
                            console.log("NEW MODAL - Auto-triggering search for RUC:", e.target.value);
                            setTimeout(() => handleRucSearch(e.target.value), 300);
                          }
                        }}
                        className="text-lg border-2 border-blue-300"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRucSearch(field.value)}
                      disabled={isSearching || field.value.length !== 13}
                      title="Buscar en SRI"
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
                    <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-yellow-800 mb-1">Información Importante</h4>
                          <div className="text-sm text-yellow-700 whitespace-pre-line">
                            {searchError}
                          </div>
                          <div className="mt-2 text-xs text-yellow-600">
                            💡 Complete manualmente los campos del formulario con la información oficial del SRI
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {field.value.length > 0 && field.value.length < 13 && (
                    <div className="text-sm text-muted-foreground">
                      Faltan {13 - field.value.length} dígitos
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Datos del SRI */}
            {sriData && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-800 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Datos del SRI Verificados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="font-medium text-green-800">Estado</div>
                      <Badge variant={sriData.estado === 'ACTIVO' ? 'default' : 'destructive'} className="text-xs">
                        {sriData.estado}
                      </Badge>
                    </div>
                    <div>
                      <div className="font-medium text-green-800">Régimen</div>
                      <div className="text-green-700">{sriData.obligaciones.regimen}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-green-800">Actividad Económica</div>
                    <div className="text-green-700 text-xs">
                      {sriData.actividadEconomica.principal.codigo} - {sriData.actividadEconomica.principal.descripcion}
                    </div>
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {sriData.obligaciones.llevarContabilidad && (
                      <Badge variant="outline" className="text-xs">Lleva Contabilidad</Badge>
                    )}
                    {sriData.obligaciones.agenteRetencion && (
                      <Badge variant="outline" className="text-xs">Agente de Retención</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* NOMBRE DESPUÉS DEL RUC */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>✅ Nombre de la Empresa *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nombre de la empresa" 
                      {...field}
                      className={sriData ? "bg-green-50 border-green-200" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DIRECCIÓN AL FINAL */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>📍 Dirección</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Dirección de la empresa" 
                      {...field}
                      className={sriData ? "bg-green-50 border-green-200" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {createMutation.isPending ? "Creando..." : "Crear Empresa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}