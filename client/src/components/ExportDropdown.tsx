import { Download, FileText, Database, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportData } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ExportDropdownProps {
  data: any[];
  filename: string;
  title: string;
  subtitle?: string;
  headers?: string[];
}

export function ExportDropdown({ data, filename, title, subtitle, headers }: ExportDropdownProps) {
  const { toast } = useToast();

  const handleExport = (format: string) => {
    if (!data || data.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay datos disponibles para exportar",
        variant: "destructive",
      });
      return;
    }

    try {
      exportData(data, format, {
        filename,
        title,
        subtitle,
        headers: headers || Object.keys(data[0] || {})
      });

      toast({
        title: "Exportación exitosa",
        description: `Datos exportados como ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error en exportación",
        description: "No se pudo exportar los datos",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Formatos disponibles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2" />
          PDF/HTML
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
          <Database className="w-4 h-4 mr-2" />
          Excel/CSV
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('json')} className="cursor-pointer">
          <Code className="w-4 h-4 mr-2" />
          JSON
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('xml')} className="cursor-pointer">
          <Code className="w-4 h-4 mr-2" />
          XML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}