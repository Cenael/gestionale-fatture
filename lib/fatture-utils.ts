import { Fattura } from "@/hooks/useFatture";

export interface FornitoreGrouped {
  nome: string;
  fatture: Fattura[];
  totale: number;
}

export function filterFatture(
  data: Fattura[],
  searchTerm: string,
  searchType: "numero" | "data"
): Fattura[] {
  if (searchTerm.trim() === "") return data;

  return data.filter((f) => {
    if (searchType === "numero") {
      return f.numero.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      return new Date(f.data).toLocaleDateString("it-IT").includes(searchTerm);
    }
  });
}

export function groupFatture(data: Fattura[]): FornitoreGrouped[] {
  const grouped: Record<string, Fattura[]> = {};

  data.forEach((f) => {
    const nome = f.fornitori?.nome || "Sconosciuto";
    if (!grouped[nome]) grouped[nome] = [];
    grouped[nome].push(f);
  });

  return Object.entries(grouped)
    .map(([nome, fatture]) => ({
      nome,
      fatture,
      totale: fatture.reduce(
        (acc: number, f: any) => acc + Number(f.importo),
        0,
      ),
    }))
    .sort((a, b) => b.totale - a.totale);
}

export function calculateTotal(data: Fattura[]): number {
  return data.reduce((acc, f) => acc + Number(f.importo), 0);
}
