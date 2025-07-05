import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function ProformasPage() {
  return (
    <DashboardLayout title="Proformas" subtitle="Gestiona tus cotizaciones y proformas">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Módulo de Proformas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Este módulo está en desarrollo. Aquí podrás gestionar todas tus proformas y cotizaciones.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}