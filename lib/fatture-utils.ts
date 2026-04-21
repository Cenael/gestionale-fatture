import { Fattura } from "@/hooks/useFatture";

// Group invoices by supplier with totals
export interface SupplierGrouped {
  nome: string;
  fatture: Fattura[];
  total: number;
}

export function groupFatture(data: Fattura[]): SupplierGrouped[] {
  const grouped: Record<string, Fattura[]> = {};

  data.forEach((invoice) => {
    const supplierName = invoice.fornitori?.nome || "Unknown";
    if (!grouped[supplierName]) grouped[supplierName] = [];
    grouped[supplierName].push(invoice);
  });

  return Object.entries(grouped)
    .map(([name, invoices]) => ({
      nome: name,
      fatture: invoices,
      total: invoices.reduce(
        (acc: number, inv: any) => acc + Number(inv.importo),
        0,
      ),
    }))
    .sort((a, b) => b.total - a.total);
}

// Calculate total invoice amount
export function calculateTotal(data: Fattura[]): number {
  return data.reduce((acc, invoice) => acc + Number(invoice.importo), 0);
}
