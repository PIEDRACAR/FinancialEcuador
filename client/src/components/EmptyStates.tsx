import { Building2, Users, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[300px] p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        {action && (
          <Button onClick={action.onClick}>
            <Plus className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export function NoCompaniesState({ onCreateCompany }: { onCreateCompany: () => void }) {
  return (
    <EmptyState
      icon={Building2}
      title="¡Bienvenido a Sistema Contable Pro!"
      description="Para comenzar, necesitas crear tu primera empresa."
      action={{
        label: "Crear Primera Empresa",
        onClick: onCreateCompany
      }}
    />
  );
}

export function NoClientsState({ onCreateClient }: { onCreateClient: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No hay clientes registrados"
      description="Comienza agregando clientes para gestionar tus facturas y contabilidad."
      action={{
        label: "Agregar Cliente",
        onClick: onCreateClient
      }}
    />
  );
}

export function NoInvoicesState({ onCreateInvoice }: { onCreateInvoice: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No hay facturas creadas"
      description="Crea tu primera factura para comenzar a gestionar tus ventas."
      action={{
        label: "Nueva Factura",
        onClick: onCreateInvoice
      }}
    />
  );
}