import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings, User, Building2, Save, Eye, EyeOff, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import { companiesApi } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const companySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  ruc: z.string().min(10, "El RUC debe tener al menos 10 caracteres"),
  address: z.string().min(1, "La dirección es requerida"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional()
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirma la nueva contraseña")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

type CompanyFormData = z.infer<typeof companySchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { user } = useAuth();
  const { selectedCompany } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: selectedCompany?.name || "",
      ruc: selectedCompany?.ruc || "",
      address: selectedCompany?.address || "",
      email: selectedCompany?.email || "",
      phone: selectedCompany?.phone || ""
    }
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: (data: CompanyFormData) => {
      if (!selectedCompany) throw new Error("No hay empresa seleccionada");
      return companiesApi.update(selectedCompany.id, data);
    },
    onSuccess: () => {
      toast({
        title: "Empresa actualizada",
        description: "Los datos de la empresa han sido actualizados exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la empresa",
        variant: "destructive",
      });
    }
  });

  const onSubmitCompany = (data: CompanyFormData) => {
    updateCompanyMutation.mutate(data);
  };

  const onSubmitPassword = (data: PasswordFormData) => {
    // Password change would be implemented here
    toast({
      title: "Funcionalidad pendiente",
      description: "El cambio de contraseña se implementará en una futura versión",
    });
    passwordForm.reset();
  };

  const handleDeleteCompany = () => {
    if (!selectedCompany) return;
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la empresa "${selectedCompany.name}"? Esta acción no se puede deshacer.`
    );
    
    if (confirmed) {
      toast({
        title: "Funcionalidad pendiente",
        description: "La eliminación de empresas se implementará en una futura versión",
      });
    }
  };

  return (
    <DashboardLayout title="Configuración" subtitle="Administra tu cuenta y empresa">
      <div className="max-w-4xl mx-auto space-y-6">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Cuenta
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          {/* Company Settings */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre de la Empresa *</Label>
                      <Input
                        id="name"
                        {...companyForm.register("name")}
                        placeholder="Mi Empresa S.A."
                      />
                      {companyForm.formState.errors.name && (
                        <p className="text-sm text-red-600">{companyForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ruc">RUC *</Label>
                      <Input
                        id="ruc"
                        {...companyForm.register("ruc")}
                        placeholder="1234567890001"
                      />
                      {companyForm.formState.errors.ruc && (
                        <p className="text-sm text-red-600">{companyForm.formState.errors.ruc.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección *</Label>
                    <Input
                      id="address"
                      {...companyForm.register("address")}
                      placeholder="Av. Principal 123, Quito, Ecuador"
                    />
                    {companyForm.formState.errors.address && (
                      <p className="text-sm text-red-600">{companyForm.formState.errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...companyForm.register("email")}
                        placeholder="contacto@miempresa.com"
                      />
                      {companyForm.formState.errors.email && (
                        <p className="text-sm text-red-600">{companyForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        {...companyForm.register("phone")}
                        placeholder="+593 99 123 4567"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteCompany}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar Empresa
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={updateCompanyMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {updateCompanyMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <div className="space-y-6">
              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Nombre</Label>
                      <Input value={user?.name || ""} disabled className="bg-gray-50" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={user?.email || ""} disabled className="bg-gray-50" />
                    </div>
                    <Alert>
                      <AlertDescription>
                        Para modificar tu información personal, contacta al administrador del sistema.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar Contraseña</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Contraseña Actual *</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          {...passwordForm.register("currentPassword")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva Contraseña *</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          {...passwordForm.register("newPassword")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...passwordForm.register("confirmPassword")}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button type="submit" className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Cambiar Contraseña
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Información del Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Versión</Label>
                        <Input value="1.0.0" disabled className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>Última Actualización</Label>
                        <Input value="30 de Junio, 2025" disabled className="bg-gray-50" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Configuraciones Regionales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Moneda</Label>
                        <Input value="USD - Dólar Estadounidense" disabled className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>Zona Horaria</Label>
                        <Input value="ECT - Tiempo de Ecuador" disabled className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>Idioma</Label>
                        <Input value="Español (Ecuador)" disabled className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>IVA</Label>
                        <Input value="12%" disabled className="bg-gray-50" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Soporte</h3>
                    <Alert>
                      <AlertDescription>
                        Para soporte técnico o reportar problemas, contacta al equipo de desarrollo a través del repositorio del proyecto en GitHub.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}