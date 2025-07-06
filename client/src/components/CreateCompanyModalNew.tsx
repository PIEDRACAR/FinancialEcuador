import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, AlertCircle, CheckCircle, ExternalLink, Info, Shield, Clock } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    console.log("SRI REAL - Iniciando consulta automática para RUC:", ruc);
    if (!ruc || ruc.length !== 13) {
      setSearchError("RUC debe tener 13 dígitos");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSriData(null);

    try {
      console.log("SRI REAL - Conectando con servidores oficiales del SRI Ecuador...");
      
      // Mostrar progreso en tiempo real
      toast({
        title: "🔍 Consultando SRI Ecuador",
        description: "Conectando con servidores oficiales...",
      });
      
      const response = await fetch(`/api/sri/ruc/${ruc}`);
      const data = await response.json();
      console.log("SRI REAL - Respuesta del servidor:", data);

      if (!response.ok) {
        console.log("SRI REAL - Error en consulta:", data.error);
        setSearchError(data.error || "Error consultando RUC en SRI");
        toast({
          title: "⚠️ Error en consulta SRI",
          description: "No se pudo obtener información del RUC",
          variant: "destructive",
        });
        return;
      }

      setSriData(data);
      
      // Auto-llenar formulario con datos oficiales del SRI
      console.log("SRI REAL - Autocompletando con datos oficiales:", {
        razonSocial: data.razonSocial,
        estado: data.estado,
        provincia: data.direccion?.provincia
      });
      
      form.setValue("name", data.razonSocial);
      form.setValue("ruc", data.ruc);
      form.setValue("address", data.direccion.direccionCompleta);

      toast({
        title: "✅ Datos oficiales SRI cargados",
        description: `${data.razonSocial} - Estado: ${data.estado}`,
      });
    } catch (error: any) {
      console.error("SRI REAL - Error en consulta automática:", error);
      setSearchError("Error de conexión con servidores del SRI Ecuador");
      toast({
        title: "Error de conectividad",
        description: "No se pudo conectar con los servidores del SRI",
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
            🏢 Crear Nueva Empresa - SRI Automático
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Consulta automática integrada con SRI Ecuador</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTitle>
          <DialogDescription>
            🔗 Conexión directa con servidores oficiales del SRI Ecuador para autocompletar datos empresariales
          </DialogDescription>
          
          {/* Disclaimer Legal */}
          <Alert className="mt-2 bg-green-50 border-green-200">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Consulta autorizada bajo Art. 69 LODSI.</strong> Datos obtenidos directamente del SRI Ecuador.
            </AlertDescription>
          </Alert>
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
                  <CardTitle className="flex items-center justify-between text-green-800 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Datos Oficiales SRI Ecuador
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Clock className="h-3 w-3 text-green-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Datos consultados en tiempo real desde SRI</p>
                            <p>Fecha de consulta: {new Date().toLocaleDateString('es-EC')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`https://srienlinea.sri.gob.ec/facturacion-internet/consultas/publico/ruc-datos2.jspa`, '_blank')}
                      className="h-6 px-2 text-xs bg-white"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver ficha completa SRI
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="font-medium text-green-800 flex items-center gap-1">
                        Estado
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Estado actual del contribuyente</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Badge variant={sriData.estado === 'ACTIVO' ? 'default' : 'destructive'} className="text-xs">
                        {sriData.estado}
                        {sriData.estado !== 'ACTIVO' && (
                          <AlertCircle className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    </div>
                    <div>
                      <div className="font-medium text-green-800">Provincia</div>
                      <div className="text-green-700">{sriData.direccion.provincia}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-green-800">Tipo Contribuyente</div>
                    <div className="text-green-700">{sriData.tipoContribuyente}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-green-800">Actividad Económica Principal</div>
                    <div className="text-green-700 text-xs">
                      {sriData.actividadEconomica.principal.codigo} - {sriData.actividadEconomica.principal.descripcion}
                    </div>
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {sriData.obligaciones.llevarContabilidad && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        📊 Lleva Contabilidad
                      </Badge>
                    )}
                    {sriData.obligaciones.agenteRetencion && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                        🎯 Agente de Retención
                      </Badge>
                    )}
                  </div>

                  {/* Notificación si está inactivo */}
                  {sriData.estado !== 'ACTIVO' && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Atención:</strong> Este RUC está en estado {sriData.estado.toLowerCase()}. 
                        Verifique en el portal oficial del SRI antes de proceder.
                      </AlertDescription>
                    </Alert>
                  )}
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