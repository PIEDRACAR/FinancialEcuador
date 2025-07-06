import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Download, Upload, Settings, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const sriConfigSchema = z.object({
  ruc: z.string().min(13, 'RUC debe tener 13 dígitos').max(13, 'RUC debe tener 13 dígitos'),
  claveContribuyente: z.string().min(1, 'Clave del contribuyente es requerida'),
  ambiente: z.enum(['produccion', 'pruebas'])
});

const syncSchema = z.object({
  fechaInicio: z.string().min(1, 'Fecha inicio es requerida'),
  fechaFin: z.string().min(1, 'Fecha fin es requerida'),
  tipos: z.array(z.enum(['compras', 'ventas', 'retenciones'])).min(1, 'Seleccione al menos un tipo')
});

type SRIConfig = z.infer<typeof sriConfigSchema>;
type SyncData = z.infer<typeof syncSchema>;

export function SRIIntegrationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['compras', 'ventas', 'retenciones']);

  // Form para configuración SRI
  const configForm = useForm<SRIConfig>({
    resolver: zodResolver(sriConfigSchema),
    defaultValues: {
      ambiente: 'produccion'
    }
  });

  // Form para sincronización
  const syncForm = useForm<SyncData>({
    resolver: zodResolver(syncSchema),
    defaultValues: {
      fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0],
      tipos: ['compras', 'ventas', 'retenciones']
    }
  });

  // Queries
  const { data: sriConfig, isLoading: configLoading } = useQuery({
    queryKey: ['/api/sri/config'],
    retry: false
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/sri/stats'],
    retry: false
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['/api/sri/logs'],
    retry: false
  });

  // Mutations
  const configureMutation = useMutation({
    mutationFn: async (data: SRIConfig) => {
      await apiRequest('/api/sri/configure', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración SRI se guardó exitosamente"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sri/config'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const syncMutation = useMutation({
    mutationFn: async (data: SyncData) => {
      await apiRequest('/api/sri/sync', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Sincronización iniciada",
        description: "La importación de datos del SRI ha comenzado"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sri/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sri/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Cargar configuración existente
  useEffect(() => {
    if (sriConfig?.configured && sriConfig.config) {
      configForm.setValue('ruc', sriConfig.config.ruc);
      configForm.setValue('ambiente', sriConfig.config.ambiente);
    }
  }, [sriConfig, configForm]);

  const onConfigureSubmit = (data: SRIConfig) => {
    configureMutation.mutate(data);
  };

  const onSyncSubmit = (data: SyncData) => {
    syncMutation.mutate({
      ...data,
      tipos: selectedTypes as any
    });
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completado</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Sincronizando</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pendiente</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integración SRI Ecuador</h1>
          <p className="text-gray-600">Importe automáticamente compras, ventas y retenciones desde el SRI</p>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Conexión Directa SRI</span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compras</p>
                <p className="text-2xl font-bold">{stats?.compras || 0}</p>
              </div>
              <Download className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ventas</p>
                <p className="text-2xl font-bold">{stats?.ventas || 0}</p>
              </div>
              <Upload className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Retenciones</p>
                <p className="text-2xl font-bold">{stats?.retenciones || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <Settings className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración SRI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Configuración SRI</span>
            </CardTitle>
            <CardDescription>
              Configure su RUC y clave del contribuyente para acceso directo al SRI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={configForm.handleSubmit(onConfigureSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="ruc">RUC de la Empresa</Label>
                <Input
                  id="ruc"
                  {...configForm.register('ruc')}
                  placeholder="1234567890001"
                  maxLength={13}
                />
                {configForm.formState.errors.ruc && (
                  <p className="text-sm text-red-600">{configForm.formState.errors.ruc.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="claveContribuyente">Clave del Contribuyente</Label>
                <Input
                  id="claveContribuyente"
                  type="password"
                  {...configForm.register('claveContribuyente')}
                  placeholder="Su clave del portal SRI"
                />
                {configForm.formState.errors.claveContribuyente && (
                  <p className="text-sm text-red-600">{configForm.formState.errors.claveContribuyente.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ambiente">Ambiente</Label>
                <Select
                  value={configForm.watch('ambiente')}
                  onValueChange={(value) => configForm.setValue('ambiente', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produccion">Producción</SelectItem>
                    <SelectItem value="pruebas">Pruebas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {sriConfig?.configured && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Configurado: {sriConfig.config.ruc} ({sriConfig.config.ambiente})
                    </span>
                  </div>
                  {sriConfig.config.lastSync && (
                    <p className="text-xs text-green-600 mt-1">
                      Última sincronización: {new Date(sriConfig.config.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={configureMutation.isPending}
              >
                {configureMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sincronización */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Importar Datos</span>
            </CardTitle>
            <CardDescription>
              Sincronice compras, ventas y retenciones desde el SRI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={syncForm.handleSubmit(onSyncSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    {...syncForm.register('fechaInicio')}
                  />
                </div>
                <div>
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    {...syncForm.register('fechaFin')}
                  />
                </div>
              </div>

              <div>
                <Label>Tipos de Documentos</Label>
                <div className="space-y-2 mt-2">
                  {[
                    { value: 'compras', label: 'Compras (Facturas recibidas)' },
                    { value: 'ventas', label: 'Ventas (Facturas emitidas)' },
                    { value: 'retenciones', label: 'Retenciones emitidas' }
                  ].map((tipo) => (
                    <label key={tipo.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(tipo.value)}
                        onChange={() => handleTypeToggle(tipo.value)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{tipo.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={syncMutation.isPending || !sriConfig?.configured}
              >
                {syncMutation.isPending ? 'Sincronizando...' : 'Iniciar Sincronización'}
              </Button>

              {!sriConfig?.configured && (
                <p className="text-sm text-orange-600 text-center">
                  Configure primero su acceso al SRI
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Logs de Sincronización */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Sincronizaciones</CardTitle>
          <CardDescription>
            Registro de las importaciones realizadas desde el SRI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="text-center py-4">Cargando historial...</div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">{log.syncType}</p>
                      <p className="text-sm text-gray-600">
                        {log.recordsImported} de {log.recordsProcessed} registros importados
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    {getStatusBadge(log.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay sincronizaciones registradas</p>
              <p className="text-sm">Inicie su primera sincronización con el SRI</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}