import { Upload, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateImportTemplate } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

interface ImportDropdownProps {
  type: string; // clients, suppliers, products, purchases, employees
  onImport?: (file: File) => void;
  onFileSelect?: (file: File) => void;
  acceptedTypes?: string;
  disabled?: boolean;
}

export function ImportDropdown({ type, onImport, onFileSelect, acceptedTypes, disabled = false }: ImportDropdownProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    try {
      generateImportTemplate(type);
      toast({
        title: "Plantilla descargada",
        description: "Plantilla de importación descargada exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar la plantilla",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast({
        title: "Archivo inválido",
        description: "Solo se permiten archivos CSV y Excel",
        variant: "destructive",
      });
      return;
    }

    if (onImport) {
      onImport(file);
    } else if (onFileSelect) {
      onFileSelect(file);
    }
    
    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={disabled}>
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Opciones de Importación</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDownloadTemplate} className="cursor-pointer">
            <Download className="w-4 h-4 mr-2" />
            Descargar Plantilla
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleFileSelect} className="cursor-pointer">
            <FileText className="w-4 h-4 mr-2" />
            Seleccionar Archivo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}