import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileText, Download, Edit, Trash2 } from "lucide-react";
import { Invoice } from "@shared/schema";

interface InvoiceDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pagada':
      return <Badge className="bg-green-100 text-green-800">Pagada</Badge>;
    case 'pendiente':
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    case 'vencida':
      return <Badge className="bg-red-100 text-red-800">Vencida</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function InvoiceDetailsModal({ 
  open, 
  onOpenChange, 
  invoice, 
  onEdit, 
  onDelete 
}: InvoiceDetailsModalProps) {
  if (!invoice) return null;

  const invoiceItems = Array.isArray(invoice.items) ? invoice.items : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Factura {invoice.number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Información de la Factura</h3>
              <div className="space-y-1">
                <p><span className="font-medium">Número:</span> {invoice.number}</p>
                <p><span className="font-medium">Estado:</span> {getStatusBadge(invoice.status)}</p>
                <p><span className="font-medium">Fecha de Emisión:</span> {format(new Date(invoice.date), "PPP", { locale: es })}</p>
                {invoice.dueDate && (
                  <p><span className="font-medium">Fecha de Vencimiento:</span> {format(new Date(invoice.dueDate), "PPP", { locale: es })}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Cliente</h3>
              <div className="space-y-1">
                <p><span className="font-medium">ID del Cliente:</span> {invoice.clientId}</p>
                {/* Note: In a real app, you'd fetch client details */}
              </div>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Productos/Servicios</h3>
            
            {invoiceItems.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Descripción</th>
                      <th className="px-4 py-2 text-right font-medium">Cantidad</th>
                      <th className="px-4 py-2 text-right font-medium">Precio Unit.</th>
                      <th className="px-4 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item: any, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">${parseFloat(item.unitPrice || '0').toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">${(item.quantity * parseFloat(item.unitPrice || '0')).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay productos/servicios registrados</p>
            )}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${parseFloat(invoice.subtotal || '0').toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (12%):</span>
              <span>${parseFloat(invoice.iva || '0').toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${parseFloat(invoice.total || '0').toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold">Notas</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{invoice.notes}</p>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-between">
            <div className="space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>

            <div className="space-x-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(invoice)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" size="sm" onClick={() => onDelete(invoice)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}