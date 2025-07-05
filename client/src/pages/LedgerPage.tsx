import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Search, Download, Printer } from "lucide-react";
import { useState } from "react";

export default function LedgerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");

  const ledgerEntries = [
    { id: 1, date: "2024-12-01", description: "Venta de mercadería", debit: 1150.00, credit: 0, balance: 1150.00 },
    { id: 2, date: "2024-12-02", description: "Depósito bancario", debit: 0, credit: 500.00, balance: 650.00 },
    { id: 3, date: "2024-12-03", description: "Pago de servicios", debit: 0, credit: 125.00, balance: 525.00 }
  ];

  return (
    <DashboardLayout title="Libro Mayor" subtitle="Consulta los saldos y movimientos por cuenta contable">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 border rounded-md"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              <option value="">Todas las cuentas</option>
              <option value="1.1.01">1.1.01 - Caja</option>
              <option value="1.1.02">1.1.02 - Bancos</option>
              <option value="1.2.01">1.2.01 - Cuentas por Cobrar</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar movimientos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Libro Mayor General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Debe</TableHead>
                  <TableHead>Haber</TableHead>
                  <TableHead>Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>{entry.debit > 0 ? `$${entry.debit.toFixed(2)}` : '-'}</TableCell>
                    <TableCell>{entry.credit > 0 ? `$${entry.credit.toFixed(2)}` : '-'}</TableCell>
                    <TableCell className="font-medium">${entry.balance.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}